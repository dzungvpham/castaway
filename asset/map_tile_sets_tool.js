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

  spawnSpecialTerrain: function(mapTiles, tile, iteration, maxRadius) {
    for (var i = 0; i < iteration; i++) {
      var queue = [];
      var radius = Game.util.randomInt(1, maxRadius);
      var radiusCount = 0;
      var width = mapTiles.length;
      var height = mapTiles[0].length;

      queue.push(this.getRandomModifiableLocation(mapTiles));
      while (queue.length != 'undefined' && queue.length > 0 && radiusCount <= radius) {
        radiusCount++;
        var mapPos = queue.shift();
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

// Game.MapTileSetsTool.prototype.getRandomLocation = function(filter_func, mapTiles) {
//   if (filter_func === undefined) {
//     filter_func = function(tile) {
//       return true;
//     };
//   }
//   var width = mapTiles.length;
//   var height = mapTiles[0].length;
//   var tileX, tileY, tile;
//   do {
//     tileX = Game.util.randomInt(0, width - 1);
//     tileY = Game.util.randomInt(0, height - 1);
//     tile = mapTiles[tileX][tileY];
//   } while (!filter_func(tile));
//   return {x: tileX, y: tileY};
// };
//
// Game.MapTileSetsTool.prototype.getRandomModifiableLocation = function(mapTiles) {
//   return this.getRandomLocation(function (tile) {
//     return (tile.isWalkable() && !tile.isSpecial());
//   });
// };
//
// Game.MapTileSetsTool.prototype.spawnSpecialTerrain = function(mapTiles, tile, iteration, maxRadius) {
//   for (var i = 0; i < iteration; i++) {
//     var queue = [];
//     var radius = Game.util.randomInt(1, maxRadius);
//     var radiusCount = 0;
//     queue.push(this.getRandomModifiableLocation(mapTiles));
//     while (queue.length != 'undefined' && queue.length > 0 && radiusCount <= radius) {
//       radiusCount++;
//       var mapPos = queue.unshift();
//       mapTiles[mapPos.x][mapPos.y] = tile;
//       var adjPos = Game.util.positions8AdjacentTo(mapPos);
//       for (var j = 0; j < adjPos.length; j++) {
//         var x = adjPos[j].x;
//         var y = adjPos[j].y;
//         var t = mapTilesp[x][y];
//         if (t.isWalkable() && !t.isSpecial()) {
//           queue.push(adjPos[j]);
//         }
//       }
//     }
//   }
// };
