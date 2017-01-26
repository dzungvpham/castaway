Game.ItemGenerator = new Game.Generator('items', Game.Item);

Game.ItemGenerator.learn({name:'_inventoryContainer', mixins: ["Container"]});

Game.ItemGenerator.learn({
  name: "Chakra Shard",
  chr: '💎',
  description: "Crystalized chakra",
  hp: 1,
  rangedAttackPower: 1,
  rangedHitChance: 1,
  dodgeChance: 1,
  normalArmor: 0.5,
  elementArmor: {earth: 1, wind: 1},
  mixins: ["PassiveBuff"]
});

Game.ItemGenerator.learn({
  name: "Apprentice Rod",
  chr: "⚕️",
  description: "A fairly efficient rod",
  rangedAttackPower: 5,
  mixins: ["PassiveBuff"]
});

Game.ItemGenerator.learn({
  name: "Glass of Foresight",
  chr: "👓",
  description: "You can see everything with this!",
  sight: 3,
  mixins: ["PassiveBuff"]
});
