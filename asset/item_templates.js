Game.ItemGenerator = new Game.Generator('items', Game.Item);

Game.ItemGenerator.learn({name:'_inventoryContainer', mixins: ["Container"]});

Game.ItemGenerator.learn({
  name: "rock",
  chr: '🔮',
  //chr: String.fromCharCode(174),
  //fg: "#aaa",
  description: "A simple rock"
});

Game.ItemGenerator.learn({
  name: "chakra shard",
  chr: '💎',
  //chr: "$",
  //fg: "#aaa",
  description: "Crystalized chakra",
  hp: 5,
  rangedHitChance: 5,
  dodgeChance: 5,
  normalArmor: 1,
  elementArmor: {fire: 5, wind: 5},
  sight: 1,
  mixins: ["PassiveBuff"]
});
