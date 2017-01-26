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
  elementArmor: {fire: 3},
  inventoryCapacity: 20,
  mixins: ["PlayerActor", "PlayerMessager", "Sight", "Directed", "MapMemory", "WalkerCorporeal",
   "Chronicle", "HitPoints", "RangedAttacker", "Elemental", "Defense", "InventoryHolder"]
});

Game.EntityGenerator.learn({
  name: 'Passive Water Spirit',
  description: "The essence of life, this water spirit has resigned into a passive state.",
  chr: '💧',
  maxHP: 50,
  element: ["water"],
  elementArmor: {fire: 5, earth: -5},
  mixins: ["HitPoints", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'Passive Earth Spirit',
  description: "The essence of soil, this earth spirit has become permanently dormant.",
  chr: '💩',
  maxHP: 50,
  element: ["earth"],
  elementArmor: {lightning: -5, water: 5},
  mixins: ["HitPoints", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'Passive Fire Spirit',
  description: "The essence of hell, this fire spirit has lost it energy.",
  chr: '🔥',
  maxHP: 50,
  element: ["fire"],
  elementArmor: {wind: -5, water: -5},
  mixins: ["HitPoints", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'Passive Wind Spirit',
  description: "The essence of catastrophe, this wind spirit is now just a breeze.",
  chr: '🌪',
  maxHP: 50,
  element: ["wind"],
  elementArmor: {fire: -5, lightning: 5},
  mixins: ["HitPoints", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'Passive Lightning Spirit',
  description: "The essence of the sky, this lightning spirit is now just a zap.",
  chr: '⚡️',
  maxHP: 50,
  element: ["lightning"],
  elementArmor: {wind: -5, earth: 5},
  mixins: ["HitPoints", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'Water Spirit',
  description: "It may look inactive, but be careful...",
  chr: '💧',
  maxHP: 50,
  meleeAttackPower: 5,
  meleeHitChance: 90,
  element: ["water"],
  elementArmor: {fire: 5, earth: -5},
  mixins: ["HitPoints", "WalkerCorporeal", "MeleeAttacker", "Elemental", "Defense", "CombatPhysics", "CombatDefensive"]
});

Game.EntityGenerator.learn({
  name: 'Earth Spirit',
  description: "The spirit of the earth looks kind of funny",
  chr: '💩',
  maxHP: 50,
  meleeAttackPower: 5,
  meleeHitChance: 90,
  element: ["earth"],
  elementArmor: {lightning: -5, water: 5},
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal", "Elemental", "Defense", "MeleeAttacker", "CombatPhysics", "CombatDefensive"]
});

Game.EntityGenerator.learn({
  name: 'Fire Spirit',
  description: "Doesn't look very friendly...",
  chr: '🔥',
  maxHP: 35,
  meleeAttackPower: 10,
  meleeHitChance: 90,
  sightRadius: 10,
  meleeAttackPower: 10,
  element: ["fire"],
  elementArmor: {wind: 5, water: -5},
  meleeAttackActionDuration: 3000,
  wanderChaserActionDuration: 1200,
  mixins: ["HitPoints", "Sight", "WalkerCorporeal", "MeleeAttacker", "WanderChaserActor", "Elemental", "Defense", "CombatPhysics"]
});

Game.EntityGenerator.learn({
  name: 'Lightning Spirit',
  description: "It moves so fast!",
  chr: '🎇',
  maxHP: 35,
  sightRadius: 10,
  meleeAttackPower: 10,
  element: ["fire"],
  elementArmor: {wind: -5, earth: 5},
  meleeAttackActionDuration: 1500,
  wanderChaserActionDuration: 800,
  mixins: ["HitPoints", "Sight", "WalkerCorporeal", "MeleeAttacker", "WanderChaserActor", "Elemental", "Defense", "CombatPhysics", "CombatDefensive"]
});

Game.EntityGenerator.learn({
  name: 'Wind Spirit',
  description: "Catastrophic like a tornado!",
  chr: '🌪',
  maxHP: 35,
  sightRadius: 10,
  meleeAttackPower: 10,
  element: ["wind"],
  elementArmor: {fire: -5, lightning: 5},
  meleeAttackActionDuration: 3000,
  wanderChaserActionDuration: 1000,
  mixins: ["HitPoints", "Sight", "WalkerCorporeal", "MeleeAttacker", "WanderChaserActor", "Elemental", "Defense", "CombatPhysics"]
});
