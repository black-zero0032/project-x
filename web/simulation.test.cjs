const test = require('node:test');
const assert = require('node:assert/strict');
const S = require('./simulation');

function run(state, seconds) {
  for (let t = 0; t < seconds; t += .12) S.advance(state, .12);
}

test('pengiriman paralel memenuhi biaya tepat satu kali dan save mempertahankan kargo', () => {
  const state = S.create();
  for (const role of ['builder', 'builder', 'hauler', 'guard', 'guard']) S.assign(state, role, 1);
  assert(S.order(state, 'lot0', 'build', 'garden'));
  assert(S.order(state, 'lot1', 'build', 'cabin'));
  run(state, 2);
  assert(state.workers.some(w => w.cargo?.job));
  const resumed = S.restore(JSON.stringify(state));
  run(state, 29);
  run(resumed, 29);
  assert.deepEqual(resumed, state);
  assert.equal(S.get(state, 'lot0').type, 'garden');
  assert.equal(S.get(state, 'lot1').type, 'cabin');
  assert.equal(S.get(state, 'hall').stock.wood, 1);
  assert.equal(S.get(state, 'hall').stock.stone, 6);
});

test('proyek pengganti tidak menerima kiriman pesanan yang dibatalkan', () => {
  const state = S.create();
  S.assign(state, 'builder', 1);
  S.order(state, 'lot0', 'build', 'garden');
  run(state, 2);
  const lot = S.get(state, 'lot0');
  const cargo = state.workers[0].cargo;
  assert.equal(cargo.job, lot.job.id);
  S.cancel(state, lot);
  assert(S.order(state, 'lot0', 'build', 'cabin'));
  assert.notEqual(cargo.job, lot.job.id);
  S.assign(state, 'builder', -1);
  run(state, 10);
  assert.equal(lot.job.received.wood, 0);
  assert.equal(S.get(state, 'hall').stock.wood, 18);
});

test('penempatan penjaga mendukung fajar dan permainan tanpa penjaga dapat berakhir', () => {
  const defended = S.create();
  for (const role of ['guard', 'guard', 'forager', 'forager']) S.assign(defended, role, 1);
  run(defended, 62);
  assert.equal(defended.nights, 1);
  assert.equal(defended.loss, '');
  const empty = S.create();
  run(empty, 140);
  assert(empty.loss);
  const end = empty.time;
  run(empty, 5);
  assert.equal(empty.time, end);
});
