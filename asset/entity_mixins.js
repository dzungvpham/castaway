Game.EntityMixin = {};

Game.EntityMixin.Sight = {
  META: {
    mixinName: "Sight",
    mixinGroup: "Sense",
    stateNamespace: "_Sight_attr",
    stateModel: {
      sightRadius: 3
    },

    init: function(template) {
      this.attr._Sight_attr.sightRadius = template.sightRadius || 3;
    },

    listeners: {
      'senseEntity': function(data) {
        return {isEntitySensed: this.canSeeEntity(data.entity)};
      },

      'examine': function(data) {
        if (this.hasMixin("Directed")) {
          var dir = this.getDirection();
          var dx = Game.util.getDirectionalDeltas(dir).dx;
          var dy = Game.util.getDirectionalDeltas(dir).dy;
          var targetX = this.getX() + dx;
          var targetY = this.getY() + dy;
          var map = this.getMap();
          var entity = map.getEntity(targetX, targetY);
          Game.Message.ageMessages();
          if (entity) {
            Game.Message.send(entity.getDetailedDescription());
            return;
          }
          var item = map.getItems(targetX, targetY);
          Game.Message.ageMessages();
          if (item.length == 1) {
            Game.Message.send(item[0].getDetailedDescription());
            return;
          } else if (item.length > 1) {
            Game.Message.send("A pile of items");
            return;
          }
          Game.Message.send(map.getTile(targetX, targetY).getDescription());
          return;
        }
      }
    }
  },

  getSightRadius: function() {
    return this.attr._Sight_attr.sightRadius;
  },

  setSightRadius: function(r) {
    this.attr._Sight_attr.sightRadius = r;
  },

  getVisibleCells: function() {
    var visibleCells = {'byDistance': {}};
    for (var i = 0; i <= this.getSightRadius(); i++) {
      visibleCells.byDistance[i] = {};
    }
    this.getMap().getFOV().compute(this.getX(), this.getY(), this.getSightRadius(), function(x, y, r, v) {
      visibleCells[x + ',' + y] = true;
      visibleCells.byDistance[r][x + ',' + y] = true;
    });
    return visibleCells;
  },

  canSeeCoord: function(x_or_pos, y) {
    var otherX = x_or_pos;
    var otherY = y;
    if (typeof x_or_pos == 'object') {
      otherX = x_or_pos.x;
      otherY = x_or_pos.y;
    }
    var inFOV = this.getVisibleCells();
    return inFOV[otherX + ',' + otherY] || false;
  },

  canSeeEntity: function(entity) {
    if (!entity || entity.getMapID() !== this.getMapID()) {
      return false;
    }
    return this.canSeeCoord(entity.getPos());
  },

  canSeeCoord_delta: function(dx, dy) {
    return this.canseeCoord(this.getX() + dx, this.getY() + dy);
  }
};

