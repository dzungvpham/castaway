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
    this.renderDisplayAll();
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
    var d = this.display.main.o;
    for (var i = 0; i < 10; i++) {
      d.drawText(5,i+5,"hello world");
    }
  },

  renderAvatar: function() {
    var d = this.getDisplay('avatar');
    d.drawText(5, 5, "Avatar");
  },

  renderMessage: function() {
    var d = this.getDisplay('message');
    d.drawText(5, 5, "Message");
  }
};
