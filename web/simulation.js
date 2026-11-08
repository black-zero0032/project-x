(function (root) {
  'use strict';

  const goods = ['food', 'wood', 'stone'];
  const roles = ['forager', 'logger', 'miner', 'builder', 'guard', 'hauler'];
  const plans = {
    cabin: { hp: 55, cost: { wood: 9, stone: 2 }, work: 7 },
    garden: { hp: 40, cost: { wood: 8, stone: 2 }, work: 7 },
    warehouse: { hp: 70, cost: { wood: 12, stone: 4 }, work: 10 },
    workshop: { hp: 65, cost: { wood: 11, stone: 5 }, work: 10 },
    tower: { hp: 75, cost: { wood: 10, stone: 6 }, work: 9 },
    wall: { hp: 90, cost: { wood: 6, stone: 3 }, work: 6 },
  };
  const recipes = {
    axe: { role: 'logger', cost: { wood: 2, stone: 2 }, work: 5 },
    pickaxe: { role: 'miner', cost: { wood: 2, stone: 3 }, work: 6 },
    hammer: { role: 'builder', cost: { wood: 3, stone: 2 }, work: 6 },
    spear: { role: 'guard', cost: { wood: 3, stone: 1 }, work: 5 },
  };
  const gathering = { forager: 'food', logger: 'wood', miner: 'stone' };
  const clock = { start: 8, secondsPerHour: 2.7 };
  const stock = (food = 0, wood = 0, stone = 0) => ({ food, wood, stone });
  const structure = (id, x, y, type = '', hp = 0, wall = false) =>
    ({ id, x, y, type, hp, max: hp, wall, level: 1, job: null });
  const deposit = (id, x, y, good, quantity) => ({ id, x, y, good, quantity, max: quantity });
  const range = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function create() {
    const plots = [
      { ...structure('hall', 16, 9.7, 'hall', 130), stock: stock(15, 18, 10) },
      structure('home', 13.2, 9, 'cabin', 55),
      structure('east', 22.6, 10.3, 'wall', 90, true),
      structure('west', 9.4, 10.3, 'wall', 90, true),
      structure('north', 16, 5.1, 'wall', 90, true),
      structure('south', 16, 15.6, 'wall', 90, true),
      ...[[13.1, 6.9], [16.3, 6.9], [19.4, 7.1], [19.4, 9.4], [12.1, 12.9],
        [15.6, 12.9], [19.1, 12.9], [21.3, 12.1]].map(([x, y], i) => structure('lot' + i, x, y)),
    ];
    const deposits = [
      deposit('berries', 7.4, 12.3, 'food', 75), deposit('berries-n', 22.6, 3.5, 'food', 64),
      deposit('woods', 7, 6.6, 'wood', 85), deposit('woods-e', 26.4, 12.6, 'wood', 94),
      deposit('rocks', 25, 7.7, 'stone', 76), deposit('rocks-s', 20.5, 17.5, 'stone', 68),
    ];
    return {
      version: 1, time: 0, serial: 0, plots, deposits,
      workers: Array.from({ length: 7 }, (_, i) => ({
        id: i, role: '', x: 14.7 + i % 4 * .72, y: 10.9 + Math.floor(i / 4) * .64,
        cargo: null, work: 0, hungry: false,
      })),
      tools: { axe: 0, pickaxe: 0, hammer: 0, spear: 0 },
      sources: { food: 'berries', wood: 'woods', stone: 'rocks' },
      destinations: { food: 'hall', wood: 'hall', stone: 'hall' },
      enemies: [], lastWave: 0, nights: 0, lastMeal: -1, guardPost: 'east',
      hunger: 0, loss: '', message: 'Buka Profesi dan siapkan regu sebelum malam.',
      delivered: 0, built: 0, priority: null,
    };
  }

  const day = s => Math.floor((clock.start + s.time / clock.secondsPerHour) / 24) + 1;
  const hour = s => (clock.start + s.time / clock.secondsPerHour) % 24;
  const night = s => hour(s) >= 20 || hour(s) < 6;
  const efficiency = p => p?.hp > p?.max / 10 ? p.hp / p.max : 0;
  const stores = s => s.plots.filter(p => p.stock && efficiency(p));
  const capacity = (p, good) => (p.type === 'hall' && good === 'food' ? 34 : 30) + (p.level - 1) * 16;
  const room = (p, good) => p?.stock && efficiency(p) ? Math.max(0, capacity(p, good) - p.stock[good]) : 0;
  const total = (s, good) => stores(s).reduce((sum, p) => sum + p.stock[good], 0);
  const count = (s, role) => s.workers.filter(w => w.role === role).length;
  const get = (s, id) => s.plots.find(p => p.id === id);
  const source = (s, good) => s.deposits.find(d => d.id === s.sources[good]);
  const notify = (s, message) => { s.message = message; };

  function walk(unit, target, speed, dt) {
    const distance = range(unit, target);
    if (distance <= speed * dt) {
      unit.x = target.x;
      unit.y = target.y;
      return true;
    }
    unit.x += (target.x - unit.x) / distance * speed * dt;
    unit.y += (target.y - unit.y) / distance * speed * dt;
    return false;
  }

  function equip(s, worker) {
    const recipe = Object.keys(recipes).find(key => recipes[key].role === worker.role);
    if (!recipe) return false;
    return s.workers.filter(w => w.role === worker.role).indexOf(worker) < s.tools[recipe];
  }

  function assign(s, role, delta) {
    if (s.loss || !roles.includes(role)) return false;
    const w = delta > 0 ? s.workers.find(w => !w.role) : s.workers.findLast(w => w.role === role);
    if (!w) return false;
    w.role = delta > 0 ? role : '';
    w.work = 0;
    return true;
  }

  function order(s, id, action, type) {
    const p = get(s, id);
    if (s.loss || !p || p.job) return false;
    let spec;
    if (action === 'build' && !p.type && Object.hasOwn(plans, type) && p.wall === (type === 'wall')) {
      spec = plans[type];
    } else if (action === 'repair' && p.hp > 0 && p.hp < p.max) {
      const damage = p.max - p.hp;
      spec = { cost: { wood: Math.ceil(damage / 18) }, work: 4 + damage / 18 };
    } else if (action === 'upgrade' && p.stock && efficiency(p) && p.level === 1) {
      spec = { cost: { wood: 12, stone: 6 }, work: 10 };
    } else if (action === 'clear' && p.type && p.id !== 'hall' &&
        (p.hp === 0 || (!p.wall && !p.stock))) {
      spec = { cost: {}, work: 4 };
    } else if (action === 'craft' && p.type === 'workshop' && efficiency(p) && Object.hasOwn(recipes, type)) {
      spec = recipes[type];
    }
    if (!spec) return false;
    p.job = { id: ++s.serial, action, type, cost: spec.cost, received: stock(), work: spec.work, done: 0, crew: 2 };
    notify(s, 'Pesanan masuk. Bahan dikirim dari penyimpanan.');
    return true;
  }

  function returnMaterial(s, good, qty) {
    for (const p of stores(s)) {
      const moved = Math.min(qty, room(p, good));
      p.stock[good] += moved;
      qty -= moved;
    }
  }

  function cancel(s, p) {
    if (!p.job || s.loss) return;
    const refund = 1 - p.job.done / p.job.work * .75;
    for (const good of goods) returnMaterial(s, good, Math.floor(p.job.received[good] * refund));
    p.job = null;
    notify(s, 'Pekerjaan dibatalkan. Bahan tersisa dikembalikan jika ada ruang.');
  }

  function finish(s, p) {
    const { action, type } = p.job;
    p.job = null;
    if (action === 'build') {
      p.type = type;
      p.hp = p.max = plans[type].hp;
      p.level = 1;
      if (type === 'warehouse') p.stock = stock();
      if (type === 'garden') s.deposits.push(deposit(p.id + '-food', p.x, p.y + .65, 'food', 48));
      s.built++;
    } else if (action === 'repair') {
      p.hp = p.max;
    } else if (action === 'clear') {
      returnMaterial(s, p.type === 'wall' ? 'stone' : 'wood', p.type === 'tower' ? 3 : 1);
      p.type = '';
      p.hp = p.max = 0;
      delete p.stock;
      s.deposits = s.deposits.filter(d => d.id !== p.id + '-food');
    } else if (action === 'upgrade') {
      p.level++;
      p.max += 25;
      p.hp = p.max;
    } else {
      s.tools[type]++;
    }
    notify(s, action === 'craft' ? 'Alat selesai dan dipakai otomatis oleh profesinya.' : 'Pekerjaan di petak selesai.');
  }

  function projectList(s) {
    return s.plots.filter(p => p.job).sort((a, b) => Number(b.id === s.priority) - Number(a.id === s.priority));
  }

  function dispatch(s, worker, projects, dt) {
    for (const p of projects) {
      for (const good of goods) {
        const incoming = s.workers.reduce((n, w) =>
          n + (w.cargo?.job === p.job.id && w.cargo.good === good ? w.cargo.qty : 0), 0);
        const need = (p.job.cost[good] || 0) - p.job.received[good] - incoming;
        if (need <= 0) continue;
        const from = stores(s).find(place => place.stock[good] > 0);
        if (!from) continue;
        if (walk(worker, from, 2.6, dt)) {
          const qty = Math.min(3, need, from.stock[good]);
          from.stock[good] -= qty;
          worker.cargo = { good, qty, target: p.id, job: p.job.id, origin: from.id };
        }
        return true;
      }
    }
    return false;
  }

  function carry(s, w, dt) {
    const cargo = w.cargo;
    const p = get(s, cargo.target);
    if (cargo.job && p?.job?.id === cargo.job) {
      if (walk(w, p, 2.2, dt)) {
        p.job.received[cargo.good] += cargo.qty;
        w.cargo = null;
      }
      return;
    }
    const preferred = get(s, cargo.job ? cargo.origin : s.destinations[cargo.good]);
    const target = cargo.job && !room(preferred, cargo.good)
      ? stores(s).find(store => room(store, cargo.good)) : preferred;
    const amount = Math.min(cargo.qty, room(target, cargo.good));
    if (!amount) return;
    if (walk(w, target, 2.2, dt)) {
      target.stock[cargo.good] += amount;
      if (!cargo.job) s.delivered += amount;
      cargo.qty -= amount;
      if (!cargo.qty) w.cargo = null;
    }
  }

  function gather(s, w, good, dt) {
    const d = source(s, good);
    const target = get(s, s.destinations[good]);
    const reserved = s.workers.reduce((n, worker) =>
      n + (worker.cargo?.good === good && !worker.cargo.job ? worker.cargo.qty : 0), 0);
    if (!d?.quantity || room(target, good) <= reserved) return;
    const garden = d.id.endsWith('-food') ? get(s, d.id.slice(0, -5)) : null;
    if (garden && !efficiency(garden)) return;
    if (!walk(w, d, 2.7, dt)) return;
    w.work += dt * (equip(s, w) ? 1.55 : 1) * (garden ? efficiency(garden) : 1);
    if (w.work < 1) return;
    const qty = Math.min(3, d.quantity, room(target, good) - reserved);
    w.work = 0;
    d.quantity -= qty;
    if (!d.quantity) notify(s, 'Deposit habis. Pilih sumber pengganti di peta.');
    w.cargo = { good, qty };
  }

  function defend(s, w, dt) {
    const post = get(s, s.guardPost);
    const home = efficiency(post) ? post : s.plots[0];
    const enemy = s.enemies.find(e => e.hp > 0 && range(home, e) < 6);
    if (!enemy) {
      walk(w, { x: home.x + (w.id % 3 - 1) * .52, y: home.y + .75 }, 2.5, dt);
      return;
    }
    if (range(w, enemy) > 1.15) walk(w, enemy, 2.8, dt);
    if (range(w, enemy) <= 1.15) enemy.hp -= dt * (equip(s, w) ? 23 : 15);
  }

  function takeMeal(s) {
    let fed = 0;
    for (const w of s.workers) {
      const place = stores(s).find(p => p.stock.food > 0);
      w.hungry = !place;
      if (place) {
        place.stock.food--;
        fed++;
      }
    }
    s.hunger = fed === s.workers.length ? 0 : s.hunger + 1;
    if (s.hunger >= 2) {
      const index = s.workers.findLastIndex(w => w.hungry);
      if (index >= 0) {
        const [worker] = s.workers.splice(index, 1);
        if (worker.cargo) returnMaterial(s, worker.cargo.good, worker.cargo.qty);
        notify(s, 'Satu warga meninggal karena kelaparan.');
      }
    }
  }

  function advance(s, dt) {
    if (s.loss) return;
    s.time += dt;
    const currentDay = day(s);
    const h = hour(s);
    if (h >= 20 && s.lastWave < currentDay) {
      s.lastWave = currentDay;
      const wall = s.plots[2 + (currentDay - 1) % 4];
      const dx = Math.sign(wall.x - 16), dy = Math.abs(wall.x - 16) < 1 ? Math.sign(wall.y - 10) : 0;
      for (let i = 0; i < Math.min(2 + currentDay, 18); i++) {
        s.enemies.push({
          id: ++s.serial, target: wall.id, hp: 21 + currentDay * 3,
          x: wall.x + dx * (7 + i * .7) + (dy ? (i % 3 - 1) * .9 : 0),
          y: wall.y + dy * (5 + i * .6) + (dx ? (i % 3 - 1) * .9 : 0),
        });
      }
      notify(s, 'Serangan malam! Periksa sisi pertahanan di peta.');
    }
    const meal = currentDay * 2 + (h >= 18 ? 1 : 0);
    if ((h >= 18 || h >= 6 && currentDay > 1) && s.lastMeal !== meal) {
      s.lastMeal = meal;
      takeMeal(s);
    }
    const projects = projectList(s);
    const ready = projects.filter(p => goods.every(g => p.job.received[g] >= (p.job.cost[g] || 0)));
    const crews = new Map(ready.map(p => [p, 0]));
    for (const w of s.workers) {
      if (w.cargo) {
        carry(s, w, dt);
      } else if (gathering[w.role]) {
        gather(s, w, gathering[w.role], dt);
      } else if (w.role === 'guard') {
        defend(s, w, dt);
      } else if (w.role === 'builder' || w.role === 'hauler') {
        const site = w.role === 'builder' && ready.find(p => crews.get(p) < p.job.crew);
        if (site) {
          const slot = crews.get(site);
          crews.set(site, slot + 1);
          const spot = { x: site.x + (slot ? .7 : -.55), y: site.y + .45 };
          if (walk(w, spot, 2.4, dt)) {
            site.job.done += dt * (slot ? .55 : 1) * (equip(s, w) ? 1.4 : 1);
          }
        } else {
          dispatch(s, w, projects, dt);
        }
      }
    }
    for (const p of ready) if (p.job.done >= p.job.work) finish(s, p);
    for (const e of s.enemies) {
      if (e.hp <= 0) continue;
      const wall = get(s, e.target);
      const p = wall.hp > 0 ? wall : s.plots[0];
      if (range(e, p) > .7) walk(e, p, .9, dt);
      else {
        p.hp = Math.max(0, p.hp - dt * 3.3);
        if (!p.hp) {
          cancel(s, p);
          notify(s, p === wall ? 'Tembok jebol. Musuh menuju pusat permukiman.' : 'Pusat permukiman hancur.');
        }
      }
    }
    s.enemies = s.enemies.filter(e => e.hp > 0);
    if (s.lastWave && currentDay > s.lastWave && h >= 6 && !s.enemies.length && s.nights < s.lastWave) {
      s.nights = s.lastWave;
      notify(s, 'Fajar tiba. Isi persediaan dan perbaiki pertahanan.');
    }
    if (s.plots[0].hp <= 0 || !s.workers.length) {
      s.loss = s.plots[0].hp <= 0 ? 'Pusat permukiman hancur.' : 'Tidak ada warga yang bertahan.';
    }
  }

  function restore(raw) {
    const s = JSON.parse(raw);
    if (s?.version !== 1 || !Number.isFinite(s.time) || s.time < 0 ||
        !Array.isArray(s.plots) || s.plots[0]?.id !== 'hall' ||
        !Array.isArray(s.workers) || !Array.isArray(s.deposits) || !Array.isArray(s.enemies) ||
        !s.sources || !s.destinations || !s.tools) throw new Error('Sesi tidak valid');
    return s;
  }

  const api = { goods, roles, plans, recipes, create, restore, day, hour, night, efficiency, capacity,
    stores, room, total, count, get, source, assign, order, cancel, advance };
  if (typeof module === 'object') module.exports = api;
  else root.Settlement = api;
})(globalThis);
