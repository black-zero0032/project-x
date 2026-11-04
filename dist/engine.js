(function (root) {
'use strict';
const buildings = {
  farm: {name:'Ladang sederhana',cost:{wood:25},days:4,desc:'+4 kapasitas petani'},
  lumber: {name:'Pondok kayu',cost:{wood:20,stone:5},days:4,desc:'+3 kapasitas penebang'},
  quarry: {name:'Tambang batu',cost:{wood:30},days:5,desc:'+3 kapasitas penambang'},
  house: {name:'Permukiman',cost:{wood:35,stone:15},days:6,desc:'+6 kapasitas penduduk'},
  lab: {name:'Rumah ilmu',cost:{wood:50,stone:25},days:8,desc:'+3 kapasitas peneliti'},
  tower: {name:'Menara jaga',cost:{wood:40,stone:30},days:7,desc:'+12 pertahanan, +3 kapasitas penjaga'},
  cultivated: {name:'Kebun terkelola',tech:'agriculture',cost:{wood:40,stone:10},days:6,desc:'+4 kapasitas petani; +50% hasil dasar untuk 4 petani'},
  workshop: {name:'Bengkel perkakas',tech:'tools',cost:{wood:40,stone:25},days:6,desc:'Membuka produksi alat; +2 kapasitas perajin'},
  waterworks: {name:'Saluran irigasi',tech:'irrigation',cost:{wood:65,stone:45},days:8,desc:'+70% hasil dasar untuk 8 petani per saluran'},
  stonehouse: {name:'Rumah batu',tech:'masonry',cost:{wood:60,stone:70},days:10,desc:'+12 kapasitas penduduk'},
  market: {name:'Pasar',tech:'commerce',cost:{wood:50,coin:80},days:8,max:1,desc:'+60% pendapatan koin; maksimal 1'},
  wall: {name:'Benteng wilayah',tech:'defense',cost:{wood:70,stone:100},days:12,max:1,desc:'+35 pertahanan; maksimal 1'}
};
const techs = {
  agriculture:{name:'Pertanian',cost:35,prereq:null,basic:true,desc:'Membuka Kebun terkelola'},
  tools:{name:'Perkakas batu',cost:45,prereq:null,basic:true,desc:'Membuka Bengkel, Kapak, Beliung, dan Cangkul'},
  irrigation:{name:'Irigasi',cost:110,prereq:'agriculture',basic:false,desc:'Membuka Saluran irigasi'},
  masonry:{name:'Arsitektur',cost:130,prereq:'tools',basic:false,desc:'Membuka Rumah batu'},
  commerce:{name:'Perdagangan',cost:160,prereq:'tools',basic:false,desc:'Membuka Pasar'},
  defense:{name:'Pertahanan',cost:180,prereq:'masonry',basic:false,desc:'Membuka Benteng wilayah'}
};
const recipes = {
  axe:{name:'Kapak batu',tech:'tools',job:'logger',cost:{wood:5,stone:4},work:3,bonus:.4,desc:'+40% hasil kayu per penebang beralat'},
  pick:{name:'Beliung batu',tech:'tools',job:'miner',cost:{wood:4,stone:6},work:3,bonus:.4,desc:'+40% hasil batu per penambang beralat'},
  hoe:{name:'Cangkul batu',tech:'tools',job:'farmer',cost:{wood:5,stone:5},work:3,bonus:.3,desc:'+30% hasil dasar pangan per petani beralat'}
};
const jobs={farmer:'Petani',logger:'Penebang',miner:'Penambang',scholar:'Peneliti',guard:'Penjaga',artisan:'Perajin'};
const emptyTools=()=>({axe:0,pick:0,hoe:0});
function fresh(meta) {
  return {version:2,day:1,cycle:meta?.cycle||1,pop:12,food:110,wood:95,stone:60,coin:100,science:0,
    jobs:{farmer:5,logger:3,miner:2,scholar:1,guard:1,artisan:0},
    buildings:{farm:2,lumber:1,quarry:1,house:2,lab:1,tower:1,cultivated:0,workshop:0,waterworks:0,stonehouse:0,market:0,wall:0},
    queue:[],tools:emptyTools(),craftQueue:[],known:(meta?.memory||[]).filter(k=>techs[k]?.basic),research:null,progress:0,
    regions:[{name:'Asteria',power:70,growth:10},{name:'Valdora',power:90,growth:12},{name:'Nusantara',power:55,growth:8}],
    logs:[{day:1,text:'Dua belas penduduk memulai sebuah peradaban baru.',type:'info'}],
    meta:meta||{points:0,perks:{harvest:0,learning:0,guard:0},memory:[],cycle:1},starve:0,dead:false,totalScience:0};
}
function log(s,text,type='info'){s.logs.unshift({day:s.day,text,type});s.logs=s.logs.slice(0,50)}
const cap=s=>s.buildings.house*6+s.buildings.stonehouse*12;
const limits=s=>({farmer:(s.buildings.farm+s.buildings.cultivated)*4,logger:s.buildings.lumber*3,miner:s.buildings.quarry*3,scholar:s.buildings.lab*3,guard:s.buildings.tower*3,artisan:s.buildings.workshop*2});
const free=s=>s.pop-Object.values(s.jobs).reduce((a,b)=>a+b,0);
const equipped=(s,k)=>Math.min(s.tools[k],s.jobs[recipes[k].job]);
function realized(s){return Object.keys(techs).filter(k=>Object.entries(buildings).some(([b,d])=>d.tech===k&&s.buildings[b]>0)||Object.entries(recipes).some(([r,d])=>d.tech===k&&s.tools[r]>0))}
const defense=s=>s.jobs.guard*8+s.buildings.tower*12+s.buildings.wall*35+s.meta.perks.guard*5;
const power=s=>Math.round(s.pop*2+Object.values(s.buildings).reduce((a,b)=>a+b,0)*3+realized(s).length*12+s.science/10);
const rate=(s,i)=>Math.max(.35,s.regions[i].power/Math.max(1,power(s)));
function rates(s){
  const food=2*(s.jobs.farmer+Math.min(s.jobs.farmer,s.buildings.cultivated*4)*.5+Math.min(s.jobs.farmer,s.buildings.waterworks*8)*.7+equipped(s,'hoe')*.3+s.jobs.farmer*s.meta.perks.harvest*.1);
  return {food:food-s.pop*.65,wood:.95*(s.jobs.logger+equipped(s,'axe')*.4),stone:.7*(s.jobs.miner+equipped(s,'pick')*.4),science:s.jobs.scholar*.8*(1+s.meta.perks.learning*.15),coin:s.pop*.18*(1+s.buildings.market*.6)};
}
const afford=(s,c)=>Object.entries(c).every(([k,v])=>s[k]>=v);
function pay(s,c){if(!afford(s,c))return false;for(const[k,v]of Object.entries(c))s[k]-=v;return true}
function assign(s,j,d){if(s.dead||!Object.hasOwn(jobs,j)||![1,-1].includes(d))return false;if(d>0&&(free(s)<1||s.jobs[j]>=limits(s)[j]))return false;if(d<0&&s.jobs[j]<1)return false;s.jobs[j]+=d;return true}
function buildReason(s,k){const b=buildings[k];if(!Object.hasOwn(buildings,k))return 'Bangunan tidak dikenal';if(s.dead)return 'Peradaban runtuh';if(b.tech&&!s.known.includes(b.tech))return 'Riset '+techs[b.tech].name+' dahulu';if(b.max&&s.buildings[k]+s.queue.filter(q=>q.key===k).length>=b.max)return 'Batas bangunan tercapai';if(s.queue.length>=3)return 'Antrean bangunan penuh';if(!afford(s,b.cost))return 'Bahan belum cukup';return ''}
function build(s,k){if(buildReason(s,k))return false;const b=buildings[k];pay(s,b.cost);s.queue.push({key:k,left:b.days});log(s,'Pembangunan '+b.name+' dimulai.');return true}
const researchCost=(s,k)=>techs[k].cost*(s.meta.memory.includes(k)&&!techs[k].basic?.5:1);
function research(s,k){const t=techs[k];if(s.dead||!Object.hasOwn(techs,k)||s.research||s.known.includes(k)||(t.prereq&&!s.known.includes(t.prereq)))return false;s.research=k;s.progress=0;return true}
function craftReason(s,k){if(!Object.hasOwn(recipes,k))return 'Resep tidak dikenal';if(s.dead)return 'Peradaban runtuh';if(!s.known.includes(recipes[k].tech))return 'Riset Perkakas batu dahulu';if(s.buildings.workshop<1)return 'Bangun Bengkel perkakas dahulu';if(s.craftQueue.length>=5)return 'Antrean alat penuh';if(!afford(s,recipes[k].cost))return 'Bahan belum cukup';return ''}
function craft(s,k){if(craftReason(s,k))return false;pay(s,recipes[k].cost);s.craftQueue.push({key:k,remaining:recipes[k].work});log(s,recipes[k].name+' masuk antrean bengkel.');return true}
function trade(s,i,k,side,n=10){if(s.dead||!Number.isInteger(i)||!s.regions[i]||!['food','wood','stone'].includes(k)||!['buy','sell'].includes(side)||!Number.isFinite(n)||n<=0)return false;const price=({food:1,wood:1.5,stone:2}[k])*rate(s,i)*n*(side==='buy'?1.15:.85);if(side==='buy'){if(s.coin<price)return false;s.coin-=price;s[k]+=n}else{if(s[k]<n)return false;s[k]-=n;s.coin+=price}return true}
function tick(s){
  if(s.dead)return;s.day++;const r=rates(s);for(const k of Object.keys(r))s[k]=Math.max(0,s[k]+r[k]);s.totalScience+=r.science;
  if(s.research){const use=Math.min(s.science,researchCost(s,s.research)-s.progress);s.science-=use;s.progress+=use;if(s.progress>=researchCost(s,s.research)){s.known.push(s.research);log(s,'Riset '+techs[s.research].name+' selesai. Resep terbuka; bangun atau produksi untuk mendapat manfaat.','good');s.research=null;s.progress=0}}
  for(const b of s.queue)b.left--;for(const b of s.queue.filter(b=>b.left<=0)){s.buildings[b.key]++;log(s,buildings[b.key].name+' selesai dibangun.','good')}s.queue=s.queue.filter(b=>b.left>0);
  let work=s.buildings.workshop>0?s.jobs.artisan:0;
  while(work>0&&s.craftQueue.length){const item=s.craftQueue[0],used=Math.min(work,item.remaining);item.remaining-=used;work-=used;if(item.remaining<=0){s.tools[item.key]++;log(s,recipes[item.key].name+' selesai; digunakan otomatis oleh pekerja yang sesuai.','good');s.craftQueue.shift()}}
  s.regions.forEach(r=>r.power+=r.growth/30);
  if(s.food<.01){s.starve++;if(s.starve%4===0){s.pop--;if(free(s)<0){const j=Object.keys(s.jobs).sort((a,b)=>s.jobs[b]-s.jobs[a])[0];s.jobs[j]--}log(s,'Kelaparan: seorang penduduk meninggalkan wilayah.','bad')}}else s.starve=0;
  if(s.day%15===0&&s.food>s.pop*3&&s.pop<cap(s)){s.pop++;log(s,'Penduduk baru tiba. Alokasikan tenaga kerjanya.','good')}
  if(s.day%30===0){const danger=18+Math.floor(s.day/30)*7;if(defense(s)>=danger)log(s,'Ancaman '+(s.day<120?'satwa liar':'penjarah')+' ditahan penjaga.','good');else{const lost=Math.round(s.food*.22);s.food-=lost;s.wood*=.9;log(s,'Serangan '+(s.day<120?'satwa liar':'penjarah')+': kehilangan '+lost+' pangan dan 10% kayu.','bad')}}
  if(s.pop<=0){s.pop=0;s.dead=true;log(s,'Peradaban runtuh. Pengetahuan menjadi bekal siklus baru.','bad')}
}
const reward=s=>Math.floor(s.day/60)+realized(s).length;
function reset(s){const m=JSON.parse(JSON.stringify(s.meta));m.points+=reward(s);m.memory=[...new Set([...m.memory,...s.known])];m.cycle++;return fresh(m)}
function perk(s,k){if(!Object.hasOwn(s.meta.perks,k))return false;const c=s.meta.perks[k]+1;if(s.meta.points<c)return false;s.meta.points-=c;s.meta.perks[k]++;return true}
const natural=n=>Number.isSafeInteger(n)&&n>=0;
const finite=n=>Number.isFinite(n)&&n>=0;
const techList=a=>Array.isArray(a)&&new Set(a).size===a.length&&a.every(k=>Object.hasOwn(techs,k));
function valid(s){try{
  if(s.version!==2||!natural(s.day)||s.day<1||!natural(s.pop)||!natural(s.cycle)||s.cycle!==s.meta.cycle||typeof s.dead!=='boolean'||s.dead!==(s.pop===0))return false;
  if(!['food','wood','stone','coin','science','progress','totalScience','starve'].every(k=>finite(s[k])))return false;
  if(!Object.keys(jobs).every(k=>natural(s.jobs[k])&&s.jobs[k]<=limits(s)[k])||free(s)<0)return false;
  if(Object.keys(s.jobs).length!==Object.keys(jobs).length||Object.keys(s.buildings).length!==Object.keys(buildings).length)return false;
  if(!Object.keys(buildings).every(k=>natural(s.buildings[k])&&(!buildings[k].max||s.buildings[k]<=buildings[k].max)))return false;
  if(!Array.isArray(s.regions)||s.regions.length!==3||!s.regions.every(r=>typeof r.name==='string'&&r.name.length<=80&&finite(r.power)&&r.power>0&&finite(r.growth)))return false;
  if(![s.known,s.meta.memory].every(techList)||!s.known.every(k=>!techs[k].prereq||s.known.includes(techs[k].prereq)))return false;
  if(s.research!==null&&(!Object.hasOwn(techs,s.research)||s.known.includes(s.research)||(techs[s.research].prereq&&!s.known.includes(techs[s.research].prereq))||s.progress>=researchCost(s,s.research)))return false;
  if(s.research===null&&s.progress!==0)return false;
  if(!Array.isArray(s.queue)||s.queue.length>3||!s.queue.every(b=>Object.hasOwn(buildings,b.key)&&finite(b.left)&&b.left>0&&b.left<=buildings[b.key].days&&(!buildings[b.key].tech||s.known.includes(buildings[b.key].tech))))return false;
  if(!Object.entries(buildings).every(([k,b])=>(!b.tech||s.buildings[k]===0||s.known.includes(b.tech))&&(!b.max||s.buildings[k]+s.queue.filter(q=>q.key===k).length<=b.max)))return false;
  if(!Object.keys(recipes).every(k=>natural(s.tools[k])&&(s.tools[k]===0||s.known.includes(recipes[k].tech))))return false;
  if(!Array.isArray(s.craftQueue)||s.craftQueue.length>5||!s.craftQueue.every(q=>Object.hasOwn(recipes,q.key)&&s.known.includes(recipes[q.key].tech)&&s.buildings.workshop>0&&finite(q.remaining)&&q.remaining>0&&q.remaining<=recipes[q.key].work))return false;
  return Array.isArray(s.logs)&&s.logs.length<=50&&s.logs.every(l=>typeof l.text==='string'&&l.text.length<2000&&natural(l.day))&&natural(s.meta.points)&&natural(s.meta.cycle)&&s.meta.cycle>0&&['harvest','learning','guard'].every(k=>natural(s.meta.perks[k]));
}catch{return false}}
function load(raw){try{
  if(!raw||![1,2].includes(raw.version))return null;
  const s=JSON.parse(JSON.stringify(raw));if(s.version===2)return valid(s)?s:null;
  if(!techList(s.applied)||!techList(s.known)||!s.applied.every(k=>s.known.includes(k)))return null;
  const oldApplied=[...s.applied];s.version=2;s.jobs.artisan=0;s.tools=emptyTools();s.craftQueue=[];
  for(const [k,b]of Object.entries(buildings))if(b.tech)s.buildings[k]=0;
  const mapping={agriculture:'cultivated',tools:'workshop',irrigation:'waterworks',masonry:'stonehouse',commerce:'market',defense:'wall'};
  for(const k of oldApplied)s.buildings[mapping[k]]=k==='agriculture'?Math.max(1,Math.ceil(s.jobs.farmer/4)):k==='irrigation'?Math.max(1,Math.ceil(s.jobs.farmer/8)):1;
  if(oldApplied.includes('tools')){s.tools.axe=s.jobs.logger;s.tools.pick=s.jobs.miner}
  delete s.applied;log(s,'Save v0.1 dimigrasikan: penerapan lama menjadi bangunan dan alat pengganti tanpa biaya ulang.','good');
  return valid(s)?s:null;
}catch{return null}}
const api={buildings,techs,recipes,jobs,fresh,cap,limits,free,equipped,realized,defense,power,rate,rates,afford,assign,buildReason,build,researchCost,research,craftReason,craft,trade,tick,reward,reset,perk,valid,load};
if(typeof module!=='undefined')module.exports=api;else root.Game=api;
})(typeof window!=='undefined'?window:globalThis);
