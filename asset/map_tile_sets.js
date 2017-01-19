Game.MapTileSets = {
  caves1: {
    _width: 20,
    _height: 20,

    getMapTiles: function() {
      var gen = new ROT.Map.Cellular(this._width, this._height, {connected: true});
      gen.randomize(0.5);

      var totalIterations = 3;
      for (var i = 0; i < totalIterations - 1; i++) {
        gen.create();
      }

      var mapTiles = Game.util.init2DArray(this._width, this._height, Game.Tile.nullTile);
      gen.connect(function(x, y, v) {
        if (v === 1) {
          mapTiles[x][y] = Game.Tile.floorTile;
        } else {
          mapTiles[x][y] = Game.Tile.wallTile;
        }
      }, 1);

      Game.MapTileSetsTool.spawnSpecialTerrain(mapTiles, Game.Tile.lavaTile, 1, 5);

      return mapTiles;
    }
  }
};
