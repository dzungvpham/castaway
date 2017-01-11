Game.EntityMixin = {};

Game.EntityMixin.WalkerCorporeal = {
  META: {
    mixinName: 'WalkerCorporeal',
    mixinGroup: 'Walker'
  },

  tryWalk: function (map, dx, dy) {
    var targetX = Math.min(Math.max(0,this.getX() + dx), map.getWidth());
    var targetY = Math.min(Math.max(0,this.getY() + dy), map.getHeight());

    if (map.getEntity(targetX, targetY)) { //Cannot walk into other entities
      return false;
    }

    if (map.getTile(targetX, targetY).isWalkable()) {
      this.setPos(targetX, targetY);
      if (this._map) { //Notify map
        this._map.updateEntityLocation(this);
      }
      if (this.hasMixin('Chronicle')) {
        this.trackTurn();
      }
      return true;
    }
    return false;
  }
};

Game.EntityMixin.Chronicle = {
  META: {
    mixinName: 'Chronicle',
    mixinGroup: 'Chronicle',
    stateNamespace: '_Chronicle_attr',
    stateModel:  {
      turnCounter: 0
    }
  },

  trackTurn: function () {
    this.attr._Chronicle_attr.turnCounter++;
  },

  getTurn: function () {
    return this.attr._Chronicle_attr.turnCounter;
  },

  setTurn: function (n) {
    this.attr._Chronicle_attr.turnCounter = n;
  }
};

Game.EntityMixin.HitPoints = {
  META: {
    mixinName: 'HitPoints',
    mixinGroup: 'HitPoints',
    stateNamespace: '_HitPoints_attr',
    stateModel:  {
      maxHp: 1,
      curHp: 1
    },

    init: function (template) {
      this.attr._HitPoints_attr.maxHp = template.maxHp || 1;
      this.attr._HitPoints_attr.curHp = template.curHp || this.attr._HitPoints_attr.maxHp;
    }
  },

  getMaxHp: function () {
    return this.attr._HitPoints_attr.maxHp;
  },

  setMaxHp: function (n) {
    this.attr._HitPoints_attr.maxHp = n;
  },

  getCurHp: function () {
    return this.attr._HitPoints_attr.curHp;
  },

  setCurHp: function (n) {
    this.attr._HitPoints_attr.curHp = n;
  },

  takeHits: function (amt) {
    this.attr._HitPoints_attr.curHp -= amt;
  },

  recoverHits: function (amt) {
    this.attr._HitPoints_attr.curHp = Math.min(this.attr._HitPoints_attr.curHp + amt, this.attr._HitPoints_attr.maxHp);
  }
};
