Game.UIMode = {};

Game.UIMode.gameStart = {
  enter: function() {
    console.log("entered gameStart");
  },

  exit: function() {
    console.log("exitted gameStart");
  },

  render: function(display) {
    console.log("rendered gameStart");
    display.drawText(5, 5, "hello");
  },

  handleInput: function(inputType, inputData) {

  }
}

Game.UIMode.gamePlay = {
  enter: function() {
    console.log("entered gamePlay");
  },

  exit: function() {
    console.log("exitted gamePlay");
  },

  render: function(display) {
    console.log("rendered gamePlay");
    display.drawText(5, 5, "hello");
  },

  handleInput: function(inputType, inputData) {

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
    display.drawText(5, 5, "hello");
  },

  handleInput: function(inputType, inputData) {

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
    display.drawText(5, 5, "hello");
  },

  handleInput: function(inputType, inputData) {

  }
}
