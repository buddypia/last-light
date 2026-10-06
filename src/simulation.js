import {ATTACKS,WOLF_MOTION,actionDuration} from './motion.js';
import {SITES,NOTES,QUESTS,STEP_IDS,newJournal,refreshJournal} from './content.js';
export const VERSION = 2;
export const clamp = (n,a,b)=>Math.max(a,Math.min(b,n));
export const distance = (a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
export const ITEM = {wood:'木材',stone:'石',fiber:'繊維',berries:'木の実',rawMeat:'生肉',meat:'焼いた肉',scrap:'金属片',bandage:'包帯',axe:'石斧',spear:'槍',torch:'松明',wire:'配線',battery:'蓄電池',antenna:'アンテナ'};
export const RECIPES = {
 axe:{name:'石斧',cost:{wood:3,stone:3,fiber:2},desc:'木を切り、岩を砕く。最初の一本。',unique:true},
 spear:{name:'狩猟槍',cost:{wood:4,stone:2,fiber:3},desc:'長い間合いで獣を迎え撃つ。左クリックで攻撃。',unique:true},
 torch:{name:'松明',cost:{wood:2,fiber:3},desc:'180秒間の灯り。獣を遠ざける。持ち物で木材を補充できる。',unique:true},
 bandage:{name:'包帯 × 1',cost:{fiber:4},desc:'体力を35回復。持ち物から使用。'},
 fire:{name:'焚き火',cost:{wood:6,stone:4},desc:'暖を取り、生肉を焼き、獣を遠ざける。燃料の補充が必要。',build:true},
 shelter:{name:'枝のシェルター',cost:{wood:10,fiber:6},desc:'夜を早送りして休む。空腹と渇きに備えてから。',build:true},
 collector:{name:'雨水の集水器',cost:{wood:6,fiber:5,scrap:2},desc:'雨水と露を集める。泉から離れた拠点に。',build:true}
};
export const LANDMARKS = [
 {id:'wreck',name:'座礁した調査船',x:60,z:53,item:'wire'},
 {id:'cave',name:'採掘跡',x:-47,z:-16,item:'battery'},
 {id:'station',name:'気象観測所',x:32,z:-43,item:'antenna'},
 {id:'radio',name:'丘の無線塔',x:0,z:-28},
 {id:'spring',name:'森の湧き水',x:22,z:3}
];
// Collision footprints follow solid landmark walls; entrances remain open.
function boxCollision(x,z,cx,cz,hx,hz,angle=0){const dx=x-cx,dz=z-cz,c=Math.cos(angle),s=Math.sin(angle);return Math.abs(dx*c-dz*s)<hx+.35&&Math.abs(dx*s+dz*c)<hz+.35;}
export function landmarkCollision(x,z){
 if(boxCollision(x,z,-47,-18,6,2.4)||boxCollision(x,z,-50.2,-16,1.7,2)||boxCollision(x,z,-43.8,-16,1.7,2))return true;
 if(boxCollision(x,z,32,-47.1,3.2,.15)||boxCollision(x,z,35,-45,.15,2)||boxCollision(x,z,29,-45,.15,2))return true;
 if(boxCollision(x,z,60,45,2.8,6.4,-.5))return true;
 if(boxCollision(x,z,0,-28,.8,.5))return true;
 if(boxCollision(x,z,-32,40,3.2,.2)||boxCollision(x,z,-35,42,.2,2)||boxCollision(x,z,-29,42,.2,2)||Math.hypot(x+45,z+67)<2.85)return true;
 return false;
}
export function terrain(x,z){
 const r=Math.hypot(x,z), coast=clamp((100-r)/22,0,1);
 return -2.5+coast*(4+1.4*Math.sin(x*.037)*Math.cos(z*.04)+5*Math.exp(-((x*x+(z+25)**2)/1000)));
}
export function rng(seed=731){return()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
export const SCENERY_ROCKS=(()=>{
 const random=rng(902),rocks=[];
 for(let i=0;i<30;i++){const a=random()*Math.PI*2,r=80+random()*10,x=Math.sin(a)*r,z=Math.cos(a)*r;if((z>55&&Math.abs(x)<30)||LANDMARKS.some(l=>distance(l,{x,z})<9))continue;const sx=2+random()*3,sy=1+random()*4,sz=2+random()*2;rocks.push({x,z,sx,sy,sz,radius:Math.max(sx,sy,sz)+.35});}return rocks;
})();
export function worldNodes(){
 const rand=rng(),nodes=[];
 const add=(type,x,z)=>nodes.push({id:`n${nodes.length}`,type,x,z,hp:type==='tree'?3:type==='rock'?2:1,readyAt:0});
 // The arrival beach always contains enough material for the first axe and fire.
 [['wood',-2,64],['wood',3,60],['wood',-5,58],['stone',5,65],['stone',-6,63],['stone',0,56],['fiber',8,59],['fiber',-8,57],['berries',-10,51]].forEach(a=>add(...a));
 for(let i=0;i<230;i++){
  let x=(rand()-.5)*165,z=(rand()-.5)*165;if(terrain(x,z)<.1||Math.hypot(x,z)>83)continue;
  if(LANDMARKS.some(l=>Math.hypot(l.x-x,l.z-z)<8)||Math.hypot(x+17,z-24)<8||Math.hypot(x,z-64)<12)continue;
  const n=rand();add(n<.43?'tree':n<.57?'rock':n<.69?'wood':n<.80?'fiber':n<.91?'berries':n<.96?'stone':'scrap',x,z);
 }
 return nodes;
}
function wolves(){return [{x:-39,z:-11},{x:25,z:-34},{x:56,z:44},{x:-27,z:28},{x:13,z:-55}].map((p,i)=>({...p,id:`w${i}`,home:{...p},hp:64,state:'wander',timer:0,phase:i*2,deadAt:0,looted:false}));}
export function newState(){return {version:VERSION,mode:'playing',elapsed:0,player:{x:0,z:68,y:terrain(0,68),yaw:0,pitch:0,health:100,food:86,water:90,warmth:90,stamina:100},inventory:{wood:0,stone:0,fiber:0,berries:3,rawMeat:0,meat:0,scrap:0,bandage:1,axe:0,spear:0,torch:0,wire:0,battery:0,antenna:0},canteen:3,torchFuel:0,equipped:'hands',nodes:worldNodes(),structures:[],wolves:wolves(),claimed:[],radio:false,rescue:90,journal:newJournal(),stats:{gathered:0,crafted:0,kills:0,distance:0},lastHit:-10,lastGather:-10,lastHurt:-10};}
export class Survival {
 constructor(state=newState()){this.s=state;this.events=[];this.building=null;this.action=null;if(RECIPES[this.s.journal.recipe]?.unique&&this.s.inventory[this.s.journal.recipe])this.finishRecipe(this.s.journal.recipe);refreshJournal(this.s);}
 emit(text,kind='info'){this.events.push({text,kind});for(const q of refreshJournal(this.s))this.events.push({text:`クエスト完了「${q.name}」 / J で次の目標`,kind:'quest'});}
 trackQuest(id){if(!QUESTS.some(q=>q.id===id))return;Object.assign(this.s.journal,{tracked:id,recipe:null,material:null,waypoint:null});}
 trackRecipe(id,material=null){if(!RECIPES[id]||(RECIPES[id].unique&&this.s.inventory[id]))return;Object.assign(this.s.journal,{recipe:id,material,waypoint:null});}
 record(id){if(NOTES[id]&&!this.s.journal.notes.includes(id)){this.s.journal.notes.push(id);this.events.push({text:`記録を発見「${NOTES[id].title}」 / J → 島の記録`,kind:'discovery'});}}
 visit(id){if(!this.s.journal.visited.includes(id))this.s.journal.visited.push(id);if(this.s.journal.waypoint===id)this.s.journal.waypoint=null;}
 finishRecipe(id){if(this.s.journal.recipe===id){this.s.journal.recipe=null;this.s.journal.material=null;}}
 get hour(){return (8+this.s.elapsed/30)%24;}
 get night(){return this.hour>=19||this.hour<6;}
 get rain(){return this.s.elapsed%360>=155&&this.s.elapsed%360<215;}
 get day(){return 1+Math.floor((this.s.elapsed+240)/720);}
 get fireNear(){return this.s.structures.some(b=>b.type==='fire'&&b.fuel>0&&distance(b,this.s.player)<7);}
 get roofNear(){return this.s.structures.some(b=>b.type==='shelter'&&distance(b,this.s.player)<4);}
 has(cost){return Object.entries(cost).every(([k,v])=>(this.s.inventory[k]||0)>=v);}
 spend(cost){if(!this.has(cost))return false;for(const[k,v]of Object.entries(cost))this.s.inventory[k]-=v;return true;}
 craft(id){
  const r=RECIPES[id];if(!r||this.s.mode!=='playing')return false;
  if(r.unique&&this.s.inventory[id]){this.emit('すでに持っています');return false;}
  if(!this.has(r.cost)){this.emit('素材が足りません');return false;}
  if(r.build){this.action=null;this.building=id;this.emit('平らな場所を選び、クリックで設置。Rで回転 / Escで取消');return true;}
  this.spend(r.cost);this.s.inventory[id]++;if(id==='torch')this.s.torchFuel=180;this.s.stats.crafted++;
  if(r.unique){this.action=null;this.s.equipped=id;}this.finishRecipe(id);this.emit(`${r.name} を製作した`,'craft');return true;
 }
 validPlacement(x,z){const d=distance({x,z},this.s.player);return d<6&&d>1.6&&this.clearBuildingGround(x,z);}
 clearBuildingGround(x,z){
  const p={x,z};return !this.blocked(x,z)&&Math.hypot(x,z)<79&&terrain(x,z)>.15&&
  Math.max(Math.abs(terrain(x+2,z)-terrain(x-2,z)),Math.abs(terrain(x,z+2)-terrain(x,z-2)))<1.6&&
  ![...LANDMARKS,...SITES].some(l=>distance(l,p)<7)&&!this.s.structures.some(b=>distance(b,p)<4.5)&&
  !this.s.nodes.some(n=>['tree','rock'].includes(n.type)&&n.hp>0&&distance(n,p)<2.3);
 }
 place(x,z,angle=0){
  const type=this.building,r=RECIPES[type];if(this.s.structures.length>=24||(type==='fire'&&this.s.structures.filter(b=>b.type==='fire').length>=4)){this.emit('野営地の上限です（建築24 / 焚き火4）');return false;}if(!r||!this.validPlacement(x,z)){this.emit('この場所には設置できません');return false;}
  if(!this.spend(r.cost)){this.emit('素材が足りません');this.building=null;return false;}
  this.s.structures.push({id:`b${this.s.structures.length}`,type,x,z,angle,fuel:type==='fire'?150:0,water:0});this.s.stats.crafted++;this.building=null;this.finishRecipe(type);this.emit(`${r.name} を設置した`,'craft');return true;
 }
 equip(id){if(this.busy){this.emit('動作が終わってから持ち替えよう');return;}if(id==='torch'&&this.s.inventory.torch&&this.s.torchFuel<=0){this.emit('松明の燃料が切れています。持ち物で木材を補充しよう');return;}if(this.s.inventory[id]){this.s.equipped=id;this.emit(`${ITEM[id]} を装備`);}else this.emit(`${ITEM[id]} は製作から作れます`);}
 get busy(){return !!this.action&&this.s.elapsed-this.action.startedAt<actionDuration(this.action.tool,this.action.kind);}
 gather(id){
  const n=this.s.nodes.find(n=>n.id===id);if(this.s.mode!=='playing'||this.busy||!n||n.hp<=0||distance(n,this.s.player)>4||this.s.elapsed-this.s.lastGather<.42)return false;
  const chopping=['tree','rock'].includes(n.type);
  if(chopping&&this.s.equipped!=='axe'){this.emit('石斧を装備してください [1]');return false;}
  if(chopping&&distance(n,this.s.player)>2.4){this.emit('斧が届くように、もう少し近づこう');return false;}
  this.s.lastGather=this.s.elapsed;
  this.action={kind:chopping?'harvest':'pickup',tool:chopping?'axe':'hands',target:id,startedAt:this.s.elapsed,hit:!chopping};
  if(!chopping)this.harvest(n);return true;
 }
 harvest(n){
  n.hp--;this.emit(n.type==='tree'?'木に斧を打ち込んだ':n.type==='rock'?'岩にひびが入った':'拾い集めた','gather');
  if(n.hp<=0){const reward=n.type==='tree'?{wood:5,fiber:1}:n.type==='rock'?{stone:4}:n.type==='wood'?{wood:2}:n.type==='stone'?{stone:2}:n.type==='fiber'?{fiber:3}:n.type==='berries'?{berries:3}:{scrap:2};
   for(const[k,v]of Object.entries(reward)){this.s.inventory[k]+=v;this.s.stats.gathered+=v;}
   n.readyAt=this.s.elapsed+240;this.emit(Object.entries(reward).map(([k,v])=>`${ITEM[k]} +${v}`).join(' / '),'pickup');
  }
 }
 resolveAction(){
  const a=this.action;if(!a)return;const age=this.s.elapsed-a.startedAt,profile=ATTACKS[a.tool];
  if(!a.hit&&age>=profile.impact){a.hit=true;this.emit('','swing');
   if(a.kind==='attack')this.strike(a.tool);
   else{const n=this.s.nodes.find(n=>n.id===a.target);if(n?.hp>0&&distance(n,this.s.player)<=2.4&&this.facing(n,.85))this.harvest(n);else this.emit('斧が届かなかった。対象を正面に捉えよう');}
  }
  if(age>=actionDuration(a.tool,a.kind))this.action=null;
 }
 facing(target,arc){const p=this.s.player,angle=Math.atan2(target.x-p.x,-(target.z-p.z));return Math.abs(Math.atan2(Math.sin(angle-p.yaw),Math.cos(angle-p.yaw)))<arc;}
 clearStrike(target){const p=this.s.player,d=distance(p,target);for(let t=.5;t<d-.8;t+=.25){const k=t/d;if(this.blocked(p.x+(target.x-p.x)*k,p.z+(target.z-p.z)*k))return false;}return true;}

 interact(target){
  if(!target||this.s.mode!=='playing')return;
  if(target.kind==='node')return this.gather(target.id);
  if(distance(target,this.s.player)>4)return;
  if(target.kind==='wolf'){const w=this.s.wolves.find(w=>w.id===target.id);if(w&&w.hp<=0&&!w.looted){w.looted=true;this.s.inventory.rawMeat+=2;this.s.inventory.fiber+=2;this.emit('生肉 +2 / 繊維 +2','pickup');}return;}
  if(target.kind==='site'){
   const site=SITES.find(l=>l.id===target.id);if(!site||distance(site,this.s.player)>4)return;
   const first=!this.s.journal.visited.includes(site.id);this.visit(site.id);this.record(site.id);
   if(site.id==='outpost'){
    if(first){this.s.inventory.scrap+=3;this.s.inventory.bandage++;this.s.inventory.berries+=3;this.emit('エダの補給を受け取った / 金属片 +3・包帯 +1・木の実 +3','pickup');}
    else this.emit('補給は回収済み。灯台守の便りは J → 島の記録で読めます');
   }else if(this.s.journal.beacon)this.emit('航路灯は点灯中。救助船の待機時間が60秒になります');
   else if(first)this.emit('灯台守の記録を発見。もう一度 E で修理 / 木材6・金属片3','discovery');
   else if(!this.spend({wood:6,scrap:3}))this.emit(`修理の不足素材 / 木材 ${this.s.inventory.wood}/6・金属片 ${this.s.inventory.scrap}/3`);
   else{this.s.journal.beacon=true;this.s.inventory.meat+=2;this.s.inventory.bandage++;if(this.s.radio)this.s.rescue=Math.min(this.s.rescue,60);this.emit('北岬の灯が戻った。救助待機は60秒 / 焼いた肉 +2・包帯 +1','signal');}
   return;
  }
  if(target.kind==='landmark'){
   const l=LANDMARKS.find(l=>l.id===target.id);if(!l||distance(l,this.s.player)>4)return;this.visit(l.id);if(l.item){if(this.s.claimed.includes(l.id)){this.emit('必要な部品は回収済み');return;}this.s.claimed.push(l.id);this.record(l.id);this.s.inventory[l.item]=1;this.s.inventory.scrap+=3;this.s.inventory.berries+=2;this.emit(`${ITEM[l.item]} を発見 / 金属片 +3 / 木の実 +2`,'discovery');}
   else if(l.id==='spring'){this.s.canteen=5;this.s.player.water=100;this.emit('湧き水を飲み、水筒を満たした [5/5]','water');}
   else if(l.id==='radio'){
    if(this.s.radio){this.emit(`救助船まで ${Math.ceil(this.s.rescue)} 秒。生き延びよう`);return;}
    if(!this.spend({wire:1,battery:1,antenna:1,wood:8,scrap:6})){this.emit('修理には配線・蓄電池・アンテナ + 木材8 + 金属片6 が必要');return;}
    this.s.radio=true;this.s.rescue=this.s.journal.beacon?60:90;this.emit(`救難信号を送信。${this.s.rescue}秒間、生き延びろ。`,'signal');
    this.s.wolves.push(...[{x:-16,z:-37},{x:17,z:-30}].map((p,i)=>({...p,id:`r${i}`,home:{...p},hp:64,state:'chase',timer:0,phase:i,deadAt:0,looted:false})));
   }return;
  }
  const b=this.s.structures.find(b=>b.id===target.id);if(!b)return;
  if(b.type==='fire'){
   if(b.fuel>0&&this.s.inventory.rawMeat>0){this.s.inventory.rawMeat--;this.s.inventory.meat++;b.fuel=Math.max(0,b.fuel-12);this.emit('生肉を焼いた。食べるには [Q]','cook');}
   else if(this.spend({wood:1})){b.fuel=Math.min(300,b.fuel+65);this.emit('焚き火に薪をくべた +65秒','fire');}else this.emit('燃料には木材が必要です');
  }else if(b.type==='collector'){if(b.water>=1){const amount=Math.min(5-this.s.canteen,Math.floor(b.water));b.water-=amount;this.s.canteen+=amount;this.emit(amount?`水筒に ${amount} 回分補充した`:'水筒は満杯です','water');}else this.emit('水を集めています。雨の日は速く溜まります');}
  else if(b.type==='shelter'){
   if(!this.night){this.emit('まだ明るい。眠れるのは19時から朝6時まで');return;}
   if(this.s.wolves.some(w=>w.hp>0&&distance(w,this.s.player)<12)){this.emit('近くに獣がいる。安全を確保しよう');return;}
   if(this.s.player.food<30||this.s.player.water<35){this.emit('休む前に食料30・水分35以上を確保しよう');return;}
   if(this.s.radio){this.emit('救助待機中は眠れません');return;}
   const wait=((30-this.hour)%24)*30;this.s.elapsed+=wait;this.s.player.food-=24;this.s.player.water-=28;this.s.player.warmth=85;this.s.player.health=clamp(this.s.player.health+25,0,100);this.s.player.stamina=100;
   this.s.structures.forEach(s=>{s.fuel=Math.max(0,s.fuel-wait);if(s.type==='collector')s.water=Math.min(5,s.water+wait*.012);});this.s.journal.rested=true;this.emit('朝が来た。体力が回復した','rest');
  }
 }
 refillTorch(){if(!this.s.inventory.torch)return false;if(this.s.torchFuel>150){this.emit('松明の燃料は十分です');return false;}if(!this.spend({wood:1})){this.emit('松明の補充には木材1が必要です');return false;}this.s.torchFuel=Math.min(180,this.s.torchFuel+90);this.emit('松明に燃料を補充 +90秒','fire');return true;}
 eat(){const inv=this.s.inventory,p=this.s.player;const key=inv.meat?'meat':inv.berries?'berries':null;if(!key){this.emit('食べ物がありません。木の実を探すか、肉を焼こう');return false;}inv[key]--;p.food=clamp(p.food+(key==='meat'?45:18),0,100);p.health=clamp(p.health+(key==='meat'?8:2),0,100);this.emit(`${ITEM[key]} を食べた`,'eat');return true;}
 drink(){if(!this.s.canteen){this.emit('水筒が空です。泉か集水器で補充しよう');return false;}this.s.canteen--;this.s.player.water=clamp(this.s.player.water+35,0,100);this.emit(`水を飲んだ。残り ${this.s.canteen} 回分`,'water');return true;}
 heal(){if(!this.s.inventory.bandage){this.emit('包帯がありません');return;}this.s.inventory.bandage--;this.s.player.health=clamp(this.s.player.health+35,0,100);this.emit('包帯を巻いた。体力 +35','heal');}
 attack(){
  const s=this.s,p=s.player,profile=ATTACKS[s.equipped];if(s.mode!=='playing'||this.building||this.busy||s.elapsed-s.lastHit<profile.duration)return false;
  if(p.stamina<profile.stamina){this.emit('息が切れている。少し休もう');return false;}
  s.lastHit=s.elapsed;p.stamina-=profile.stamina;this.action={kind:'attack',tool:s.equipped,startedAt:s.elapsed,hit:false};return true;
 }
 strike(tool){
  const s=this.s,p=s.player,profile=ATTACKS[tool];
  for(const w of [...s.wolves].sort((a,b)=>distance(a,p)-distance(b,p))){
   const d=distance(w,p),aimHeight=terrain(p.x,p.z)+1.7+Math.tan(p.pitch)*d-terrain(w.x,w.z);
   if(w.hp>0&&d<profile.reach&&this.facing(w,profile.arc)&&aimHeight>.25&&aimHeight<1.95&&this.clearStrike(w)){
    w.hp-=profile.damage;w.state='stunned';w.timer=.43;w.hurtAt=s.elapsed;w.facing=Math.atan2(p.x-w.x,p.z-w.z);this.moveWolf(w,Math.sin(p.yaw)*.32,-Math.cos(p.yaw)*.32,false);
    if(w.hp<=0){w.deadAt=s.elapsed;w.state='dead';s.stats.kills++;this.emit('獣を倒した。近づいて [E] で解体','kill');}else this.emit('命中','hit');return true;
   }
  }return false;
 }
 moveWolf(w,dx,dz,steer=true){
  const length=Math.hypot(dx,dz);if(length<1e-6)return;const angle=Math.atan2(dx,dz),legal=(x,z)=>Math.hypot(x,z)<92&&terrain(x,z)>-.25&&!this.blocked(x,z);
  for(const turn of (steer?[0,.65,-.65,1.3,-1.3]:[0])){const x=w.x+Math.sin(angle+turn)*length,z=w.z+Math.cos(angle+turn)*length;if(legal(x,z)){w.x=x;w.z=z;if(w.state!=='stunned')w.facing=angle+turn;return;}}
 }
 updateWolf(w,dt){
  if(w.hp<=0)return;const s=this.s,p=s.player,d=distance(w,p);w.timer-=dt;
  if(!Number.isFinite(w.facing))w.facing=Math.atan2(p.x-w.x,p.z-w.z);
  if(w.state==='stunned'&&w.timer>0)return;
  const fire=s.structures.find(b=>b.type==='fire'&&b.fuel>0&&distance(w,b)<7),torch=s.equipped==='torch'&&d<5;
  if(fire||torch){const away=fire||p,a=Math.atan2(w.x-away.x,w.z-away.z);w.state='flee';this.moveWolf(w,Math.sin(a)*3.1*dt,Math.cos(a)*3.1*dt);return;}
  if(w.state==='windup'){
   if(w.timer<=0){w.state='lunge';w.timer=WOLF_MOTION.lunge;w.biteDone=false;w.attackYaw=w.facing;}
   return;
  }
  if(w.state==='lunge'){
   const a=Number.isFinite(w.attackYaw)?w.attackYaw:w.facing;this.moveWolf(w,Math.sin(a)*5.5*dt,Math.cos(a)*5.5*dt,false);w.facing=a;
   if(!w.biteDone&&w.timer<=WOLF_MOTION.lunge-WOLF_MOTION.contact){w.biteDone=true;const hitAngle=Math.atan2(p.x-w.x,p.z-w.z)-a;if(distance(w,p)<1.85&&Math.cos(hitAngle)>.3&&this.clearStrike(w))this.hurt(16,'狼に噛まれた。踏み込みを横か後ろへ避けよう');}
   if(w.timer<=0){w.state='cooldown';w.timer=WOLF_MOTION.recovery;}return;
  }
  if(w.state==='cooldown'&&w.timer>0)return;
  if(d<(this.night?23:16)||s.radio){
   if(d<2.5){w.state='windup';w.timer=WOLF_MOTION.windup;w.facing=Math.atan2(p.x-w.x,p.z-w.z);this.emit('狼が身をかがめた — 横か後ろへ避けよう！','warn');return;}
   const others=s.wolves.filter(o=>o!==w&&o.hp>0&&distance(o,p)<11),flank=others.length&&d<9?(w.phase%4<2?1:-1)*.32:0,a=Math.atan2(p.x-w.x,p.z-w.z)+flank;
   let dx=Math.sin(a)*3.2,dz=Math.cos(a)*3.2;
   for(const o of others){const gap=distance(o,w);if(gap<1.35&&gap>.01){dx+=(w.x-o.x)/gap*(1.35-gap)*2;dz+=(w.z-o.z)/gap*(1.35-gap)*2;}}
   w.state='chase';this.moveWolf(w,dx*dt,dz*dt);return;
  }
  const home=w.home||w,homeDistance=distance(home,w);if((s.elapsed+w.phase*3)%14>10&&homeDistance<7){w.state='idle';return;}
  const a=homeDistance>7?Math.atan2(home.x-w.x,home.z-w.z):s.elapsed*.16+w.phase;w.state='wander';this.moveWolf(w,Math.sin(a)*.8*dt,Math.cos(a)*.8*dt);
 }

 hurt(amount,cause){this.s.player.health=Math.max(0,this.s.player.health-amount);this.s.lastHurt=this.s.elapsed;if(amount>=5)this.emit(cause,'hurt');if(this.s.player.health<=0&&this.s.mode==='playing'){this.s.mode='dead';this.emit(cause,'death');}}
 blocked(x,z){const s=this.s;return landmarkCollision(x,z)||boxCollision(x,z,-17,24,2,2.3,.6)||SCENERY_ROCKS.some(b=>Math.hypot(x-b.x,z-b.z)<b.radius)||s.nodes.some(n=>n.hp>0&&((n.type==='tree'&&Math.hypot(x-n.x,z-n.z)<.9)||(n.type==='rock'&&Math.hypot(x-n.x,z-n.z)<1.45)))||s.structures.some(b=>b.type==='collector'?Math.hypot(x-b.x,z-b.z)<1:b.type==='shelter'&&[-1,1].some(side=>boxCollision(x,z,b.x+Math.cos(b.angle)*side*1.5,b.z-Math.sin(b.angle)*side*1.5,.55,1.5,b.angle)));}
 move(dx,dz){const p=this.s.player,old={x:p.x,z:p.z};if(!this.blocked(p.x+dx,p.z))p.x+=dx;if(!this.blocked(p.x,p.z+dz))p.z+=dz;const radius=Math.hypot(p.x,p.z);if(radius>96){p.x*=96/radius;p.z*=96/radius;}this.s.stats.distance+=distance(old,p);}
 update(dt,input={}){
  if(this.s.mode!=='playing')return;dt=clamp(dt,0,.1);const s=this.s,p=s.player;s.elapsed+=dt;
  this.resolveAction();
  if(s.equipped==='torch'){s.torchFuel=Math.max(0,s.torchFuel-dt);if(s.torchFuel===0){s.equipped='hands';this.emit('松明が消えた。持ち物で燃料を補充しよう');}}
  const moving=!!(input.forward||input.side),running=input.run&&p.stamina>4&&moving;let speed=running?7:4.3;if(terrain(p.x,p.z)<-.3)speed*=.48;
  if(moving){const len=Math.hypot(input.forward||0,input.side||0)||1,fw=(input.forward||0)/len,side=(input.side||0)/len;this.move((Math.sin(p.yaw)*fw+Math.cos(p.yaw)*side)*speed*dt,(-Math.cos(p.yaw)*fw+Math.sin(p.yaw)*side)*speed*dt);}
  p.stamina=clamp(p.stamina+(running?-18:17)*dt,0,100);
  p.food=clamp(p.food-dt*(running?.18:.085),0,100);p.water=clamp(p.water-dt*(running?.26:.14),0,100);
  const cold=this.night||this.rain,heat=this.fireNear?1.7:this.roofNear?.3:s.equipped==='torch'?.1:cold?-.22:.26;p.warmth=clamp(p.warmth+heat*dt,0,100);
  if(terrain(p.x,p.z)<-.6){p.warmth=clamp(p.warmth-dt*.8,0,100);this.hurt(dt*1.5,'沖の海は冷たすぎる。岸に戻ろう');}
  if(p.food<=0)this.hurt(dt*1.8,'食料が尽きた');if(p.water<=0)this.hurt(dt*2.8,'水が尽きた');if(p.warmth<=0)this.hurt(dt*1.4,'寒さに耐えられなかった');
  if(p.food>65&&p.water>60&&p.warmth>50&&s.elapsed-s.lastHurt>15)p.health=clamp(p.health+dt*.15,0,100);
  for(const b of s.structures){if(b.fuel>0)b.fuel=Math.max(0,b.fuel-dt);if(b.type==='collector')b.water=Math.min(5,b.water+dt*(this.rain?.15:.012));}
  for(const n of s.nodes)if(n.hp<=0&&n.readyAt<=s.elapsed&&['berries','fiber','wood','stone'].includes(n.type))n.hp=1;
  for(const w of s.wolves)this.updateWolf(w,dt);
  if(s.radio&&s.mode==='playing'){s.rescue=Math.max(0,s.rescue-dt);if(s.rescue<=0){s.mode='won';this.emit('水平線に、迎えの灯が見えた。','victory');}}
 }
 serialize(){return JSON.stringify(this.s);}
 static restore(raw){
  const s=JSON.parse(raw);if(!s||![1,VERSION].includes(s.version)||!['playing','dead','won'].includes(s.mode))throw Error('記録の形式が違います');
  const legacy=s.version===1,base=newState();
  for(const k of ['elapsed','canteen','torchFuel','rescue','lastHit','lastGather','lastHurt'])if(!Number.isFinite(s[k]))throw Error('記録が壊れています');
  if(s.elapsed<0||s.elapsed>1e8||s.canteen<0||s.canteen>5||s.torchFuel<0||s.torchFuel>180||s.rescue<0||s.rescue>90)throw Error('記録が壊れています');
  for(const[k,v]of Object.entries(base.player)){if(!Number.isFinite(s.player?.[k]))throw Error('プレイヤー記録が壊れています');}
  if(Math.hypot(s.player.x,s.player.z)>100||['health','food','water','warmth','stamina'].some(k=>s.player[k]<0||s.player[k]>100))throw Error('プレイヤー記録が壊れています');
  if(Object.keys(s.inventory||{}).some(k=>!Object.hasOwn(ITEM,k)))throw Error('持ち物の記録が壊れています');
  for(const k of Object.keys(ITEM))if(!Number.isInteger(s.inventory?.[k])||s.inventory[k]<0||s.inventory[k]>1e5)throw Error('持ち物の記録が壊れています');
  if(!['hands','axe','spear','torch'].includes(s.equipped))throw Error('装備の記録が壊れています');
  if(!Array.isArray(s.nodes)||s.nodes.length!==base.nodes.length)throw Error('島の記録が壊れています');
  s.nodes.forEach((n,i)=>{const original=base.nodes[i];if(n.id!==original.id||n.x!==original.x||n.z!==original.z||n.type!==original.type||!Number.isFinite(n.hp)||n.hp<0||n.hp>original.hp||!Number.isFinite(n.readyAt))throw Error('資源の記録が壊れています');});
  if(!Array.isArray(s.structures)||s.structures.length>200||s.structures.some((b,i)=>b.id!==`b${i}`||!RECIPES[b.type]?.build||!['x','z','angle','fuel','water'].every(k=>Number.isFinite(b[k]))||Math.hypot(b.x,b.z)>80||b.fuel<0||b.fuel>300||b.water<0||b.water>5))throw Error('野営地の記録が壊れています');
  if(!Array.isArray(s.wolves)||s.wolves.length>7||s.wolves.some(w=>!['x','z','hp','timer','phase','deadAt'].every(k=>Number.isFinite(w[k]))||!['idle','wander','chase','windup','lunge','cooldown','stunned','dead','flee'].includes(w.state)||['facing','attackYaw','hurtAt'].some(k=>w[k]!==undefined&&!Number.isFinite(w[k]))||(w.biteDone!==undefined&&typeof w.biteDone!=='boolean')||w.hp>64||w.hp< -40||Math.hypot(w.x,w.z)>200))throw Error('獣の記録が壊れています');
  if(!Array.isArray(s.claimed)||s.claimed.some(id=>!['wreck','cave','station'].includes(id))||typeof s.radio!=='boolean')throw Error('探索の記録が壊れています');
  if(!Object.keys(base.stats).every(k=>Number.isFinite(s.stats?.[k])&&s.stats[k]>=0))throw Error('記録が壊れています');
  if(s.version===1){s.journal=newJournal();s.journal.notes.push(...s.claimed);s.journal.visited.push(...s.claimed);if(s.radio)s.journal.visited.push('radio');if(s.inventory.spear)s.journal.steps.push('tools:equip');s.version=VERSION;}
  const j=s.journal,validList=(key,allowed)=>Array.isArray(j?.[key])&&j[key].length<=allowed.length&&new Set(j[key]).size===j[key].length&&j[key].every(id=>allowed.includes(id));
  if(!j||!['introSeen','beacon','rested'].every(k=>typeof j[k]==='boolean')||!validList('notes',Object.keys(NOTES))||!validList('visited',[...LANDMARKS,...SITES].map(l=>l.id))||!validList('steps',STEP_IDS)||!validList('completed',QUESTS.map(q=>q.id))||!QUESTS.some(q=>q.id===j.tracked)||!(j.recipe===null||Object.hasOwn(RECIPES,j.recipe))||!(j.material===null||['wood','stone','fiber','scrap','berries'].includes(j.material))||!(j.waypoint===null||[...LANDMARKS,...SITES].some(l=>l.id===j.waypoint)))throw Error('手帳の記録が壊れています');
  const game=new Survival(s);
  if(legacy){
   // New landmarks occupy previously open ground. Preserve supplies and building IDs,
   // moving only overlapping legacy objects to the closest valid nearby site.
   const nearest=(origin,valid)=>{for(let r=.5;r<=40;r+=.5)for(let i=0;i<48;i++){const a=i*Math.PI/24,x=origin.x+Math.sin(a)*r,z=origin.z+Math.cos(a)*r;if(valid(x,z))return {x,z};}throw Error('新しい建物の近くに安全な再開位置が見つかりません');};
   let adjusted=false;
   for(const b of s.structures)if(SITES.some(l=>distance(l,b)<7)){Object.assign(b,nearest(b,(x,z)=>game.clearBuildingGround(x,z)));adjusted=true;}
   if(game.blocked(s.player.x,s.player.z)){Object.assign(s.player,nearest(s.player,(x,z)=>terrain(x,z)>.15&&Math.hypot(x,z)<95&&!game.blocked(x,z)&&!game.blocked(x+.45,z)&&!game.blocked(x-.45,z)&&!game.blocked(x,z+.45)&&!game.blocked(x,z-.45)));s.player.y=terrain(s.player.x,s.player.z);adjusted=true;}
   if(adjusted)game.emit('新しい建物との重なりを避け、近くの安全な位置に記録を引き継ぎました');
  }
  return game;
 }
}
