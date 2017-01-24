Game.UIMode = {};

Game.UIMode.DEFAULT_FG = '#fff';
Game.UIMode.DEFAULT_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{' + Game.UIMode.DEFAULT_FG + '}%b{' + Game.UIMode.DEFAULT_BG + '}';

Game.UIMode.gameStart = {
  enter: function() {
    Game.refresh();
  },

  exit: function() {
    Game.refresh();
  },

  render: function(display) {
    display.drawText(8, 1, Game.UIMode.DEFAULT_COLOR_STR + Game.Misc.gameStart);
    display.drawText(30, 15, Game.UIMode.DEFAULT_COLOR_STR + "Press any key to continue");
  },

  handleInput: function(inputType, inputData) {
    if (inputData.charCode !== 0) {
      Game.switchUIMode("gamePersistence");
    }
  }
}

Game.UIMode.gamePersistence = {
  RANDOM_SEED_KEY: 'gameRandomSeed',
  _storedKeyBinding: '',

  enter: function() {
    this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
    Game.KeyBinding.setKeyBinding('persist');
    Game.refresh();
    setTimeout(function() {Game.specialMessage(" ");}, 1);
  },

  exit: function() {
  },

  render: function(display) {
    display.drawText(8, 1, Game.UIMode.DEFAULT_COLOR_STR + Game.Misc.gameStart);
    if (Game.isStarted()) {
      display.drawText(20, 15, Game.UIMode.DEFAULT_COLOR_STR + "Press N for new game, S to save, L to load, ESC to resume");
    } else {
      display.drawText(30, 15, Game.UIMode.DEFAULT_COLOR_STR + "Press N for new game, L to load");
    }
  },

  handleInput: function(inputType, inputData) {
    var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);
    if (!actionBinding) {
      return false;
    }
    switch (actionBinding.actionKey) {
      case "PERSISTENCE_SAVE":
        Game.getDisplay("main").drawText(30, 18, "Saving....");
        setTimeout(function() {Game.getCurUIMode().saveGame();}, 100);
        break;
      case "PERSISTENCE_LOAD":
        Game.getDisplay("main").drawText(30, 18, "Loading....");
        setTimeout(function() {Game.getCurUIMode().loadGame();}, 100);
        break;
      case "PERSISTENCE_NEW":
        Game.getDisplay("main").drawText(30, 18, "Loading....");
        setTimeout(function() {Game.getCurUIMode().newGame();}, 100);
        break;
      case "CANCEL":
        if (Game.isStarted()) {
          Game.switchUIMode("gamePlay");
          Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
        }
        break;
      case "HELP":
        Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
        Game.addUIMode("LAYER_textReading");
        break;
    }
    return false;
  },

  saveGame: function() {
    if (this.localStorageAvailable()) {
      Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
      Game.DATASTORE.MESSAGE = Game.Message.attr;
      Game.DATASTORE.KEY_BINDING_SET = this._storedKeyBinding;
      Game.DATASTORE.SCHEDULE = {};
      //offsetting times by 1 so later restore can just drop them in and go
      Game.DATASTORE.SCHEDULE[Game.Scheduler._current.getID()] = 1;
      for (var i = 0; i < Game.Scheduler._queue._eventTimes.length; i++) {
        Game.DATASTORE.SCHEDULE[Game.Scheduler._queue._events[i].getID()] = Game.Scheduler._queue._eventTimes[i] + 1;
      }
      Game.DATASTORE.SCHEDULE_TIME = Game.Scheduler._queue.getTime() - 1; //offset by 1 so that when the engine is started after restore the queue state will match that as when it was saved

      window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
      Game.getDisplay("main").drawText(30, 18, "Game saved");
    }
  },

  loadGame: function() {
    var json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
    var state_data = JSON.parse(json_state_data);

    this.resetDatastore();

    Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

    for (var mapID in state_data.MAP) {
      if (state_data.MAP.hasOwnProperty(mapID)) {
        var mapAttr = JSON.parse(state_data.MAP[mapID]);
        Game.DATASTORE.MAP[mapID] = new Game.Map(mapAttr._mapTileSetName, mapID);
        Game.DATASTORE.MAP[mapID].fromJSON(state_data.MAP[mapID]);
      }
    }

    ROT.RNG.getUniform(); //Once map is generated, RNG is cycled to get new data for entity generation

    for (var entityID in state_data.ENTITY) {
      if (state_data.ENTITY.hasOwnProperty(entityID)) {
        var entityAttr = JSON.parse(state_data.ENTITY[entityID]);
        Game.DATASTORE.ENTITY[entityID] = Game.EntityGenerator.create(entityAttr._generator_template_key, entityAttr._ID);
        Game.DATASTORE.ENTITY[entityID].fromJSON(state_data.ENTITY[entityID]);
      }
    }

    for (var itemID in state_data.ITEM) {
      if (state_data.ITEM.hasOwnProperty(itemID)) {
        var itemAttr = JSON.parse(state_data.ITEM[itemID]);
        var newItem = Game.ItemGenerator.create(itemAttr._generator_template_key, itemAttr._id);
        Game.DATASTORE.ITEM[itemID] = newItem;
        Game.DATASTORE.ITEM[itemID].fromJSON(state_data.ITEM[itemID]);
      }
    }

    Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
    Game.Message.attr = state_data.MESSAGE;

    Game.initTimeEngine();
      for (var schedItemId in state_data.SCHEDULE) {
        if (state_data.SCHEDULE.hasOwnProperty(schedItemId)) {
          // check here to determine which data store thing will be added to the scheduler (and the actual addition may vary - e.g. not everyting will be a repeatable thing)
          if (Game.DATASTORE.ENTITY.hasOwnProperty(schedItemId)) {
            Game.Scheduler.add(Game.DATASTORE.ENTITY[schedItemId], true, state_data.SCHEDULE[schedItemId]);
          }
        }
      }
      Game.Scheduler._queue._time = state_data.SCHEDULE_TIME;

    Game.switchUIMode("gamePlay");
    Game.KeyBinding.setKeyBinding(state_data.KEY_BINDING_SET);
    Game.KeyBinding.informPlayer();
  },

  newGame: function() {
    this.resetDatastore();
    Game.initTimeEngine();
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform() * 100000));
    Game.UIMode.gamePlay.setupNewGame("stage_1");
    setTimeout(function(){ Game.switchUIMode("gamePlay"); }, 1);
  },

  localStorageAvailable: function() {
    try {
      var x = '__storage_test__';
      window.localStorage.setItem(x, x);
      window.localStorage.removeItem(x);
      return true;
    } catch(e) {
      Game.Message.send("No local data storage is available for this browser");
      return false;
    }
  },

  resetDatastore: function() {
    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};
    Game.DATASTORE.ITEM = {};
    //Game.initTimeEngine();
  },

  BASE_toJSON: function(state_hash_name) {
    var state = this.attr;
    if (state_hash_name) {
      state = this[state_hash_name];
    }
    var json = JSON.stringify(state);
    return json;
  },

  BASE_fromJSON: function (json, state_hash_name) {
    var using_state_hash = 'attr';
    if (state_hash_name) {
      using_state_hash = state_hash_name;
    }
    this[using_state_hash] = JSON.parse(json);
  }
}