Game.EntityMixin.MapMemory = {
  META: {
    mixinName: "MapMemory",
    mixinGroup: "MapMemory",
    stateNamespace: "_MapMemory_attr",
    stateModel: {
      mapHash: {}
    },

    init: function(template) {
      this.attr._MapMemory_attr.mapHash = template.mapHash || {};
    }
  },

  rememberCoords: function(coordSet, mapID) { //Remember seen coords
    var mapKey = mapID || this.getMapID();
    if (!this.attr._MapMemory_attr.mapHash[mapKey]) {
      this.attr._MapMemory_attr.mapHash[mapKey] = {};
    }
    for (var coord in coordSet) {
      if (coordSet.hasOwnProperty(coord) && coord != "byDistance") {
        this.attr._MapMemory_attr.mapHash[mapKey][coord] = true;
      }
    }
  },

  getRememberedCoords: function(mapID) {
    var mapKey = mapID || this.getMapID();
    return this.attr._MapMemory_attr.mapHash[mapKey] || {};
  }
};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker',

    listeners: {
      'adjacentMove': function(data) {
        var map = this.getMap();
        var dx = data.dx;
        var dy = data.dy;
        var targetX = this.getX() + dx;
        var targetY = this.getY() + dy;

        if ((targetX < 0) || (targetX >= map.getWidth()) || (targetY < 0) || (targetY >= map.getHeight())) {
        this.raiseSymbolActiveEvent('walkForbidden', {target: Game.Tile.nullTile});
          return {madeAdjacentMove: false};
        }

        if (map.getEntity(targetX, targetY)) { //Cannot walk into other entities
          this.raiseSymbolActiveEvent('bumpEntity', {actor: this, recipient: map.getEntity(targetX, targetY)});
          return {madeAdjacentMove: false};
        }

        var targetTile = map.getTile(targetX, targetY);
        if (targetTile.isWalkable()) {
          this.setPos(targetX, targetY);
          if (map) { //Notify map
            map.updateEntityLocation(this);
          }
          this.raiseSymbolActiveEvent("specialTerrain", {tile: targetTile});
          return {madeAdjacentMove: true};
        } else {
          this.raiseSymbolActiveEvent('walkForbidden', {target: targetTile});
          return false;
        }
        return {madeAdjacentMove: false};
      },

      'specialTerrain': function(data) {
        if (data.tile.isSpecial()) {
          if (this.hasMixin("Elemental") && data.tile.getElement() != false) {
            if (this.getCurrentElement() == data.tile.getElement()) {
              return;
            }
          }
          if (this.hasMixin("HitPoints")) {
            var damage = data.tile.getDamage(); //'damage' here can be either heal or real damage
            if (damage >= 0) {
              this.takeHits(damage);
              this.raiseSymbolActiveEvent('damagedBy', {damager: data.tile, damageAmount: damage});
              if (this.getCurrentHP() <= 0) {
                this.raiseSymbolActiveEvent('killed', {killedBy: data.tile});
              }
            } else {
              var diff = this.getCurrentHP() - this.getMaxHP();
              if (diff < 0) {
                if (diff <= damage) {
                  this.takeHits(damage);
                  this.raiseSymbolActiveEvent("healedBy", {healAmount: -1*damage});
                } else {
                  this.takeHits(diff);
                  this.raiseSymbolActiveEvent("healedBy", {healAmount: -1*diff});
                }
              }
            }
          }
        }
      }
    }
  },
};

Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle',
    stateNamespace: '_Chronicle_attr',

    stateModel:  {
      turnCounter: 0,
      killLog: {},
      killCounter: 0,
      deathmessage: ''
    },

    listeners: {
      'actionDone': function(data) {
        this.trackTurnCount();
      },

      'madeKill': function(data) {
        this.addKill(data.entityKilled);
      },

      'killed': function(data) {
        this.attr._Chronicle_attr.deathMessage = 'You were killed by ' + data.killedBy.getName();
        Game.Message.send(this.attr._Chronicle_attr.deathMessage);
      }
    }
  },

  trackTurnCount: function () {
    this.attr._Chronicle_attr.turnCounter++;
  },

  getTurn: function () {
    return this.attr._Chronicle_attr.turnCounter;
  },

  setTurn: function (n) {
    this.attr._Chronicle_attr.turnCounter = n;
  },

  addKill: function(entityKilled) {
    var entityName = entityKilled.getName();
    if (this.attr._Chronicle_attr.killLog[entityName]) {
      this.attr._Chronicle_attr.killLog[entityName]++;
    } else {
      this.attr._Chronicle_attr.killLog[entityName] = 1;
    }
    this.attr._Chronicle_attr.killCounter++;
  },

  getKills: function() {
    return this.attr._Chronicle_attr.killLog;
  },

  getKillCount: function() {
    return this.attr._Chronicle_attr.killCounter;
  },

  clearKills: function() {
    this.attr._Chronicle_attr.killLog = {};
  }
};

