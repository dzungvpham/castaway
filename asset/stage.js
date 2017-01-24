Game.Stage = {};

Game.Stage.populateMap = function(map, stage) {
  var entityList = {};
  var itemList = {};
  switch(stage) {
    case "stage_1":
      entityList = {"newt": 2, "moss": 5, "squirell": 3, "slug": 1};
      itemList = {"rock": 5, "chakra shard": 3};
      break;
    case "stage_2":
      entityList = {"newt": 3, "moss": 7, "squirell": 5, "slug": 3};
      itemList = {"rock": 5, "chakra shard": 5};
      break;
    case "stage_3":
      entityList = {"newt": 3, "moss": 10, "squirell": 7, "slug": 5};
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
  return true;
};
