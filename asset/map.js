Game.DATASTORE.MAP = {};

Game.Map = function(mapTileSetName, presetID) {
  console.log("Setting up new map using " + mapTileSetName + " tile set");
  this._tiles = Game.MapTileSets[mapTileSetName].getMapTiles();
  this.attr = {
    _id: presetID || Game.util.uniqueID(),
    _mapTileSetName: mapTileSetName,
    _width: this._tiles.length,
    _height: this._tiles[0].length,
    _entitiesByLocation: {},
    _locationsByEntity: {},
    _itemsByLocation: {}
  };
  this._fov = null;
  this.setUpFOV();
  Game.DATASTORE.MAP[this.attr._id] = this;
};

Game.Map.prototype.setUpFOV = function() {
  var map = this;
  this._fov = new ROT.FOV.PreciseShadowcasting(function(x, y) {
    return !map.getTile(x, y).isOpaque();
  }, {topology: 8});
};

Game.Map.prototype.getFOV = function() {
  return this._fov;
}

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

  if ((x < 0) || (x >= this.attr._width) || (y < 0) || (y >= this.attr._height)) {
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
  this.attr._locationsByEntity[entity.getID()] = pos.x + "," + pos.y;
  this.attr._entitiesByLocation[pos.x + "," + pos.y] = entity.getID();
  entity.setMap(this);
  entity.setPos(pos);
};

Game.Map.prototype.updateEntityLocation = function(entity) {
  var origPos = this.attr._locationsByEntity[entity.getID()];
  if (origPos) {
    delete this.attr._entitiesByLocation[origPos];
    //this.attr._entitiesByLocation[origPos] = undefined;
  }
  var newPos = entity.getPos();
  this.attr._entitiesByLocation[newPos.x + "," + newPos.y] = entity.getID();
  this.attr._locationsByEntity[entity.getID()] = newPos.x + "," + newPos.y;
};

Game.Map.prototype.removeEntity = function(entity) {
  delete this.attr._entitiesByLocation[entity.getX() + "," + entity.getY];
  delete this.attr._locationsByEntity[entity.getID()];
  return entity;
};

Game.Map.prototype.removeEntityAt = function(x_or_pos, y) {
  var entity = getEntity(x_or_pos, y);
  if (entity) {
    return this.removeEntity(entity);
  }
  return entity;
};

Game.Map.prototype.getItems = function(x_or_pos, y) {
  var useX = x_or_pos;
  var useY = y;
  if (typeof x_or_pos == 'object') {
    useX = x_or_pos.x;
    useY = x_or_pos.y;
  }
  var itemIDs = this.attr._itemsByLocation[useX + ',' + useY];
  if (itemIDs) {
    return itemIDs.map(function(id) {return Game.DATASTORE.ITEM[id]; });
  }
  return []; // Return empty array if there is no item at the specified pos
};

Game.Map.prototype.addItem = function (item, pos) {
    var loc = pos.x + "," + pos.y;
    if (! this.attr._itemsByLocation[loc]) {
      this.attr._itemsByLocation[loc] = [];
    }
    this.attr._itemsByLocation[loc].push(item.getID());
};

Game.Map.prototype.removeItemAt = function (itm_or_idx, x_or_pos,y) {
  var useX = x_or_pos;
  var useY=y;
  if (typeof x_or_pos == 'object') {
    useX = x_or_pos.x;
    useY = x_or_pos.y;
  }
  var itemIDs = this.attr._itemsByLocation[useX + ',' + useY];
  if (!itemIDs) {
    return false;
  }

  var item = false;
  var extractedID = '';
  if (Number.isInteger(itm_or_idx)) { //If ID
    extractedID = itemIDs.splice(itm_or_idx, 1);
    item = Game.DATASTORE.ITEM[extractedID];
  } else { //If specific item
    var idToFind = itm_or_idx.getID();
    for (var i = 0; i < itemIDs.length; i++) {
      if (idToFind === itemIDs[i]) {
        extractedID = itemIDs.splice(i, 1);
        item = Game.DATASTORE.ITEM[extractedID];
        break;
      }
    }
  }
  return item;
};

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
  } while (!filter_func(tile, tileX, tileY));
  return {x: tileX, y: tileY};
};

