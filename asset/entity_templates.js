Game.EntityGenerator = new Game.Generator('entities', Game.Entity);

Game.EntityGenerator.learn('avatar', {
  name: 'avatar',
  chr: '@',
  fg: '#dda',
  maxHp: 10,
  curHp: 10,
  mixins: [Game.EntityMixin.WalkerCorporeal, Game.EntityMixin.Chronicle, Game.EntityMixin.HitPoints]
});

Game.EntityGenerator.learn('moss', {
  name: 'moss',
  chr: '%',
  fg: '#b6b',
  maxHp: 1,
  mixins: [Game.EntityMixin.HitPoints]
});
