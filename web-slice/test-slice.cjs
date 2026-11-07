const assert = require('node:assert/strict');
const { test } = require('node:test');
const E = require('./engine.js');

function advance(s, n) {
  for (let i = 0; i < n; i++) E.tick(s);
}

test('alokasi profesi menggunakan warga yang tersedia', () => {
  const s = E.create();
  for (let i = 0; i < 8; i++) assert(E.setRole(s, 'food', 1));
  assert.equal(E.setRole(s, 'guard', 1), false);
  assert(E.setRole(s, 'food', -1));
  assert(E.setRole(s, 'guard', 1));
  assert.equal(E.count(s, 'guard'), 1);
});

test('bahan perlu tiba di proyek dan kemajuan berhenti tanpa pembangun', () => {
  const s = E.create();
  E.order(s, 3, 'build', 'farm');
  E.setRole(s, 'food', 1);
  advance(s, 3);
  assert.equal(s.plots[3].job.delivered.wood, 0);
  E.setRole(s, 'builder', 1);
  for (let i = 0; i < 65 && !s.plots[3].job.done; i++) E.tick(s);
  const j = s.plots[3].job;
  assert(j.done > 0);
  assert.equal(j.delivered.wood, 8);
  assert.equal(j.delivered.stone, 3);
  const before = j.done;
  E.setRole(s, 'builder', -1);
  advance(s, 4);
  assert.equal(j.done, before);
  E.setRole(s, 'builder', 1);
  advance(s, 14);
  assert.equal(s.plots[3].type, 'farm');
});

test('petak tetap, pusat dilindungi, dan lebih dari tiga pesanan diizinkan', () => {
  const s = E.create();
  assert.equal(E.order(s, 0, 'clear'), false);
  assert.equal(E.order(s, 3, 'build', 'wall'), false);
  assert.equal(E.order(s, 100, 'build', 'farm'), false);
  for (const i of [3, 4, 5, 6]) assert(E.order(s, i, 'build', 'farm'));
  assert.equal(s.plots.filter(p => p.job).length, 4);
});

test('gudang penuh menunda pengumpulan dan membuka kembali secara otomatis', () => {
  const s = E.create();
  const core = s.plots[0];
  E.setRole(s, 'food', 1);
  E.setRole(s, 'food', 1);
  core.stock.wood = E.capacity(core, 'wood');
  E.setRole(s, 'wood', 1);
  advance(s, 4);
  assert.equal(s.deposits[1].left, 45);
  core.stock.wood -= 6;
  advance(s, 48);
  assert.equal(s.deposits[1].left, 39);
  assert.equal(core.stock.wood, E.capacity(core, 'wood'));
});

test('deposit habis tetap menunggu penugasan meski ditanam ulang', () => {
  const s = E.create();
  s.deposits[1].left = 1;
  E.setRole(s, 'wood', 1);
  advance(s, 12);
  assert(s.stalled.wood);
  assert(E.replant(s, 1));
  advance(s, 15);
  assert.equal(s.deposits[1].left, 22);
  assert(E.assignSource(s, 1));
  advance(s, 16);
  assert(s.deposits[1].left < 22);
});

test('sesi tersimpan mempertahankan bahan dalam perjalanan dan pesanan', () => {
  const s = E.create();
  E.order(s, 3, 'build', 'farm');
  E.setRole(s, 'builder', 1);
  E.tick(s);
  assert(s.workers[0].cargo.job);
  const loaded = E.restore(JSON.stringify(s));
  advance(s, 25);
  advance(loaded, 25);
  assert.deepEqual(loaded, s);
  assert.throws(() => E.restore('{}'));
});

test('pembatalan tidak mengirim kargo lama ke pesanan baru', () => {
  const s = E.create();
  E.order(s, 3, 'build', 'farm');
  E.setRole(s, 'builder', 1);
  E.tick(s);
  const previous = s.workers[0].cargo.job;
  assert(E.cancel(s, 3));
  assert(E.order(s, 3, 'build', 'house'));
  assert.notEqual(s.plots[3].job.token, previous);
  E.setRole(s, 'builder', -1);
  advance(s, 20);
  assert.equal(s.plots[3].job.delivered.wood, 0);
  assert.equal(s.plots[0].stock.wood, 17);
});

test('jalur kebun dan pos jaga bertahan tiga malam', () => {
  const s = E.create();
  for (const role of ['food', 'food', 'wood', 'stone', 'guard', 'guard', 'builder', 'builder']) {
    E.setRole(s, role, 1);
  }
  for (let i = 0; i < 280 && !s.loss && !s.milestone; i++) {
    E.tick(s);
    if (s.tick === 24) E.order(s, 3, 'build', 'farm');
    if (s.tick === 84) E.order(s, 9, 'build', 'tower');
    if (s.plots[3].type === 'farm') s.sources.food = -3;
    if (s.plots[9].type === 'tower') s.post = 9;
    if (s.stalled.wood) E.assignSource(s, 3);
    if (s.plots[1].hp > 0 && s.plots[1].hp < 78 && !s.plots[1].job) E.order(s, 1, 'repair');
  }
  assert.equal(s.loss, '');
  assert.equal(s.nights, 3);
  assert(s.milestone);
  assert.equal(s.plots[9].type, 'tower');
  assert.equal(s.enemies.length, 0);
  assert.equal(s.workers.length, 8);
});

test('kelaparan dan serangan menghasilkan Game Over yang menghentikan waktu', () => {
  const hungry = E.create();
  hungry.workers.splice(1);
  hungry.plots[0].stock.food = 0;
  advance(hungry, 140);
  assert.match(hungry.loss, /warga/);
  const t = hungry.tick;
  E.tick(hungry);
  assert.equal(hungry.tick, t);

  const breached = E.create();
  E.setRole(breached, 'food', 1);
  E.setRole(breached, 'food', 1);
  advance(breached, 145);
  assert.equal(breached.plots[1].hp, 0);
  assert.match(breached.loss, /Pusat/);
});