Game.Map.prototype.getRandomWalkableLocation = function() {
  var map = this;
  return this.getRandomLocation(function (tile, tileX, tileY) {
    return (tile.isWalkable() && map.getEntity(tileX, tileY) !== 'object');
  });
};

Game.Map.prototype.renderOn = function (display, camX, camY, renderOptions) {
  var opt = renderOptions || {};

  var checkCellVisible = opt.visibleCells !== undefined;
  var visibleCells = opt.visibleCells || {};
  var showVisibleEntities = (opt.showVisibleEntities !== undefined) ? opt.showVisibleEntities : true;
  var showVisibleItems = (opt.showVisibleItems !== undefined) ? opt.showVisibleItems : true;
  var showVisibleTiles = (opt.showVisibleTiles !== undefined) ? opt.showVisibleTiles : true;

  var checkCellMasked = opt.maskedCells !== undefined;
  var maskedCells = opt.maskedCells || {};
  var showMaskedEntities = (opt.showMaskedEntities !== undefined) ? opt.showMaskedEntities : true;
  var showMaskedItems = (opt.showMaskedItems !== undefined) ? opt.showMaskedItems : true;
  var showMaskedTiles = (opt.showMaskedTiles !== undefined) ? opt.showMaskedTiles : true;

  if (!(showVisibleEntities || showVisibleTiles || showMaskedEntities || showMaskedTiles)) {
    return;
  }

  var dim = Game.util.getDisplayDim(display);
  var xStart = camX - Math.round(dim.w/2); //camX & camY is at the center
  var yStart = camY - Math.round(dim.h/2);

  for (var x = 0; x < dim.w; x++) {
    for (var y = 0; y < dim.h; y++) {

      var mapPos = {x: x + xStart, y: y + yStart};
      var mapCoord = mapPos.x + ',' + mapPos.y;
      if (!((checkCellVisible && visibleCells[mapCoord]) || (checkCellMasked && maskedCells[mapCoord]))) {
        if (!visibleCells[mapPos.x + ',' + mapPos.y]) {
          continue; //Skip this loop if current pos is not to be shown (i.e not remembered)
        }
      }

      var tile = this.getTile(mapPos); //Draw tiles
      if (tile.getName() == 'nullTile') {
        tile = Game.Tile.wallTile;
      }
      if (showVisibleTiles && visibleCells[mapCoord]) {
        tile.draw(display, x, y);
      } else if (showMaskedTiles && maskedCells[mapCoord]) {
        tile.draw(display, x, y, true);
      }

      var items = this.getItems(mapPos);
      if (items.length == 1) {
        if (showVisibleItems && visibleCells[mapCoord]) {
          items[0].setBg(tile.getBg());
          items[0].draw(display, x, y);
        } else if (showMaskedItems && maskedCells[mapCoord]) {
          items[0].setBg(tile.getBg());
          items[0].draw(display, x, y, true);
        }
      } else if (items.length > 1) {
        if (showVisibleItems && visibleCells[mapCoord]) {
          Game.Symbol.ITEM_PILE.setBg(tile.getBg());
          Game.Symbol.ITEM_PILE.draw(display, x, y);
        } else if (showMaskedItems && maskedCells[mapCoord]) {
          Game.Symbol.ITEM_PILE.setBg(tile.getBg());
          Game.Symbol.ITEM_PILE.draw(display, x, y, true);
        }
      }

      var entity = this.getEntity(mapPos);
      if (entity) {
        if (showVisibleEntities && visibleCells[mapCoord]) {
          entity.setBg(tile.getBg());
          entity.draw(display, x, y);
        } else if (showMaskedEntities && maskedCells[mapCoord]) {
          entity.setBg(tile.getBg());
          entity.draw(display, x, y, true);
        }
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