Game.EntityMixin.HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    stateNamespace: '_HitPoints_attr',

    stateModel:  {
      maxHP: 1,
      curHP: 1
    },

    init: function (template) {
      this.attr._HitPoints_attr.maxHP = template.maxHP || 1;
      this.attr._HitPoints_attr.curHP = template.curHP || this.attr._HitPoints_attr.maxHP;
    },

    listeners: {
      'attacked': function(data) {
        this.takeHits(data.attackPower);
        this.raiseSymbolActiveEvent('damagedBy', {damager: data.attacker, damageAmount: data.attackPower});
        data.attacker.raiseSymbolActiveEvent('dealtDamage', {target: this, damageAmount: data.attackPower});
        if (this.getCurrentHP() <= 0) {
          data.attacker.raiseSymbolActiveEvent('madeKill', {entityKilled: this});
          this.raiseSymbolActiveEvent('killed', {killedBy: data.attacker});
        }
      },

      'killed': function(data) {
        this.destroy();
      }
    }
  },

  getMaxHP: function () {
    return this.attr._HitPoints_attr.maxHP;
  },

  setMaxHP: function (n) {
    this.attr._HitPoints_attr.maxHP = n;
  },

  getCurrentHP: function () {
    return this.attr._HitPoints_attr.curHP;
  },

  setCurrentHP: function (n) {
    this.attr._HitPoints_attr.curHP = n;
  },

  takeHits: function (amt) {
    this.attr._HitPoints_attr.curHP -= amt;
  },

  recoverHits: function (amt) {
    this.attr._HitPoints_attr.curHP = Math.min(this.attr._HitPoints_attr.curHP + amt, this.attr._HitPoints_attr.maxHP);
  }
};

Game.EntityMixin.MeleeAttacker = {
  META: {
    mixinName: 'MeleeAttacker',
    mixinGroup: 'Attacker',
    stateNamespace: '_MeleeAttacker_attr',

    stateModel: {
        attackPower: 1,
        hitChance: 10,
        attackActionDuration: 1000
    },

    init: function(template) {
      this.attr._MeleeAttacker_attr.attackPower = template.meleeAttackPower || 1;
      this.attr._MeleeAttacker_attr.hitChance = template.meleeHitChance || 10;
      this.attr._MeleeAttacker_attr.attackActionDuration = template.meleeAttackActionDuration || 1000;
    },

    listeners: {
      'bumpEntity': function(data) {
        var entity = data.recipient;
        var flag = entity.raiseSymbolActiveEvent("calcHit", {hitChance: this.getMeleeHitChance()}).targetHit[0];
        if (flag) {
          var damage = this.getMeleeAttackPower();
          if (this.hasMixin('Elemental') && entity.hasMixin("Defense")) {
            damage = entity.raiseSymbolActiveEvent('calcDamage', {element: this.getCurrentElement(), attackPower: damage}).damage;
          }
          entity.raiseSymbolActiveEvent('attacked', {attacker: this, attackPower: damage});
        } else {
          this.raiseSymbolActiveEvent("attackMissed", {target: entity});
          entity.raiseSymbolActiveEvent("attackDodged", {attacker: this});
        }
        this.raiseSymbolActiveEvent('actionDone');
        this.setCurrentActionDuration(this.attr._MeleeAttacker_attr.attackActionDuration);
      }
    }
  },

  getMeleeAttackPower: function() {
    return this.attr._MeleeAttacker_attr.attackPower;
  },

  setMeleeAttackPower: function(n) {
    this.attr._MeleeAttacker_attr.attackPower = n;
  },

  getMeleeHitChance: function() {
    return this.attr._MeleeAttacker_attr.hitChance;
  },

  setMeleeHitChance: function(n) {
    this.attr._MeleeAttacker_attr.hitChance = n;
  }
};

