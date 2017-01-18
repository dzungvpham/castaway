Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: {north: '^', south: 'v', west: '<', east: '>'},
  maxHP: 100,
  sightRadius: 10,
  attackPower: 10,
  direction: 'north',
  element: ["fire", "water", "earth", "wind"],
  elementArmor: {fire: 5},
  mixins: ["PlayerActor", "PlayerMessager", "Sight", "Directed", "MapMemory", "WalkerCorporeal",
   "Chronicle", "HitPoints", "MeleeAttacker", "RangedAttacker", "Elemental", "ElementalDefense"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  maxHP: 10,
  element: ["water"],
  elementArmor: {fire: -5, earth: 5},
  mixins: ["HitPoints", "Elemental", "ElementalDefense"]
});

Game.EntityGenerator.learn({
  name: 'newt',
  chr: '~',
  fg: '#f98',
  maxHP: 2,
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal"]
});

Game.EntityGenerator.learn({
  name: 'squirell',
  chr: '&',
  fg: '#940',
  maxHP: 3,
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal", "MeleeAttacker"]
});

Game.EntityGenerator.learn({
  name: 'slug',
  chr: '~',
  maxHP: 30,
  sightRadius: 5,
  attackPower: 10,
  element: ["fire"],
  elementArmor: {wind: -5, water: 5},
  attackActionDuration: 3000,
  wanderChaserActionDuration: 1200,
  mixins: ["HitPoints", "Sight", "WalkerCorporeal", "MeleeAttacker", "WanderChaserActor", "Elemental", "ElementalDefense"]
});
