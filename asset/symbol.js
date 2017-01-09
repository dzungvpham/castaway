Game.Symbol = function(properties) { //Pass in hash properties instead
  if (!properties) {
    properties = {};
  }

  if (!('attr' in this)) {
    this.attr = {};
  }

  this.attr = {
    _char: properties.chr || ' ',
    _fg: properties.fg || Game.UIMode.DEFAULT_FG,
    _bg: properties.bg || Game.UIMode.DEFAULT_BG
  };
};

Game.Symbol.prototype.getChar = function() {
  return this.attr._char;
}

Game.Symbol.prototype.getFg = function() {
  return this.attr._fg;
}

Game.Symbol.prototype.getBg = function() {
  return this.attr._bg;
}

Game.Symbol.prototype.draw = function (display, dispX, dispY) {
  display.draw(dispX, dispY, this.attr._char, this.attr._fg, this.attr._bg);
};

//Game.Symbol.AVATAR = new Game.Symbol({chr: '@', fg: '#dda'});