Game.EntityMixin.RangedAttacker = {
  META: {
    mixinName: 'RangedAttacker',
    mixinGroup: 'Attacker',
    stateNamespace: '_RangedAttacker_attr',

    stateModel: {
        attackPower: 1,
        hitChance: 10,
        attackActionDuration: 1000
    },

    init: function(template) {
      this.attr._RangedAttacker_attr.attackPower = template.rangedAttackPower || 1;
      this.attr._RangedAttacker_attr.hitChance = template.rangedHitChance || 10;
      this.attr._RangedAttacker_attr.attackActionDuration = template.rangedAttackActionDuration || 1000;
    },

    listeners: {
      'shoot': function(data) {
        if (!this.hasMixin("CombatMultipleProjectiles")) {
          var hit = this.checkShootPath();
          if (!hit) {
            return false;
          } else if (typeof hit == 'string') {
            Game.Message.ageMessages();
            Game.Message.send("You hit " + hit);
          } else {
            var flag = hit.raiseSymbolActiveEvent("calcHit", {hitChance: this.getRangedHitChance()}).targetHit[0];
            if (flag) {
              if (this.hasMixin("CombatPushBack")) {
                this.raiseSymbolActiveEvent("pushBack", {pusher: this, pushee: hit});
              }
              var damage = this.getRangedAttackPower();
              if (this.hasMixin('Elemental') && hit.hasMixin("Defense")) {
                damage = hit.raiseSymbolActiveEvent('calcDamage', {element: this.getCurrentElement(), attackPower: damage}).damage;
              }
              hit.raiseSymbolActiveEvent('attacked', {attacker: this, attackPower: damage});

            } else {
              this.raiseSymbolActiveEvent("attackMissed", {target: hit});
              hit.raiseSymbolActiveEvent("attackDodged", {attacker: this});
            }
          }
          this.setCurrentActionDuration(this.attr._RangedAttacker_attr.attackActionDuration);
        } else {
          this.raiseSymbolActiveEvent("shootMultiple");
        }
      }
    }
  },

  getRangedAttackPower: function() {
    return this.attr._RangedAttacker_attr.attackPower;
  },

  setRangedAttackPower: function(n) {
    this.attr._RangedAttacker_attr.attackPower = n;
  },

  getRangedHitChance: function() {
    return this.attr._RangedAttacker_attr.hitChance;
  },

  setRangedHitChance: function(n) {
    this.attr._RangedAttacker_attr.hitChance = n;
  },

  checkShootPath: function() {
    if (this.hasMixin("Directed")) {
      Game.TimeEngine.lock();
      var dir = this.getDirection();
      var deltas = Game.util.getDirectionalDeltas(dir);
      if (deltas) {
        var dx = deltas.dx;
        var dy = deltas.dy;
      } else {
        return false;
      }

      var targetX = this.getX();
      var targetY = this.getY();
      var actor = this;
      var step = 0;

      while (true) {
        step++;
        targetX += dx;
        targetY += dy;
        var tile = this.getMap().getTile(targetX, targetY);

        if (tile.getName() == 'nullTile') {
          setTimeout(function() {
            actor.raiseSymbolActiveEvent('actionDone');
          }, 1);
          return false;
        } else if (!tile.isWalkable()) {
          setTimeout(function() {
            actor.raiseSymbolActiveEvent('actionDone');
          }, 1);
          return tile.getName();
        }

        var entity = this.getMap().getEntity(targetX, targetY);
        if (entity) {
          setTimeout(function() {
            actor.raiseSymbolActiveEvent('actionDone');
          }, 1);
          return entity;
        }
        //util
        var drawX = targetX - Game.UIMode.gamePlay.attr._camX + Game.getDisplayWidth("main")/2;
        var drawY = targetY - Game.UIMode.gamePlay.attr._camY + Game.getDisplayHeight("main")/2;
        var items = this.getMap().getItems(targetX, targetY);
        var fg = "#fff";
        if (this.hasMixin("Elemental")) {
          fg = this.getElementColor();
        }
        setTimeout(function(fg, tile, x, y) {
          Game.Symbol.PROJECTILE.setFg(fg);
          Game.Symbol.PROJECTILE.setBg(tile.getBg());
          Game.Symbol.PROJECTILE.draw(Game.getDisplay("main"), x, y);
        }, 20*step, fg, tile, drawX, drawY);

        setTimeout(function(x, y) {
          Game.refresh();
        }, 20*step + 20);
      }
    }
    return false;
  }
};

Game.EntityMixin.Directed = {
  META: {
    mixinName: 'Directed',
    mixinGroup: 'Directed',
    stateNamespace: '_Directed_attr',

    stateModel: {
        direction: 'north'
    },

    init: function(template) {
      this.attr._Directed_attr.direction = template.direction || 'north';
    },

    listeners: {
      'changeDirection': function(data) {
        this.attr._Directed_attr.direction = data.direction;
      }
    }
  },

  getDirection: function() {
    return this.attr._Directed_attr.direction;
  }
};

