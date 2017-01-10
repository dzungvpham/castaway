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

    var bindEventToScreen = function(eventType) {
      window.addEventListener(eventType, function(evt) {
        Game.eventHandler(eventType, evt);
        });
    };
    // Bind keyboard input events
    bindEventToScreen('keypress');
    bindEventToScreen('keydown');

    Game.switchUIMode(Game.UIMode.gamePersistence);
  }
};

var Game = {

  _PERSISTENCE_NAMESPACE: "ws2017",
  _randomSeed: null,
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
  _game: null,

  init: function() {
    this._game = this;
    this._randomSeed = 5 + Math.floor(Math.random()*100000);
    console.log("Using random seed " + this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);

    for (var display_key in this.display) {
      this.display[display_key].o = new ROT.Display({
        width: this.display[display_key].w,
        height: this.display[display_key].h,
        spacing: this._DISPLAY_SPACING
      });
    }
  },

  setRandomSeed: function(seed) {
    this._randomSeed = seed;
    console.log("Using random seed " + this._randomSeed);
    ROT.RNG.setSeed(this._randomSeed);
  },

  getRandomSeed: function() {
    return this._randomSeed;
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
    this.getDisplay('main').clear();
    if (this._curUIMode) {
      this._curUIMode.render(this.getDisplay('main'));
    }
  },

  renderAvatar: function() {
    this.getDisplay('avatar').clear();
    if (this._curUIMode === null) {
      return;
   }
    if (this._curUIMode.hasOwnProperty('renderAvatarInfo')) {
      this._curUIMode.renderAvatarInfo(this.getDisplay('avatar'));
    }
  },

  renderMessage: function() {
    Game.Message.render(this.getDisplay('message'));
  },

  eventHandler: function(eventType, evt) {
    if (this._curUIMode !== null) {
      this._curUIMode.handleInput(eventType, evt);
    }
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
  },

  refresh: function() {
    this.renderDisplayAll();
  },

  toJSON: function() {
    var json = {
      "_randomSeed": this._randomSeed
    };
    return json;
  }
};
