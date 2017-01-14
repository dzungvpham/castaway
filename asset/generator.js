Game.Generator = function(genName, constructor, defaultTemplate) {
  this._name = genName;
  this._constructor = constructor;
  this._templates = {};
  this._templates._DEFAULT = defaultTemplate || {};
};

Game.Generator.prototype.learn = function(template, createKey) {
  if (!template.name) {
    console.log("Generator " + this._name + "cannot learn template without name attr");
    console.dir(template);
    return false;
  }
  createKey = createKey || template.name;
  this._templates[createKey] = template;
};

Game.Generator.prototype.create = function(createKey, presetID) {
  var template = JSON.parse(JSON.stringify(this._templates[createKey]));
  if (!template) {
    template = this._templates._DEFAULT;
  }
  if (presetID) {
    template.presetID = presetID;
  }
  template.generator_template_key = createKey;
  return new this._constructor(template);
};
