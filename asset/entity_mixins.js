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
        this.raiseEntityEvent('walkForbidden',{target:Game.Tile.nullTile});
          return {madeAdjacentMove:false};
        }

        if (map.getEntity(targetX, targetY)) { //Cannot walk into other entities
          this.raiseEntityEvent('bumpEntity', {actor: this, recipient: map.getEntity(targetX, targetY)});
          return {madeAdjacentMove: false};
        }

        var targetTile = map.getTile(targetX, targetY);
        if (targetTile.isWalkable()) {
          this.setPos(targetX, targetY);
          if (map) { //Notify map
            map.updateEntityLocation(this);
          }
          return {madeAdjacentMove: true};
        } else {
          this.raiseEntityEvent('walkForbidden', {target: targetTile});
          return false;
        }
        return {madeAdjacentMove: false};
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
        this.raiseEntityEvent('damagedBy', {damager: data.attacker, damageAmount: data.attackPower});
        data.attacker.raiseEntityEvent('dealtDamage', {target: this, damageAmount: data.attackPower});
        if (this.getCurrentHP() <= 0) {
          data.attacker.raiseEntityEvent('madeKill', {entityKilled: this});
          this.raiseEntityEvent('killed', {killedBy: data.attacker});
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
    mixinName: 'meleeAttacker',
    mixinGroup: 'attacker',
    stateNamespace: '_MeleeAttacker_attr',

    stateModel: {
        attackPower: 1,
        attackActionDuration: 1000
    },

    init: function(template) {
      this.attr._MeleeAttacker_attr.attackPower = template.attackPower || 1;
      this.attr._MeleeAttacker_attr.attackActionDuration = template.attackActionDuration || 1000;
    },

    listeners: {
      'bumpEntity': function(data) {
        var damage = this.getAttackPower();
        if (this.hasMixin('Elemental') && data.recipient.hasMixin("ElementalDefense")) {
          damage = data.recipient.raiseEntityEvent('calcElemDamage', {element: this.getCurrentElement(), attackPower: damage}).damage;
        }
        data.recipient.raiseEntityEvent('attacked', {attacker: this, attackPower: damage});
        this.raiseEntityEvent('actionDone');
        this.setCurrentActionDuration(this.attr._MeleeAttacker_attr.attackActionDuration);
      }
    }
  },

  getAttackPower: function() {
    return this.attr._MeleeAttacker_attr.attackPower;
  }
};

