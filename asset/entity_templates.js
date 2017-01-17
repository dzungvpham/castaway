Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHP: 10,
  curHP: 10,
  sightRadius: 3,
  mixins: ["PlayerActor", "PlayerMessager", "Sight", "WalkerCorporeal", "Chronicle", "HitPoints", "MeleeAttacker"]
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
