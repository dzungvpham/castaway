Game.Tile = function(template) { //Pass in hash
  if (!template) {
    template = {};
  }

  if (!('attr' in this)) {
    this.attr = {};
  }

  Game.Symbol.call(this, template);

  this.attr._name = template.name || 'n/a';
  this.attr._description = template.description || "Nothing interesting"
  this.attr._walkable = template.walkable || false;
  this.attr._special = template.special || false; //Speciality means harmful or helpful
  if (this.attr._special) {
    this.attr._damage = template.damage || 0;
    this.attr._element = template.element || false;
  }
  this.attr._transparent = template.transparent || false;
  this.attr._opaque = template.opaque || !this.attr._transparent;
};

Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function() {
  return this.attr._name;
};

Game.Tile.prototype.getDescription = function() {
  return this.attr._description;
};

Game.Tile.prototype.isWalkable = function() {
  return this.attr._walkable;
};

Game.Tile.prototype.isTransparent = function() {
  return this.attr._transparent;
};

Game.Tile.prototype.isOpaque = function() {
  return this.attr._opaque;
};

Game.Tile.prototype.isSpecial = function() {
  return this.attr._special;
};

Game.Tile.prototype.getDamage = function() {
  return this.attr._damage;
};

Game.Tile.prototype.getElement = function() {
  return this.attr._element;
};