Game.UIMode.gamePlay = {
  attr: {
      _mapID: null,
      _avatarID: null,
      _camX: 0,
      _camY: 0,
      _currentStage: null
  },

  JSON_KEY: 'UIMode_gamePlay',
  IS_STARTED: false,

  enter: function() {
    Game.KeyBinding.setKeyBinding();
    this.IS_STARTED = true;
    if (this.attr._avatarID) {
      this.setCameraToAvatar();
    }

    setTimeout(function() {Game.TimeEngine.unlock();}, 1);
    Game.refresh();
  },

  exit: function() {
    Game.refresh();
    Game.TimeEngine.lock();
  },

  render: function(display) {
    var renderOptions = {
      visibleCells: this.getAvatar().getVisibleCells(),
      maskedCells: this.getAvatar().getRememberedCoords(),
      showMaskedEntities: false
    };
    this.getMap().renderOn(display, this.attr._camX, this.attr._camY, renderOptions);
    this.getAvatar().rememberCoords(renderOptions.visibleCells);
    this.renderAvatar(display);
    display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR + "Press ? to open help, = to open save/load/new game menu");
    display.drawText(72, 0, Game.UIMode.DEFAULT_COLOR_STR + "Stage " + this.getCurrentStage().split("_")[1]);
  },

  getMap: function() {
    return Game.DATASTORE.MAP[this.attr._mapID];
  },

  setMap: function(map) {
    this.attr._mapID = map.getID();
  },

  getAvatar: function() {
    return Game.DATASTORE.ENTITY[this.attr._avatarID];
  },

  setAvatar: function(avatar) {
    this.attr._avatarID = avatar.getID();
  },

  renderAvatar: function(display) {
    //Calculate position of avatar based on starting coords
    var avatar = this.getAvatar();
    var targetX = avatar.getX() - this.attr._camX + display._options.width/2;
    var targetY = avatar.getY() - this.attr._camY + display._options.height/2;
    var origBg = avatar.getBg();
    avatar.setBg(this.getMap().getTile(avatar.getX(), avatar.getY()).getBg());
    avatar.draw(display, targetX, targetY);
    avatar.setBg(origBg);
  },

  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_FG;
    var bg = Game.UIMode.DEFAULT_BG;
    var avatar = this.getAvatar();
    display.drawText(1, 1, "HP: " + avatar.getCurrentHP() + "/" + avatar.getMaxHP());
    display.drawText(1, 2, "Base Damage: " + avatar.getRangedAttackPower());
    display.drawText(1, 3, "Accuracy: " + avatar.getRangedHitChance() + "%");
    display.drawText(1, 4, "Evasion: " + avatar.getDodgeChance() + "%");
    display.drawText(1, 5, "Sight: " + avatar.getSightRadius());
    display.drawText(1, 6, "Chakra: " + avatar.getCurrentElement());
    display.drawText(1, 7, "Killed: " + avatar.getKillCount());
    // display.drawText(1, 7, "Physical Armor: " + avatar.getNormalArmor());
    // display.drawText(1, 8, "Fire Armor: " + avatar.getElementArmor("fire"));
    // display.drawText(1, 9, "Water Armor: " + avatar.getElementArmor("water"));
    // display.drawText(1, 10, "Earth Armor: " + avatar.getElementArmor("earth"));
    // display.drawText(1, 11, "Wind Armor: " + avatar.getElementArmor("wind"));
    // display.drawText(1, 12, "Lightning Armor: " + avatar.getElementArmor("lightning"));
  },

  moveAvatar: function (pdx, pdy) {
    var moveResp = this.getAvatar().raiseSymbolActiveEvent("adjacentMove", {dx: pdx, dy: pdy});

    if (moveResp.madeAdjacentMove && moveResp.madeAdjacentMove[0]) {
      this.setCameraToAvatar();
      return true;
    }
    return false;
  },

  setCamera: function (sx, sy) {
    this.attr._camX = Math.min(Math.max(0, sx), this.getMap().getWidth());
    this.attr._camY = Math.min(Math.max(0, sy), this.getMap().getHeight());
  },

  setCameraToAvatar: function () {
    this.setCamera(this.getAvatar().getX(), this.getAvatar().getY());
  },

  handleInput: function(inputType, inputData) {
    var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);
    if (!actionBinding || (actionBinding.actionKey == 'CANCEL')) {
      return false;
    }
    var tookTurn = false;
    switch (actionBinding.actionKey) {
      case "MOVE_U":
        this.getAvatar().raiseSymbolActiveEvent("changeDirection", {direction: 'north'});
        tookTurn = this.moveAvatar(0, -1);
        break;
      case "MOVE_L":
        this.getAvatar().raiseSymbolActiveEvent("changeDirection", {direction: 'west'});
        tookTurn = this.moveAvatar(-1, 0);
        break;
      case "MOVE_WAIT":
        this.getAvatar().raiseSymbolActiveEvent("specialTerrain", {tile: this.getMap().getTile(this.getAvatar().getPos())});
        tookTurn = true;
        break;
      case "MOVE_R":
        this.getAvatar().raiseSymbolActiveEvent("changeDirection", {direction: 'east'});
        tookTurn = this.moveAvatar(1, 0);
        break;
      case "MOVE_D":
        this.getAvatar().raiseSymbolActiveEvent("changeDirection", {direction: 'south'});
        tookTurn = this.moveAvatar(0, 1);
        break;
      case "SHOOT":
        this.getAvatar().raiseSymbolActiveEvent("shoot");
        tookTurn = true;
        break;
      case "NEXT_ELEM":
        this.getAvatar().raiseSymbolActiveEvent("nextElement");
        break;
      case "PREV_ELEM":
        this.getAvatar().raiseSymbolActiveEvent("prevElement");
        break;
      case "INVENTORY":
        Game.addUIMode("LAYER_inventoryListing");
        Game.getCurUIMode().doSetup();
        break;
      case "PICKUP":
        var pickUpList = Game.util.objectArrayToIDArray(this.getAvatar().getMap().getItems(this.getAvatar().getPos()));
        if (pickUpList.length <= 1) {
          var pickupRes = this.getAvatar().pickupItems(pickUpList);
          tookTurn = pickupRes.numItemsPickedUp > 0;
        } else {
          Game.addUIMode('LAYER_inventoryPickup');
          Game.getCurUIMode().doSetup();
        }
        break;
      case "EXAMINE":
        this.getAvatar().raiseSymbolActiveEvent("examine");
        break;
      case "CHANGE_BINDINGS":
        Game.KeyBinding.swapToNextKeyBinding();
        break;
      case "PERSISTENCE":
        Game.switchUIMode("gamePersistence");
        break;
      case "HELP":
        Game.UIMode.LAYER_textReading.setText(Game.KeyBinding.getBindingHelpText());
        Game.addUIMode("LAYER_textReading");
        break;
    }

    Game.refresh();
    if (tookTurn) {
      if (this.getAvatar()) {
        this.getAvatar().raiseSymbolActiveEvent('actionDone');
        if (this.checkWin()) {
          if (this.getCurrentStage() != "stage_3") {
            setTimeout(function() {Game.switchUIMode("gameNextStage");}, 1);
          } else {
            setTimeout(function() {Game.switchUIMode("gameWin");}, 1);
          }
        } else if (this.checkLose()) {
          setTimeout(function() {Game.switchUIMode("gameLose");}, 1);
        }
        return true;
      } else {
        setTimeout(function() {Game.switchUIMode("gameLose");}, 1);
      }
    }
    return false;
  },

  getCurrentStage: function() {
    return this.attr._currentStage;
  },

  setCurrentStage: function(stage) {
    this.attr._currentStage = stage;
  },

  checkWin: function() {
    var loc = this.getAvatar().getMap().attr._locationsByEntity;
    if (Object.keys(loc).length == 1 && this.getAvatar().isAlive()) {
      return true;
    }
    return false;
  },

  checkLose: function() {
    if (!this.getAvatar().isAlive()) {
      return true;
    }
    return false;
  },

  setupNewGame: function(stage) {
    Game.Message.clear();
    this.setCurrentStage(stage);
    this.setMap(new Game.Map(stage));
    var map = this.getMap();
    Game.Stage.populateMap(map, stage);
    if (stage == "stage_1") {
      this.setAvatar(Game.EntityGenerator.create('avatar'));
      map.addEntity(this.getAvatar(), map.getRandomWalkableLocation());
    } else {
      map.addEntity(this.getAvatar(), map.getRandomWalkableLocation());
    }
    this.setCameraToAvatar();
  },

  toJSON: function() {
    return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  },

  fromJSON: function (json) {
    Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
  }
}

