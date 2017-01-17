Game.UIMode = {};

Game.UIMode.DEFAULT_FG = '#fff';
Game.UIMode.DEFAULT_BG = '#000';
Game.UIMode.DEFAULT_COLOR_STR = '%c{' + Game.UIMode.DEFAULT_FG + '}%b{' + Game.UIMode.DEFAULT_BG + '}';

Game.UIMode.gameStart = {
  enter: function() {
    Game.KeyBinding.setKeyBinding();
    Game.refresh();
  },

  exit: function() {
    Game.KeyBinding.informPlayer();
    Game.refresh();
  },

  render: function(display) {
    display.drawText(5, 5, Game.UIMode.DEFAULT_COLOR_STR + "Press any key to play");
  },

  handleInput: function(inputType, inputData) {
    if (inputData.charCode !== 0) {
      Game.switchUIMode("gamePlay");
    }
  }
}

Game.UIMode.gamePlay = {
  attr: {
      _mapID: null,
      _avatarID: null,
      _camX: 0,
      _camY: 0
  },

  JSON_KEY: 'UIMode_gamePlay',
  IS_STARTED: false,

  enter: function() {
    this.IS_STARTED = true;
    if (this.attr._avatarID) {
      this.setCameraToAvatar();
    }

    Game.TimeEngine.unlock();
    Game.refresh();
  },

  exit: function() {
    Game.refresh();
    Game.TimeEngine.lock();
  },

  render: function(display) {
    var renderOptions = {
      visibleCells: this.getAvatar().getVisibleCells(),
      maskedCells: this.getAvatar().getRememberedCoords()
    };
    this.getMap().renderOn(display, this.attr._camX, this.attr._camY, renderOptions);
    this.getAvatar().rememberCoords(renderOptions.visibleCells);
    this.renderAvatar(display);
    display.drawText(0, 0, Game.UIMode.DEFAULT_COLOR_STR + "Press = to save/load/start new game");
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
    avatar.draw(display, avatar.getX() - this.attr._camX + display._options.width/2,
      avatar.getY() - this.attr._camY + display._options.height/2);
  },

  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_FG;
    var bg = Game.UIMode.DEFAULT_BG;
    var avatar = this.getAvatar();
    display.drawText(1, 2, "Avatar x: " + avatar.getX(), fg, bg);
    display.drawText(1, 3, "Avatar y: " + avatar.getY(), fg, bg);
    display.drawText(1, 4, "Turn: " + avatar.getTurn());
    display.drawText(1, 5, "HP: " + avatar.getCurrentHP() + "/" + avatar.getMaxHP());
    display.drawText(1, 6, "Atk: " + avatar.getAttackPower());
    display.drawText(1, 7, "Killed: " + avatar.getKillCount());
  },

  moveAvatar: function (pdx, pdy) {
    var moveResp = this.getAvatar().raiseEntityEvent("adjacentMove", {dx: pdx, dy: pdy});

    if (moveResp.madeAdjacentMove && moveResp.madeAdjacentMove[0]) {
      this.setCameraToAvatar();
      return true;
    }
    return false;
  },

  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
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
      case "MOVE_UL":
        tookTurn = this.moveAvatar(-1, -1);
        break;
      case "MOVE_U":
        tookTurn = this.moveAvatar(0, -1);
        break;
      case "MOVE_UR":
        tookTurn = this.moveAvatar(1, -1);
        break;
      case "MOVE_L":
        tookTurn = this.moveAvatar(-1, 0);
        break;
      case "MOVE_WAIT":
        tookTurn = true;
        break;
      case "MOVE_R":
        tookTurn = this.moveAvatar(1, 0);
        break;
      case "MOVE_DL":
        tookTurn = this.moveAvatar(-1, 1);
        break;
      case "MOVE_D":
        tookTurn = this.moveAvatar(0, 1);
        break;
      case "MOVE_DR":
        tookTurn = this.moveAvatar(1, 1);
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
      this.getAvatar().raiseEntityEvent('actionDone');
      Game.Message.ageMessages();
      return true;
    }
    return false;
  },

  setupNewGame: function() {
    Game.Message.clear();
    this.setMap(new Game.Map('caves1'));
    this.setAvatar(Game.EntityGenerator.create('avatar'));
    var map = this.getMap();
    map.addEntity(this.getAvatar(), map.getRandomWalkableLocation());
    this.setCameraToAvatar();
    for (var count = 0; count < 5; count++) { //Not consistent
       map.addEntity(Game.EntityGenerator.create('moss'), map.getRandomWalkableLocation());
       map.addEntity(Game.EntityGenerator.create('newt'), map.getRandomWalkableLocation());
       map.addEntity(Game.EntityGenerator.create('squirell'), map.getRandomWalkableLocation());
       map.addEntity(Game.EntityGenerator.create('slug'), map.getRandomWalkableLocation());
    }
  },

  toJSON: function() {
    return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  },

  fromJSON: function (json) {
    Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
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
    if (Game.isStarted()) {
      display.drawText(5, 5, Game.UIMode.DEFAULT_COLOR_STR + "Press S to save, L to load, N for new game, ESC to resume");
    } else {
      display.drawText(5, 5, Game.UIMode.DEFAULT_COLOR_STR + "Press L to load, N for new game");
    }
  },

  handleInput: function(inputType, inputData) {
    var actionBinding = Game.KeyBinding.getInputBinding(inputType, inputData);
    if (!actionBinding) {
      return false;
    }
    switch (actionBinding.actionKey) {
      case "PERSISTENCE_SAVE":
        this.saveGame();
        break;
      case "PERSISTENCE_LOAD":
        this.loadGame();
        break;
      case "PERSISTENCE_NEW":
        this.newGame();
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
      Game.switchUIMode("gamePlay");
    }
  },

  loadGame: function() {
    var json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
    var state_data = JSON.parse(json_state_data);

    Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};

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
    Game.KeyBinding.setKeyBinding(state_data.KEY_BINDING_SET)
    Game.KeyBinding.informPlayer();
  },

  newGame: function() {
    Game.DATASTORE = {};
    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};
    Game.initTimeEngine();
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform() * 100000));
    Game.UIMode.gamePlay.setupNewGame();
    setTimeout(function(){ Game.switchUIMode("gameStart"); }, 1);
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

Game.UIMode.gameWin = {
  enter: function() {
    Game.TimeEngine.lock();
  },

  exit: function() {
  },

  render: function(display) {
    display.drawText(5, 5, Game.UIMode.DEFAULT_COLOR_STR + "You won!");
  },

  handleInput: function(inputType, inputData) {
    Game.Message.clear();
  }
}

Game.UIMode.gameLose = {
  enter: function() {
    Game.TimeEngine.lock();
  },

  exit: function() {
  },

  render: function(display) {
    display.drawText(5, 5, Game.UIMode.DEFAULT_COLOR_STR + "You lose!");
  },

  handleInput: function(inputType, inputData) {
    Game.Message.clear();
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
    Game.specialMessage("[ESC] to exit, [ and ] for scrolling");
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