Game.EntityMixin.PlayerMessager = {
  META: {
    mixinName: 'playerMessager',
    mixinGroup: 'playerMessager',
    listeners: {
      'walkForbidden': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You cannot walk into " + data.target.getName());
      },

      'dealtDamage': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You hit " + data.target.getName() + " for " + data.damageAmount);
      },

      'attackMissed': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You missed " + data.target.getName());
      },

      'madeKill': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You killed " + data.entityKilled.getName());
      },

      'damagedBy': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You took " + data.damageAmount + " damage from " + data.damager.getName());
      },

      'healedBy': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You were healed by " + data.healAmount + " HP");
      },

      'attackDodged': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You dodged " + data.attacker.getName());
      },

      'killed': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You were killed by " + data.killedBy.getName());
      },

      'noItemsToPickup': function(data) {
        Game.Message.ageMessages();
        Game.Message.send('There is nothing to pickup');
      },

      'inventoryFull': function(data) {
        Game.Message.ageMessages();
        Game.Message.send('Your inventory is full');
      },

      'inventoryEmpty': function(data) {
        Game.Message.ageMessages();
        Game.Message.send('You are not carrying anything');
      },

      'noItemsPickedUp': function(data) {
        Game.Message.ageMessages();
        Game.Message.send('You could not pick up any items');
      },

      'someItemsPickedUp': function(data) {
        Game.Message.ageMessages();
        Game.Message.send('You picked up '+ data.numItemsPickedUp + ' of the items, leaving ' + data.numItemsNotPickedUp + ' of them');
      },

      'allItemsPickedUp': function(data) {
        Game.Message.ageMessages();
        if (data.numItemsPickedUp > 2) {
          Game.Message.send('You picked up all ' + data.numItemsPickedUp + ' items');
        } else if (data.numItemsPickedUp == 2) {
            Game.Message.send('You picked up both items');
        } else {
          Game.Message.send('You picked up ' + data.lastItemPickedUpName);
        }
      },

      'itemsDropped': function(data) {
        Game.Message.ageMessages();
        if (data.numItemsDropped > 1) {
          Game.Message.send('You dropped ' + data.numItemsDropped + ' items');
        } else {
          Game.Message.send('You dropped ' + data.lastItemDroppedName);
        }
      }
    },
  }
};

Game.EntityMixin.PlayerActor = {
  META: {
    mixinName: "PlayerActor",
    mixinGroup: "Actor",
    stateNamespace: "_PlayerActor_attr",
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },

    init: function(template) {
      Game.Scheduler.add(this, true, 1);
    },

    listeners: {
      'actionDone': function(data) {
        Game.Scheduler.setDuration(this.getCurrentActionDuration());
        this.setCurrentActionDuration(this.getBaseActionDuration() + Game.util.randomInt(-5, 5));
        setTimeout(function() {Game.TimeEngine.unlock();}, 1);
      },

      'killed': function(data) {
        Game.TimeEngine.lock();
        Game.switchUIMode("gameLose");
      }
    }
  },

  getBaseActionDuration: function () {
    return this.attr._PlayerActor_attr.baseActionDuration;
  },

  setBaseActionDuration: function (n) {
    this.attr._PlayerActor_attr.baseActionDuration = n;
  },

  getCurrentActionDuration: function () {
    return this.attr._PlayerActor_attr.currentActionDuration;
  },

  setCurrentActionDuration: function (n) {
    this.attr._PlayerActor_attr.currentActionDuration = n;
  },

  isActing: function(state) {
    if (state !== undefined) {
      this.attr._PlayerActor_attr.actingState = state;
    }
    return this.attr._PlayerActor_attr.actingState;
  },

  act: function() {
    if (this.isActing()) {
      return;
    }
    this.isActing(true);
    Game.refresh();
    Game.TimeEngine.lock();
    this.isActing(false);
  }
};

Game.EntityMixin.WanderActor = {
  META: {
    mixinName: 'WanderActor',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },

    init: function (template) {
      Game.Scheduler.add(this, true, Game.util.randomInt(2, this.getBaseActionDuration()));
      this.attr._WanderActor_attr.baseActionDuration = template.wanderActionDuration || 1000;
      this.attr._WanderActor_attr.currentActionDuration = this.attr._WanderActor_attr.baseActionDuration;
    }
  },

  getBaseActionDuration: function () {
    return this.attr._WanderActor_attr.baseActionDuration;
  },

  setBaseActionDuration: function (n) {
    this.attr._WanderActor_attr.baseActionDuration = n;
  },

  getCurrentActionDuration: function () {
    return this.attr._WanderActor_attr.currentActionDuration;
  },

  setCurrentActionDuration: function (n) {
    this.attr._WanderActor_attr.currentActionDuration = n;
  },

  getMoveDelta: function () {
    return Game.util.positionsAdjacentTo({x: 0, y: 0}).random();
  },

  act: function () {
    Game.TimeEngine.lock();
    var move = this.getMoveDelta();
    if (this.hasMixin('Walker')) {
      this.raiseSymbolActiveEvent("adjacentMove", {dx: move.x, dy: move.y});
    }
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration() + Game.util.randomInt(-10, 10));
    this.raiseSymbolActiveEvent('actionDone');
    Game.TimeEngine.unlock();
  }
};

