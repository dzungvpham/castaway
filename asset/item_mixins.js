Game.ItemMixin = {};

Game.ItemMixin.Container = {
  META: {
    mixinName: 'Container',
    mixinGroup: 'Container',
    stateNamespace: '_Container_attr',
    stateModel:  {
      itemIs: [],
      capacity: 1
    },

    init: function (template) {
      this.attr._Container_attr.itemIDs = template.itemIDs || [];
      this.attr._Container_attr.capacity = template.capacity || 1;
    }
  },

  getCapacity: function () {
    return this.attr._Container_attr.capacity ;
  },

  setCapacity: function (c) {
    this.attr._Container_attr.capacity = c;
  },

  hasSpace: function () {
    return this.attr._Container_attr.capacity > this.attr._Container_attr.itemIDs.length;
  },

  addItems: function (items_or_ids) {
    var addItemStatus = {
      numItemsAdded:0,
      numItemsNotAdded: items_or_ids.length
    };

    if (items_or_ids.length < 1) {
      return addItemStatus;
    }

    for (var i = 0; i < items_or_ids.length; i++) {
      if (!this.hasSpace()) {
        return addItemStatus;
      }

      var itemID = items_or_ids[i];
      if (typeof itemID !== 'string') {
        itemID = itemID.getID();
      }

      this._forceAddItemID(itemID);
      addItemStatus.numItemsAdded++;
      addItemStatus.numItemsNotAdded--;
    }

    return addItemStatus;
  },

  _forceAddItemID: function (itemID) {
    this.attr._Container_attr.itemIDs.push(itemID);
  },

  getItemIDs: function () {
    return this.attr._Container_attr.itemIDs;
  },

  extractItems: function (ids_or_idxs) {
    var idsOnly = JSON.parse(JSON.stringify(ids_or_idxs)); // clone so we're not accidentally mucking with the param array with is passed by reference
    // first convert indexes to ids - uniformity makes the rest of this easier
    // doing this in two passes so itemIDs doesn't change mid-loop
    for (var i = 0; i < idsOnly.length; i++) {
      if (!isNaN(idsOnly[i])) {
        idsOnly[i] = this.attr._Container_attr.itemIDs[idsOnly[i]];
      }
    }
    var ret = [];
    while (idsOnly.length > 0) {
      var curId = idsOnly.shift();
      var idIdx = this.attr._Container_attr.itemIDs.indexOf(curId);
      if (idIdx > -1) {
        this.attr._Container_attr.itemIDs.splice(idIdx,1);
        ret.push(Game.DATASTORE.ITEM[curId]);
      }
    }
    return ret;
  }
};

Game.ItemMixin.PassiveBuff = {
  META: {
    mixinName: "PassiveBuff",
    mixinGroup: "Buff",
    stateNamespace: "_PassiveBuff_attr",
    stateModel: {
      hp: 0,
      meleeHitChance: 0,
      rangedHitChance: 0,
      dodgeChance: 0,
      normalArmor: 0,
      elementArmor: {fire: 0, water: 0, earth: 0, wind: 0, lightning: 0},
      sight: 0
    },

    init: function(template) {
      this.attr._PassiveBuff_attr.hp = template.hp || 0;
      this.attr._PassiveBuff_attr.meleeHitChance = template.meleeHitChance || 0;
      this.attr._PassiveBuff_attr.rangedHitChance = template.rangedHitChance || 0;
      this.attr._PassiveBuff_attr.dodgeChance = template.dodgeChance || 0;
      this.attr._PassiveBuff_attr.normalArmor = template.normalArmor || 0;
      this.attr._PassiveBuff_attr.elementArmor = template.elementArmor || {fire: 0, water: 0, earth: 0, wind: 0, lightning: 0};
      this.attr._PassiveBuff_attr.sight = template.sight || 0;
    },

    listeners: {
      'pickedUp': function(data) {
        if (data.picker.hasMixin("HitPoints")) {
          data.picker.setMaxHP(data.picker.getMaxHP() + this.getMaxHP());
        }
        if (data.picker.hasMixin("MeleeAttacker")) {
          data.picker.setMeleeHitChance(data.picker.getMeleeHitChance() + this.getMeleeHitChance());
        }
        if (data.picker.hasMixin("RangedAttacker")) {
          data.picker.setRangedHitChance(data.picker.getRangedHitChance() + this.getRangedHitChance());
        }
        if (data.picker.hasMixin("Defense")) {
          data.picker.setDodgeChance(data.picker.getDodgeChance() + this.getDodgeChance());
          data.picker.setNormalArmor(data.picker.getNormalArmor() + this.getNormalArmor());
          for (element in this.getElementArmor()) {
            data.picker.setElementArmor(element, data.picker.getElementArmor(element) + this.getElementArmor()[element]);
          }
        }
        if (data.picker.hasMixin("Sight")) {
          data.picker.setSightRadius(data.picker.getSightRadius() + this.getSight());
        }
      },

      'dropped': function(data) {
        if (data.dropper.hasMixin("HitPoints")) {
          data.dropper.setMaxHP(data.dropper.getMaxHP() - this.getMaxHP());
        }
        if (data.dropper.hasMixin("MeleeAttacker")) {
          data.dropper.setMeleeHitChance(data.dropper.getMeleeHitChance() - this.getMeleeHitChance());
        }
        if (data.dropper.hasMixin("RangedAttacker")) {
          data.dropper.setRangedHitChance(data.dropper.getRangedHitChance() - this.getRangedHitChance());
        }
        if (data.dropper.hasMixin("Defense")) {
          data.dropper.setDodgeChance(data.dropper.getDodgeChance() - this.getDodgeChance());
          data.dropper.setNormalArmor(data.dropper.getNormalArmor() - this.getNormalArmor());
          for (element in this.getElementArmor()) {
            data.dropper.setElementArmor(element, data.dropper.getElementArmor(element) - this.getElementArmor()[element]);
          }
        }
        if (data.dropper.hasMixin("Sight")) {
          data.dropper.setSightRadius(data.dropper.getSightRadius() - this.getSight());
        }
      }
    }
  },

  getMaxHP() {
    return this.attr._PassiveBuff_attr.hp;
  },

  getMeleeHitChance() {
    return this.attr._PassiveBuff_attr.meleeHitChance;
  },

  getRangedHitChance() {
    return this.attr._PassiveBuff_attr.rangedHitChance;
  },

  getDodgeChance() {
    return this.attr._PassiveBuff_attr.dodgeChance;
  },

  getNormalArmor() {
    return this.attr._PassiveBuff_attr.normalArmor;
  },

  getSight() {
    return this.attr._PassiveBuff_attr.sight;
  },

  getElementArmor() {
    return this.attr._PassiveBuff_attr.elementArmor;
  }
}
