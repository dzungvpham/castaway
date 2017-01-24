Game.Stage = {};

Game.Stage.populateMap(map, stage) {
  var entityList = {};
  var itemList = {};
  switch(stage) {
    case "stage1":
      entityList = {"newt": 2, "moss": 5, "squirell": 3, "slug": 1};
      itemList = {"rock": 5, "chakra shard": 3};
      break;
    default:
      return false;
  }
  for (var entity in entityList) {
    for (var i = 0; i < entityList[entity]; i++) {
      map.addEntity(Game.EntityGenerator.create(entity, map.getRandomWalkableLocation()));
    }
  }
  for (var item in itemList) {
    for (var i = 0; i < itemList[item]; i++) {
      map.addItem(Game.ItemGenerator.create(item, map.getRandomWalkableLocation()));
    }
  }
};
