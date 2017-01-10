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
};

Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function() {
  return this.attr._name;
};

Game.Tile.prototype.isWalkable = function() {
  return this.attr._walkable;
}

Game.Tile.nullTile = new Game.Tile({name: "nullTile"});
Game.Tile.floorTile = new Game.Tile({name: "floorTile", chr: '.', walkable: true});
Game.Tile.wallTile = new Game.Tile({name: "wallTile", chr: '#'});
