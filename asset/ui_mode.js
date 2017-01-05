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
      _map: null
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
    display.drawText(5, 5, "Press W to win, L to lose, = to save/load game");
    this.attr._map.renderOn(display);
  },

  handleInput: function(inputType, inputData) {
    Game.Message.send("You pressed the '" + String.fromCharCode(inputData.charCode) + "' key");
    if (inputType == 'keypress') {
      if (inputData.key == 'w' || (inputData.key == 'W' && inputData.shiftKey)) {
        Game.switchUIMode(Game.UIMode.gameWin);
      } else if (inputData.key == 'l' || (inputData.key == 'L' && inputData.shiftKey)) {
        Game.switchUIMode(Game.UIMode.gameLose);
      } else if (inputData.key == '=') {
        Game.switchUIMode(Game.UIMode.gamePersistence);
      }
    }
  },

  setupPlay: function() {
    var gen = new ROT.Map.Cellular(80, 24);
    gen.randomize(0.5);

    var totalIterations = 3;
    for (var i = 0; i < totalIterations - 1; i++) {
      gen.create();
    }

    mapTiles = Game.util.init2DArray(80, 24, Game.Tile.nullTile);
    gen.create(function(x, y, v) {
      if (v === 1) {
        mapTiles[x][y] = Game.Tile.floorTile;
      } else {
        mapTiles[x][y] = Game.Tile.wallTile;
      }
    });

    this.attr._map = new Game.Map(mapTiles);
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
