Game.Tile = function(properties) { //Pass in hash
  if (!properties) {
    properties = {};
  }

  if (!('attr' in this)) {
    this.attr = {};
  }

  Game.Symbol.call(this, properties);

  this.attr._name = properties.name || 'n/a';
  this.attr._walkable = properties.walkable || false;
  this.attr._special = properties.special || false; //Speciality means harmful or helpful
  if (this.attr._special) {
    this.attr._damage = properties.damage || 0;
    this.attr._element = properties.element || false;
  }
  this.attr._transparent = properties.transparent || false;
  this.attr._opaque = properties.opaque || !this.attr._transparent;
};

Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function() {
  return this.attr._name;
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

Game.Tile.nullTile = new Game.Tile({name: "nullTile"});
Game.Tile.floorTile = new Game.Tile({name: "floorTile", chr: '.', walkable: true, transparent: true});
Game.Tile.wallTile = new Game.Tile({name: "wallTile", chr: '#'});
Game.Tile.lavaTile = new Game.Tile({name: "lava", bg: "#ff2500", walkable: true, transparent: true, special: true, damage: 5, element: "fire"});
Game.Tile.herbTile = new Game.Tile({name: "herb", bg: "#2faf79", walkable: true, transparent: true, special: true, damage: -5});
