Game.UIMode = {};

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
  enter: function() {
    console.log("entered gamePlay");
    Game.Message.send("Playing");
  },

  exit: function() {
    console.log("exitted gamePlay");
  },

  render: function(display) {
    console.log("rendered gamePlay");
    display.drawText(5, 5, "Press W to win, L to lose");
  },

  handleInput: function(inputType, inputData) {
    Game.Message.send("You pressed the '" + String.fromCharCode(inputData.charCode) + "' key");
    if (inputType == 'keypress') {
      if (inputData.key == 'w' || (inputData.key == 'W' && inputData.shiftKey)) {
        Game.switchUIMode(Game.UIMode.gameWin);
      } else if (inputData.key == 'l' || (inputData.key == 'L' && inputData.shiftKey)) {
        Game.switchUIMode(Game.UIMode.gameLose);
      }
    }
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
