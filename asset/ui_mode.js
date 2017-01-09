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
      _map: null,
      _mapWidth: 300,
      _mapHeight: 200,
      _camX: 100,
      _camY: 100,
      _avatar: null
  },

  enter: function() {
    console.log("entered gamePlay");
    Game.Message.send("Playing");
  },

  exit: function() {
    console.log("exitted gamePlay");
  },

  render: function(display) {
    console.log("rendered gamePlay");
    display.drawText(1, 1, "Press W to win, L to lose, = to save/load game");
    this.attr._map.renderOn(display, this.attr._camX, this.attr._camY);
    this.renderAvatar(display);
  },

  renderAvatar: function(display) {
    //Calculate position of avatar based on starting coords
    this.attr._avatar.draw(display, this.attr._avatar.getX() - this.attr._camX + display._options.width/2,
      this.attr._avatar.getY() - this.attr._camY + display._options.height/2);
  },

  renderAvatarInfo: function (display) {
    var fg = Game.UIMode.DEFAULT_FG;
    var bg = Game.UIMode.DEFAULT_BG;
    display.drawText(1, 2, "Avatar x: " + this.attr._avatar.getX(), fg, bg);
    display.drawText(1, 3, "Avatar y: " + this.attr._avatar.getY(), fg, bg);
    display.drawText(1, 4, "Turn: " + this.attr._avatar.getTurn());
    display.drawText(1, 5, "HP: " + this.attr._avatar.getCurHp() + "/" + this.attr._avatar.getMaxHp());
  },

  moveAvatar: function (dx,dy) {
    if (this.attr._avatar.tryWalk(this.attr._map, dx, dy)) {
      this.setCameraToAvatar();
    }
  },

  moveCamera: function (dx,dy) {
    this.setCamera(this.attr._cameraX + dx,this.attr._cameraY + dy);
  },

  setCamera: function (sx, sy) {
    this.attr._camX = Math.min(Math.max(0, sx), this.attr._mapWidth);
    this.attr._camY = Math.min(Math.max(0, sy), this.attr._mapHeight);
  },

  setCameraToAvatar: function () {
    this.setCamera(this.attr._avatar.getX(), this.attr._avatar.getY());
  },

  handleInput: function(inputType, inputData) {
    var pressedKey = String.fromCharCode(inputData.charCode);
    Game.Message.send("You pressed the '" + pressedKey + "' key");
    Game.renderMessage();
    if (inputType == 'keypress') {
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
    }
  },

  setupPlay: function() {
    var gen = new ROT.Map.Cellular(this.attr._mapWidth, this.attr._mapHeight);
    gen.randomize(0.5);

    var totalIterations = 3;
    for (var i = 0; i < totalIterations - 1; i++) {
      gen.create();
    }

    mapTiles = Game.util.init2DArray(this.attr._mapWidth, this.attr._mapHeight, Game.Tile.nullTile);
    gen.create(function(x, y, v) {
      if (v === 1) {
        mapTiles[x][y] = Game.Tile.floorTile;
      } else {
        mapTiles[x][y] = Game.Tile.wallTile;
      }
    });

    this.attr._map = new Game.Map(mapTiles);
    this.attr._avatar = new Game.Entity(Game.EntityTemplates.Avatar);
    this.attr._avatar.setPos(100, 100);
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
      window.localStorage.setItem(Game._PERSISTENCE_NAMESPACE, JSON.stringify(Game._game));
      Game.switchUIMode(Game.UIMode.gamePlay);
    }
  },

  loadGame: function() {
    var json_state_data = window.localStorage.getItem(Game._PERSISTENCE_NAMESPACE);
    var state_data = JSON.parse(json_state_data);
    Game.setRandomSeed(state_data._randomSeed);
    Game.UIMode.gamePlay.setupPlay();
    Game.switchUIMode(Game.UIMode.gamePlay);
  },

  newGame: function() {
    Game.setRandomSeed(5 + Math.floor(Math.random()*100000));
    Game.UIMode.gamePlay.setupPlay();
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
  }
}
