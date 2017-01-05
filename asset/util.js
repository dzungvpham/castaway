Game.util = {

  randomString: function (len) {
    var charSource = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('');
    var res='';
    for (var i=0; i<len; i++) {
        res += charSource.random();
    }
    return res;
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
  }

};