Game.UIMode.gameNextStage = {
  enter: function() {
    Game.TimeEngine.lock();
    Game.refresh();
  },

  exit: function() {
  },

  render: function(display) {
    display.drawText(5, 12, Game.UIMode.DEFAULT_COLOR_STR + "Stage Completed!");
    display.drawText(5, 13, Game.UIMode.DEFAULT_COLOR_STR + "Loading next stage...");
    this.setupNextStage();
    display.drawText(5, 13, Game.UIMode.DEFAULT_COLOR_STR + "Press any key to continue");
  },

  handleInput: function(inputType, inputData) {
    if (inputData.charCode !== 0) {
      Game.switchUIMode("gamePlay");
    }
  },

  setupNextStage: function() {
    var num = Game.UIMode.gamePlay.getCurrentStage().split("_")[1];
    if (num < 3) {
      num++;
    }
    var avatarID = Game.getAvatar().getID();
    var avatar = Game.getAvatar();
    var container = avatar.getContainer();
    var itemsInventory = container.getAllItems();
    Game.UIMode.gamePersistence.resetDatastore();
    Game.DATASTORE.ITEM[container.getID()] = container;
    for (var i = 0; i < itemsInventory.length; i++) {
      Game.DATASTORE.ITEM[itemsInventory[i].getID()] = itemsInventory[i];
    }
    Game.DATASTORE.ENTITY[avatarID] = avatar;
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform() * 100000));
    Game.UIMode.gamePlay.setupNewGame("stage_" + num);
  }
}

