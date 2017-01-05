Game.Message = {

  _curMessage: '',

  render: function(display) {
    display.clear();
    display.drawText(5, 5, this._curMessage);
  },

  send: function(msg) {
    this._curMessage = msg;
  },

  clear: function() {
    this._curMessage = '';
  }
};
