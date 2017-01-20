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
      if (! this.hasSpace()) {
        if (i === 0) {
          return addItemStatus;
        } else {
          return addItemStatus;
        }
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
    // NOTE: early dev stuff here! simple placeholder functionality....
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
