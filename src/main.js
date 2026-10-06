import './style.css';
import {Survival,ITEM,RECIPES,LANDMARKS,terrain,distance,clamp} from './simulation.js';
import {Island} from './world.js';
import {Soundscape} from './audio.js';
import {SITES,HELP,QUESTS,trackedQuest,stepDone,neededRecipe,navigation,itemIcon} from './content.js';
import {crafting,quests,notebook,fieldGuide,mapMarkup,installTooltips} from './journal.js';
const $=id=>document.getElementById(id),testing=import.meta.env.DEV&&new URLSearchParams(location.search).has('test'),SAVE=testing?'last-light-test-save-v2':'last-light-save-v1',SETTINGS=testing?'last-light-test-settings-v2':'last-light-settings-v1';
let game=new Survival(),world,sound=new Soundscape(),screen='title',page='craft',target=null,keys=new Set(),last=performance.now(),uiClock=0,saveClock=0,jump=0,vy=0,buildAngle=0,noticeUntil=0,damageUntil=0,frameTimes=[],stepClock=0;
let testFrozen=false;
let pointerHintShown=false,selectedRecipe='axe';
const hideTooltip=installTooltips();
let settings={volume:.35,sensitivity:1,quality:'high',reduced:false};
try{const v=JSON.parse(localStorage.getItem(SETTINGS)||'{}');if(Number.isFinite(v.volume))settings.volume=clamp(v.volume,0,1);if(Number.isFinite(v.sensitivity))settings.sensitivity=clamp(v.sensitivity,.3,2);if(['high','low'].includes(v.quality))settings.quality=v.quality;settings.reduced=v.reduced===true;}catch{}
const dialogs=[$('journal'),$('pause'),$('ending'),$('arrival'),$('about')];
let aboutPrevScreen='title';
function openAbout(from='title'){aboutPrevScreen=from;unlock();$('about').showModal();$('about-back').focus();}
function closeAbout(){if(!$('about').open)return;$('about').close();if(aboutPrevScreen==='paused'&&screen==='paused'){$('pause').showModal();$('pause-about').focus();}else if(screen==='playing')lock();}
function hasSave(){try{return !!localStorage.getItem(SAVE);}catch{return false;}}
function save(){try{if(game.s.mode!=='playing')return false;localStorage.setItem(SAVE,game.serialize());$('continue-game').hidden=false;return true;}catch{toast('保存できません。ブラウザのストレージ設定を確認してください');return false;}}
function toast(text){if(!text)return;$('notice').textContent=text;$('notice').style.opacity=1;noticeUntil=performance.now()+3800;}
function unlock(){keys.clear();if(document.pointerLockElement)document.exitPointerLock();}
function lock(){if(testing&&testFrozen)return;sound.start();if(!document.pointerLockElement)$('scene').requestPointerLock?.().catch(()=>{if(!pointerHintShown){toast('画面をドラッグ、または矢印キーでも視点を動かせます');pointerHintShown=true;}});}
function closeDialogs(){hideTooltip();dialogs.forEach(d=>{if(d.open)d.close();});}
function start(loaded=false){
 if(loaded){try{const raw=localStorage.getItem(SAVE),restored=Survival.restore(raw);if(JSON.parse(raw).version===1&&!localStorage.getItem(`${SAVE}-before-journal`))localStorage.setItem(`${SAVE}-before-journal`,raw);if(restored.s.mode!=='playing')throw Error('この記録は終了済みです');game=restored;}catch(err){alert(`記録を読み込めませんでした。${err.message}\n新しく始めることはできます。`);return;}}
 else {if(hasSave()&&!confirm('新しく始めると、前の島の記録を上書きします。始めますか？'))return;game=new Survival();}
 closeDialogs();world.reset();screen='playing';$('title').hidden=true;$('hud').hidden=false;$('shade').classList.add('playing');jump=0;vy=0;keys.clear();saveClock=0;save();if(!game.s.journal.introSeen){screen='intro';$('arrival').showModal();$('arrival-craft').focus();}else lock();toast(loaded?'島の記録を再開しました':'海岸の枝・石・草を集め、[C] で石斧を作ろう');updateUI();
}
function pause(){if(screen!=='playing')return;screen='paused';unlock();$('pause').showModal();$('resume').focus();$('save-note').textContent='';}
function resume(){closeDialogs();screen='playing';lock();}
function journal(next=page){if(screen==='journal'&&next===page){closeJournal();return;}if(screen!=='playing'&&screen!=='journal')return;page=next;screen='journal';unlock();renderJournal();if(!$('journal').open)$('journal').showModal();$('close-journal').focus();}
function closeJournal(){hideTooltip();if(screen!=='journal')return;$('journal').close();screen='playing';lock();}
function craft(id){if(game.craft(id)){if(game.building){world.setGhost(game.building);closeJournal();}else renderJournal();}else renderJournal();flushEvents();}
function renderJournal(){
 hideTooltip();
 document.querySelectorAll('[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===page));$('journal-title').textContent={craft:'手を動かす。生き延びる。',inventory:'持ち帰れたもの',map:'グレイウォーター島',quests:'帰り道を、つなぐ。',notes:'島が覚えていること',guide:'生きて、帰るために'}[page];
 if(page==='craft')$('journal-body').innerHTML=crafting(game,selectedRecipe);
 else if(page==='inventory'){$('journal-body').innerHTML='<div class="inventory">'+Object.entries(game.s.inventory).map(([k,n])=>`<div class="item-row"><span>${ITEM[k]} <button class="help-dot" data-help="${k}" aria-label="${ITEM[k]}の説明">?</button></span><b>${n}</b></div>`).join('')+`<div class="item-row"><span>水筒</span><b>${game.s.canteen} / 5</b></div></div><p>木の実は食料+18、焼いた肉は+45。生肉は焚き火で調理できます。</p><button id="refill-torch" ${!game.s.inventory.torch?'disabled':''}>松明の燃料を補充 / 木材1 / 残り ${Math.ceil(game.s.torchFuel)}秒</button> <button id="use-bandage" ${!game.s.inventory.bandage?'disabled':''}>包帯を使う / 体力 +35</button>`;$('refill-torch').onclick=()=>{game.refillTorch();renderJournal();flushEvents();};$('use-bandage').onclick=()=>{game.heal();renderJournal();flushEvents();updateUI();};}
 else if(page==='map'){$('journal-body').innerHTML=mapMarkup(game.s);drawMap();}
 else if(page==='quests')$('journal-body').innerHTML=quests(game.s);
 else if(page==='notes')$('journal-body').innerHTML=notebook(game.s);
 else $('journal-body').innerHTML=fieldGuide();
 $('journal-body').querySelectorAll('[data-craft]').forEach(b=>b.onclick=()=>craft(b.dataset.craft));
 $('journal-body').querySelectorAll('[data-recipe]').forEach(b=>b.onclick=()=>{selectedRecipe=b.dataset.recipe;renderJournal();document.querySelector(`[data-recipe="${selectedRecipe}"]`).focus();});
 $('journal-body').querySelectorAll('[data-open-recipe]').forEach(b=>b.onclick=()=>{selectedRecipe=b.dataset.openRecipe;page='craft';renderJournal();});
 $('journal-body').querySelectorAll('[data-material]').forEach(b=>b.onclick=()=>{game.trackRecipe(b.dataset.for,b.dataset.material);closeJournal();updateUI();toast(`${ITEM[b.dataset.material]}の採集場所を案内します。Eで採集`);});
 $('journal-body').querySelectorAll('[data-track-recipe]').forEach(b=>b.onclick=()=>{game.trackRecipe(b.dataset.trackRecipe);closeJournal();updateUI();});
 $('journal-body').querySelectorAll('[data-quest]').forEach(b=>b.onclick=()=>{game.trackQuest(b.dataset.quest);closeJournal();updateUI();});
 $('journal-body').querySelectorAll('[data-waypoint]').forEach(b=>b.onclick=()=>{game.s.journal.waypoint=b.dataset.waypoint;closeJournal();updateUI();});
 $('journal-body').querySelector('[data-auto-guide]')?.addEventListener('click',()=>{Object.assign(game.s.journal,{waypoint:null,recipe:null,material:null});closeJournal();updateUI();});
}
function drawMap(){const c=$('map-canvas'),ctx=c.getContext('2d'),scale=2.65,px=x=>300+x*scale,pz=z=>300+z*scale;ctx.fillStyle='#1c3940';ctx.fillRect(0,0,600,600);ctx.strokeStyle='#6d999525';for(let i=0;i<600;i+=50){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,600);ctx.moveTo(0,i);ctx.lineTo(600,i);ctx.stroke();}ctx.fillStyle='#7d8963';ctx.beginPath();ctx.arc(300,300,230,0,Math.PI*2);ctx.fill();for(let r=25;r<80;r+=15){ctx.strokeStyle='#cad0ab30';ctx.beginPath();ctx.ellipse(px(0),pz(-22),r*scale,r*scale*.85,0,0,Math.PI*2);ctx.stroke();}ctx.strokeStyle='#bcb58a';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(px(0),pz(68));for(let z=65;z>-30;z--)ctx.lineTo(px(Math.sin(z*.07)*3),pz(z));ctx.stroke();ctx.textAlign='center';ctx.font='14px Arial';for(const l of [...LANDMARKS,...SITES]){const done=game.s.claimed.includes(l.id);ctx.fillStyle=l.item?'#ffda8e':'#e3ecda';ctx.beginPath();ctx.arc(px(l.x),pz(l.z),5,0,7);ctx.fill();ctx.fillStyle='#10292c';ctx.fillRect(px(l.x)-55,pz(l.z)+9,110,22);ctx.fillStyle='#f2e9cb';ctx.fillText((done?'✓ ':'')+l.name,px(l.x),pz(l.z)+25);}const nav=navigation(game.s,RECIPES,LANDMARKS);if(nav){ctx.strokeStyle='#fff1b5';ctx.lineWidth=2;ctx.setLineDash([4,5]);ctx.beginPath();ctx.moveTo(px(game.s.player.x),pz(game.s.player.z));ctx.lineTo(px(nav.x),pz(nav.z));ctx.stroke();ctx.setLineDash([]);ctx.beginPath();ctx.arc(px(nav.x),pz(nav.z),12,0,7);ctx.stroke();}ctx.fillStyle='#efd293';game.s.structures.forEach(b=>ctx.fillText('△',px(b.x),pz(b.z)));const p=game.s.player;ctx.save();ctx.translate(px(p.x),pz(p.z));ctx.rotate(p.yaw);ctx.fillStyle='#fff9d7';ctx.strokeStyle='#153235';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-10);ctx.lineTo(-7,8);ctx.lineTo(0,4);ctx.lineTo(7,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();ctx.fillStyle='#d6d9bd';ctx.font='13px monospace';ctx.fillText('N',300,28);ctx.fillText('GREYWATER / 35° 08′ N',300,576);}
function findTarget(){
 const p=game.s.player,candidates=[...game.s.nodes.filter(n=>n.hp>0).map(n=>({...n,kind:'node'})),...LANDMARKS.map(l=>({...l,kind:'landmark'})),...SITES.map(l=>({...l,kind:'site'})),...game.s.structures.map(b=>({...b,kind:'structure'})),...game.s.wolves.filter(w=>w.hp<=0&&!w.looted).map(w=>({...w,kind:'wolf'}))];
 return candidates.map(o=>{const d=distance(p,o),yaw=Math.atan2(o.x-p.x,-(o.z-p.z)),angle=Math.abs(Math.atan2(Math.sin(yaw-p.yaw),Math.cos(yaw-p.yaw)));return {...o,d,angle};}).filter(o=>o.d<3.8&&(o.angle<.64||o.d<1.2)).sort((a,b)=>(a.angle+a.d*.12)-(b.angle+b.d*.12))[0]||null;
}
function updateUI(){
 const s=game.s,p=s.player;$('daytime').textContent=`DAY ${String(game.day).padStart(2,'0')} / ${String(Math.floor(game.hour)).padStart(2,'0')}:${String(Math.floor(game.hour%1*60)).padStart(2,'0')}`;
 const heading=((p.yaw*180/Math.PI)%360+360)%360,dirs=['N','NE','E','SE','S','SW','W','NW'];$('compass').textContent=`·　${dirs[Math.round(heading/45)%8]}　·　${String(Math.round(heading)).padStart(3,'0')}°`;
 $('weather-label').textContent=game.rain?'雨 / 冷え込みに注意':game.night?'夜 / 焚き火のそばへ':'晴れ / 海風';
 for(const k of ['health','food','water','warmth','stamina']){const el=$(k);el.querySelector('em').style.width=`${p[k]}%`;el.querySelector('b').textContent=Math.ceil(p[k]);el.classList.toggle('danger',p[k]<25);el.setAttribute('aria-label',`${el.querySelector('span').textContent} ${Math.ceil(p[k])}`);}
 document.querySelectorAll('[data-equip]').forEach(b=>{b.classList.toggle('selected',s.equipped===b.dataset.equip);b.style.opacity=s.inventory[b.dataset.equip]?1:.45;});document.querySelector('[data-equip="torch"] span').textContent=`松明 ${Math.ceil(s.torchFuel)}s`;$('drink').querySelector('span').textContent=`水筒 ${s.canteen}/5`;
 const q=trackedQuest(s),recipe=neededRecipe(s),next=q.steps.find(step=>!stepDone(s,q,step)),nav=navigation(s,RECIPES,LANDMARKS);
 $('objective-text').textContent=s.radio?`救助船の到着まで ${Math.ceil(s.rescue)} 秒`:recipe?`${RECIPES[recipe].name}を作る`:q.name;
 $('objective-sub').textContent=s.radio?'船が信号を受信した。火と食料を確保して待とう。':recipe?Object.entries(RECIPES[recipe].cost).map(([k,n])=>`${s.inventory[k]>=n?'✓ ':''}${ITEM[k]} ${s.inventory[k]}/${n}`).join('　'):next?.label||'目標を達成しました';
 $('objective-action').textContent=recipe?`C ${RECIPES[recipe].name}の作り方`:'J クエストを見る';
 if(nav){const angle=Math.atan2(nav.x-p.x,-(nav.z-p.z))-p.yaw;$('waypoint-arrow').style.transform=`rotate(${angle}rad)`;$('waypoint-label').textContent=`${nav.label} · ${Math.round(distance(nav,p))} m`;$('waypoint-detail').textContent=nav.kind==='material'?'金色の目印へ。近づいて E で採集。':'金色の目印へ。現地で E を押して調べる。';}
 else{$('waypoint-label').textContent=recipe?game.has(RECIPES[recipe].cost)?'素材がそろいました。C で製作。':'資源を探して、島を探索しよう。':next?.label||'';$('waypoint-detail').textContent=recipe?game.has(RECIPES[recipe].cost)?'製作画面は、下のボタンでも開けます。':'枝・小石・草は時間が経つと再び採れます。':'';}
 $('waypoint-arrow').hidden=!nav;
 $('region-label').textContent=SITES.find(l=>distance(l,p)<22)?.region||'';
 target=findTarget();let action='',detail='';
 if(game.building){action='クリックで設置 / R 回転 / Esc 取消';detail=RECIPES[game.building].name;}
 else if(target){if(target.kind==='node'){action={tree:'針葉樹を切る',rock:'岩を砕く',wood:'枝を拾う',stone:'小石を拾う',fiber:'草から繊維を採る',berries:'木の実を摘む',scrap:'金属片を拾う'}[target.type];detail=['tree','rock'].includes(target.type)?`石斧が必要 / あと ${target.hp} 回`:({wood:'木材 +2 / 道具なしで採れる',stone:'石 +2 / 道具なしで採れる',fiber:'繊維 +3 / 道具なしで採れる',berries:'木の実 +3 / Qで食べる',scrap:'金属片 +2 / 修理・建築に使う'}[target.type]);}
  else if(target.kind==='site'){action=target.id==='outpost'?s.journal.visited.includes('outpost')?'灯台守の便りを確認':'補給と灯台守の便りを受け取る':s.journal.beacon?'航路灯を確認':s.journal.visited.includes('lighthouse')?'灯台を修理する':'灯台守の記録を調べる';detail=target.id==='lighthouse'?`木材 ${s.inventory.wood}/6・金属片 ${s.inventory.scrap}/3 / 救助待機60秒`: '金属片3・包帯1・木の実3 / Jで記録を読む';}
  else if(target.kind==='wolf'){action='獣を解体する';detail='生肉と繊維を回収';}
  else if(target.kind==='landmark'){const l=target;if(l.item){action=s.claimed.includes(l.id)?'回収済み':`${ITEM[l.item]} を回収`;detail=l.name;}else if(l.id==='spring'){action='飲む / 水筒を満たす';detail='安全な湧き水';}else{action=s.radio?'救助を待つ':'無線を修理する';detail='配線・蓄電池・アンテナ / 木材8・金属片6';}}
  else if(target.type==='fire'){action=target.fuel>0&&s.inventory.rawMeat?'肉を焼く':'薪をくべる';detail=`残り燃料 ${Math.ceil(target.fuel)} 秒 / 木材1で +65秒`;}
  else if(target.type==='shelter'){action='朝まで休む';detail='夜のみ / 食料 -24・水分 -28 / 体力 +25';}
  else{action='集水器から補充する';detail=`水 ${target.water.toFixed(1)} / 5`;}
 }
 $('interaction').innerHTML=action?`${game.building?'':'<kbd>E</kbd> '}${action}<small>${detail}</small>`:'';
 const danger=s.wolves.find(w=>w.hp>0&&['windup','lunge'].includes(w.state)&&distance(w,p)<5),near=s.wolves.some(w=>w.hp>0&&distance(w,p)<13);$('threat').textContent=danger?'獣が身をかがめた — 横か後ろへ避ける':p.water<20?'水分が少ない — [F] 水を飲む':p.food<20?'空腹 — [Q] 食べる':p.warmth<20?'体が冷えている — 焚き火へ':near?'近くに獣の気配':' '; 
}
function equip(id){if(!game.s.inventory[id]){selectedRecipe=id;journal('craft');}else game.equip(id);}
function finishIntro(showCraft){game.s.journal.introSeen=true;$('arrival').close();screen='playing';save();if(showCraft){selectedRecipe='axe';journal('craft');}else lock();}
$('arrival-craft').onclick=()=>finishIntro(true);$('arrival-explore').onclick=()=>finishIntro(false);
$('objective-action').onclick=()=>{const r=neededRecipe(game.s);if(r){selectedRecipe=r;journal('craft');}else journal('quests');};
document.querySelectorAll('[data-open-page]').forEach(b=>b.onclick=()=>journal(b.dataset.openPage));
function flushEvents(){for(const e of game.events){if(e.text)toast(e.text);sound.event(e.kind);if(e.kind==='hurt')damageUntil=performance.now()+400;if(e.kind==='death'||e.kind==='victory')end(e.text);}game.events.length=0;}
function end(cause){screen='ended';unlock();closeDialogs();const won=game.s.mode==='won';$('ending-eyebrow').textContent=won?'SIGNAL RECEIVED / YOU MADE IT':'THE ISLAND REMEMBERS';$('ending-title').textContent=won?'灯は、届いた。':'まだ、終わりじゃない。';$('ending-copy').textContent=won?'霧の向こうから汽笛が聞こえる。あなたの焚き火が、帰り道を照らした。グレイウォーター島でのサバイバルはここで完了です。':`${cause}。次は食料を蓄え、暖かい拠点を作ってから遠くへ。`;$('ending-stats').innerHTML=`島で過ごした時間 ${Math.floor(game.s.elapsed/60)}分${Math.floor(game.s.elapsed%60)}秒<br>採集 ${game.s.stats.gathered} / 製作 ${game.s.stats.crafted} / 獣 ${game.s.stats.kills}<br>移動距離 ${Math.round(game.s.stats.distance)} m<br>見つけた記録 ${game.s.journal.notes.length-1} / 5　航路灯 ${game.s.journal.beacon?'復旧済み':'未復旧'}<br>完了したクエスト ${game.s.journal.completed.length} / ${QUESTS.length}`;$('ending-load').hidden=!hasSave();$('ending').showModal();$('retry').focus();}
function settingsChanged(){settings={volume:+$('volume').value,sensitivity:+$('sensitivity').value,quality:$('quality').value,reduced:$('reduced').checked};sound.setVolume(settings.volume);world.setQuality(settings.quality);try{localStorage.setItem(SETTINGS,JSON.stringify(settings));}catch{}}
$('new-game').onclick=()=>start();$('continue-game').onclick=()=>start(true);$('continue-game').hidden=!hasSave();$('about-game').onclick=()=>openAbout('title');$('pause-about').onclick=()=>{if($('pause').open)$('pause').close();openAbout('paused');};$('close-about').onclick=closeAbout;$('about-back').onclick=closeAbout;$('pause-button').onclick=pause;$('resume').onclick=resume;$('save').onclick=()=>{$('save-note').textContent=save()?'記録を保存しました':'保存に失敗しました';};$('back-title').onclick=()=>{if(!save())return;screen='title';unlock();closeDialogs();$('title').hidden=false;$('hud').hidden=true;$('shade').classList.remove('playing');};$('retry').onclick=()=>start();$('ending-load').onclick=()=>start(true);$('close-journal').onclick=closeJournal;
 document.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>{page=b.dataset.page;renderJournal();});document.querySelectorAll('[data-equip]').forEach(b=>b.onclick=()=>{equip(b.dataset.equip);flushEvents();});$('eat').onclick=()=>{game.eat();flushEvents();};$('drink').onclick=()=>{game.drink();flushEvents();};
