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
    }
  },

  getSightRadius: function() {
    return this.attr._Sight_attr.sightRadius;
  },

  setSightRadius: function(r) {
    this.attr._Sight_attr.sightRadius = r;
  }
};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker'
  },

  tryWalk: function (map, dx, dy) {
    var targetX = Math.min(Math.max(0,this.getX() + dx), map.getWidth() - 1);
    var targetY = Math.min(Math.max(0,this.getY() + dy), map.getHeight() - 1);

    if (map.getEntity(targetX, targetY)) { //Cannot walk into other entities
      this.raiseEntityEvent('bumpEntity', {actor: this, recipient: map.getEntity(targetX, targetY)});
      return false;
    }

    targetTile = map.getTile(targetX, targetY);
    if (targetTile.isWalkable()) {
      this.setPos(targetX, targetY);
      var myMap = this.getMap();
      if (myMap) { //Notify map
        myMap.updateEntityLocation(this);
      }
      return true;
    } else {
      this.raiseEntityEvent('walkForbidden', {target: targetTile});
      return false;
    }
  }
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
        this.attr._Chronicle_attr.deathMessage = 'killed by ' + data.killedBy.getName();
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
        attackPower: 1
    },

    init: function(template) {
      this.attr._MeleeAttacker_attr.attackPower = template.attackPower || 1;
    },

    listeners: {
      'bumpEntity': function(data) {
        data.recipient.raiseEntityEvent('attacked', {attacker: this, attackPower: this.getAttackPower()});
        this.raiseEntityEvent('actionDone');
      }
    }
  },

  getAttackPower: function() {
    return this.attr._MeleeAttacker_attr.attackPower;
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

      'madeKill': function(data) {
        Game.Message.send("You killed " + data.entityKilled.getName());
      },

      'damagedBy': function(data) {
        Game.Message.send(data.damager.getName() + " hit you for " + data.damageAmount);
        //Game.renderMessage();
      },

      'killed': function(data) {
        Game.Message.send("You were killed by " + data.killedBy.getName());
        //Game.renderMessage();
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
        Game.TimeEngine.unlock();
        setTimeout(function() {Game.TimeEngine.unlock();}, 1);
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

  getMove: function () {
    return Game.util.positionsAdjacentTo({x: 0, y: 0}).random();
  },

  act: function () {
    Game.TimeEngine.lock();
    var move = this.getMove();
    if (this.hasMixin('Walker')) {
      this.tryWalk(this.getMap(),move.x, move.y);
    }
    Game.Scheduler.setDuration(this.getCurrentActionDuration());
    this.setCurrentActionDuration(this.getBaseActionDuration() + Game.util.randomInt(-10, 10));
    this.raiseEntityEvent('actionDone');
    Game.TimeEngine.unlock();
  }
};