Game.EntityMixin.WanderChaserActor = {
  META: {
    mixinName: 'WanderActorChaser',
    mixinGroup: 'Actor',
    stateNamespace: '_WanderChaserActor_attr',
    stateModel:  {
      baseActionDuration: 1000,
      currentActionDuration: 1000
    },

    init: function (template) {
      Game.Scheduler.add(this, true, Game.util.randomInt(2, this.getBaseActionDuration()));
      this.attr._WanderChaserActor_attr.baseActionDuration = template.wanderChaserActionDuration || 1000;
      this.attr._WanderChaserActor_attr.currentActionDuration = this.attr._WanderChaserActor_attr.baseActionDuration;
    }
  },

  getBaseActionDuration: function () {
    return this.attr._WanderChaserActor_attr.baseActionDuration;
  },

  setBaseActionDuration: function (n) {
    this.attr._WanderChaserActor_attr.baseActionDuration = n;
  },

  getCurrentActionDuration: function () {
    return this.attr._WanderChaserActor_attr.currentActionDuration;
  },

  setCurrentActionDuration: function (n) {
    this.attr._WanderChaserActor_attr.currentActionDuration = n;
  },

  getMoveDelta: function () {
    var avatar = Game.getAvatar();
    var senseResp = this.raiseSymbolActiveEvent("senseEntity", {entity: avatar});
    if (Game.util.compactBooleanArray_or(senseResp.isEntitySensed)) {
      var source = this;
      var map = this.getMap();
      var path = new ROT.Path.AStar(avatar.getX(), avatar.getY(), function(x, y) {
        var entity = map.getEntity(x, y);
        if (entity && entity !== avatar && entity !== source) {
          return false;
        }
        return map.getTile(x, y).isWalkable();
      }, {topology: 8});
      var count = 0;
      var moveDelta = {x: 0, y: 0};
      path.compute(this.getX(), this.getY(), function(x, y) {
        if (count == 1) { //2nd tile
          moveDelta.x = x - source.getX();
          moveDelta.y = y - source.getY();
        }
        count++;
      });
      return moveDelta;
    }
    return Game.util.positionsAdjacentTo({x: 0, y: 0}).random(); //If no entity found
  },

  act: function () {
    Game.TimeEngine.lock();
    var move = this.getMoveDelta();
    if (this.hasMixin('Walker')) {
      this.raiseSymbolActiveEvent("adjacentMove", {dx: move.x, dy: move.y});
    }
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration() + Game.util.randomInt(-10, 10));
    this.raiseSymbolActiveEvent('actionDone');
    Game.TimeEngine.unlock();
  }
};

