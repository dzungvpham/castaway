window.onload = function() {
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

    Game.switchUIMode("gameStart");
  }
};

var Game = {

  _PERSISTENCE_NAMESPACE: "ws2017",
  _randomSeed: null,
  _DISPLAY_SPACING: 1.1,
  _fontSize: 15,
  _tileWidth: 32,
  _tileHeight: 32,
  _squareRatio: false,
  _curUIMode: null,
  _UIModeNameStack: [],
  _game: null,
  DATASTORE: {},
  TRANSIENT_RNG: null,
  Scheduler: null,
  TimeEngine: null,

  display: {
    main: {
      w: 80,
      h: 24,
      o: null
    },
    avatar: {
      w: 24,
      h: 24,
      o: null
    },
    message: {
      w: 104,
      h: 10,
      o: null
    }
  },

  init: function() {
    Game.KeyBinding.setKeyBinding();
    this._game = this;
    this.TRANSIENT_RNG = ROT.RNG.clone();
    this.setRandomSeed(5 + Math.floor(this.TRANSIENT_RNG.getUniform() * 100000));

    for (var display_key in this.display) {
      this.display[display_key].o = new ROT.Display({
        width: this.display[display_key].w,
        height: this.display[display_key].h,
        spacing: this._DISPLAY_SPACING,
        fontSize: this._fontSize,
        tileWidth: this._tileWidth,
        tileHeight: this._tileHeight,
        forceSquareRatio: this._squareRatio
      });
    }

    var bindEventToUIMode = function(eventType) {
      window.addEventListener(eventType, function(evt) {
          if (Game.getCurUIMode() !== null) {
            Game.getCurUIMode().handleInput(eventType, evt);
          }
        });
    };
    // Bind keyboard input events
    bindEventToUIMode('keypress');
    bindEventToUIMode('keydown');

    Game.Audio.background.loop = true;
    Game.Audio.background.play();
  },

  initTimeEngine: function() {
    this.Scheduler = new ROT.Scheduler.Action();
    this.TimeEngine = new ROT.Engine(this.Scheduler);
  },

  setRandomSeed: function(seed) {
    this._randomSeed = seed;
    console.log("Using random seed " + this._randomSeed);
    this.DATASTORE[Game.UIMode.gamePersistence.RANDOM_SEED_KEY] = this._randomSeed;
    ROT.RNG.setSeed(this._randomSeed);
  },

  getRandomSeed: function() {
    return this._randomSeed;
  },

  getDisplay: function(displayID) {
    if (this.display.hasOwnProperty(displayID)) {
      return this.display[displayID].o;
    }
    return null;
  },

  getDisplayHeight: function (displayID) {
    if (this.display.hasOwnProperty(displayID)) {
      return this.display[displayID].h;
    }
    return null;
  },

 getDisplayWidth: function (displayID) {
    if (this.display.hasOwnProperty(displayID)) {
      return this.display[displayID].w;
    }
    return null;
  },

  getAvatar: function() {
    return Game.UIMode.gamePlay.getAvatar();
  },

  renderDisplayAll: function() {
    this.renderMain();
    this.renderAvatar();
    this.renderMessage();
  },

  renderMain: function() {
    this.getDisplay('main').clear();
    if (this.getCurUIMode() && 'render' in this.getCurUIMode()) {
      this.getCurUIMode().render(this.getDisplay('main'));
    }
  },

  renderAvatar: function() {
    this.getDisplay('avatar').clear();
    if (this.getCurUIMode() === null) {
      return;
   }
    if ('renderAvatarInfo' in this.getCurUIMode()) {
      this.getCurUIMode().renderAvatarInfo(this.getDisplay('avatar'));
    }
  },

  renderMessage: function() {
    Game.Message.render(this.getDisplay('message'));
  },

  hideMessage: function() {
    this.getDisplay('message').clear();
  },

  specialMessage: function(msg) {
    this.display.message.o.clear();
    this.display.message.o.drawText(1, 1, Game.UIMode.DEFAULT_COLOR_STR + msg, this.display.message.w);
  },

  eventHandler: function(eventType, evt) {
    if (this.getCurUIMode() !== null) {
      this.getCurUIMode().handleInput(eventType, evt);
    }
  },

  refresh: function() {
    this.renderDisplayAll();
  },

  isStarted: function() {
    return Game.UIMode.gamePlay.IS_STARTED;
  },

  clearDisplayAll: function() {
    for (var displayID in this.display) {
      disp = this.getDisplay(displayID);
      if (disp !== null)  {
        disp.clear();
      }
    }
  },

  switchUIMode: function(newUIModeName) {
    if (newUIModeName.startsWith("LAYER_")) {
      console.log("Cannot switch to LAYER UImode");
      return;
    }
    var curUIMode = this.getCurUIMode();
    if (curUIMode !== null) {
      curUIMode.exit();
    }
    this._UIModeNameStack[0] = newUIModeName;
    var newUIMode = Game.UIMode[newUIModeName];
    if (newUIMode) {
      newUIMode.enter();
    }
  },

  getCurUIMode: function() {
    var curUIModeName = this._UIModeNameStack[0];
    if (curUIModeName) {
      return Game.UIMode[curUIModeName];
    }
    return null;
  },

  addUIMode: function(newUIModeLayerName) {
    if (!newUIModeLayerName.startsWith("LAYER_")) {
      console.log("Cannot add non-layer UIMode to stack");
      return;
    }
    this._UIModeNameStack.unshift(newUIModeLayerName);
    var newUIMode = Game.UIMode[newUIModeLayerName];
    if (newUIMode) {
      newUIMode.enter();
    }
  },

  removeUIMode: function() {
    var curUIMode = this.getCurUIMode();
    if (curUIMode) {
      curUIMode.exit();
    }
    this._UIModeNameStack.shift();
    //this.renderDisplayAll();
  }
};
