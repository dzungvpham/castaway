Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHp: 10,
  curHp: 10,
  mixins: ["WalkerCorporeal", "Chronicle", "HitPoints", "MeleeAttacker", "PlayerMessager"]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  fg: '#0f0',
  maxHp: 1,
  curHp: 1,
  mixins: ["HitPoints"]
});
