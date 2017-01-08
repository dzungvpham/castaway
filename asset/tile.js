Game.Tile = function(name, symbol) {
  this.attr = {
    _name: name,
    _sym: symbol
  };
};

Game.Tile.prototype.getName = function() {
  return this.attr._name;
};
Game.Tile.prototype.getSymbol = function() {
  return this.attr._sym;
};

Game.Tile.nullTile = new Game.Tile("nullTile", new Game.Symbol());
Game.Tile.floorTile = new Game.Tile("floorTile", new Game.Symbol('.'));
Game.Tile.wallTile = new Game.Tile("wallTile", new Game.Symbol('#'));
