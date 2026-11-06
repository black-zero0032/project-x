/* Project X presentation simulation. Original source. No dependencies.
 * State is owned by this deterministic simulation; in-place updates avoid cloning each frame.
 * All balance values below are provisional demonstration values, not final product decisions.
 */
(function(root){
'use strict';
const W=26,H=19;
const names=['Arga','Nara','Bima','Sari','Damar','Laras','Raka','Intan','Bayu','Tara','Jati','Mira'];
const roles={idle:'Siaga',farmer:'Petani',logger:'Penebang',miner:'Penambang',hauler:'Pengangkut',builder:'Pembangun',scholar:'Peneliti',smith:'Perajin',guard:'Penjaga'};
const items={food:'Pangan',wood:'Kayu',stone:'Batu',ore:'Bijih besi',metal:'Logam',tool:'Perkakas',spear:'Tombak'};
const buildings={
 farm:{name:'Ladang',cost:{wood:10},work:5,terrain:'fertile',desc:'Petani menghasilkan pangan. Wajib tanah subur.'},
 hut:{name:'Hunian',cost:{wood:12,stone:4},work:6,desc:'Tempat penduduk beristirahat.'},
 lab:{name:'Rumah ilmu',cost:{wood:15,stone:8},work:7,desc:'Tempat pekerja melakukan penelitian.'},
 furnace:{name:'Peleburan',cost:{wood:14,stone:12},work:8,tech:'metal',desc:'2 bijih + 1 kayu → 1 logam. Perlu perajin.'},
 workshop:{name:'Bengkel',cost:{wood:14,stone:8},work:7,tech:'tools',desc:'Produksi perkakas atau tombak. Perlu perajin.'},
 tower:{name:'Pos jaga',cost:{wood:12,stone:8},work:6,tech:'defense',desc:'Jangkauan penjaga di dekat pos bertambah.'},
 road:{name:'Jalan',cost:{stone:1},work:1,desc:'Gerak pekerja di petak ini lebih cepat.'}
};
const techs={
 tools:{name:'Perkakas',cost:{wood:5,stone:5},work:8,parents:[],unlock:'Bengkel & perkakas'},
 metal:{name:'Metalurgi',cost:{ore:6,stone:4},work:10,parents:['tools'],unlock:'Peleburan & alat logam'},
 defense:{name:'Pertahanan',cost:{wood:8,stone:6},work:9,parents:['tools'],unlock:'Pos jaga'},
 trade:{name:'Pertukaran',cost:{wood:5,food:8},work:8,parents:[],unlock:'Hubungan dagang & mata uang'}
};
const requiredTool={logger:'tool',miner:'tool',guard:'spear'};
const key=(x,y)=>`${x},${y}`;
function terrain(x,y){if(x<4||(x<9&&y<8))return 'forest';if(x>19&&y<9)return 'mountain';if(x>15&&y>12)return 'fertile';if(y>15&&x<9)return 'water';return 'ground';}
function inLand(x,y){return x>=0&&y>=0&&x<W&&y<H&&terrain(x,y)!=='water';}
function initial(){
 const cells=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++)cells.push({x,y,type:terrain(x,y),deposit:terrain(x,y)==='forest'?35:terrain(x,y)==='mountain'?50:0});
 const unlocked=[];for(let y=6;y<=14;y++)for(let x=9;x<=18;x++)if(!(x>15&&y<9))unlocked.push(key(x,y));
 // Initial collection areas are connected to the settlement by an open corridor.
 for(let x=6;x<=21;x++)unlocked.push(key(x,9));unlocked.push(key(21,8),key(6,8),key(6,7));
 return {version:3,day:1,hour:7,elapsed:0,wall:100,dead:false,stage:0,paused:true,speed:1,cells,unlocked:[...new Set(unlocked)],
 stock:{food:85,wood:75,stone:55,ore:18,metal:0,tool:5,spear:4},
 people:names.map((name,i)=>({id:i,name,age:22+i*2,role:['farmer','farmer','logger','miner','hauler','hauler','builder','builder','scholar','idle','guard','guard'][i],x:12+i%4,y:9+Math.floor(i/4),tool:null,durability:0,restUntil:0,guarded:false,post:{x:17,y:10+i%3},job:null,carry:null})),
 buildings:[{id:0,type:'warehouse',x:13,y:10,done:true},{id:1,type:'hut',x:11,y:11,done:true},{id:2,type:'hut',x:11,y:13,done:true},{id:3,type:'farm',x:17,y:13,done:true},{id:4,type:'lab',x:14,y:8,done:true}],nextId:5,piles:[],known:[],seen:['tools','trade'],research:null,orders:[],enemies:[],shipments:[],shots:[],spawnedDay:0,
 market:{open:false,local:false,coins:0,localCoins:0,rate:2,stock:{food:80,wood:60,stone:60,ore:45,metal:25},flows:0},
 messages:['Warga memilihmu sebagai kepala permukiman. Persiapkan pangan dan pertahanan sebelum malam.'],stats:{delivered:0,built:0,crafted:0,sold:0},tutorial:0};
}
function log(s,msg){s.messages.unshift(msg);s.messages=s.messages.slice(0,30);}
function isNight(s){return s.hour>=18||s.hour<6;}
function has(s,cost){return Object.entries(cost).every(([k,v])=>s.stock[k]>=v);}
function spend(s,cost){for(const[k,v]of Object.entries(cost))s.stock[k]-=v;}
function unlocked(s,x,y){return s.unlocked.includes(key(x,y));}
function occupied(s,x,y){return s.buildings.some(b=>b.x===x&&b.y===y&&b.type!=='road');}
function active(s,p){return !s.dead&&s.elapsed>=p.restUntil&&(p.role==='guard'||!isNight(s));}
function equipped(p){return !requiredTool[p.role]||(p.tool===requiredTool[p.role]&&p.durability>0);}
function assign(s,id,role){const p=s.people.find(p=>p.id===id);if(!p||!roles[role]||s.dead)return false;p.role=role;p.job=null;return true;}
function equip(s,id,type){const p=s.people.find(p=>p.id===id);if(!p||!['tool','spear'].includes(type)||s.stock[type]<1||s.dead)return false;
 if(p.tool){s.stock[p.tool]++;} // Swapping preserves the old item's durability in a reserve inventory.
 if(p.tool){s.reserves??={tool:[],spear:[]};s.reserves[p.tool].push(p.durability);}
 s.stock[type]--;s.reserves??={tool:[],spear:[]};p.tool=type;p.durability=s.reserves[type].length?s.reserves[type].shift():100;return true;}
function wear(s,p,amount){if(!p.tool)return;p.durability=Math.max(0,p.durability-amount);if(!p.durability){log(s,`Alat ${p.name} rusak. Bagikan alat pengganti.`);p.tool=null;}}
function build(s,type,x,y){const b=buildings[type];if(s.dead||!b||!inLand(x,y)||!unlocked(s,x,y)||occupied(s,x,y)||s.buildings.some(z=>z.x===x&&z.y===y)||b.tech&&!s.known.includes(b.tech)||b.terrain&&terrain(x,y)!==b.terrain||!has(s,b.cost))return false;
 spend(s,b.cost);s.buildings.push({id:s.nextId++,type,x,y,done:false,progress:0,delivered:0,needed:Object.values(b.cost).reduce((a,b)=>a+b,0),reserved:{...b.cost}});log(s,`${b.name}: bahan dipesan, menunggu pengangkut dan pembangun.`);return true;}
function expand(s,x,y){if(s.dead||!inLand(x,y)||unlocked(s,x,y)||![[1,0],[-1,0],[0,1],[0,-1]].some(([dx,dy])=>unlocked(s,x+dx,y+dy))||!has(s,{wood:2}))return false;spend(s,{wood:2});s.unlocked.push(key(x,y));return true;}
function research(s,id){const t=techs[id];if(s.dead||!t||s.research||s.known.includes(id)||!t.parents.every(x=>s.known.includes(x))||!s.buildings.some(b=>b.type==='lab'&&b.done)||!has(s,t.cost))return false;spend(s,t.cost);s.research={id,progress:0};return true;}
function craft(s,type){const cost=type==='tool'?{metal:1,wood:2}:{metal:1,wood:3};if(s.dead||!['tool','spear'].includes(type)||!s.known.includes('tools')||!s.buildings.some(b=>b.type==='workshop'&&b.done)||!has(s,cost)||s.orders.length>=5)return false;spend(s,cost);s.orders.push({type,progress:0});return true;}
function addPile(s,x,y,item,amount){const p=s.piles.find(p=>p.x===x&&p.y===y&&p.item===item);if(p)p.amount+=amount;else s.piles.push({id:s.nextId++,x,y,item,amount});}
function nearest(list,p){return [...list].sort((a,b)=>dist(p,a)-dist(p,b))[0];}
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y);}
function move(s,p,target,dt){let dx=target.x-p.x,dy=target.y-p.y,d=Math.hypot(dx,dy);if(d<.16){p.x=target.x;p.y=target.y;return true;}
 const road=s.buildings.some(b=>b.type==='road'&&b.done&&Math.round(p.x)===b.x&&Math.round(p.y)===b.y);const step=Math.min(d,dt*(road?3.8:2.3)*(terrain(Math.round(p.x),Math.round(p.y))==='mountain'?.65:1));p.x+=dx/d*step;p.y+=dy/d*step;return d<=step+.16;}
