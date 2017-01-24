Game.Stage = {};

Game.Stage.modifyStage = function(map, stage) {
  var entityList = {};
  var itemList = {};
  var newMixin = {};
  switch(stage) {
    case "stage_1":
      //entityList = {"newt": 2, "moss": 5, "squirell": 3, "slug": 1};
      entityList = {"water spirit": 3, "earth spirit": 3, "fire spirit": 1};
      itemList = {"chakra shard": 1};
      break;
    case "stage_2":
      entityList = {"water spirit": 7, "earth spirit": 5, "fire spirit": 3};
      itemList = {"rock": 5, "chakra shard": 5};
      newMixin = {
        "MeleeAttacker": {
          meleeAttackPower: 5,
          meleeHitChance: 90,
        }
      };
      break;
    case "stage_3":
      entityList = {"water spirit": 7, "earth spirit": 5, "fire spirit": 5};
      itemList = {"rock": 5, "chakra shard": 10};
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
