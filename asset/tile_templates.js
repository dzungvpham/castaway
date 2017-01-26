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
  bg: "#ed812f",
  walkable: true,
  transparent: true,
  special: true,
  damage: 10,
  element: "fire",
  description: "You might not want to walk into that. Unless..."
});

Game.Tile.herbTile = new Game.Tile({
  name: "herb",
  bg: "#b5e86f",
  walkable: true,
  transparent: true,
  special: true,
  damage: -1,
  description: "Smells like medicine"
});
