Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHP: 1,
  sightRadius: 10,
  mixins: ["PlayerActor", "PlayerMessager", "Sight", "MapMemory", "WalkerCorporeal", "Chronicle", "HitPoints", "MeleeAttacker"]
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
