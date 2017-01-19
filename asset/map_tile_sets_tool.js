Game.MapTileSetsTool = {
  getRandomLocation: function(filter_func, mapTiles) {
    if (filter_func === undefined) {
      filter_func = function(tile) {
        return true;
      };
    }
    var width = mapTiles.length;
    var height = mapTiles[0].length;
    var tileX, tileY, tile;
    do {
      tileX = Game.util.randomInt(0, width - 1);
      tileY = Game.util.randomInt(0, height - 1);
      tile = mapTiles[tileX][tileY];
    } while (!filter_func(tile));
    return {x: tileX, y: tileY};
  },

  getRandomModifiableLocation: function(mapTiles) {
    return this.getRandomLocation(function (tile) {
      return (tile.isWalkable() && !tile.isSpecial());
    }, mapTiles);
  },

  spawnSpecialTerrain: function(mapTiles, tile, iteration, maxTilesNum) {
    for (var i = 0; i < iteration; i++) {
      var queue = [];
      var width = mapTiles.length;
      var height = mapTiles[0].length;
      var tileCount = 0;

      queue.push(this.getRandomModifiableLocation(mapTiles));
      while (queue.length != 'undefined' && queue.length > 0 && tileCount <= maxTilesNum) {
        var mapPos = queue.shift();
        tileCount++;
        mapTiles[mapPos.x][mapPos.y] = tile;

        var adjPos = Game.util.positions8AdjacentTo(mapPos);
        for (var j = 0; j < adjPos.length; j++) {
          var x = adjPos[j].x;
          var y = adjPos[j].y;
          if ((x >= 0) && (x < width) && (y >= 0) && (y < height)) {
            var t = mapTiles[x][y];
            if (t.isWalkable() && !t.isSpecial()) {
              queue.push(adjPos[j]);
            }
          }
        }
      }
    }
  }
};