for(const id of ['volume','sensitivity','quality','reduced']){$(id).addEventListener('input',settingsChanged);if(id==='reduced')$(id).checked=settings.reduced;else $(id).value=settings[id];}
for(const d of dialogs)d.addEventListener('cancel',e=>{e.preventDefault();if(d.id==='about')closeAbout();else if(screen==='journal')closeJournal();else if(screen==='paused')resume();});
window.addEventListener('keydown',e=>{
 if(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&screen==='playing')e.preventDefault();
 if(e.repeat)return;
 if(screen==='journal'){if(['KeyC','KeyM','KeyJ','KeyH'].includes(e.code)){e.preventDefault();journal({KeyC:'craft',KeyM:'map',KeyJ:'quests',KeyH:'guide'}[e.code]);}return;}
 if(screen!=='playing')return;
 keys.add(e.code);
 if(e.code==='KeyE'&&target){game.interact(target);flushEvents();updateUI();}
 if(e.code==='KeyJ')journal('quests');if(e.code==='KeyH')journal('guide');if(e.code==='KeyC'){selectedRecipe=neededRecipe(game.s)||selectedRecipe;journal('craft');}if(e.code==='Tab')journal('inventory');if(e.code==='KeyM')journal('map');
 if(e.code==='Digit1')equip('axe');if(e.code==='Digit2')equip('spear');if(e.code==='Digit3')equip('torch');if(e.code==='KeyQ')game.eat();if(e.code==='KeyF')game.drink();
 if(e.code==='Space'&&jump===0&&game.s.player.stamina>8){vy=5.2;game.s.player.stamina-=8;}
 if(e.code==='KeyR')buildAngle+=Math.PI/4;
 if(e.code==='Escape'){e.preventDefault();if(game.building){game.building=null;world.setGhost(null);toast('設置を取り消した。素材は消費していません');}else pause();}
 flushEvents();
});
window.addEventListener('keyup',e=>keys.delete(e.code));
let dragging=false,dragDistance=0;
function useTool(){if(screen!=='playing')return;if(game.building){const p=game.s.player;if(game.place(p.x+Math.sin(p.yaw)*4.2,p.z-Math.cos(p.yaw)*4.2,buildAngle))world.setGhost(null);}else game.attack();flushEvents();}
$('scene').addEventListener('pointerdown',e=>{if(screen!=='playing'||e.button!==0)return;if(document.pointerLockElement)useTool();else{dragging=true;dragDistance=0;lock();}});
window.addEventListener('pointerup',()=>{if(dragging&&dragDistance<6)useTool();dragging=false;});
window.addEventListener('mousemove',e=>{if(screen!=='playing'||(!document.pointerLockElement&&!dragging))return;if(dragging)dragDistance+=Math.abs(e.movementX)+Math.abs(e.movementY);game.s.player.yaw+=e.movementX*.002*settings.sensitivity;game.s.player.pitch=clamp(game.s.player.pitch-e.movementY*.002*settings.sensitivity,-1.25,1.25);});
document.addEventListener('pointerlockchange',()=>{if(!testFrozen&&!document.pointerLockElement&&screen==='playing')pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden&&!testFrozen)pause();});window.addEventListener('blur',()=>{keys.clear();if(!testFrozen)pause();});window.addEventListener('resize',()=>world?.resize());window.addEventListener('beforeunload',()=>{if(screen!=='title')save();});
function frame(now){
 const raw=(now-last)/1000,dt=Math.min(.05,raw);last=now;frameTimes.push(raw*1000);if(frameTimes.length>600)frameTimes.shift();
 const active=screen==='playing'&&!testFrozen,moving=active&&['KeyW','KeyA','KeyS','KeyD'].some(k=>keys.has(k));
 if(active){const p=game.s.player;if(keys.has('ArrowLeft'))p.yaw-=dt*1.65;if(keys.has('ArrowRight'))p.yaw+=dt*1.65;if(keys.has('ArrowUp'))p.pitch=clamp(p.pitch+dt*1,-1.25,1.25);if(keys.has('ArrowDown'))p.pitch=clamp(p.pitch-dt*1,-1.25,1.25);
  game.update(dt,{forward:Number(keys.has('KeyW'))-Number(keys.has('KeyS')),side:Number(keys.has('KeyD'))-Number(keys.has('KeyA')),run:keys.has('ShiftLeft')||keys.has('ShiftRight')});
  if(vy!==0||jump>0){vy-=dt*15;jump=Math.max(0,jump+vy*dt);if(jump===0)vy=0;}
  stepClock+=dt;if(moving&&stepClock>.45){sound.tone(75,.04,'triangle',.06);stepClock=0;}
  flushEvents();saveClock+=dt;if(saveClock>20){save();saveClock=0;}
 }
 world.update(game,!testFrozen&&(screen==='playing'||screen==='title')?dt:0,{title:screen==='title',reduced:settings.reduced,jump,moving,running:keys.has('ShiftLeft')||keys.has('ShiftRight'),angle:buildAngle,guidance:screen==='playing'?navigation(game.s,RECIPES,LANDMARKS):null});sound.environment(game.rain,!active);
 uiClock+=dt;if(uiClock>.12){if(screen!=='title')updateUI();uiClock=0;}
 if(now>noticeUntil)$('notice').style.opacity=0;$('damage').style.opacity=now<damageUntil?.65:0;
 requestAnimationFrame(frame);
}
try{world=new Island($('scene'),game.s);world.setQuality(settings.quality);sound.setVolume(settings.volume);$('loading').hidden=true;requestAnimationFrame(frame);}catch(err){$('loading').innerHTML='<div>島を読み込めませんでした。<br>WebGL対応のChromeでページを再読み込みしてください。<br><button onclick="location.reload()">再読み込み</button></div>';console.error(err);}
// Diagnostic access exists only on a Vite development URL explicitly opting into tests.
if(import.meta.env.DEV&&new URLSearchParams(location.search).has('test'))window.__lastLight={
 snapshot:()=>({screen,state:JSON.parse(game.serialize()),target,action:game.action?{...game.action,age:game.s.elapsed-game.action.startedAt}:null,rig:world.fp.inspect(),build:game.building,performance:{frames:frameTimes.length,mean:frameTimes.reduce((a,b)=>a+b,0)/frameTimes.length,p95:[...frameTimes].sort((a,b)=>a-b)[Math.floor(frameTimes.length*.95)],drawCalls:world.renderer.info.render.calls,triangles:world.renderer.info.render.triangles},renderer:world.renderer.getContext().getParameter(world.renderer.getContext().RENDERER)}),
 teleport:(x,z,yaw=0)=>{game.s.player.x=x;game.s.player.z=z;game.s.player.yaw=yaw;game.s.player.pitch=0;updateUI();},
 grant:items=>Object.assign(game.s.inventory,items),
 freeze:value=>{testFrozen=value;},
 encounter:wolves=>{game.s.wolves=wolves;world.reset();},
 render:()=>{world.fp.drawAge=1;world.update(game,0,{reduced:settings.reduced});updateUI();},
 clearAction:()=>{game.action=null;},
 setTime:t=>game.s.elapsed=t,
 advance:seconds=>{for(let t=0;t<seconds&&game.s.mode==='playing';t+=.05)game.update(Math.min(.05,seconds-t));flushEvents();updateUI();},
 setVitals:v=>Object.assign(game.s.player,v),
 input:(input,seconds)=>{for(let t=0;t<seconds&&game.s.mode==='playing';t+=.05)game.update(Math.min(.05,seconds-t),input);flushEvents();updateUI();},
 save:()=>save(),view:()=>({position:world.camera.position.toArray(),rotation:world.camera.rotation.toArray()}),
};
