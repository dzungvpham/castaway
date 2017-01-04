console.log("game.js loaded");

window.onload = function() {
  console.log("Window loaded - Starting game");
  if (!ROT.isSupported()) {
    alert("rot.js is not supported by browser")
  } else {
    Game.init();
    document.getElementById("ws-main-display").appendChild(
      Game.display.main.o.getContainer()
    );
  }
};

var Game = {

  display: {
    SPACING: 1.1,
    main: {
      w: 80,
      h: 24,
      o: null
    },
    avatar: {
      w: 20,
      h: 24,
      o: null
    },
    messages: {
      w: 100,
      h: 6
      o: null
    }
  },

  init: function() {
    this._randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._randomSeed = 76250;
    console.log("using random seed "+this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);

    this.display.main.o = new ROT.Display({width: this.display.main.w, height: this.display.main.h, spacing: Game.display.SPACING});
    this.renderMain();
  },

  getDisplay: function (displayId) {
    if (this.display.hasOwnProperty(displayId)) {
      return this.display[displayId].o;
    }
    return null;
  },

  renderMain: function() {
    var d = this.display.main.o;
    for (var i = 0; i < 10; i++) {
      d.drawText(5,i+5,"hello world");
    }
  }
};
