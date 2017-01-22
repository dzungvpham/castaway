Game.SymbolActive = function(template) {
  template = template || {};
  Game.Symbol.call(this, template);
  this.attr._name = template.name || '';
  this.attr._description = template.description || 'Completely uninteresting';
  this.attr._ID = template.presetID || Game.util.uniqueID();

  this._mixinsName = template.mixins || [];
  this._mixins = [];
  for (var i = 0; i < this._mixinsName.length; i++) {
    this._mixins.push(this._mixinSet[this._mixinsName[i]]);
  }
  this._mixinTracker = {};

  for (var i = 0; i < this._mixins.length; i++) {
    var mixin = this._mixins[i];
    this._mixinTracker[mixin.META.mixinName] = true;
    this._mixinTracker[mixin.META.mixinGroup] = true;

    for (var mixinProp in mixin) {
      if (mixinProp != 'META' && mixin.hasOwnProperty(mixinProp)) {
        this[mixinProp] = mixin[mixinProp];
      }
    }

    if (mixin.META.hasOwnProperty('stateNamespace')) {
      this.attr[mixin.META.stateNamespace] = {};
      for (var mixinStateProp in mixin.META.stateModel) {
        if (mixin.META.stateModel.hasOwnProperty(mixinStateProp)) {
          if (typeof mixin.META.stateModel[mixinStateProp] == "object") {
            this.attr[mixin.META.stateNamespace][mixinStateProp] = JSON.parse(JSON.stringify(mixin.META.stateModel[mixinStateProp]));
          } else {
            this.attr[mixin.META.stateNamespace][mixinStateProp] = mixin.META.stateModel[mixinStateProp];
          }
        }
      }
    }

    if (mixin.META.hasOwnProperty('init')) {
      mixin.META.init.call(this, template);
    }
  }

};

Game.SymbolActive.extend(Game.Symbol);

Game.SymbolActive.prototype.getID = function() {
  return this.attr._ID;
}

Game.SymbolActive.prototype.getName = function() {
  return this.attr._name;
};

Game.SymbolActive.prototype.setName = function(name) {
  this.attr._name = name;
};

Game.SymbolActive.prototype.getDescription = function() {
  return this.attr._description;
};

Game.SymbolActive.prototype.getDetailedDescription = function () {
  var descr = this.getRepresentation() + ' ' + Game.UIMode.DEFAULT_COLOR_STR + this.getName() + ': ' + this.getDescription();
  var descrDetails = this.raiseSymbolActiveEvent('getStats');
  var detailsText = '';
  for (var det in descrDetails) {
    if (descrDetails.hasOwnProperty(det)) {
      if (detailsText) {
        detailsText += '\n';
      }
      detailsText += det + ': ' + descrDetails[det];
    }
  }
  if (detailsText) {
    descr += "\n"+detailsText;
  }
  return descr;
};

Game.SymbolActive.prototype.setDescription = function(descr) {
    this.attr._description = descr;
};

Game.SymbolActive.prototype.hasMixin = function(mixin) {
  if (typeof mixin == 'object') {
    return this._mixinTracker.hasOwnProperty(mixin.META.mixinName);
  } else {
    return this._mixinTracker.hasOwnProperty(mixin);
  }
};

Game.SymbolActive.prototype.raiseSymbolActiveEvent = function(evt, data) {
  var response = {};
  for (var i = 0; i < this._mixins.length; i++) {
    var mixin = this._mixins[i];
    if (mixin.META.listeners && mixin.META.listeners[evt]) {
      var resp = mixin.META.listeners[evt].call(this, data);
      for (var respKey in resp) {
        if (resp.hasOwnProperty(respKey)) {
          if (!response[respKey]) {
            response[respKey] = [];
          }
          response[respKey].push(resp[respKey]);
        }
      }
    }
  }
  return response;
};

Game.SymbolActive.prototype.toJSON = function() {
  var json = Game.UIMode.gamePersistence.BASE_toJSON.call(this);
  return json;
};

Game.SymbolActive.prototype.fromJSON = function(json) {
  Game.UIMode.gamePersistence.BASE_fromJSON.call(this, json);
};