Game.UIMode.gameWin = {
  enter: function() {
    Game.isStarted = false;
    Game.TimeEngine.lock();
    Game.refresh();
  },

  exit: function() {
  },

  render: function(display) {
    display.drawText(5, 5, Game.UIMode.DEFAULT_COLOR_STR + "You won!");
    display.drawText(5, 6, Game.UIMode.DEFAULT_COLOR_STR + "Press any key to go continue");
  },

  handleInput: function(inputType, inputData) {
    if (inputData.charCode !== 0) {
      Game.switchUIMode("gamePersistence");
    }
  }
}

Game.UIMode.gameLose = {
  enter: function() {
    Game.TimeEngine.lock();
    Game.refresh();
  },

  exit: function() {
  },

  render: function(display) {
    display.drawText(5, 5, Game.UIMode.DEFAULT_COLOR_STR + "You lose!");
    display.drawText(5, 6, Game.UIMode.DEFAULT_COLOR_STR + "Press any key to go continue");
  },

  handleInput: function(inputType, inputData) {
    if (inputData.charCode !== 0) {
      Game.switchUIMode("gamePersistence");
    }
  }
}

Game.UIMode.LAYER_textReading = {
  _storedKeyBinding: '',
  _text: 'default',
  _renderY: 0,
  _renderScrollLimit: 0,

  enter: function() {
    this._renderY = 0;
    this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
    Game.KeyBinding.setKeyBinding('LAYER_textReading');
    Game.refresh();
    setTimeout(function() {Game.specialMessage("[ESC] to exit, [ and ] for scrolling")}, 1);
  },

  exit: function() {
    Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
    setTimeout(function() {Game.refresh();}, 1);
  },

  render: function(display) {
    var dim = Game.util.getDisplayDim(display);
    var linesTaken = display.drawText(1, this._renderY, Game.UIMode.DEFAULT_COLOR_STR + this._text, dim.w - 2);
    this._renderScrollLimit = dim.h - linesTaken;
    if (this._renderScrolLimit > 0) {
      this._renderScrollLimit = 0;
    }
  },

  handleInput: function(inputType, inputData) {
    var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);
    if (!actionBinding) {
      return false;
    }
    switch (actionBinding.actionKey) {
      case "CANCEL":
        Game.removeUIMode();
        break;
      case "DATA_NAV_UP":
        this._renderY--;
        if (this._renderY < this._renderScrolLimit) {
          this._renderY = this._renderScrollLimit;
        }
        Game.renderMain();
        return true;
      case "DATA_NAV_DOWN":
        this._renderY++;
        if (this._renderY > 0) {
          this._renderY = 0;
        }
        Game.renderMain();
        return true;
      case "MISC":
        this.setText(Game.Misc.Chi);
        Game.renderMain();
        return true;
    }
  },

  getText: function() {
    return this._text;
  },

  setText: function(text) {
    this._text = text;
  }
}

