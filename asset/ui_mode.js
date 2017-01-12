Game.UIMode = {};

Game.UIMode.DEFAUlT_FG = '#fff';
Game.UIMode.DEFAULT_BG = '#000';

Game.UIMode.gameStart = {
  enter: function() {
    console.log("entered gameStart");
    Game.Message.send("Welcome to WS2017");
  },

  exit: function() {
    console.log("exitted gameStart");
  },

  render: function(display) {
    console.log("rendered gameStart");
    display.drawText(5, 5, "Press any key to play");
  },

  handleInput: function(inputType, inputData) {
    if (inputData.charCode !== 0) {
      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  }
}

Game.UIMode.gamePlay = {
  attr: {
      _mapID: null,
      _camX: 0,
      _camY: 0,
      _avatarID: null
  },

  JSON_KEY: 'UIMode_gamePlay',

  enter: function() {
    console.log("entered gamePlay");
    Game.Message.send("Playing");
    if (this.attr._avatarID) {
      this.setCameraToAvatar();
    }
    Game.refresh();
  },

  exit: function() {
    Game.refresh();
  },

  render: function(display) {
    console.log("rendered gamePlay");
    this.getMap().renderOn(display, this.attr._camX, this.attr._camY);
    this.renderAvatar(display);
    display.drawText(0, 0, "Press W to win, L to lose, = to save/load/start new game");
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

  moveAvatar: function (dx,dy) {
    if (this.getAvatar().tryWalk(this.getMap(), dx, dy)) {
      this.setCameraToAvatar();
    }
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
    var pressedKey = String.fromCharCode(inputData.charCode);
    if (inputType == 'keypress') {
      //Game.Message.send("You pressed the '" + pressedKey + "' key");
      key = inputData.key;
      if (key == 'w' || (key == 'W' && inputData.shiftKey)) {
        Game.switchUIMode(Game.UIMode.gameWin);
      } else if (key == 'l' || (key == 'L' && inputData.shiftKey)) {
        Game.switchUIMode(Game.UIMode.gameLose);
      } else if (key == '=') {
        Game.switchUIMode(Game.UIMode.gamePersistence);
      } else {
        switch(key) {
          case '1':
            this.moveAvatar(-1, 1);
            break;
          case '2':
            this.moveAvatar(0, 1);
            break;
          case '3':
            this.moveAvatar(1, 1);
            break;
          case '4':
            this.moveAvatar(-1, 0);
            break;
          case '5':
            Game.renderMessage();
            //this.getAvatar.raiseEntityEvent('tookTurn');
            break;
          case '6':
            this.moveAvatar(1, 0);
            break;
          case '7':
            this.moveAvatar(-1, -1);
            break;
          case '8':
            this.moveAvatar(0, -1);
            break;
          case '9':
            this.moveAvatar(1, -1);
            break;
          default:
            break;
        }
      }
      Game.refresh();
      Game.Message.ageMessages();
    }
  },

  setupNewGame: function() {
    this.setMap(new Game.Map('caves1'));
    this.setAvatar(Game.EntityGenerator.create('avatar'));
    var map = this.getMap();
    map.addEntity(this.getAvatar(), map.getRandomWalkableLocation());
    this.setCameraToAvatar();
    for (var count = 0; count < 10; count++) {
       map.addEntity(Game.EntityGenerator.create('moss'), map.getRandomWalkableLocation());
    }
  },

  toJSON: function() {
    return Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  },

  fromJSON: function (json) {
    Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
  }
}

Game.UIMode.gameWin = {
  enter: function() {
    console.log("entered gameWin");
  },

  exit: function() {
    console.log("exitted gameWin");
  },

  render: function(display) {
    console.log("rendered gameWin");
    display.drawText(5, 5, "You won!");
  },

  handleInput: function(inputType, inputData) {
    Game.Message.clear();
  }
}

Game.UIMode.gameLose = {
  enter: function() {
    console.log("entered gameLose");
  },

  exit: function() {
    console.log("exitted gameLose");
  },

  render: function(display) {
    console.log("rendered gameLose");
    display.drawText(5, 5, "You lose!");
  },

  handleInput: function(inputType, inputData) {
    Game.Message.clear();
  }
}

Game.UIMode.gamePersistence = {
  RANDOM_SEED_KEY: 'gameRandomSeed',

  enter: function() {
    console.log("entered gamePersistence");
    Game.Message.send("Save/load game")
  },

  exit: function() {
    console.log("exitted gamePersistence");
  },

  render: function(display) {
    console.log("rendered gamePersistence");
    display.drawText(5, 5, "Press S to save, L to load, N for new game");
  },

  handleInput: function(inputType, inputData) {
    if (inputType == 'keypress') {
      if (inputData.key == 's' || (inputData.key == 'S' && inputData.shiftKey)) {
        this.saveGame();
      } else if (inputData.key == 'l' || (inputData.key == 'L' && inputData.shiftKey)) {
        this.loadGame();
      } else if (inputData.key == 'n' || (inputData.key == 'N' && inputData.shiftKey)) {
        this.newGame();
      }
    }
  },

  saveGame: function() {
    if (this.localStorageAvailable()) {
      Game.DATASTORE.GAME_PLAY = Game.UIMode.gamePlay.attr;
      window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game.DATASTORE));
      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  },

  loadGame: function() {
    var json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
    var state_data = JSON.parse(json_state_data);

    Game.setRandomSeed(state_data[this.RANDOM_SEED_KEY]);

    Game.DATASTORE.MAP = {};
    Game.DATASTORE.ENTITY = {};

    for (var mapID in state_data.MAP) {
      if (state_data.MAP.hasOwnProperty(mapID)) {
        var mapAttr = JSON.parse(state_data.MAP[mapID]);
        Game.DATASTORE.MAP[mapID] = new Game.Map(mapAttr._mapTileSetName);
        Game.DATASTORE.MAP[mapID].fromJSON(state_data.MAP[mapID]);
      }
    }

    for (var entityID in state_data.ENTITY) {
      if (state_data.ENTITY.hasOwnProperty(entityID)) {
        var entityAttr = JSON.parse(state_data.ENTITY[entityID]);
        Game.DATASTORE.ENTITY[entityID] = Game.EntityGenerator.create(entityAttr._generator_template_key);
        Game.DATASTORE.ENTITY[entityID].fromJSON(state_data.ENTITY[entityID]);
      }
    }

    Game.UIMode.gamePlay.attr = state_data.GAME_PLAY;
    Game.switchUIMode(Game.UIMode.gamePlay);
  },

  newGame: function() {
    Game.setRandomSeed(5 + Math.floor(Game.TRANSIENT_RNG.getUniform() * 100000));
    Game.UIMode.gamePlay.setupNewGame();
    Game.switchUIMode(Game.UIMode.gameStart);
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
