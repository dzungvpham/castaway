console.log("game.js loaded");

window.onload = function() {
  console.log("Window loaded - Starting game");
  if (!ROT.isSupported()) {
    alert("rot.js is not supported by browser")
  } else {
    Game.init();
    document.getElementById("ws-main-display").appendChild(
      Game.display.main.o.getContainer()
    );
  }
};

var Game = {
  display: {
    main: {
      w: 80,
      h: 24,
      o: null
    }
  },
  init: function() {
    console.log("game init");
    this.display.main.o = new ROT.Display({
      width: this.display.main.w,
      height: this.display.main.h,
    });
    for (var i = 0; i < 10; i++) {
      this.display.main.o.drawText(5, i+5, "Hello World");
    }
  }
};