Game.UIMode.LAYER_itemListing = function(template) {
  template = template ? template : {};

  this._caption = template.caption || 'Items';
  this._helpText = template.helpText || "[Enter] to execute, [Esc] to exit, [ and ] for scrolling";
  this._processingFunction = template.processingFunction;
  this._autoProcess = template.autoProcess || false;
  this._filterListedItemsOnFunction = template.filterListedItemsOn || function(x) {
      return x;
  };
  this._canSelectItem = template.canSelect || false;
  this._canSelectMultipleItems = template.canSelectMultipleItems || false;
  this._hasNoItemOption = template.hasNoItemOption || false;
  this._origItemIdList= template.itemIdList ? JSON.parse(JSON.stringify(template.itemIdList)) : [];
  this._itemIdList = [];
  this._runFilterOnItemIdList();
  this._keyBindingName= template.keyBindingName || 'LAYER_itemListing';

  this._selectedItemIdxs= [];
  this._displayItemsStartIndex = 0;
  this._displayItems = [];
  this._displayMaxNum = Game.getDisplayHeight("main") - 3;
  this._numItemsShown = 0;
};

Game.UIMode.LAYER_itemListing.prototype._runFilterOnItemIdList = function () {
  this._itemIdList = [];
  for (var i = 0; i < this._origItemIdList.length; i++) {
    if (this._filterListedItemsOnFunction(this._origItemIdList[i])) {
      this._itemIdList.push(this._origItemIdList[i]);
    }
  }
};