function transport(s,p,dt){const store=s.buildings[0];if(p.carry){const target=p.carry.buildId!=null?s.buildings.find(b=>b.id===p.carry.buildId):store;if(!target){p.carry=null;return;}if(move(s,p,target,dt)){if(p.carry.buildId!=null)target.delivered+=p.carry.amount;else{s.stock[p.carry.item]+=p.carry.amount;s.stats.delivered+=p.carry.amount;}p.carry=null;}return;}
 const site=s.buildings.find(b=>!b.done&&Object.values(b.reserved).some(n=>n>0));if(site){if(!move(s,p,store,dt))return;const item=Object.keys(site.reserved).find(k=>site.reserved[k]>0);const amount=Math.min(8,site.reserved[item]);site.reserved[item]-=amount;p.carry={item,amount,buildId:site.id};return;}
 const pile=nearest(s.piles.filter(p=>p.amount>=1),p);if(!pile)return;if(move(s,p,pile,dt)){const amount=Math.min(8,Math.floor(pile.amount));pile.amount-=amount;p.carry={item:pile.item,amount};s.piles=s.piles.filter(p=>p.amount>.01);}}
function work(s,p,dt){
 const home=s.buildings.find(b=>b.type==='hut'&&b.done)||s.buildings[0];
 if(!active(s,p)){move(s,p,home,dt);return;}
 if(p.carry&&p.role!=='hauler'){if(move(s,p,s.buildings[0],dt)){if(p.carry.buildId!=null){const site=s.buildings.find(b=>b.id===p.carry.buildId);if(site)site.reserved[p.carry.item]+=p.carry.amount;}else s.stock[p.carry.item]+=p.carry.amount;p.carry=null;}return;}
 if(p.role==='guard'){if(!equipped(p))return;move(s,p,p.post,dt);if(isNight(s)){p.guarded=true;const range=s.buildings.some(b=>b.type==='tower'&&b.done&&dist(p,b)<1.5)?7:5;const e=nearest(s.enemies.filter(e=>e.hp>0&&dist(p,e)<=range),p);if(e){e.hp-=dt*5;wear(s,p,dt*.3);s.shots.push({x:p.x,y:p.y,tx:e.x,ty:e.y,life:.2});}}return;}
 if(!equipped(p))return;
 if(p.role==='hauler'){transport(s,p,dt);return;}
 if(p.role==='builder'){const site=nearest(s.buildings.filter(b=>!b.done&&b.delivered>=b.needed),p);if(site&&move(s,p,site,dt)){site.progress+=dt;if(site.progress>=buildings[site.type].work){site.done=true;s.stats.built++;log(s,`${buildings[site.type].name} selesai dibangun.`);}}return;}
 if(p.role==='scholar'){const lab=s.buildings.find(b=>b.type==='lab'&&b.done);if(lab&&s.research&&move(s,p,lab,dt)){s.research.progress+=dt;const t=techs[s.research.id];if(s.research.progress>=t.work){const id=s.research.id;s.known.push(id);s.research=null;s.seen=[...new Set([...s.seen,...Object.keys(techs).filter(k=>techs[k].parents.every(x=>s.known.includes(x)))])];log(s,`${t.name} selesai. ${t.unlock} terbuka; hasil fisiknya tetap harus dibuat.`);if(id==='trade'){s.market.open=true;log(s,'Pedagang Asteria tiba. Jual surplus untuk memperoleh uang Asteria (AS).');}}}return;}
 if(p.role==='smith'){
  const shop=s.buildings.find(b=>b.type==='workshop'&&b.done),furnace=s.buildings.find(b=>b.type==='furnace'&&b.done);
  if(shop&&s.orders.length){if(move(s,p,shop,dt)){const o=s.orders[0];o.progress+=dt;if(o.progress>=4){addPile(s,shop.x,shop.y,o.type,1);s.orders.shift();s.stats.crafted++;log(s,'Alat selesai, menunggu diangkut ke gudang.');}}}
  else if(furnace){if(move(s,p,furnace,dt)){p.progress=(p.progress||0)+dt;if(p.progress>=4&&has(s,{ore:2,wood:1})){p.progress=0;spend(s,{ore:2,wood:1});addPile(s,furnace.x,furnace.y,'metal',1);}}}return;
 }
 let target,item,rate;
 if(p.role==='farmer'){target=nearest(s.buildings.filter(b=>b.type==='farm'&&b.done),p);item='food';rate=1.5;}
 if(p.role==='logger'){target=nearest(s.cells.filter(c=>c.type==='forest'&&c.deposit>0&&unlocked(s,c.x,c.y)),p);item='wood';rate=1;}
 if(p.role==='miner'){target=nearest(s.cells.filter(c=>c.type==='mountain'&&c.deposit>0&&unlocked(s,c.x,c.y)),p);item=p.mine||'ore';rate=.8;}
 if(target&&move(s,p,target,dt)){let n=dt*rate;if(target.deposit!=null){n=Math.min(n,target.deposit);target.deposit-=n;}addPile(s,target.x,target.y,item,n);wear(s,p,dt*.15);}
}
function waveSize(day){return 4+Math.floor(day/3)+(day%7===0?5:0)+(day%30===0?10:0)+(day%180===0?25:0);}
function spawnWave(s){const n=waveSize(s.day);s.enemies=Array.from({length:n},(_,i)=>({id:i,x:25+(i%3)*.5,y:7+i%7,hp:14+s.day*.5}));s.spawnedDay=s.day;log(s,`${n} mutan menyerang dari timur!`);}
function tick(s,dt){if(s.paused||s.dead||!Number.isFinite(dt)||dt<=0)return;s.elapsed+=dt;const old=s.hour;s.hour+=dt*.25;
 if(old<17&&s.hour>=17)log(s,'PERINGATAN: gerakan mutan di tepi timur. Tempatkan penjaga bertombak.');
 if(old<18&&s.hour>=18&&s.spawnedDay!==s.day)spawnWave(s);
 if(s.hour>=24){s.hour-=24;s.day++;}
 if(old<6&&s.hour>=6){for(const p of s.people)if(p.guarded){p.restUntil=s.elapsed+20;p.guarded=false;}log(s,'Fajar. Penjaga malam wajib tidur sampai pukul 11.00.');}
 for(const p of s.people)work(s,p,dt);
 for(const e of s.enemies){if(e.hp<=0)continue;const wallX=20;if(e.x>wallX)e.x-=dt*.8;else s.wall-=dt*(.85+s.day*.04);}
 s.enemies=s.enemies.filter(e=>e.hp>0);s.shots=s.shots.map(z=>({...z,life:z.life-dt})).filter(z=>z.life>0);
 const foodNeed=dt*.035*s.people.length;s.stock.food=Math.max(0,s.stock.food-foodNeed);s.hunger=s.stock.food<=0?(s.hunger||0)+dt:0;
 if(s.hunger>40&&s.people.length){const p=s.people.pop();log(s,`${p.name} meninggal akibat kelaparan.`);s.hunger=0;}
 for(const sh of s.shipments){sh.remaining-=dt;if(sh.remaining<=0&&!sh.arrived){addPile(s,19,10,sh.item,sh.amount);sh.arrived=true;log(s,'Kiriman tiba di gerbang, menunggu pengangkut.');}}s.shipments=s.shipments.filter(sh=>!sh.arrived);
 if(s.wall<=0||!s.people.length){s.wall=Math.max(0,s.wall);s.dead=true;s.paused=true;log(s,'Peradaban runtuh. Mulai siklus baru untuk mencoba strategi lain.');}
}
const prices={food:1,wood:1.5,stone:2,ore:3,metal:7};
function price(s,item,buy){const base=prices[item];if(!base)return NaN;const scarcity=Math.max(.65,Math.min(1.8,60/(s.market.stock[item]+20)));return Math.round(base*scarcity*(buy?1.15:.85)*10)/10;}
function trade(s,item,buy){if(s.dead||!s.market.open||!prices[item])return false;const qty=5,cost=Math.round(price(s,item,buy)*qty*10)/10;
 if(buy){if(s.market.coins+1e-8<cost||s.market.stock[item]<qty)return false;s.market.coins-=cost;s.market.stock[item]-=qty;s.shipments.push({item,amount:qty,remaining:10});s.market.flows++;}
 else{if(s.stock[item]<qty)return false;s.stock[item]-=qty;s.market.coins+=cost;s.market.stock[item]+=qty;s.stats.sold+=qty;s.market.flows--;}
 s.market.rate=Math.max(.8,Math.min(4,2+s.market.flows*.03));if(s.stats.sold>=10&&!s.market.local){s.market.local=true;log(s,'Kesepakatan mata uang lokal dibuka. Tukarkan AS menjadi PX; tidak ada uang gratis.');}return true;}