Game.EntityMixin.Elemental = {
  META: {
    mixinName: "Elemental",
    mixinGroup: "Elemental",
    stateNamespace: "_Elemental_attr",
    stateModel: {
      element: ["fire"],
      currentElemIndex: 0,
      elementColor: {fire: '#f00', water: '#00bcf2', earth: '#940', wind: '#fff', lightning: '#ff0'},
      elementIcon: {fire: '🔥', water: '💦', earth: '🌑', wind: '💨', lightning: '⚡'}
    },

    init: function(template) {
      this.attr._Elemental_attr.element = template.element || [];
      this.attr._Elemental_attr.currentElemIndex = template.currentElemIndex || 0;
      this.setFg(this.getElementColor());
    },

    listeners: {
      'nextElement': function(data) {
        this.nextCurrentElement();
        this.setFg(this.getElementColor());
      },

      'prevElement': function(data) {
        this.prevCurrentElement();
        this.setFg(this.getElementColor());
      }
    }
  },

  getElement() {
    return this.attr._Elemental_attr.element;
  },

  getCurrentElement() {
    return this.attr._Elemental_attr.element[this.attr._Elemental_attr.currentElemIndex];
  },

  getElementColor(elem) {
    var color = this.attr._Elemental_attr.elementColor[elem] || this.attr._Elemental_attr.elementColor[this.getCurrentElement()];
    if (color != 'undefined') {
      return color;
    }
  },

  getElementIcon(elem) {
    var color = this.attr._Elemental_attr.elementIcon[elem] || this.attr._Elemental_attr.elementIcon[this.getCurrentElement()];
    if (color != 'undefined') {
      return color;
    }
  },

  addElement(elem) {
    this.attr._Elemetal_attr.element.push(elem);
  },

  nextCurrentElement() {
    this.attr._Elemental_attr.currentElemIndex++;
    if (this.attr._Elemental_attr.currentElemIndex >= this.attr._Elemental_attr.element.length) {
      this.attr._Elemental_attr.currentElemIndex = 0;
    }
  },

  prevCurrentElement() {
    this.attr._Elemental_attr.currentElemIndex--;
    if (this.attr._Elemental_attr.currentElemIndex < 0) {
      this.attr._Elemental_attr.currentElemIndex = this.attr._Elemental_attr.element.length - 1;
    }
  },

  getStrongAgainst() {
    switch(this.getCurrentElement()) {
      case "fire":
        return "wind";
      case "water":
        return "fire";
      case "earth":
        return "water";
      case "wind":
        return "lightning";
      case "lightning":
        return "earth";
    }
  },

  getWeakAgainst() {
    switch(this.getCurrentElement()) {
      case "fire":
        return "water";
      case "water":
        return "earth";
      case "earth":
        return "lightning";
      case "wind":
        return "fire";
      case "lightning":
        return "wind";
    }
  }
};

Game.EntityMixin.Defense = {
  META: {
    mixinName: "Defense",
    mixinGroup: "Defense",
    stateNamespace: "_Defense_attr",
    stateModel: {
      dodgeChance: 10,
      elementArmor: {fire: 0, water: 0, earth: 0, wind: 0, lightning: 0},
      normalArmor: 1
    },

    init: function(template) {
      this.attr._Defense_attr.elementArmor = template.elementArmor || {};
      this.attr._Defense_attr.normalArmor = template.normalArmor || 1;
      this.attr._Defense_attr.dodgeChance = template.dodgeChance || 10;
    },

    listeners: {
      'calcDamage': function(data) {
        var elem = data.element;
        var normalReduction = this.getNormalArmor();
        var elemReduction = this.getElementArmor(elem);
        if (elem && elemReduction) {
          var dam = data.attackPower - elemReduction - normalReduction;
          if (dam < 0) {
            dam = 0;
          }
          return {damage: dam};
        }
        var dam = data.attackPower - normalReduction;
        if (dam < 0) {
          dam = 0;
        }
        return {damage: dam};
      },

      'calcHit': function(data) {
        if (ROT.RNG.getUniform()*100 <= data.hitChance && ROT.RNG.getUniform()*100 > this.getDodgeChance()) {
          return {targetHit: true};
        }
        return {targetHit: false};
      }
    }
  },

  getElementArmor: function(elem) {
    if (elem) {
      if (this.attr._Defense_attr.elementArmor[elem]) {
        return this.attr._Defense_attr.elementArmor[elem];
      }
      return 0;
    }
    return this.attr._Defense_attr.elementArmor;
  },

  setElementArmor: function(elem, value) {
    this.attr._Defense_attr.elementArmor[elem] = value;
  },

  getNormalArmor: function() {
    return this.attr._Defense_attr.normalArmor;
  },

  setNormalArmor: function(n) {
    this.attr._Defense_attr.normalArmor = n;
  },

  getDodgeChance: function() {
    return this.attr._Defense_attr.dodgeChance;
  },

  setDodgeChance: function(n) {
    this.attr._Defense_attr.dodgeChance = n;
  }
};