Game.UIMode.LAYER_itemListing.prototype.enter = function () {
  this._storedKeyBinding = Game.KeyBinding.getKeyBinding();
  Game.KeyBinding.setKeyBinding(this._keyBindingName);
  Game.refresh();
};

Game.UIMode.LAYER_itemListing.prototype.exit = function () {
  Game.KeyBinding.setKeyBinding(this._storedKeyBinding);
  setTimeout(function(){
     Game.refresh();
  }, 1);
};

Game.UIMode.LAYER_itemListing.prototype.setup = function(setupParams) {
  setupParams = setupParams ? setupParams : {};

  if (setupParams.hasOwnProperty('caption')) {
    this._caption = setupParams.caption;
  }
  if (setupParams.hasOwnProperty('processingFunction')) {
    this._processingFunction = setupParams.processingFunction;
  }
  if (setupParams.hasOwnProperty('filterListedItemsOn')) {
    this._filterListedItemsOnFunction = setupParams.filterListedItemsOn;
    this._runFilterOnItemIdList();
  }
  if (setupParams.hasOwnProperty('canSelect')) {
    this._canSelectItem = setupParams.canSelect;
  }
  if (setupParams.hasOwnProperty('canSelectMultipleItems')) {
    this._canSelectMultipleItems = setupParams.canSelectMultipleItems;
  }
  if (setupParams.hasOwnProperty('hasNoItemOption')) {
    this._hasNoItemOption = setupParams.hasNoItemOption;
  }
  if (setupParams.hasOwnProperty('itemIdList')) {
    this._origItemIdList = JSON.parse(JSON.stringify(setupParams.itemIdList));
    this._runFilterOnItemIdList();
  }
  if (setupParams.hasOwnProperty('keyBindingName')) {
    this._keyBindingName = setupParams.keyBindingName;
  }

  this._selectedItemIdxs= [];
  this._displayItemsStartIndex = 0;
  this._displayItems = [];
  this._numItemsShown = 0;
  this.determineDisplayItems();
};

Game.UIMode.LAYER_itemListing.prototype.getItemList = function () {
  return this._itemIdList;
};

Game.UIMode.LAYER_itemListing.prototype.setItemList = function (itemList) {
  this._itemIdList = itemList;
};

Game.UIMode.LAYER_itemListing.prototype.determineDisplayItems = function() {
    this._displayItems = this._itemIdList.slice(this._displayItemsStartIndex, this._displayItemsStartIndex + this._displayMaxNum).map(function(itemId) { return Game.DATASTORE.ITEM[itemId]; });
};

Game.UIMode.LAYER_itemListing.prototype.handlePageUp = function() {
    this._displayItemsStartIndex -= this._displayMaxNum;
    if (this._displayItemsStartIndex < 0) {
        this._displayItemsStartIndex = 0;
    }
    this.determineDisplayItems();
    Game.renderMain();
};

Game.UIMode.LAYER_itemListing.prototype.handlePageDown = function() {
    var numUnseenItems = this._itemIdList.length - (this._displayItemsStartIndex + this._displayItems.length);
    this._displayItemsStartIndex += this._displayMaxNum;
    if (this._displayItemsStartIndex > this._itemIdList.length) {
        this._displayItemsStartIndex -= this._displayMaxNum;
    }
    this.determineDisplayItems();
    Game.renderMain();
};

Game.UIMode.LAYER_itemListing.prototype.getKeyBindingName = function () {
  return this._keyBindingName;
};

Game.UIMode.LAYER_itemListing.prototype.setKeyBindingName = function (keyBindingName) {
  this._keyBindingName = keyBindingName;
};

Game.UIMode.LAYER_itemListing.prototype.getCaptionText = function () {
  var captionText = 'Items';
  if (typeof this._caption == 'function') {
    captionText = this._caption();
  } else {
    captionText = this._caption;
  }
  return captionText;
};

