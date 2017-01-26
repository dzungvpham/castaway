Game.Stage = {
  finalStage: "stage_2"
};

Game.Stage.modifyStage = function(map, stage) {
  var entityList = {};
  var itemList = {};
  var newMixin = {};
  switch(stage) {
    case "stage_1":
      entityList = {"Passive Water Spirit": 1, "Passive Earth Spirit": 1, "Passive Fire Spirit": 1, "Passive Wind Spirit": 1, "Passive Lightning Spirit": 1};
      break;
    case "stage_2":
      entityList = {"Water Spirit": 20, "Earth Spirit": 15, "Fire Spirit": 10, "Lightning Spirit": 5, "Wind Spirit": 5};
      itemList = {"Chakra Shard": 20, "Apprentice Rod": 1, "Glass of Foresight": 1};
      newMixin = {
        "HitPointsRegenerate": {
          regenerateAmount: 0.1,
          regenerateTurn: 5
        },
        "CombatPushBack": {
          pushDistance: 1,
          pushChance: 50
        }
      };
      break;
    case "stage_3":
      entityList = {"Earth Spirit": 5, "Fire Spirit": 5, "Lightning Spirit": 3};
      itemList = {"Chakra Shard": 5, "Apprentice Rod": 1, "Glass of Foresight": 1};
      newMixin = {
        "CombatPushBack": {
          pushDistance: 1,
          pushChance: 70
        }
      }
      break;
    case "stage_4":
      entityList = {"Earth Spirit": 3, "Fire Spirit": 5, };
      itemList = {"Chakra Shard": 3, "Glass of Foresight": 1};
    break;
    default:
      return false;
  }

  for (var entity in entityList) {
    for (var i = 0; i < entityList[entity]; i++) {
      map.addEntity(Game.EntityGenerator.create(entity), map.getRandomWalkableLocation());
    }
  }
  for (var item in itemList) {
    for (var i = 0; i < itemList[item]; i++) {
      map.addItem(Game.ItemGenerator.create(item), map.getRandomWalkableLocation());
    }
  }
  for (var mixin in newMixin) {
    Game.getAvatar().addMixin(mixin, newMixin[mixin]);
  }
  return true;
};
