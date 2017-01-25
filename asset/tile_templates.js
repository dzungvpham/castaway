Game.Tile.nullTile = new Game.Tile({
  name: "nullTile",
  description: "Nothing interesting"
});

Game.Tile.floorTile = new Game.Tile({
  name: "floorTile",
  chr: '.',
  fg: "#FFCB2D",
  walkable: true,
  transparent: true,
  description: "As good as a floor can be"
});

Game.Tile.wallTile = new Game.Tile({
  name: "tree",
  chr: '🌲',
  description: "An evergreen."
});

Game.Tile.wallTile2 = new Game.Tile({
  name: "tree",
  chr: '🌳',
  description: "A decidous tree."
});

Game.Tile.lavaTile = new Game.Tile({
  name: "lava",
  //chr: "🔥",
  bg: "#ff2500",
  walkable: true,
  transparent: true,
  special: true,
  damage: 5,
  element: "fire",
  description: "You might not want to walk into that. Unless..."
});

Game.Tile.herbTile = new Game.Tile({
  name: "herb",
  bg: "#2faf79",
  walkable: true,
  transparent: true,
  special: true,
  damage: -5,
  description: "Smells like medicine"
});