Game.UIMode.LAYER_itemListing.prototype.render = function(display) {
  var selectionLetters = 'abcdefghijklmnopqrstuvwxyz';

  display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR + this.getCaptionText());
  display.drawText(0, 1, Game.UIMode.DEFAULT_COLOR_STR + this._helpText);

  var row = 2;
  if (this._hasNoItemOption) {
    display.drawText(0, 1, Game.UIMode.DEFAULT_COLOR_STR + '0 - no item');
    row++;
  }
  if (this._displayItemsStartIndex > 0) {
    display.drawText(0, 1 + row, '%c{black}%b{yellow}] for more');
    row++;
  }

  this._numItemsShown = 0;
  for (var i = 0; i < this._displayItems.length; i++) {
    var trueItemIndex = this._displayItemsStartIndex + i;
    if (this._displayItems[i]) {
      var selectionLetter = selectionLetters.substring(i, i + 1);

      // If we have selected an item, show a +, else show a space between the selectionLetter and the item's name.
      var selectionState = (this._canSelectItem && this._selectedItemIdxs[trueItemIndex]) ? '+' : ' ';

      var item_symbol = this._displayItems[i].getRepresentation() + Game.UIMode.DEFAULT_COLOR_STR;
      display.drawText(0, 1 + row, Game.UIMode.DEFAULT_COLOR_STR + selectionLetter + ' ' + selectionState + ' ' + item_symbol + ' ' + this._displayItems[i].getName());
      row++;
      this._numItemsShown++;
    }
  }
  if ((this._displayItemsStartIndex + this._displayItems.length) < this._itemIdList.length) {
    display.drawText(0, 1 + row, '%c{black}%b{yellow}] for more');
    row++;
  }
};

Game.UIMode.LAYER_itemListing.prototype.executeProcessingFunction = function() {
  // Gather the selected item ids
  var selectedItemIds = [];
  for (var selectionIndex in this._selectedItemIdxs) {
    if (this._selectedItemIdxs.hasOwnProperty(selectionIndex)) {
      selectedItemIds.push(this._itemIdList[selectionIndex]);
    }
  }
  // Call the processing function and end the player's turn if it returns true.
  if (this._processingFunction(selectedItemIds)) {
    //Game.getAvatar().raiseSymbolActiveEvent('actionDone');
    setTimeout(function() {
       Game.Message.ageMessages();
    }, 1);
  }
  Game.refresh();
};

Game.UIMode.LAYER_itemListing.prototype.handleInput = function (inputType, inputData) {
  var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);
  if (!actionBinding) {
    if ((inputType === 'keydown') && this._canSelectItem && inputData.keyCode >= ROT.VK_A && inputData.keyCode <= ROT.VK_Z) {

      var index = inputData.keyCode - ROT.VK_A;
      if (index > this._numItemsShown) {
        return false;
      }
      var trueItemIndex = this._displayItemsStartIndex + index;

      if (this._itemIdList[trueItemIndex]) {
        // If multiple selection is allowed, toggle the selection status, else select the item and exit the screen
        if (this._canSelectMultipleItems) {
          if (this._selectedItemIdxs[trueItemIndex]) {
            delete this._selectedItemIdxs[trueItemIndex];
          } else {
            this._selectedItemIdxs[trueItemIndex] = true;
          }
        } else {
          var index = -1;
          for (var i = 0; i < this._selectedItemIdxs.length; i++) {
            if (this._selectedItemIdxs[i] == true) {
              var index = i;
              break;
            }
          }
          if (index > -1) {
            if (this._selectedItemIdxs[trueItemIndex] == this._selectedItemIdxs[index]) {
              delete this._selectedItemIdxs[trueItemIndex];
            } else {
              delete this._selectedItemIdxs[index];
              this._selectedItemIdxs[trueItemIndex] = true;
            }
          } else {
            this._selectedItemIdxs[trueItemIndex] = true;
          }
        }
        if (this._autoProcess) {
          this.executeProcessingFunction();
        }
        Game.refresh();
      } else {
       return false;
      }
    }
    return false;
  }

  switch (actionBinding.actionKey) {
    case "CANCEL":
      Game.removeUIMode();
      break;
    case "DATA_NAV_UP":
      this.handlePageUp();
      break;
    case "DATA_NAV_DOWN":
      this.handlePageDown();
      break;
    case "SELECT_NOTHING":
      if (this._canSelectItem && this._hasNoItemOption) {
        this._selectedItemIdxs = {};
      }
      break;
    case "HELP":
      var helpText = this.getCaptionText() + "\n";
      if (this._canSelectItem || this._canSelectMultipleItems) {
        var numItemsShown = this._displayMaxNum;
        if (this._hasNoItemOption) {
          numItemsShown--;
        }
        if ((this._displayItemsStartIndex + this._displayItems.length) < this._itemIdList.length) {
          numItemsShown--;
        }
        if (this._displayItemsStartIndex > 0) {
          numItemsShown--;
        }
        //var lastSelectionLetter = (String.fromCharCode(ROT.VK_A + this._numItemsShown - 1)).toLowerCase();
        helpText += "a-z" + "   select the indicated item\n";
      }
      helpText += Game.KeyBinding.getBindingHelpText();
      Game.UIMode.LAYER_textReading.setText(helpText);
      Game.addUIMode('LAYER_textReading');
      break;
  }

  return false;
};

