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

Game.EntityMixin.CombatMultipleProjectiles = {
  META: {
    mixinName: "CombatMultipleProjectiles",
    mixinGroup: "CombatModifier",
    listeners: {
      "shootMultiple": function(data) {
        var hitResult = this.checkShootPaths();
        for (var i = 0; i < hitResult.length; i++) {

        }
      }
    }
  },

  checkShootPaths: function() {
    if (this.hasMixin("Directed")) {
      Game.TimeEngine.lock();
      var dir = this.getDirection();
      var delta = Game.util.getDirectionalDeltas(dir);
      if (delta) {
        var dx1 = delta.dx;
        var dy1 = delta.dy;
      } else {
        return false;
      }

      if (dx1 = 0) {
        dx2 = 1;
        dx3 = -1;
        dy2 = dy1;
        dy3 = dy1;
      } else {
        dy2 = 1;
        dy3 = -1;
        dx2 = dx1;
        dx3 = dx1;
      }
      var deltas = {
        'd1': {
          x: dx1,
          y: dy1,
          targetX: this.getX(),
          targetY: this.getY(),
          step: 0
        },
        'd2': {
          x: dx2,
          y: dy2,
          targetX: this.getX(),
          targetY: this.getY(),
          step: 0
        },
        'd3': {
          x: dx3,
          y: dy3,
          targetX: this.getX(),
          targetY: this.getY(),
          step: 0
        }
      }
      var actor = this;
      var result = [];

      while (true) {
        for (del in deltas) {
          if (deltas[del]) {
            deltas[del].targetX += deltas[del].dx;
            deltas[del].targetY += deltas[del].dy;
            deltas[del].step++;
            var tile = this.getMap().getTile(deltas[del].targetX, deltas[del].targetY);

            if (tile.getName() == 'nullTile') {
              result.push(false);
              deltas[del] = false;
            } else if (!tile.isWalkable()) {
              result.push(tile.getName());
              deltas[del] = false;
            }

            var entity = this.getMap().getEntity(targetX, targetY);
            if (entity) {
              result.push(entity);
              deltas[del] = false;
            }
          }

          var drawX = deltas[del].targetX - Game.UIMode.gamePlay.attr._camX + Game.getDisplayWidth("main")/2;
          var drawY = deltas[del].targetY - Game.UIMode.gamePlay.attr._camY + Game.getDisplayHeight("main")/2;
          var items = this.getMap().getItems(deltas[del].targetX, deltas[del].targetY);
          var fg = "#fff";
          if (this.hasMixin("Elemental")) {
            fg = this.getElementColor();
          }
          setTimeout(function(fg, tile, x, y) {
            Game.Symbol.PROJECTILE.setFg(fg);
            Game.Symbol.PROJECTILE.setBg(tile.getBg());
            Game.Symbol.PROJECTILE.draw(Game.getDisplay("main"), x, y);
          }, 20*deltas[del].step, fg, tile, drawX, drawY);

          if (items.length == 1) {
            setTimeout(function(item, bg, x, y) {
              var origBg = item.getBg();
              item.setBg(bg);
              item.draw(Game.getDisplay("main"), x, y);
              item.setBg(origBg);
            }, 20*deltas[del].step + 20, items[0], tile.getBg(), drawX, drawY);
          } else if (items.length >= 2){
            setTimeout(function(bg, x, y) {
              Game.Symbol.ITEM_PILE.setBg(bg);
              Game.Symbol.ITEM_PILE.draw(Game.getDisplay("main"), x, y);
            }, 20*deltas[del].step + 20, tile.getBg(), drawX, drawY);
          } else {
            setTimeout(function(tile, x, y) {
              tile.draw(Game.getDisplay("main"), x, y);
            }, 20*deltas[del].step + 20, tile, drawX, drawY);
          }

        }

        var flag = true;
        for (del in deltas) {
          if (deltas[del]) {
            flag = false;
            break;
          }
        }

        if (flag) {
          setTimeout(function() {
            actor.raiseSymbolActiveEvent('actionDone');
          }, 1);
          break;
        }
      }
      Game.TimeEngine.unlock();
      return result;
    }
    return false;
  }
};

Game.EntityMixin.CombatDefensive = {
  META: {
    mixinName: "CombatDefensive",
    mixinGroup: "CombatBehavior",

    listeners: {
      "attacked": function(data) {
        if (this.hasMixin("WalkerCorporeal") && !this.hasMixin("WanderChaserActor")) {
          if (!this.hasMixin("WanderActor")) {
              this.addMixin("WanderChaserActor", {});
          } else {

          }
        }
        return;
      }
    }
  }

};
