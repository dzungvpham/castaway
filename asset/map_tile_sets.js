Game.MapTileSets = {
  stage_1: {
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
          if (ROT.RNG.getUniform() < 0.5) {
            mapTiles[x][y] = Game.Tile.wallTile;
          } else {
            mapTiles[x][y] = Game.Tile.wallTile2;
          }
        }
      }, 1);

      return mapTiles;
    }
  },

  stage_2: {
    _width: 100,
    _height: 100,

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

      Game.MapTileSetsTool.spawnSpecialTerrain(mapTiles, Game.Tile.lavaTile, 10, 25);
      Game.MapTileSetsTool.spawnSpecialTerrain(mapTiles, Game.Tile.herbTile, 3, 10);

      return mapTiles;
    }
  },

  stage_3: {
    _width: 30,
    _height: 30,

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

      Game.MapTileSetsTool.spawnSpecialTerrain(mapTiles, Game.Tile.lavaTile, 5, 20);
      Game.MapTileSetsTool.spawnSpecialTerrain(mapTiles, Game.Tile.herbTile, 1, 3);

      return mapTiles;
    }
  },

  stage_4: {
    _width: 50,
    _height: 50,

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

      Game.MapTileSetsTool.spawnSpecialTerrain(mapTiles, Game.Tile.lavaTile, 5, 25);
      Game.MapTileSetsTool.spawnSpecialTerrain(mapTiles, Game.Tile.herbTile, 1, 3);

      return mapTiles;
    }
  }
};
