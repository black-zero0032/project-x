(function (root) {
  'use strict';
  const goods = ['food', 'wood', 'stone'];
  const roles = ['food', 'wood', 'stone', 'builder', 'guard', 'porter'];
  const plans = {
    house: { cost: { wood: 10, stone: 3 }, work: 12, hp: 60 },
    store: { cost: { wood: 12, stone: 5 }, work: 15, hp: 65 },
    farm: { cost: { wood: 8, stone: 3 }, work: 12, hp: 50 },
    tower: { cost: { wood: 12, stone: 6 }, work: 16, hp: 70 },
    wall: { cost: { wood: 10, stone: 8 }, work: 16, hp: 85 }
  };
  const plot = (type, x, y, hp) => ({ type, x, y, hp, max: hp, level: 1 });
  const stash = (food = 0, wood = 0, stone = 0) => ({ food, wood, stone });
  const deposit = (kind, x, y, max) => ({ kind, x, y, max, left: max });

  function create() {
    return {
      version: 1, tick: 0, serial: 8, nights: 0, hunger: 0, loss: '', milestone: false,
      history: { built: 0, firstDelivery: false }, notice: 'Alokasikan pengumpul sebelum memulai waktu.',
      plots: [
        { ...plot('core', 12, 7, 120), stock: stash(15, 17, 8) },
        plot('wall', 19, 7, 85), plot('house', 9, 6, 60),
        ...[[10, 4], [13, 4], [16, 4], [9, 9], [12, 10], [15, 9], [17, 7]].map(([x, y]) => plot('', x, y, 0))
      ],
      deposits: [deposit('food', 5, 9, 78), deposit('wood', 5, 4, 45), deposit('stone', 21, 11, 66),
        deposit('wood', 22, 3, 95), deposit('food', 6, 12, 100), deposit('stone', 23, 9, 90)],
      sources: { food: 0, wood: 1, stone: 2 }, destinations: { food: 0, wood: 0, stone: 0 },
      stalled: {}, workers: Array.from({ length: 8 }, (_, id) => ({ id, role: '', x: 12, y: 7 })),
      enemies: [], post: 1, preferred: null
    };
  }

  const capacity = (p, g) => p.type === 'core' ? { food: 30, wood: 32, stone: 25 }[g] : 34 + 18 * (p.level - 1);
  const efficiency = p => p.hp <= p.max / 10 ? 0 : p.hp / p.max;
  const stores = s => s.plots.filter(p => p.stock && efficiency(p));
  const room = (p, g) => p?.stock && efficiency(p) ? capacity(p, g) - p.stock[g] : 0;
  const running = (s, type) => s.plots.filter(p => p.type === type && efficiency(p));
  const count = (s, role) => s.workers.filter(w => w.role === role).length;
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const phase = s => s.tick % 84;
  const day = s => Math.floor(s.tick / 84) + 1;
  const night = s => phase(s) >= 56;
  const notice = (s, message) => { s.notice = message; };

  function walk(w, p, speed = 0.76) {
    const d = distance(w, p);
    if (d <= speed) {
      w.x = p.x;
      w.y = p.y;
      return true;
    }
    w.x += (p.x - w.x) * speed / d;
    w.y += (p.y - w.y) * speed / d;
    return false;
  }

  function stock(s, good) {
    return stores(s).reduce((sum, p) => sum + p.stock[good], 0);
  }

  function setRole(s, role, delta) {
    if (s.loss || !roles.includes(role)) return false;
    const w = delta > 0 ? s.workers.find(w => !w.role) : s.workers.findLast(w => w.role === role);
    if (!w) return false;
    // Cargo stays with its carrier until delivered, even after a job change.
    w.role = delta > 0 ? role : '';
    return true;
  }

  function assignSource(s, id) {
    const d = s.deposits[id];
    if (!d || !d.left || s.loss) return false;
    s.sources[d.kind] = id;
    delete s.stalled[d.kind];
    return true;
  }

  function replant(s, id) {
    const d = s.deposits[id];
    const core = s.plots[0];
    if (s.loss || !d || d.kind === 'stone' || d.left >= d.max || core.stock.food < 4) return false;
    core.stock.food -= 4;
    d.left = Math.min(d.max, d.left + 22);
    notice(s, 'Cadangan ditanam ulang. Pilih deposit untuk menugaskan kembali.');
    return true;
  }

  function order(s, id, action, type) {
    const p = s.plots[id];
    if (!p || p.job || s.loss) return false;
    let cost;
    let work;
    if (action === 'build' && !p.type && Object.hasOwn(plans, type) && (id === 1) === (type === 'wall')) {
      ({ cost, work } = plans[type]);
    } else if (action === 'repair' && p.hp > 0 && p.hp < p.max) {
      cost = { wood: Math.ceil((p.max - p.hp) / 14) };
      work = Math.ceil((p.max - p.hp) / 5);
    } else if (action === 'upgrade' && p.hp > 0 && p.level === 1 && ['store', 'core', 'tower'].includes(p.type)) {
      cost = { wood: 10, stone: 5 };
      work = 15;
    } else if (action === 'clear' && p.type && p.hp === 0 && p.type !== 'core') {
      cost = {};
      work = 7;
    } else if (action === 'clear' && p.hp > 0 && ['house', 'farm', 'tower'].includes(p.type)) {
      cost = {};
      work = 9;
    } else {
      return false;
    }
    p.job = { token: ++s.serial, action, type, cost, delivered: stash(), work, done: 0, crew: null };
    return true;
  }

  function put(p, g, n) {
    const accepted = Math.min(n, room(p, g));
    if (accepted) p.stock[g] += accepted;
    return accepted;
  }

  function refund(s, p, materials, fraction) {
    const choices = stores(s).sort((a, b) => distance(a, p) - distance(b, p));
    for (const g of goods) {
      let n = Math.floor((materials[g] || 0) * fraction);
      for (const destination of choices) n -= put(destination, g, n);
      if (n) notice(s, 'Sebagian bahan pengembalian hilang karena gudang penuh.');
    }
  }

  function cancel(s, id) {
    const p = s.plots[id];
    if (!p?.job || s.loss) return false;
    refund(s, p, p.job.delivered, 0.75 - 0.5 * p.job.done / p.job.work);
    delete p.job;
    return true;
  }

  function demand(s, p, g) {
    if (!p.job) return 0;
    const reserved = s.workers.reduce((n, w) => n + (w.cargo?.job === p.job.token && w.cargo.g === g ? w.cargo.n : 0), 0);
    return (p.job.cost[g] || 0) - p.job.delivered[g] - reserved;
  }

  function deliver(s, w) {
    const cargo = w.cargo;
    const p = s.plots[cargo.to];
    if (!walk(w, p)) return;
    if (cargo.job && p.job?.token === cargo.job) {
      p.job.delivered[cargo.g] += cargo.n;
      delete w.cargo;
      return;
    }
    if (cargo.job) {
      cargo.to = s.plots[cargo.from].stock ? cargo.from : 0;
      delete cargo.job;
      return;
    }
    if (!p.stock && !cargo.gathered && cargo.to !== 0) {
      cargo.to = 0;
      return;
    }
    cargo.n -= put(p, cargo.g, cargo.n);
    if (cargo.n) return;
    if (cargo.gathered) s.history.firstDelivery = true;
    delete w.cargo;
  }

  function haul(s, w, jobs) {
    const core = s.plots[0];
    if (w.role === 'porter' && core.stock.food < 10) {
      const food = stores(s).find(p => p !== core && p.stock.food > 0);
      if (food) {
        if (walk(w, food)) {
          const n = Math.min(3, food.stock.food);
          food.stock.food -= n;
          w.cargo = { g: 'food', n, to: 0 };
        }
        return true;
      }
    }
    for (const p of jobs) {
      for (const g of goods) {
        const needed = demand(s, p, g);
        if (needed <= 0) continue;
        const sources = stores(s).filter(a => a.stock[g] > 0).sort((a, b) => distance(a, w) - distance(b, w));
        const source = sources[0];
        if (!source) continue;
        if (walk(w, source)) {
          const n = Math.min(3, needed, source.stock[g]);
          source.stock[g] -= n;
          w.cargo = { g, n, to: s.plots.indexOf(p), from: s.plots.indexOf(source), job: p.job.token };
        }
        return true;
      }
    }
    return false;
  }

  function gather(s, w) {
    const g = w.role;
    const farm = g === 'food' && s.sources.food < 0 ? s.plots[-s.sources.food] : null;
    const d = farm || s.deposits[s.sources[g]];
    const to = s.destinations[g];
    const p = s.plots[to];
    if (s.stalled[g] || !room(p, g) || (farm && (farm.type !== 'farm' || !efficiency(farm)))) return;
    if (!walk(w, d)) return;
    const waiting = s.workers.reduce((n, a) => n + (a.cargo?.g === g && a.cargo.to === to && !a.cargo.job ? a.cargo.n : 0), 0);
    const n = Math.min(farm ? Math.floor(4 * efficiency(farm)) : 3, room(p, g) - waiting, farm ? Infinity : d.left);
    if (n > 0) {
      if (!farm) d.left -= n;
      w.cargo = { g, n, to, gathered: true };
    }
    if (!farm && !d.left) {
      s.stalled[g] = true;
      notice(s, 'Deposit habis. Pilih deposit lain untuk pekerja yang menunggu.');
    }
  }

  function complete(s, p) {
    const job = p.job;
    if (job.action === 'build') {
      const plan = plans[job.type];
      Object.assign(p, plot(job.type, p.x, p.y, plan.hp));
      if (p.type === 'store') p.stock = stash();
      s.history.built++;
      notice(s, 'Bangunan selesai. Pilih petaknya untuk memeriksa fungsi.');
    } else if (job.action === 'repair') {
      p.hp = p.max;
    } else if (job.action === 'upgrade') {
      p.level++;
      p.max += 25;
      p.hp += 25;
    } else if (job.action === 'clear') {
      refund(s, p, plans[p.type]?.cost || { wood: 8 }, p.type === 'wall' ? 0.15 : 0.35);
      Object.assign(p, plot('', p.x, p.y, 0));
    }
    delete p.job;
  }

  function work(s) {
    const jobs = s.plots.filter(p => p.job).sort((a, b) =>
      Number(s.plots.indexOf(b) === s.preferred) - Number(s.plots.indexOf(a) === s.preferred) ||
      Number(b.type === 'wall') - Number(a.type === 'wall'));
    const builders = s.workers.filter(w => w.role === 'builder' && !w.cargo);
    const allocation = new Map(jobs.map(p => [p, []]));
    for (const p of jobs) {
      if (p.job.crew !== null) allocation.get(p).push(...builders.splice(0, p.job.crew));
    }
    for (let layer = 0; layer < 3; layer++) {
      for (const p of jobs) {
        if (p.job.crew === null && builders.length) allocation.get(p).push(builders.shift());
      }
    }
    const active = new Map(jobs.map(p => [p, 0]));
    for (const w of s.workers) {
      if (w.cargo) deliver(s, w);
      else if (goods.includes(w.role)) gather(s, w);
      else if (w.role === 'guard') {
        const post = s.plots[s.post];
        walk(w, efficiency(post) ? post : s.plots[0]);
      } else if (w.role === 'porter') haul(s, w, jobs);
      else if (w.role === 'builder') {
        const target = jobs.find(p => allocation.get(p).includes(w));
        if (!target || haul(s, w, [target])) continue;
        if (goods.every(g => target.job.delivered[g] >= (target.job.cost[g] || 0)) && walk(w, target)) {
          active.set(target, active.get(target) + 1);
        }
      }
    }
    for (const [p, crew] of active) {
      if (!crew) continue;
      p.job.done += [0, 1, 1.65, 2.05][crew];
      if (p.job.done >= p.job.work) complete(s, p);
    }
  }

  function damage(s, p, n) {
    p.hp = Math.max(0, p.hp - n);
    if (p.hp) return;
    if (p.job) delete p.job;
    if (p.stock) delete p.stock;
    notice(s, p.type === 'core' ? 'Pusat peradaban hancur.' : 'Bangunan hancur dan meninggalkan reruntuhan.');
  }

  function attack(s) {
    const time = phase(s);
    if (time === 46) notice(s, 'Bahaya! Gerombolan terlihat di timur. Siapkan penjaga.');
    if (time === 56 || time === 64 || (day(s) >= 2 && time === 70)) {
      const amount = Math.min(10, 1 + day(s));
      for (let i = 0; i < amount; i++) {
        s.enemies.push({ id: ++s.serial, x: 25, y: 4 + i % 7, hp: 7 + day(s) });
      }
    }
    for (const w of s.workers.filter(w => w.role === 'guard' && !w.cargo)) {
      const post = s.plots[s.post];
      const target = s.enemies.find(e => e.hp > 0 && distance(w, e) <= (post.type === 'tower' ? 5.3 : 3.3));
      if (target) target.hp -= (post.type === 'tower' ? 4.5 : 3) * (efficiency(post) || 0.5);
    }
    s.enemies = s.enemies.filter(e => e.hp > 0);
    for (const e of s.enemies) {
      const wall = s.plots[1];
      const post = s.plots[s.post];
      const target = wall.hp ? wall : post.type === 'tower' && post.hp ? post : s.plots[0];
      if (!target.hp) break;
      if (walk(e, target, 0.62)) {
        damage(s, target, 2 + Math.floor(day(s) / 2));
        const guard = s.workers.find(w => w.role === 'guard' && distance(w, e) < 1);
        if (guard) {
          guard.wounds = (guard.wounds || 0) + 1;
          if (guard.wounds >= 12) {
            s.workers.splice(s.workers.indexOf(guard), 1);
            notice(s, 'Penjaga gugur. Tugaskan warga cadangan untuk menjaga pos.');
          }
        }
      }
    }
    if (time === 83) {
      s.nights++;
      notice(s, 'Fajar tiba. Isi stok dan perbaiki pertahanan sebelum malam berikutnya.');
    }
    if (s.nights >= 3 && !s.enemies.length && s.plots[0].hp && s.workers.length) s.milestone = true;
  }

  function tick(s) {
    if (s.loss) return;
    work(s);
    if (s.tick % 7 === 0) {
      const core = s.plots[0];
      const meal = Math.ceil(s.workers.length / 3);
      if (core.stock.food >= meal) {
        core.stock.food -= meal;
        s.hunger = 0;
      } else {
        core.stock.food = 0;
        if (++s.hunger === 1) notice(s, 'Pangan di pusat habis. Tugaskan pengumpul atau bangun kebun.');
        if (s.hunger % 2 === 0) {
          const w = s.workers.find(w => !w.role) || s.workers[0];
          s.workers.splice(s.workers.indexOf(w), 1);
          notice(s, 'Seorang warga meninggal karena kelaparan.');
        }
      }
    }
    if (s.tick > 0 && s.tick % 42 === 0 && !night(s) && s.plots[0].stock.food >= 12) {
      const capacity = 6 + running(s, 'house').reduce((n, p) => n + Math.floor(2 * efficiency(p)), 0);
      if (s.workers.length < capacity) {
        s.workers.push({ id: ++s.serial, x: 12, y: 7, role: '' });
        notice(s, 'Pendatang tiba. Alokasikan profesi untuk warga baru.');
      }
    }
    attack(s);
    s.tick++;
    if (!s.workers.length) s.loss = 'Semua warga telah gugur.';
    if (!s.plots[0].hp) s.loss = 'Pusat peradaban telah hancur.';
  }

  function restore(raw) {
    const s = JSON.parse(raw);
    if (s?.version !== 1 || !Number.isInteger(s.tick) || s.plots?.length !== 10 || !Array.isArray(s.workers)) {
      throw new Error('Sesi tidak dikenali');
    }
    return s;
  }

  const api = { create, plans, goods, roles, capacity, efficiency, room, stock, count, phase, day,
    night, setRole, assignSource, replant, order, cancel, tick, restore };
  if (typeof module === 'object') module.exports = api;
  else root.Outpost = api;
})(globalThis);
