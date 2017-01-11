Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn({
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHp: 10,
  curHp: 10,
  mixins: [Game.EntityMixin.WalkerCorporeal, Game.EntityMixin.Chronicle, Game.EntityMixin.HitPoints]
});

Game.EntityGenerator.learn({
  name: 'moss',
  chr: '%',
  fg: '#0f0',
  maxHp: 1,
  mixins: [Game.EntityMixin.HitPoints]
});