Game.UIMode.LAYER_inventoryListing = new Game.UIMode.LAYER_itemListing({
    caption: 'Inventory',
    helpText: "a-z to choose item, Shift + D to drop, [Esc] to exit, [ and ] for scrolling",
    canSelect: true,
    canSelectMultipleItems: false,
    keyBindingName: 'LAYER_inventoryListing',
    processingFunction: function (selectedItemIds) {
      if (selectedItemIds[0]) {
        var d = Game.DATASTORE.ITEM[selectedItemIds[0]].getDetailedDescription();
        setTimeout(function() {
           Game.specialMessage(d);
        }, 2);
      }
      return false;
    },
    autoProcess: true
});

Game.UIMode.LAYER_inventoryListing.doSetup = function() {
  this.setup({itemIdList: Game.getAvatar().getInventoryItemIDs()});
};

Game.UIMode.LAYER_inventoryListing.handleInput = function(inputType, inputData) {
  var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);

  if (actionBinding) {
    switch(actionBinding.actionKey) {
      case "PROCESS_SELECTIONS":
        this.execute();
        break;
      case "DROP":
        var origFunc = this._processingFunction;
        this._processingFunction = function (selectedItemIds) {
          if (selectedItemIds.length < 1) {
            return false;
          }
          var dropResult = Game.getAvatar().dropItems(selectedItemIds);
          return dropResult.numItemsDropped > 0;
        }
        this.execute();
        this._processingFunction = origFunc;
        return true;
    }
  }
  return Game.UIMode.LAYER_itemListing.prototype.handleInput.call(this, inputType, inputData);
};

Game.UIMode.LAYER_inventoryListing.execute = function() {
  this.executeProcessingFunction();
  this.doSetup();
  Game.refresh();
}

Game.UIMode.LAYER_inventoryPickup = new Game.UIMode.LAYER_itemListing({
  caption: 'Pick Up',
  helpText: "a-z to choose item, [Enter] to pick up chosen items, [Esc] to exit, [ and ] for scrolling",
  canSelect: true,
  canSelectMultipleItems: true,
  keyBindingName: 'LAYER_inventoryPickup',
  processingFunction: function (selectedItemIds) {
    var pickupResult = Game.getAvatar().pickupItems(selectedItemIds);
    return pickupResult.numItemsPickedUp > 0;
  }
});

Game.UIMode.LAYER_inventoryPickup.handleInput = function(inputType, inputData) {
  var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);

  if (actionBinding) {
    switch(actionBinding.actionKey) {
      case "PROCESS_SELECTIONS":
        this.execute();
        break;
    }
  }
  return Game.UIMode.LAYER_itemListing.prototype.handleInput.call(this, inputType, inputData);
};

Game.UIMode.LAYER_inventoryPickup.doSetup = function () {
  this.setup({itemIdList: Game.util.objectArrayToIDArray(Game.getAvatar().getMap().getItems(Game.getAvatar().getPos()))});
};

Game.UIMode.LAYER_inventoryPickup.execute = function() {
  this.executeProcessingFunction();
  this.doSetup();
  Game.refresh();
}
