(function (root) {
  'use strict';

  const goods = ['food', 'grain', 'wood', 'scrap', 'stone'];
  const roles = ['forager', 'logger', 'scavenger', 'guard', 'builder', 'miner', 'farmer', 'hauler'];
  const grid = { x: 10, y: 5.5, size: 2, columns: 6, rows: 5 };
  const sides = ['west', 'east', 'north', 'south'];
  const plans = {
    cabin: { hp: 55, cost: { wood: 9, stone: 2 }, work: 7 },
    rack: { hp: 45, cost: { wood: 50 }, work: 7 },
    garden: { hp: 40, cost: { wood: 75, scrap: 8 }, work: 9, level: 2 },
    warehouse: { hp: 70, cost: { wood: 50 }, work: 8 },
    workshop: { hp: 65, cost: { wood: 50 }, work: 9 },
    tower: { hp: 75, cost: { wood: 40, stone: 6 }, work: 9, level: 2 },
    wall: { hp: 90, cost: { wood: 6, stone: 3 }, work: 6 },
  };
  const recipes = {
    axe: { role: 'logger', cost: { scrap: 5 }, work: 4, level: 1, icon: 'axe' },
    bow: { role: 'forager', cost: { wood: 15 }, work: 4, level: 1, icon: 'spear' },
    knife: { role: 'guard', cost: { scrap: 10 }, work: 4, level: 1, icon: 'spear' },
    saw: { role: 'builder', cost: { scrap: 20 }, work: 5, level: 2, icon: 'hammer' },
    pickaxe: { role: 'miner', cost: { scrap: 20 }, work: 5, level: 2, icon: 'pickaxe' },
    hoe: { role: 'farmer', cost: { scrap: 20 }, work: 5, level: 2, icon: 'hammer' },
  };
  const gathering = { forager: 'food', logger: 'wood', scavenger: 'scrap', miner: 'stone', farmer: 'grain' };
  const clock = { start: 8, secondsPerHour: 2.7 };
  const stock = (food = 0, wood = 0, scrap = 0) => ({ food, grain: 0, wood, scrap, stone: 0 });
  const structure = (id, x, y, type = '', hp = 0, wall = false) =>
    ({ id, x, y, type, hp, max: hp, wall, level: 1, job: null });
  const deposit = (id, x, y, good, quantity) => ({ id, x, y, good, quantity, max: quantity });
  const range = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

  function create() {
    const plots = [
      { ...structure('hall', 15, 10.5, 'hall', 130), stock: stock(5, 150, 12) },
      structure('east', 22.6, 10.3, 'wall', 90, true),
      structure('west', 9.4, 10.3, 'wall', 90, true),
      structure('north', 16, 5.1, 'wall', 90, true),
      structure('south', 16, 15.6, 'wall', 90, true),
      ...Array.from({ length: grid.columns * grid.rows }, (_, i) => {
        const x = grid.x + (i % grid.columns + .5) * grid.size;
        const y = grid.y + (Math.floor(i / grid.columns) + .5) * grid.size;
        return x === 15 && y === 10.5 ? null : structure('lot' + i, x, y);
      }).filter(Boolean),
    ];
    const deposits = [
      deposit('hunt', 7.4, 12.3, 'food', 75), deposit('hunt-n', 22.6, 3.5, 'food', 64),
      deposit('woods', 7, 6.6, 'wood', 185), deposit('woods-e', 26.4, 12.6, 'wood', 194),
      deposit('scrap', 25.6, 11.8, 'scrap', 120), deposit('scrap-s', 24, 17, 'scrap', 140),
      deposit('rocks', 25, 7.7, 'stone', 76), deposit('rocks-s', 20.5, 17.5, 'stone', 68),
    ];
    return {
      version: 2, time: 0, serial: 0, plots, deposits,
      workers: Array.from({ length: 5 }, (_, i) => ({
        id: i, role: '', x: 14.7 + i % 4 * .72, y: 10.9 + Math.floor(i / 4) * .64,
        cargo: null, work: 0, hungry: false,
      })),
      tools: Object.fromEntries(Object.keys(recipes).map(id => [id, 0])),
      sources: { food: 'hunt', grain: '', wood: 'woods', scrap: 'scrap', stone: 'rocks' },
      destinations: Object.fromEntries(goods.map(g => [g, 'hall'])),
      enemies: [], lastWave: 0, nights: 0, lastMeal: -1, posts: { west: 0, east: 0, north: 0, south: 0 },
      growth: 0,
      hunger: 0, loss: '', message: 'Buka Profesi dan siapkan regu sebelum malam.',
      delivered: 0, built: 0, priority: null,
    };
  }

  const day = s => Math.floor((clock.start + s.time / clock.secondsPerHour) / 24) + 1;
  const hour = s => (clock.start + s.time / clock.secondsPerHour) % 24;
  const night = s => hour(s) >= 20 || hour(s) < 6;
  const efficiency = p => p?.hp > p?.max / 10 ? p.hp / p.max : 0;
  const stores = s => s.plots.filter(p => p.stock && efficiency(p));
  const capacity = (p, good) => {
    if (p.type === 'rack') return good === 'food' ? p.level * 5 : 0;
    if (p.type === 'hall') return { food: 5, grain: p.level > 1 ? 24 : 0, wood: 150 * p.level, scrap: 20 * p.level, stone: 30 * p.level }[good];
    return 50 + (p.level - 1) * 20;
  };
  const room = (p, good) => p?.stock && efficiency(p) ? Math.max(0, capacity(p, good) - p.stock[good]) : 0;
  const total = (s, good) => stores(s).reduce((sum, p) => sum + p.stock[good], 0);
  const count = (s, role) => s.workers.filter(w => w.role === role).length;
  const get = (s, id) => s.plots.find(p => p.id === id);
  const source = (s, good) => s.deposits.find(d => d.id === s.sources[good]);
  const housing = s => s.plots.reduce((n, p) => n + (efficiency(p) ? p.type === 'hall' ? 5 * p.level : p.type === 'cabin' ? 3 : 0 : 0), 0);
  const plotAt = (s, x, y) => {
    const col = Math.floor((x - grid.x) / grid.size), row = Math.floor((y - grid.y) / grid.size);
    if (col < 0 || col >= grid.columns || row < 0 || row >= grid.rows) return null;
    return get(s, col === 2 && row === 2 ? 'hall' : 'lot' + (row * grid.columns + col));
  };
  const roleLimit = (s, role) => {
    if (role === 'builder') return s.tools.saw;
    if (role === 'miner') return s.tools.pickaxe;
    if (role === 'farmer') return s.plots.some(p => p.type === 'garden' && efficiency(p)) ? s.tools.hoe : 0;
    if (role === 'hauler') return get(s, 'hall').level > 1 ? housing(s) : 0;
    return housing(s);
  };
  const nextWave = s => {
    const n = s.lastWave + 1;
    return { day: n, large: n % 4 === 0, side: sides[(n - 1) % sides.length] };
  };
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

  function travel(worker, target, speed, dt) {
    const inside = p => p.x >= 9.4 && p.x <= 22.6 && p.y >= 5.1 && p.y <= 15.6;
    if (inside(worker) !== inside(target)) {
      const outside = inside(worker) ? target : worker;
      const side = outside.x < 9.4 ? 'west' : outside.x > 22.6 ? 'east' : outside.y < 5.1 ? 'north' : 'south';
      const gate = {
        west: { x: 9.4, y: 10.3 }, east: { x: 22.6, y: 10.3 },
        north: { x: 16, y: 5.1 }, south: { x: 16, y: 15.6 },
      }[side];
      if (range(worker, gate) > .08) {
        walk(worker, gate, speed, dt);
        return false;
      }
    }
    return walk(worker, target, speed, dt);
  }

  function equip(s, worker) {
    const recipe = Object.keys(recipes).find(key => recipes[key].role === worker.role);
    if (!recipe) return false;
    return s.workers.filter(w => w.role === worker.role).indexOf(worker) < s.tools[recipe];
  }

  function assign(s, role, delta) {
    if (s.loss || !roles.includes(role)) return false;
    if (delta > 0 && count(s, role) >= roleLimit(s, role)) return false;
    const w = delta > 0 ? s.workers.find(w => !w.role) : s.workers.findLast(w => w.role === role);
    if (!w) return false;
    w.role = delta > 0 ? role : '';
    w.work = 0;
    if (role === 'guard' && delta < 0) {
      const assigned = sides.reduce((n, side) => n + s.posts[side], 0);
      if (assigned > count(s, 'guard')) s.posts[sides.findLast(side => s.posts[side])]--;
    }
    return true;
  }

  function postGuard(s, side, delta) {
    if (!sides.includes(side) || s.loss) return false;
    const posted = sides.reduce((n, id) => n + s.posts[id], 0);
    if (delta > 0 ? posted >= count(s, 'guard') || !efficiency(get(s, side)) : !s.posts[side]) return false;
    s.posts[side] += delta > 0 ? 1 : -1;
    return true;
  }

  function order(s, id, action, type) {
    const p = get(s, id);
    if (s.loss || !p || p.job) return false;
    let spec;
    if (action === 'build' && !p.type && Object.hasOwn(plans, type) && p.wall === (type === 'wall') &&
        get(s, 'hall').level >= (plans[type].level || 1)) {
      spec = plans[type];
    } else if (action === 'repair' && p.hp > 0 && p.hp < p.max) {
      const damage = p.max - p.hp;
      spec = { cost: { wood: Math.ceil(damage / 18) }, work: 4 + damage / 18 };
    } else if (action === 'upgrade' && efficiency(p) && p.level === 1 &&
        (p.id === 'hall' || ((p.stock || p.type === 'workshop') && get(s, 'hall').level >= 2))) {
      spec = { cost: { wood: p.id === 'hall' ? 200 : 80 }, work: 10 };
    } else if (action === 'clear' && p.type && p.id !== 'hall' &&
        (p.hp === 0 || (!p.wall && !p.stock))) {
      spec = { cost: {}, work: 4 };
    } else if (action === 'craft' && p.type === 'workshop' && efficiency(p) && Object.hasOwn(recipes, type) &&
        p.level >= recipes[type].level) {
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
      if (type === 'warehouse' || type === 'rack') p.stock = stock();
      if (type === 'garden') {
        const crop = deposit(p.id + '-crop', p.x, p.y + .65, 'grain', 36);
        crop.quantity = 0;
        crop.growth = 0;
        s.deposits.push(crop);
        if (!s.sources.grain) s.sources.grain = crop.id;
      }
      s.built++;
    } else if (action === 'repair') {
      p.hp = p.max;
    } else if (action === 'clear') {
      returnMaterial(s, p.type === 'wall' ? 'stone' : 'wood', p.type === 'tower' ? 3 : 1);
      p.type = '';
      p.hp = p.max = 0;
      delete p.stock;
      s.deposits = s.deposits.filter(d => d.id !== p.id + '-crop');
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
        if (travel(worker, from, 2.6, dt)) {
          const qty = Math.min(good === 'wood' ? 15 : 5, need, from.stock[good]);
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
      if (travel(w, p, 2.2, dt)) {
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
    if (travel(w, target, 2.2, dt)) {
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
    if (!d || room(target, good) <= reserved || !d.quantity && good !== 'grain') return;
    const garden = good === 'grain' ? get(s, d.id.slice(0, -5)) : null;
    if (garden && !efficiency(garden)) return;
    if (!travel(w, d, 2.7, dt)) return;
    if (garden && !d.quantity) {
      d.growth += dt * efficiency(garden);
      if (d.growth >= 60) {
        d.quantity = d.max;
        d.growth = 0;
        notify(s, 'Gandum siap dipanen.');
      }
      return;
    }
    w.work += dt * (equip(s, w) ? 1.55 : 1) * (garden ? efficiency(garden) : 1);
    if (w.work < 1) return;
    const qty = Math.min(good === 'wood' ? 10 : good === 'food' ? 5 : 3, d.quantity, room(target, good) - reserved);
    w.work = 0;
    d.quantity -= qty;
    if (!d.quantity && !garden) notify(s, 'Deposit habis. Pilih sumber pengganti di peta.');
    w.cargo = { good, qty };
  }

  function defend(s, w, dt) {
    let index = s.workers.filter(worker => worker.role === 'guard').indexOf(w);
    const side = sides.find(id => {
      index -= s.posts[id];
      return index < 0;
    });
    const post = get(s, side);
    const home = efficiency(post) ? post : s.plots[0];
    const enemy = s.enemies.find(e => e.hp > 0 && range(home, e) < (side ? 5 : 2.5));
    if (!enemy) {
      walk(w, { x: home.x + (w.id % 3 - 1) * .52, y: home.y + .75 }, 2.5, dt);
      return;
    }
    if (range(w, enemy) > 1.15) walk(w, enemy, 2.8, dt);
    if (range(w, enemy) <= 1.15) {
      const support = side && s.plots.some(p => p.type === 'tower' && efficiency(p) && range(p, home) < 4);
      enemy.hp -= dt * (equip(s, w) ? 23 : 15) * (support ? 1.25 : 1);
    }
  }

  function takeMeal(s) {
    let fed = 0;
    for (const w of s.workers) {
      const good = total(s, 'grain') ? 'grain' : 'food';
      const place = stores(s).find(p => p.stock[good] > 0);
      w.hungry = !place;
      if (place) {
        place.stock[good]--;
        fed++;
      }
    }
    s.hunger = fed === s.workers.length ? 0 : s.hunger + 1;
    if (s.hunger >= 2) {
      const index = s.workers.findLastIndex(w => w.hungry);
      if (index >= 0) {
        const [worker] = s.workers.splice(index, 1);
        if (worker.cargo) returnMaterial(s, worker.cargo.good, worker.cargo.qty);
        const posted = sides.reduce((n, side) => n + s.posts[side], 0);
        if (posted > count(s, 'guard')) s.posts[sides.findLast(side => s.posts[side])]--;
        notify(s, 'Satu warga meninggal karena kelaparan.');
      }
    }
    if (!s.hunger && s.workers.length < housing(s)) {
      s.growth++;
      if (s.growth >= 3) {
        const home = get(s, 'hall');
        s.workers.push({ id: ++s.serial + 5, role: '', x: home.x, y: home.y + .6, cargo: null, work: 0, hungry: false });
        s.growth = 0;
        notify(s, 'Seorang warga lahir. Buka Profesi untuk menugaskan.');
      }
    }
  }

  function advance(s, dt) {
    if (s.loss) return;
    s.time += dt;
    const currentDay = day(s);
    const h = hour(s);
    if (h >= 20 && s.lastWave < currentDay) {
      const wave = nextWave(s);
      s.lastWave = currentDay;
      const wall = get(s, wave.side);
      const dx = Math.abs(wall.x - 16) > 1 ? Math.sign(wall.x - 16) : 0;
      const dy = dx ? 0 : Math.sign(wall.y - 10);
      const size = wave.large ? Math.min(6 + currentDay, 18) : Math.min(1 + Math.ceil(currentDay / 3), 8);
      for (let i = 0; i < size; i++) {
        s.enemies.push({
          id: ++s.serial, target: wall.id, hp: 21 + currentDay * 3,
          x: wall.x + dx * (7 + i * .7) + (dy ? (i % 3 - 1) * .9 : 0),
          y: wall.y + dy * (5 + i * .6) + (dx ? (i % 3 - 1) * .9 : 0),
        });
      }
      notify(s, wave.large ? 'Gelombang besar tiba! Periksa sisi pertahanan.' : 'Serangan malam! Periksa sisi pertahanan.');
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
      } else if (gathering[w.role] && !night(s)) {
        gather(s, w, gathering[w.role], dt);
      } else if (gathering[w.role]) {
        const home = get(s, 'hall');
        travel(w, { x: home.x + (w.id % 4 - 1.5) * .25, y: home.y + .62 }, 2.3, dt);
      } else if (w.role === 'guard') {
        defend(s, w, dt);
      } else if (w.role === 'builder' || w.role === 'hauler' || !w.role) {
        const site = w.role !== 'hauler' && ready.find(p => crews.get(p) < p.job.crew);
        if (site) {
          const slot = crews.get(site);
          crews.set(site, slot + 1);
          const spot = { x: site.x + (slot ? .7 : -.55), y: site.y + .45 };
          if (walk(w, spot, 2.4, dt)) {
            site.job.done += dt * (slot ? .55 : 1) * (w.role === 'builder' ? 1.4 : .8);
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
    if (s?.version !== 2 || !Number.isFinite(s.time) || s.time < 0 ||
        !Array.isArray(s.plots) || s.plots[0]?.id !== 'hall' ||
        !Array.isArray(s.workers) || !Array.isArray(s.deposits) || !Array.isArray(s.enemies) ||
        !s.sources || !s.destinations || !s.tools) throw new Error('Sesi tidak valid');
    return s;
  }

  const api = { goods, roles, plans, recipes, grid, sides, create, restore, day, hour, night, efficiency, capacity,
    stores, room, total, count, get, source, housing, plotAt, roleLimit, nextWave, assign, postGuard, order, cancel, advance };
  if (typeof module === 'object') module.exports = api;
  else root.Settlement = api;
})(globalThis);