Game.EntityMixin.RangedAttacker = {
  META: {
    mixinName: 'rangedAttacker',
    mixinGroup: 'attacker',
    stateNamespace: '_RangedAttacker_attr',

    stateModel: {
        attackPower: 1,
        attackAccuracy: 1,
        attackActionDuration: 1000
    },

    init: function(template) {
      this.attr._RangedAttacker_attr.attackPower = template.attackPower || 1;
      this.attr._RangedAttacker_attr.attackAccuracy = template.attackAccuracy || 1;
      this.attr._RangedAttacker_attr.attackAccuraryReduction = template.attackAccuraryReduction || 0.1;
      this.attr._RangedAttacker_attr.attackActionDuration = template.attackActionDuration || 1000;
    },

    listeners: {
      'shoot': function(data) {
        var hit = this.checkShootPath();
        if (!hit) {
          return false;
        } else if (hit == 'wallTile') {
          Game.Message.send("You hit the wall");
        } else {
          var damage = this.getAttackPower();
          if (this.hasMixin('Elemental') && hit.hasMixin("ElementalDefense")) {
            damage = hit.raiseEntityEvent('calcElemDamage', {element: this.getCurrentElement(), attackPower: damage}).damage;
          }
          hit.raiseEntityEvent('attacked', {attacker: this, attackPower: damage});
        }
        this.raiseEntityEvent('actionDone');
        this.setCurrentActionDuration(this.attr._RangedAttacker_attr.attackActionDuration);
      }
    }
  },

  getAttackPower: function() {
    return this.attr._RangedAttacker_attr.attackPower;
  },

  getAttackAccuracy: function() {
    return this.attr._RangedAttacker_attr.attackAccuracy;
  },

  checkShootPath: function() {
    if (this.hasMixin("Directed")) {
      var dir = this.getDirection();
      var dx = 0;
      var dy = 0;
      var targetX = this.getX();
      var targetY = this.getY();
      switch (dir) {
        case "north":
          dx = 0;
          dy = -1;
          break;
        case "south":
          dx = 0;
          dy = 1;
          break;
        case "west":
          dx = -1;
          dy = 0;
          break;
        case "east":
          dx = 1;
          dy = 0;
          break;
        default:
          return false;
      }
      while (true) {
        targetX += dx;
        targetY += dy;
        var tile = this.getMap().getTile(targetX, targetY);
        if (tile.getName() == 'nullTile') {
          return false;
        } else if (tile.getName() == 'wallTile') {
          return 'wallTile';
        }
        var entity = this.getMap().getEntity(targetX, targetY);
        if (entity) {
          return entity;
        }
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
        Game.Message.send("You cannot walk into the " + data.target.getName());
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
        Game.Message.send(data.damager.getName() + " hit you for " + data.damageAmount);
      },

      'attackDodged': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You dodged " + data.attacker.getName());
      },

      'killed': function(data) {
        Game.Message.ageMessages();
        Game.Message.send("You were killed by " + data.killedBy.getName());
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
      this.raiseEntityEvent("adjacentMove", {dx: move.x, dy: move.y});
    }
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration() + Game.util.randomInt(-10, 10));
    this.raiseEntityEvent('actionDone');
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
    var senseResp = this.raiseEntityEvent("senseEntity", {entity: avatar});
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
      this.raiseEntityEvent("adjacentMove", {dx: move.x, dy: move.y});
    }
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration() + Game.util.randomInt(-10, 10));
    this.raiseEntityEvent('actionDone');
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
      currentElement: "fire",
      currentElemIndex: 0,
      elementColor: {fire: '#f00', water: '#00f', earth: '#940', wind: '#fff'}
    },

    init: function(template) {
      this.attr._Elemental_attr.element = template.element || ["fire"];
      this.attr._Elemental_attr.currentElemIndex = template.currentElemIndex || 0;
      this.attr._Elemental_attr.currentElement = this.attr._Elemental_attr.element[this.attr._Elemental_attr.currentElemIndex];
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
    return this.attr._Elemental_attr.currentElement;
  },

  getElementColor() {
    var color = this.attr._Elemental_attr.elementColor[this.attr._Elemental_attr.currentElement];
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
    this.attr._Elemental_attr.currentElement = this.attr._Elemental_attr.element[this.attr._Elemental_attr.currentElemIndex];
  },

  prevCurrentElement() {
    this.attr._Elemental_attr.currentElemIndex--;
    if (this.attr._Elemental_attr.currentElemIndex < 0) {
      this.attr._Elemental_attr.currentElemIndex = this.attr._Elemental_attr.element.length - 1;
    }
    this.attr._Elemental_attr.currentElement = this.attr._Elemental_attr.element[this.attr._Elemental_attr.currentElemIndex];
  },
};

Game.EntityMixin.ElementalDefense = {
  META: {
    mixinName: "ElementalDefense",
    mixinGroup: "Defense",
    stateNamespace: "_ElementalDefense_attr",
    stateModel: {
      elementArmor: {fire: 0, water: 0, earth: 0, wind: 0},
    },

    init: function(template) {
      this.attr._ElementalDefense_attr.elementArmor = template.elementArmor || {};
    },

    listeners: {
      'calcElemDamage': function(data) {
        var elem = data.element;
        var value = this.getElementArmor(elem);
        if (elem && value) {
          return {damage: data.attackPower + value};
        }
        return {damage: data.attackPower};
      }
    }
  },

  getElementArmor: function(elem) {
    if (elem) {
      if (this.attr._ElementalDefense_attr.elementArmor[elem]) {
        return this.attr._ElementalDefense_attr.elementArmor[elem];
      }
      return false;
    }
    return this.attr._ElementalDefense_attr.elementArmor;
  },

  setElementArmor: function(elem, value) {
    if (this.attr._ElementalDefense_attr.elementArmor[elem]) {
      this.attr._ElementalDefense_attr.elementArmor[elem] = value;
    }
  }
};
