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

Game.Symbol.prototype.draw = function (display, dispX, dispY, isMasked) {
  var char = this.attr._char;
  if (typeof this.attr._char == 'object') {
    char = this.attr._char[this.getDirection()];
  }
  if (isMasked) {
    display.draw(dispX, dispY, char, '#444', '#000');
  } else {
    display.draw(dispX, dispY, char, this.attr._fg, this.attr._bg);
  }
};
