Game.Message = {
  attr: {
    fresh: [],
    stale: [],
    archived: [],
    archivedMax: 200
  },

  render: function(display) {
    display.clear();
    var dispRowMax = display._options.height - 1;
    var dispColMax = display._options.width - 2;
    var dispRow = 0;
    var freshIndex = 0;
    var staleIndex = 0;

    //Draw stale messages
    for (staleIndex = 0; staleIndex < this.attr.stale.length && dispRow < dispRowMax; staleIndex++) {
      dispRow += display.drawText(1, dispRow, '%c{#aaa}%b{#000}' + this.attr.stale[staleIndex] + '%c{}%b{}', dispColMax);
    }

    //Draw fresh messages
    for (freshIndex = 0; freshIndex < this.attr.fresh.length && dispRow < dispRowMax; freshIndex++) {
      dispRow += display.drawText(1, dispRow, '%c{#fff}%b{#000}' + this.attr.fresh[freshIndex] + '%c{}%b{}', dispColMax);
    }
  },

  ageMessages: function(lastStaleIndex) {

    //Move stale messages to archived
    while (this.attr.stale.length > 0) {
      this.attr.archived.unshift(this.attr.stale.pop());
    }

    //Delete archived messages that are too old
    while (this.attr.archived.length > this.attr.archivedMax) {
      this.attr.archived.pop();
    }

    //Move fresh messages to stale
    while (this.attr.fresh.length > 0) {
      this.attr.stale.unshift(this.attr.fresh.pop());
    }

  },

  send: function(msg) {
    this.attr.fresh.push(msg);
  },

  clear: function() {
    this.attr.fresh = [];
    this.attr.stale = [];
  },

  getArchive: function() {
    return this.attr.archived;
  },

  getArchiveLimit: function() {
    return this.attr.archivedMax;
  },

  setArchiveLimit: function(max) {
    this.attr.archivedMax = max;
  }
};
