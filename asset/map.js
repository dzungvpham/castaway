Game.DATASTORE.MAP = {};

Game.Map = function(mapTileSetName) {
  console.log("Setting up new map using " + mapTileSetName + " tile set");
  this._tiles = Game.MapTileSets[mapTileSetName].getMapTiles();
  this.attr = {
    _id: Game.util.randomString(Game._randomStringLength),
    _mapTileSetName: mapTileSetName,
    _width: this._tiles.length,
    _height: this._tiles[0].length,
    _entitiesByLocation: {},
    _locationsByEntities: {}
  };
  Game.DATASTORE.MAP[this.attr._id] = this;
};

Game.Map.prototype.getID = function() {
  return this.attr._id;
};

Game.Map.prototype.getWidth = function() {
  return this.attr._width;
};

Game.Map.prototype.getHeight = function() {
  return this.attr._height;
};

Game.Map.prototype.getTile = function(x_or_pos, y) {
  x = x_or_pos;
  if (typeof x_or_pos == 'object') {
    x = x_or_pos.x;
    y = x_or_pos.y;
  }

  if ((x < 0) || (x >= this.attr._width) || (y<0) || (y >= this.attr._height)) {
    return Game.Tile.nullTile;
  }
  return this._tiles[x][y] || Game.Tile.nullTile;
};

Game.Map.prototype.getEntity = function(x_or_pos, y) {
  x = x_or_pos;
  if (typeof x_or_pos == 'object') {
    x = x_or_pos.x;
    y = x_or_pos.y;
  }
  var entityID = this.attr._entitiesByLocation[x + ',' + y];
  if (entityID) {
    return Game.DATASTORE.ENTITY[entityID];
  }
  return false;
};

Game.Map.prototype.addEntity = function(entity, pos) {
  this.attr._locationsByEntities[entity.getID()] = pos.x + "," + pos.y;
  this.attr._entitiesByLocation[pos.x + "," + pos.y] = entity.getID();
  entity.setMap(this);
  entity.setPos(pos);
};

Game.Map.prototype.updateEntityLocation = function(entity) {
  var origPos = this.attr._locationsByEntities[entity.getID()];
  if (origPos) {
    delete this.attr._entitiesByLocation[origPos];
    //this.attr._entitiesByLocation[origPos] = undefined;
  }
  var newPos = entity.getPos();
  this.attr._entitiesByLocation[newPos.x + "," + newPos.y] = entity.getID();
  this.attr._locationsByEntities[entity.getID()] = newPos.x + "," + newPos.y;
};

Game.Map.prototype.removeEntity = function(entity) {
  delete this.attr._entitiesByLocation[entity.getX() + "," + entity.getY];
  delete this.attr._locationsByEntities[entity.getID()];
  return entity;
};

Game.Map.prototype.removeEntityAt = function(x_or_pos, y) {
  var entity = getEntity(x_or_pos, y);
  if (entity) {
    return this.removeEntity(entity);
  }
  return entity;
}

Game.Map.prototype.getRandomLocation = function(filter_func) {
  if (filter_func === undefined) {
    filter_func = function(tile) {
      return true;
    };
  }
  var tileX, tileY, t;
  do {
    tileX = Game.util.randomInt(0, this.attr._width - 1);
    tileY = Game.util.randomInt(0, this.attr._height - 1);
    tile = this.getTile(tileX, tileY);
  } while (!filter_func(tile));
  return {x: tileX, y: tileY};
};

Game.Map.prototype.getRandomWalkableLocation = function() {
  return this.getRandomLocation(function (tile) {return tile.isWalkable(); });
};

Game.Map.prototype.renderOn = function (display, camX, camY) {
  var dispW = display._options.width; //width of visible display
  var dispH = display._options.height; //height of visible display
  var xStart = camX - Math.round(dispW/2); //camX & camY is at the center
  var yStart = camY - Math.round(dispH/2);
  for (var x = 0; x < dispW; x++) {
    for (var y = 0; y < dispH; y++) {
      var mapPos = {x: x + xStart, y: y + yStart};
      var tile = this.getTile(mapPos); //Draw tiles
      if (tile.getName() == 'nullTile') {
        tile = Game.Tile.wallTile;
      }
      tile.draw(display, x, y);
      var entity = this.getEntity(mapPos);
      if (entity) {
        entity.draw(display, x, y);
      }
    }
  }
};

Game.Map.prototype.toJSON = function() {
  var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  return json;
};

Game.Map.prototype.fromJSON = function(json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
};
