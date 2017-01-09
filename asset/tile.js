Game.Tile = function(properties) { //Pass in hash
  if (!properties) {
    properties = {};
  }

  if (!('attr' in this)) {
    this.attr = {};
  }

  Game.Symbol.call(this, properties);

  this.attr._name = properties.name || Game.UIMode.DEFAULT_BG
};

Game.Tile.extend(Game.Symbol);

Game.Tile.prototype.getName = function() {
  return this.attr._name;
};

Game.Tile.nullTile = new Game.Tile({name: "nullTile"});
Game.Tile.floorTile = new Game.Tile({name: "floorTile", chr: '.'});
Game.Tile.wallTile = new Game.Tile({name: "wallTile", chr: '#'});