function exchange(s,toLocal){if(s.dead||!s.market.local)return false;if(toLocal){if(s.market.coins<5)return false;s.market.coins-=5;s.market.localCoins+=5*s.market.rate;}else{const cost=5*s.market.rate;if(s.market.localCoins+1e-8<cost)return false;s.market.localCoins=Math.max(0,s.market.localCoins-cost);s.market.coins+=5;}return true;}
function reset(s){const next=initial();next.seen=[...new Set([...next.seen,...s.seen])];return next;}
function readyScenario(){const s=initial();s.known=['tools','metal','defense','trade'];s.seen=Object.keys(techs);s.market.open=true;s.market.coins=30;s.stock.metal=8;
 s.buildings.push({id:5,type:'workshop',x:15,y:11,done:true},{id:6,type:'furnace',x:15,y:13,done:true},{id:7,type:'tower',x:18,y:10,done:true});s.nextId=8;s.people[9].role='smith';
 for(const p of s.people)if(requiredTool[p.role])equip(s,p.id,requiredTool[p.role]);s.tutorial=3;log(s,'Skenario presentasi: fasilitas awal disiapkan untuk menunjukkan seluruh alur demo.');return s;}
const api={W,H,roles,items,buildings,techs,initial,readyScenario,tick,assign,equip,build,expand,research,craft,trade,exchange,price,reset,isNight,active,equipped,terrain,unlocked,occupied,waveSize,requiredTool};
if(typeof module!=='undefined')module.exports=api;else root.PX=api;
})(typeof window!=='undefined'?window:globalThis);
