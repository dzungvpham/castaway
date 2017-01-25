if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(str, pos) {
    pos = pos || 0;
    return this.indexOf(str, pos) === pos;
  }
}

Game.util = {

  ID_SEQUENCE: 0,

  uniqueID: function() {
    return Date.now() + ++Game.util.ID_SEQUENCE + this.randomString(24);
  },

  randomString: function(len) {
    var charSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    var res='';
    for (var i=0; i<len; i++) {
        res += charSource.random();
    }
    return res;
  },

  randomInt: function(min, max) {
    var range = max - min;
    var offset = Math.floor(ROT.RNG.getUniform() * (range + 1));
    return offset + min;
  },

  init2DArray: function(xSize, ySize, initVal) {
    var a = [];
    for (var x = 0; x < xSize; x++) {
      a.push([]);
      for (var y = 0; y < ySize; y++) {
        a[x].push(initVal);
      }
    }
    return a;
  },

  positionsAdjacentTo: function (pos) {
    var adjPos = [];
    adjPos.push(
      {x:pos.x + 1, y: pos.y},
      {x:pos.x - 1, y: pos.y},
      {x:pos.x, y: pos.y + 1},
      {x:pos.x, y: pos.y - 1}
    );
    return adjPos;
  },

  positions8AdjacentTo: function (pos) {
    var adjPos = [];
    for (var dx = -1; dx <= 1; dx++) {
      for (var dy = -1; dy <= 1; dy++) {
        if (!(dx == 0 && dy == 0)) {
          adjPos.push({x: pos.x + dx, y: pos.y + dy});
        }
      }
    }
    return adjPos;
  },

  getDisplayDim: function(display) {
    return {w: display._options.width, h: display._options.height};
  },

  objectArrayToIDArray: function (arr) {
    return arr.map(function (elt) {
      return elt.getID();
    });
  },

  compactBooleanArray_or: function(arr) {
    if (!arr) {
      return true;
    }
    for (var i = 0; i < arr.length; i++) {
      if (arr[i]) {
        return true;
      }
    }
    return false;
  },

  compactBooleanArray_and: function(arr) {
    if (!arr) {
      return false;
    }
    for (var i = 0; i < arr.length; i++) {
      if (!arr[i]) {
        return false;
      }
    }
    return true;
  },

  compactNumberArray_add: function (arr) {
    if (!arr) {
      return 0;
    }
    var ret = 0;
    for (var i = 0; i < arr.length; i++) {
      ret += arr[i];
    }
    return ret;
  },

  compactNumberArray_mult: function (arr) {
    if (!arr) {
      return 1;
    }
    var ret = 1;
    for (var i = 0; i < arr.length; i++) {
      ret *= arr[i];
    }
    return ret;
  },

  changeColorLuminance: function(hex, lum) {
    //Validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, '');
  	if (hex.length < 6) {
  		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
  	}
  	lum = lum || 0;

  	// convert to decimal and change luminosity
  	var rgb = "#", c, i;
  	for (i = 0; i < 3; i++) {
  		c = parseInt(hex.substr(i*2,2), 16);
  		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
  		rgb += ("00"+c).substr(c.length);
  	}
  	return rgb;
  },

  getDirectionalDeltas: function(dir) {
    var deltaX = 0;
    var deltaY = 0;
    switch (dir) {
      case "north":
        deltaX = 0;
        deltaY = -1;
        break;
      case "south":
        deltaX = 0;
        deltaY = 1;
        break;
      case "west":
        deltaX = -1;
        deltaY = 0;
        break;
      case "east":
        deltaX = 1;
        deltaY = 0;
        break;
      case "northwest":
        deltaX = -1;
        deltaY = -1;
        break;
      case "southwest":
        deltaX = -1;
        deltaY = 1;
        break;
      case "northeast":
        deltaX = 1;
        deltaY = -1;
        break;
      case "southeast":
        deltaX = 1;
        deltaY = 1;
        break;
      default:
        return false;
    }
    return {dx: deltaX, dy: deltaY};
  }
};
