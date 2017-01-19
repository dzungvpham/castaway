Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: {north: '^', south: 'v', west: '<', east: '>'},
  maxHP: 100,
  sightRadius: 10,
  meleeAttackPower: 5,
  meleeHitChance: 0.9,
  rangedAttackPower: 10,
  rangedHitChance: 0.8,
  dodgeChance: 0.3,
  direction: 'north',
  element: ["fire", "water", "earth", "wind", "lightning"],
  elementArmor: {fire: 5},
  mixins: ["PlayerActor", "PlayerMessager", "Sight", "Directed", "MapMemory", "WalkerCorporeal",
   "Chronicle", "HitPoints", "MeleeAttacker", "RangedAttacker", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  maxHP: 10,
  element: ["water"],
  elementArmor: {fire: 5, earth: -5},
  mixins: ["HitPoints", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'newt',
  chr: '~',
  maxHP: 10,
  element: ["earth"],
  elementArmor: {lightning: -5, water: 5},
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'squirell',
  chr: '&',
  maxHP: 10,
  element: ["lightning"],
  elementArmor: {wind: -5, earth: 5},
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal", "MeleeAttacker", "Elemental", "Defense"]
});

Game.EntityGenerator.learn({
  name: 'slug',
  chr: '~',
  maxHP: 30,
  sightRadius: 5,
  meleeAttackPower: 10,
  element: ["fire"],
  elementArmor: {wind: 5, water: -5},
  meleeAttackActionDuration: 3000,
  wanderChaserActionDuration: 1200,
  mixins: ["HitPoints", "Sight", "WalkerCorporeal", "MeleeAttacker", "WanderChaserActor", "Elemental", "Defense"]
});
