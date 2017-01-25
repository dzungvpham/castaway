Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: {north: '^', south: 'v', west: '<', east: '>'},
  maxHP: 100,
  sightRadius: 10,
  rangedAttackPower: 10,
  rangedHitChance: 80,
  dodgeChance: 20,
  direction: 'north',
  element: ["fire", "water", "earth", "wind", "lightning"],
  elementArmor: {fire: 5},
  inventoryCapacity: 3,
  pushDistance: 1,
  pushChance: 80,
  mixins: ["PlayerActor", "PlayerMessager", "Sight", "Directed", "MapMemory", "WalkerCorporeal",
   "Chronicle", "HitPoints", "RangedAttacker", "Elemental", "Defense", "InventoryHolder", "CombatPushBack"]
});

Game.EntityGenerator.learn({
  name: 'water spirit',
  chr: '💧',
  maxHP: 10,
  element: ["water"],
  elementArmor: {fire: 5, earth: -5},
  mixins: ["HitPoints", "Elemental", "Defense", "CombatPhysics"]
});

Game.EntityGenerator.learn({
  name: 'earth spirit',
  chr: '💩',
  maxHP: 10,
  element: ["earth"],
  elementArmor: {lightning: -5, water: 5},
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal", "Elemental", "Defense", "MeleeAttacker", "CombatPhysics"]
});

Game.EntityGenerator.learn({
  name: 'squirell',
  chr: '🐿️',
  maxHP: 10,
  element: ["lightning"],
  elementArmor: {wind: -5, earth: 5},
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal", "MeleeAttacker", "Elemental", "Defense", "CombatPhysics"]
});

Game.EntityGenerator.learn({
  name: 'fire spirit',
  //chr: '~',
  chr: '🔥',
  maxHP: 30,
  sightRadius: 5,
  meleeAttackPower: 10,
  element: ["fire"],
  elementArmor: {wind: 5, water: -5},
  meleeAttackActionDuration: 3000,
  wanderChaserActionDuration: 1200,
  mixins: ["HitPoints", "Sight", "WalkerCorporeal", "MeleeAttacker", "WanderChaserActor", "Elemental", "Defense", "CombatPhysics"]
});
