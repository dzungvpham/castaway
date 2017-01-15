Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHp: 10,
  curHp: 10,
  mixins: ["PlayerActor", "PlayerMessager", "WalkerCorporeal", "Chronicle", "HitPoints", "MeleeAttacker"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  fg: '#0f0',
  maxHp: 1,
  curHp: 1,
  mixins: ["HitPoints"]
});

Game.EntityGenerator.learn({
  name: 'newt',
  chr: '~',
  fg: '#f98',
  maxHp: 2,
  curHp: 2,
  mixins: ["HitPoints", "WanderActor", "WalkerCorporeal"]
});
