Game.DATASTORE.ENTITY = {};

Game.Entity = function(template) {
  template = template || {};
  this._mixinSet = Game.EntityMixin;
  Game.SymbolActive.call(this, template);
  if (!('attr' in this)) {
    this.attr = {};
  }
  this.attr._name = template.name || '';
  this.attr._x = template.x || 0;
  this.attr._y = template.y || 0;
  this.attr._generator_template_key = template.generator_template_key || '';
  this.attr._mapID = null;
  Game.DATASTORE.ENTITY[this.attr._ID] = this;

};

Game.Entity.extend(Game.SymbolActive);

Game.Entity.prototype.getID = function() {
  return this.attr._ID;
};

Game.Entity.prototype.getPos = function() {
  return {x: this.attr._x, y: this.attr._y};
};

Game.Entity.prototype.setPos = function(x_or_xy,y) {
  if (typeof x_or_xy == 'object') {
    this.attr._x = x_or_xy.x;
    this.attr._y = x_or_xy.y;
  } else {
    this.attr._x = x_or_xy;
    this.attr._y = y;
  }
};

Game.Entity.prototype.getX = function() {
    return this.attr._x;
};

Game.Entity.prototype.getY   = function() {
    return this.attr._y;
};

Game.Entity.prototype.setX = function(x) {
    this.attr._x = x;
};

Game.Entity.prototype.setY = function(y) {
    this.attr._y = y;
};

Game.Entity.prototype.getMap = function() {
  return Game.DATASTORE.MAP[this.attr._mapID];
};

Game.Entity.prototype.getMapID = function() {
  return this.attr._mapID;
};

Game.Entity.prototype.setMap = function(map) {
  this.attr._mapID = map.getID();
};

Game.Entity.prototype.destroy = function() {
  this.getMap().removeEntity(this);
  Game.Scheduler.remove(this);
  delete Game.DATASTORE.ENTITY[this.getID()];
};
