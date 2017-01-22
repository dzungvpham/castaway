Game.Symbol = function(template) { //Pass in hash template instead
  if (!template) {
    template = {};
  }

  if (!('attr' in this)) {
    this.attr = {};
  }

  this.attr = {
    _char: template.chr || '',
    _fg: template.fg || Game.UIMode.DEFAULT_FG,
    _bg: template.bg || Game.UIMode.DEFAULT_BG
  };
};

Game.Symbol.prototype.getChar = function() {
  return this.attr._char;
};

Game.Symbol.prototype.getFg = function() {
  return this.attr._fg;
};

Game.Symbol.prototype.getBg = function() {
  return this.attr._bg;
};

Game.Symbol.prototype.setFg = function(color) {
  this.attr._fg = color;
};

Game.Symbol.prototype.setBg = function(color) {
  this.attr._bg = color;
};

Game.Symbol.prototype.getColorDesignator = function(){
  return '%c{' + this.attr._fg + '}%b{' + this.attr._bg + '}';
};

Game.Symbol.prototype.getRepresentation = function() {
  return '%c{' + this.attr._fg + '}%b{' + this.attr._bg + '}' + this.attr._char;
};


Game.Symbol.prototype.draw = function (display, dispX, dispY, isMasked) {
  var char = this.attr._char;
  if (typeof this.attr._char == 'object') {
    char = this.attr._char[this.getDirection()];
  }
  if (isMasked) {
    display.draw(dispX, dispY, char, Game.util.changeColorLuminance(this.attr._fg, -0.8), Game.util.changeColorLuminance(this.attr._bg, -0.8));
  } else {
    display.draw(dispX, dispY, char, this.attr._fg, this.attr._bg);
  }
};

Game.Symbol.ITEM_PILE = new Game.Symbol({chr: "*", fg: "#dcc"});
