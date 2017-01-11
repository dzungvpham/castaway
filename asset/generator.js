Game.Generator = function(genName, constructor, defaultTemplate) {
  this._name = genName;
  this._constructor = constructor;
  this._templates = {};
  this._templates._DEFAULT = defaultTemplate || {};
};

Game.Generator.prototype.learn = function(templateName, template) {
  this._templates[templateName] = template;
};

Game.Generator.prototype.create = function(templateName) {
  var template = this._templates[templateName];
  if (!template) {
    template = this._templates._DEFAULT;
  }
  return new this._constructor(template);
}
