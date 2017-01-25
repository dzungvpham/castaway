Game.EntityMixin.CombatPhysics = {
  META: {
    mixinName: "CombatPhysics",
    mixinGroup: "CombatEffect",

    listeners: {
      "pushedBack": function(data) {
        var pushDistance = data.pushDistance;
        var pushed = false;
        var dir = data.direction;
        var deltas = Game.util.getDirectionalDeltas(dir);
        var dx = deltas.dx;
        var dy = deltas.dy;
        var targetX = this.getX();
        var targetY = this.getY();

        for (var i = 0; i < pushDistance; i++) {
          targetX += dx;
          targetY += dy;

          if (this.getMap().getEntity(targetX, targetY)) {
            break;
          }

          var tile = this.getMap().getTile(targetX, targetY);
          if (tile.getName() == 'nullTile') {
            break;
          } else if (!tile.isWalkable()) {
            break;
          } else if (tile.isWalkable()) {
            pushed = true;
            this.setPos(targetX, targetY);
            this.raiseSymbolActiveEvent("specialTerrain", {tile: tile});
          }
        }

        if (pushed) {
          this.getMap().updateEntityLocation(this);
        }

        return {result: pushed};
      }
    }
  }
}

Game.EntityMixin.CombatPushBack = {
  META: {
    mixinName: "CombatPushBack",
    mixinGroup: "CombatModifier",
    stateNamespace: "_CombatPushBack_attr",
    stateModel: {
      pushDistance: 0,
      pushChance: 0
    },

    init: function(template) {
      this.attr._CombatPushBack_attr.pushDistance = template.pushDistance || 0;
      this.attr._CombatPushBack_attr.pushChance = template.pushChance || 0;
    },

    listeners: {
      'pushBack': function(data) {
        var pusher = data.pusher;
        if (pusher.hasMixin("Directed") && ROT.RNG.getUniform() < this.getPushChance()) {
          var dir = pusher.getDirection();
          var pushee = data.pushee;
          if (pushee.hasMixin("CombatPhysics")) {
            var pushResp = pushee.raiseSymbolActiveEvent("pushedBack", {pushDistance: this.getPushDistance(), direction: dir});
            if (pushResp.result[0] == true) {
              Game.Message.ageMessages();
              Game.Message.send("You pushed " + pushee.getName() + " back " + this.getPushDistance() + (this.getPushDistance() > 1 ? " steps" : " step"));
            }
          }
        }
        return;
      }
    }
  },

  getPushDistance: function() {
    return this.attr._CombatPushBack_attr.pushDistance;
  },

  setPushDistance: function(d) {
    this.attr._CombatPushBack_attr.pushDistance = d;
  },

  getPushChance: function() {
    return this.attr._CombatPushBack_attr.pushChance;
  },

  setPushChance: function(c) {
    this.attr._CombatPushBack_attr.pushChance = c;
  }
};