Game.EntityMixin.InventoryHolder = {
  META: {
    mixinName: 'InventoryHolder',
    mixinGroup: 'InventoryHolder',
    stateNamespace: '_InventoryHolder_attr',
    stateModel:  {
      containerID: '',
      inventoryCapacity: 5
    },

    init: function (template) {
      this.attr._InventoryHolder_attr.inventoryCapacity = template.inventoryCapacity || 5;
      if (template.containerID) {
        this.attr._InventoryHolder_attr.containerID = template.containerID;
      } else {
        var container = Game.ItemGenerator.create('_inventoryContainer');
        container.setCapacity(this.attr._InventoryHolder_attr.inventoryCapacity);
        this.attr._InventoryHolder_attr.containerID = container.getID();
      }
    },

    listeners: {
      'pickupItems': function(data) {
        return {addedAnyItems: this.pickupItems(data.itemSet)};
      },

      'dropItems': function(data) {
        return {droppedItems: this.dropItems(data.itemSet)};
      }
    }
  },

  getContainer: function () {
    return Game.DATASTORE.ITEM[this.attr._InventoryHolder_attr.containerID];
  },

  hasInventorySpace: function () {
    return this.getContainer().hasSpace();
  },

  addInventoryItems: function (items_or_ids) {
    return this.getContainer().addItems(items_or_ids);
  },

  getInventoryItemIDs: function () {
    return this.getContainer().getItemIDs();
  },

  extractInventoryItems: function (ids_or_idxs) {
    return this.getContainer().extractItems(ids_or_idxs);
  },

  pickupItems: function (ids_or_idxs) {
    var itemsToAdd = [];
    var fromPile = this.getMap().getItems(this.getPos());
    var pickupResult = {
      numItemsPickedUp:0,
      numItemsNotPickedUp:ids_or_idxs.length
    };

    if (fromPile.length < 1) {
      this.raiseSymbolActiveEvent('noItemsToPickup');
      return pickupResult;
    }

    if (!this.getContainer().hasSpace()) {
      this.raiseSymbolActiveEvent('inventoryFull');
      this.raiseSymbolActiveEvent('noItemsPickedUp');
      return pickupResult;
    }

    for (var i = 0; i < fromPile.length; i++) {
      if ((ids_or_idxs.indexOf(i) > -1) || (ids_or_idxs.indexOf(fromPile[i].getID()) > -1)) {
          itemsToAdd.push(fromPile[i]);
      }
    }

    var addResult = this.getContainer().addItems(itemsToAdd);
    for (var i = 0; i < itemsToAdd.length; i++) {
      itemsToAdd[i].raiseSymbolActiveEvent("pickedUp", {picker: this});
    }
    pickupResult.numItemsPickedUp = addResult.numItemsAdded;
    pickupResult.numItemsNotPickedUp = addResult.numItemsNotAdded;
    var lastItemFromMap = '';
    for (var j = 0; j < pickupResult.numItemsPickedUp; j++) {
      lastItemFromMap = this.getMap().removeItemAt(itemsToAdd[j], this.getPos());
    }

    pickupResult.lastItemPickedUpName = lastItemFromMap.getName();
    if (pickupResult.numItemsNotPickedUp > 0) {
      this.raiseSymbolActiveEvent('someItemsPickedUp', pickupResult);
    } else {
      this.raiseSymbolActiveEvent('allItemsPickedUp', pickupResult);
    }

    return pickupResult;
  },

  dropItems: function (ids_or_idxs) {
    var itemsToDrop = this.getContainer().extractItems(ids_or_idxs);
    var dropResult = {numItemsDropped: 0};

    if (itemsToDrop.length < 1) {
      this.raiseSymbolActiveEvent("inventoryEmpty");
      return dropResult;
    }

    for (var i = 0; i < itemsToDrop.length; i++) {
      itemsToDrop[i].raiseSymbolActiveEvent("dropped", {dropper: this});
    }

    var lastItemDropped = '';
    for (var i = 0; i < itemsToDrop.length; i++) {
      if (itemsToDrop[i]) {
        lastItemDropped = itemsToDrop[i];
        this.getMap().addItem(itemsToDrop[i], this.getPos());
        dropResult.numItemsDropped++;
      }
    }

    dropResult.lastItemDroppedName = lastItemDropped.getName();
    this.raiseSymbolActiveEvent('itemsDropped', dropResult);
    return dropResult;
  }
};

Game.EntityMixin.HitPointsRegenerate = {
  META: {
    mixinName: "HitPointsRegenerate",
    mixinGroup: "HitPoints",
    stateNamespace: "_HitPoints_Regenerate",
    stateModel: {
      regenerateAmount: 1;
    }
  }
}
