console.log("game.js loaded");

window.onload = function() {
  console.log("Window loaded - Starting game");

  if (!ROT.isSupported()) {
    alert("rot.js is not supported by browser")
  } else {

    Game.init();

    document.getElementById("wsrl-main-display").appendChild(
      Game.getDisplay('main').getContainer()
    );
    document.getElementById("wsrl-avatar-display").appendChild(
      Game.getDisplay('avatar').getContainer()
    );
    document.getElementById("wsrl-message-display").appendChild(
      Game.getDisplay('message').getContainer()
    );

    Game.switchUIMode(Game.UIMode.gameStart);
  }
};

var Game = {

  _DISPLAY_SPACING: 1.1,

  display: {
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
    message: {
      w: 100,
      h: 6,
      o: null
    }
  },

  _curUIMode: null,

  init: function() {
    this._randomSeed = 5 + Math.floor(Math.random()*100000);
    //this._randomSeed = 76250;
    console.log("using random seed "+this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);

    for (var display_key in this.display) {
      this.display[display_key].o = new ROT.Display({
        width: this.display[display_key].w,
        height: this.display[display_key].h,
        spacing: this._DISPLAY_SPACING
      });
    }
  },

  getDisplay: function (displayId) {
    if (this.display.hasOwnProperty(displayId)) {
      return this.display[displayId].o;
    }
    return null;
  },

  renderDisplayAll: function() {
    this.renderMain();
    this.renderAvatar();
    this.renderMessage();
  },

  renderMain: function() {
    this._curUIMode.render(this.getDisplay('main'));
  },

  renderAvatar: function() {
    this._curUIMode.render(this.getDisplay('avatar'));
  },

  renderMessage: function() {
    this._curUIMode.render(this.getDisplay('message'));
  },

  switchUIMode: function(newUIMode) {
    if (this._curUIMode !== null) {
      this._curUIMode.exit();
    }
    this._curUIMode = newUIMode;
    if (this._curUIMode !== null) {
      this._curUIMode.enter();
    }
    this.renderDisplayAll();
  }
};
