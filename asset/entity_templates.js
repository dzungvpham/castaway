Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: {north: '^', south: 'v', west: '<', east: '>'},
  maxHP: 10,
  sightRadius: 10,
  direction: 'north',
  element: ["fire", "water", "earth", "wind"],
  mixins: ["PlayerActor", "PlayerMessager", "Sight", "Directed", "MapMemory", "WalkerCorporeal", "Chronicle", "HitPoints", "MeleeAttacker", "RangedAttacker", "Elemental"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  fg: '#0f0',
  maxHP: 1,
  mixins: ["HitPoints"]
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
  fg: '#ff9',
  maxHP: 5,
  sightRadius: 5,
  attackPower: 1,
  attackActionDuration: 3000,
  wanderChaserActionDuration: 1200,
  mixins: ["HitPoints", "Sight", "WalkerCorporeal", "MeleeAttacker", "WanderChaserActor"]
});
