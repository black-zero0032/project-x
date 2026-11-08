const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('./simulation');

function run(state, seconds) {
  for (let t = 0; t < seconds; t += .12) S.advance(state, .12);
}

test('all 30 square tiles map to one plot and reject occupied or outside placement', () => {
  const s = S.create();
  const { x, y, size, columns, rows } = S.grid;
  const ids = new Set();
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const plot = S.plotAt(s, x + col * size + .05, y + row * size + .05);
      ids.add(plot.id);
    }
  }
  assert.equal(ids.size, 30);
  assert.equal(S.plotAt(s, x + size * columns, y), null);
  assert.equal(S.order(s, 'hall', 'build', 'workshop'), false);
  assert.equal(S.order(s, 'lot0', 'build', 'garden'), false);
});

test('spare citizen delivers and builds workshop; recipe and role unlocks require their level', () => {
  const s = S.create();
  for (const role of ['forager', 'logger', 'scavenger', 'guard']) assert(S.assign(s, role, 1));
  assert.equal(S.assign(s, 'builder', 1), false);
  assert(S.postGuard(s, 'west', 1));
  assert(S.order(s, 'lot0', 'build', 'workshop'));
  for (let i = 0; i < 35 && !s.workers.some(w => w.cargo?.job); i++) S.advance(s, .12);
  assert(s.workers.some(w => w.cargo?.job));
  const loaded = S.restore(JSON.stringify(s));
  run(s, 63);
  run(loaded, 63);
  assert.deepEqual(s, loaded);
  assert.equal(S.get(s, 'lot0').type, 'workshop');
  assert.equal(s.nights, 1);
  assert.equal(S.order(s, 'lot0', 'craft', 'saw'), false);
  assert(S.order(s, 'lot0', 'craft', 'axe'));
  run(s, 13);
  assert.equal(s.tools.axe, 1);
  assert.equal(S.roleLimit(s, 'builder'), 0);
});

test('guard reserves can be split, distinct food stocks are consumed, and loss stops time', () => {
  const s = S.create();
  assert(S.assign(s, 'guard', 1));
  assert(S.assign(s, 'guard', 1));
  assert(S.postGuard(s, 'west', 1));
  assert(S.postGuard(s, 'east', 1));
  assert(!S.postGuard(s, 'south', 1));
  assert(S.assign(s, 'guard', -1));
  assert.equal(Object.values(s.posts).reduce((a, b) => a + b), 1);
  const hall = S.get(s, 'hall');
  hall.level = 2;
  hall.stock.grain = 4;
  run(s, 28);
  assert.equal(hall.stock.grain, 0);
  assert.equal(hall.stock.food, 4);
  const doomed = S.create();
  run(doomed, 210);
  assert(doomed.loss);
  const end = doomed.time;
  run(doomed, 5);
  assert.equal(doomed.time, end);
});
