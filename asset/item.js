Game.DATASTORE.ITEM = {};

Game.Item = function(template) {
  template = template || {};
  this._mixinSet = Game.ItemMixin;
  Game.SymbolActive.call(this, template);
  this.attr._generator_template_key = template.generator_template_key || '';

  Game.DATASTORE.ITEM[this.attr._ID] = this;
};

Game.Item.extend(Game.SymbolActive);
