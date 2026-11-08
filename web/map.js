(() => {
  'use strict';
  const root = '../assets/project-x-v0.1/';
  const art = {};
  const files = [
    'tiles/grass', 'tiles/road', 'world/hut', 'world/watchtower', 'world/warehouse',
    'world/workshop', 'world/garden', 'world/wall-intact', 'world/wall-damaged',
    'world/rubble', 'world/tree-large', 'world/tree-small', 'world/stump', 'world/stone',
    'world/logs', 'citizens/idle', 'citizens/carrier', 'citizens/guard', 'threats/mutant',
  ];
  const loaded = Promise.allSettled(files.map(async file => {
    const image = new Image();
    image.src = root + file + '.png';
    await image.decode();
    art[file] = image;
  }));
  const random = (x, y) => ((Math.imul(x + 131, 73856093) ^ Math.imul(y + 37, 19349663)) >>> 0) % 997 / 997;
  const forest = [];
  for (let y = -11; y < 34; y++) {
    for (let x = -13; x < 46; x++) {
      const inside = x > 4 && x < 29 && y > 2 && y < 18;
      const roll = random(x, y);
      if ((inside ? roll > .982 : roll > .29)) forest.push([x + roll * .48, y + roll * .58, roll]);
    }
  }
  const buildings = { hall: 'hut', cabin: 'hut', garden: 'garden', warehouse: 'warehouse', workshop: 'workshop', tower: 'watchtower' };

  window.makeSettlementMap = canvas => {
    const ctx = canvas.getContext('2d', { alpha: false });
    let scale = 1, offsetX = 0, offsetY = 0, zoom = 1, panX = 0, panY = 0;
    const tilePatterns = {};

    function box(x, y, width, height, color) {
      ctx.fillStyle = color;
      ctx.fillRect(Math.round(x * scale + offsetX), Math.round(y * scale + offsetY),
        Math.max(1, Math.round(width * scale)), Math.max(1, Math.round(height * scale)));
    }

    function sprite(file, x, y, width, height, alpha = 1) {
      const image = art[file];
      if (!image) return;
      const ratio = Math.min(width * scale / image.width, height * scale / image.height);
      const w = Math.max(1, Math.round(image.width * ratio));
      const h = Math.max(1, Math.round(image.height * ratio));
      ctx.globalAlpha = alpha;
      ctx.drawImage(image, Math.round(x * scale + offsetX - w / 2), Math.round(y * scale + offsetY - h), w, h);
      ctx.globalAlpha = 1;
    }

    function meter(x, y, ratio, color, width = 1.45) {
      box(x - width / 2, y, width, .15, '#352426');
      if (ratio > 0) box(x - width / 2, y, width * Math.min(1, ratio), .11, color);
    }

    function terrain(name, fallback) {
      const image = art['tiles/' + name];
      if (!image) return fallback;
      if (!tilePatterns[name]) {
        const texture = document.createElement('canvas');
        texture.width = texture.height = 32;
        const tile = texture.getContext('2d');
        tile.imageSmoothingEnabled = false;
        tile.drawImage(image, 0, 0, 32, 32);
        tilePatterns[name] = ctx.createPattern(texture, 'repeat');
      }
      tilePatterns[name].setTransform(new DOMMatrix().translate(offsetX, offsetY).scale(scale / 16));
      return tilePatterns[name];
    }

    function plot(p, title) {
      if (p.wall) return;
      if (!p.type) {
        if (p.job) {
          sprite('world/' + buildings[p.job.type], p.x, p.y + .48, 2.25, 2.1, .55);
          sprite('world/logs', p.x + .65, p.y + .5, .65, .5);
        } else if (!title) {
          box(p.x - .66, p.y - .24, 1.32, .72, '#54482c82');
          box(p.x - .66, p.y - .24, 1.32, .06, '#baa365');
          box(p.x - .66, p.y + .44, 1.32, .06, '#baa365');
          box(p.x - .66, p.y - .24, .06, .72, '#baa365');
          box(p.x + .6, p.y - .24, .06, .72, '#baa365');
        }
      } else {
        const size = p.type === 'hall' ? 3.1 : 2.15;
        sprite('world/' + (p.hp ? buildings[p.type] : 'rubble'), p.x, p.y + .55, size, size);
        if (p.type === 'hall' && p.hp) sprite('world/logs', p.x + 1.65, p.y + .48, .72, .55);
        if (p.hp && p.hp < p.max) meter(p.x, p.y + .67, p.hp / p.max, '#ef8a5c');
      }
      if (p.job) meter(p.x, p.y + .88, p.job.done / p.job.work, '#ffcd37');
    }

    function walls(state) {
      for (const p of state.plots.filter(p => p.wall)) {
        const horizontal = ['north', 'south'].includes(p.id);
        if (!p.type) {
          box(p.x - .45, p.y, .9, .12, '#f0d17c');
        } else {
          const span = horizontal ? 4 : 10;
          for (let i = -span; i <= span; i++) {
            const distance = Math.abs(i) * (horizontal ? 1.49 : .51);
            if (!p.hp && distance < 1.6) continue;
            const x = p.x + (horizontal ? i * 1.49 : 0);
            const y = p.y + (horizontal ? .25 : i * .51);
            sprite('world/' + (distance < 1.6 && p.hp < p.max / 2 ? 'wall-damaged' : 'wall-intact'),
              x, y, horizontal ? 1.53 : 1.26, horizontal ? .64 : .57);
          }
          if (!p.hp) sprite('world/rubble', p.x, p.y + .4, 1.4, .8);
          if (p.hp > 0 && p.hp < p.max) meter(p.x, p.y + .66, p.hp / p.max, '#e98052');
        }
        if (p.job) meter(p.x, p.y + .92, p.job.done / p.job.work, '#ffca41');
      }
    }

    function draw(state, selected, title = false, stamp = 0) {
      const w = Math.round(canvas.clientWidth * .72), h = Math.round(canvas.clientHeight * .72);
      if (!w || !h) return;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.imageSmoothingEnabled = false;
      const base = Math.min(w / 32, h / 20);
      scale = base * (title ? 1.68 : zoom);
      offsetX = w / 2 - (title ? 9.9 : 16 - panX) * scale;
      offsetY = h / 2 - (title ? 9.1 : 10.3 - panY) * scale;
      ctx.fillStyle = terrain('grass', '#6b7746');
      ctx.fillRect(0, 0, w, h);
      const road = terrain('road', '#a3804e');
      box(7.6, 10.4, 19.7, .78, road);
      box(15.61, 3.7, .78, 13.3, road);
      for (const [x, y, roll] of forest) {
        if (x * scale + offsetX < -70 || x * scale + offsetX > w + 70 ||
          y * scale + offsetY < -50 || y * scale + offsetY > h + 80) continue;
        sprite(roll > .55 ? 'world/tree-large' : 'world/tree-small', x, y, 2.75, 2.6);
      }
      walls(state);
      const entities = state.plots.map(p => [p.y, () => plot(p, title)]);
      for (const d of state.deposits) {
        if (d.id.endsWith('-food')) continue;
        entities.push([d.y, () => {
          if (d.good === 'wood') {
            sprite(d.quantity ? 'world/tree-large' : 'world/stump', d.x, d.y + .35, 2.55, 2.6);
            if (d.quantity) sprite('world/logs', d.x + .7, d.y + .43, .85, .6);
          } else if (d.good === 'stone') {
            if (d.quantity) sprite('world/stone', d.x, d.y + .35, 1.85, 1.35);
          } else {
            for (let i = 0; i < 6; i++) {
              const x = d.x + (i % 3 - 1) * .42, y = d.y + (i > 2 ? .14 : -.22);
              box(x, y, .36, .3, '#3b5029');
              if (d.quantity) box(x + .13, y + .05, .11, .13, '#e99e4d');
            }
          }
          if (!title) meter(d.x, d.y + .59, d.quantity / d.max, '#f6d15d', 1.1);
        }]);
      }
      for (const worker of state.workers) entities.push([worker.y, () => {
        const mode = worker.cargo ? 'carrier' : worker.role === 'guard' ? 'guard' : 'idle';
        sprite('citizens/' + mode, worker.x, worker.y + .18 + (worker.id % 3) * .045, .78, .85);
      }]);
      for (const enemy of state.enemies) entities.push([enemy.y, () => {
        sprite('threats/mutant', enemy.x, enemy.y + .22, 1.03, .95);
        meter(enemy.x, enemy.y + .31, enemy.hp / 30, '#d76650', .7);
      }]);
      entities.sort((a, b) => a[0] - b[0]).forEach(([, render]) => render());
      if (title || Settlement.night(state)) {
        ctx.fillStyle = title ? '#14213e9e' : '#151d4591';
        ctx.fillRect(0, 0, w, h);
        const x = offsetX + 16 * scale, y = offsetY + 10.45 * scale;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, scale * 4.1);
        glow.addColorStop(0, '#ffc7648a');
        glow.addColorStop(1, '#d98a2e00');
        ctx.fillStyle = glow;
        ctx.fillRect(x - scale * 5, y - scale * 5, scale * 10, scale * 10);
        const flame = Math.floor(stamp / 190) % 3;
        box(15.89, 10.33 + flame * .034, .22, .31, '#ffac43');
        box(15.94, 10.48, .11, .16, '#fff18a');
      }
      if (selected) {
        ctx.strokeStyle = '#fff0a1';
        ctx.lineWidth = Math.max(1, scale * .065);
        ctx.strokeRect(Math.round(offsetX + (selected.x - .92) * scale),
          Math.round(offsetY + (selected.y - .7) * scale), Math.round(scale * 1.84), Math.round(scale * 1.42));
      }
    }

    function coords(clientX, clientY) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((clientX - rect.left) * canvas.width / rect.width - offsetX) / scale,
        y: ((clientY - rect.top) * canvas.height / rect.height - offsetY) / scale,
      };
    }
    function move(dx, dy) {
      panX = Math.max(-11, Math.min(11, panX + dx * .72 / scale));
      panY = Math.max(-8, Math.min(8, panY + dy * .72 / scale));
    }
    function zoomBy(delta) {
      zoom = Math.max(.85, Math.min(2.35, zoom + delta));
    }
    return { draw, coords, move, zoomBy, loaded };
  };
})();
