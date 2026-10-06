// Island history, field-guide copy and quest conditions share one source with the UI.
export const SITES = [
  {id:'outpost',name:'西の補給所',x:-32,z:44,region:'潮風の林',summary:'調査隊が残した補給と、灯台守の便り。'},
  {id:'lighthouse',name:'北岬の灯台',x:-45,z:-64,region:'北岬',summary:'消えた航路灯。復旧すれば救助船が島を見つけやすくなる。'}
];
export const NOTES = {
  arrival:{title:'濡れた手帳の最初の頁',author:'調査員 ミオ',place:'漂着した海岸',text:'嵐で調査船ノース17号から投げ出された。流れ着いたのは、かつて気象観測に使われていたグレイウォーター島。丘の無線塔なら、まだ海の向こうへ声を届けられるかもしれない。まずは手を動かそう。地面の枝、小石、草の繊維があれば、一本の斧を作れる。'},
  outpost:{title:'灯台守の置き手紙',author:'灯台守 エダ',place:'西の補給所',text:'ここを見つけた誰かへ。金属片と包帯を置いておく。北岬の灯台は嵐で配電盤が壊れたが、木材6と金属片3で直せるはずだ。灯りが点けば、沖で待機する救助船は霧の中でもこちらを見つけられる。無線で知らせる前に、できるなら灯を戻してほしい。私たちは島を忘れない。'},
  wreck:{title:'ノース17号・最後の航海日誌',author:'船長 レン',place:'座礁した調査船',text:'18時40分。波が甲板を越えた。避難用の配線は黄色い防水箱へ移した。丘の無線塔に使える。船員は連絡船へ退避したが、ミオの姿が見えない。沖で救難周波数を聞き続ける。誰かが島に残っているなら、信号を送ってくれ。'},
  cave:{title:'予備電源の保管票',author:'整備士 ソウ',place:'採掘跡',text:'採掘が終わって何年も経つ。今は冷たい風を避ける保管庫だ。観測所の予備蓄電池をここに置いた。狼の足跡が入口に増えている。長い槍で間合いを取るか、火を持って近づくこと。ここの石は無線塔の基礎にも使われた。島の仕事は、いつも誰かの仕事につながっている。'},
  station:{title:'送られなかった気象記録',author:'観測員 ナギ',place:'気象観測所',text:'気圧が急に下がり、南の道が波に洗われた。避難前、アンテナを外して防水箱へ収めた。水は中央東の泉で確保できる。雨水の集水器も、雨が止んだ後には露を少しずつ集める。この島で記録した最後の天気は「嵐」。次の頁には「晴れ」と書ける人がいてほしい。'},
  lighthouse:{title:'灯を絶やすな',author:'灯台守 エダ',place:'北岬の灯台',text:'灯台は自分のためには光らない。海の上の誰かに、ここに岸があると伝えるためのものだ。配電盤に残った最後のメモは、たった一行。「帰り道を、消さないで」。修理を終えたら無線塔へ。配線・蓄電池・アンテナ、それに木材8と金属片6があれば、声はきっと届く。'}
};
export const HELP = {
 wood:{name:'木材',shape:'地面に横たわる茶色い枝・丸太',source:'枝に近づいて E。道具なしで木材2。石斧を作った後は、木を E で3回切ると木材5。',use:'斧・槍・焚き火・建築、火の燃料。最初の斧には3個。'},
 stone:{name:'石',shape:'地面の小さな灰色の石',source:'小石に近づいて E。道具なしで石2。大きな岩は石斧を装備し、E で2回砕くと石4。',use:'石斧には3個、槍には2個、焚き火には4個。'},
 fiber:{name:'繊維',shape:'細長い葉が束になった緑の草',source:'背の低い草に近づき E で採る。道具は不要、繊維3を入手。木を切っても1個手に入る。',use:'道具を結び、包帯やシェルターを作る。斧には2個、槍には3個。'},
 berries:{name:'木の実',shape:'橙色の実が付いた低い茂み',source:'茂みに近づいて E。木の実3を採れる。しばらくすると再び実る。',use:'Q で食べると食料+18、体力+2。焼いた肉があれば先に食べる。'},
 scrap:{name:'金属片',shape:'地面の錆びた板、調査隊の補給箱',source:'錆びた板に E。無線部品の箱から各3個、西の補給所でも3個。',use:'無線修理6個、灯台修理3個、集水器2個。用途を考えて残しておこう。'},
 rawMeat:{name:'生肉',source:'倒した狼に近づき E で解体すると2個。',use:'火がついた焚き火で E を押して焼く。生のままでは食べられない。'},
 meat:{name:'焼いた肉',source:'生肉を持ち、火のついた焚き火で E。',use:'Q で食べると食料+45、体力+8。'},
 axe:{name:'石斧',source:'C → 石斧。木材3・石3・繊維2を集め「石斧を製作する」。作業台は不要。',use:'製作後は自動装備。1 で持ち替え、木や大岩の近くで E。斧を振り下ろして採取。左クリックは獣への攻撃。'},
 spear:{name:'狩猟槍',source:'C → 狩猟槍。木材4・石2・繊維3で製作。最初に斧を作ると木材を集めやすい。',use:'2 で装備、獣を中央に捉えて左クリックで両手突き。斧より長い間合い。突き終わるまで持ち替えはできない。'},
 torch:{name:'松明',source:'C → 松明。木材2・繊維3で製作。',use:'3 で装備。180秒の灯りと獣よけ。Tabの持ち物で木材1を使うと燃料+90秒。'},
 bandage:{name:'包帯',source:'C → 包帯。繊維4で1個製作。',use:'Tab → 持ち物 → 包帯を使う。体力+35。'},
 fire:{name:'焚き火',source:'C → 焚き火。木材6・石4。製作画面から場所を選び、緑のプレビューでクリック。',use:'近くで体温回復、狼を遠ざける。Eで肉を調理、肉がなければ木材1で燃料+65秒。'},
 shelter:{name:'枝のシェルター',source:'C → 枝のシェルター。木材10・繊維6。Rで回転、クリックで設置。',use:'19時〜6時に E で朝まで休む。食料30・水分35以上と安全な周囲が必要。体力+25。'},
 collector:{name:'雨水の集水器',source:'C → 雨水の集水器。木材6・繊維5・金属片2。',use:'雨と露を集める。水が1以上溜まったら E で水筒に補充。'},
 wire:{name:'配線',source:'南東の座礁船の黄色い箱で E。',use:'無線修理に使う3部品のひとつ。'},
 battery:{name:'蓄電池',source:'西の採掘跡の黄色い箱で E。',use:'無線修理に使う3部品のひとつ。'},
 antenna:{name:'アンテナ',source:'北東の気象観測所の黄色い箱で E。',use:'無線修理に使う3部品のひとつ。'},
 water:{name:'水分 / 水筒',source:'F で水筒から飲む。中央東の泉で E を押すと、水分100・水筒5回分に補充。',use:'水分0で体力が減る。1回飲むと水分+35。'},
 food:{name:'食料',source:'Q で木の実か焼いた肉を食べる。',use:'食料0で体力が減る。移動前に蓄えよう。'},
 health:{name:'体力',source:'包帯、食事、シェルターでの休息で回復。',use:'0になると倒れる。最後の保存記録から再開できる。'},
 warmth:{name:'体温',source:'雨や夜、海に入ると冷える。焚き火・屋根・松明で暖を取る。',use:'体温0で体力が減る。'},
 stamina:{name:'持久力',source:'疾走と攻撃、ジャンプで消費。歩くか立ち止まると回復。',use:'攻撃連打はできない。狼の予兆に合わせて横か後ろへ避け、反撃しよう。'}
};
const has=(s,k,n=1)=>(s.inventory[k]||0)>=n;
export const QUESTS = [
 {id:'axe',chapter:'01',name:'漂着者の一歩',type:'main',story:'ミオの手帳には、最初の道具の作り方が残っていた。海岸の漂流物を、一本の斧に変えよう。',result:'木と大岩から、まとまった素材を集められる。',recipe:'axe',steps:[
  {id:'wood',label:'枝を拾って木材3を集める',test:s=>has(s,'wood',3)||has(s,'axe')},
  {id:'stone',label:'小石を拾って石3を集める',test:s=>has(s,'stone',3)||has(s,'axe')},
  {id:'fiber',label:'草から繊維2を採る',test:s=>has(s,'fiber',2)||has(s,'axe')},
  {id:'craft',label:'C → 石斧 → 製作する',test:s=>has(s,'axe')}]},
 {id:'tools',chapter:'02',name:'森へ入る準備',type:'main',story:'森の奥には狼がいる。長い槍で身を守り、松明で暗さと獣に備えよう。',result:'槍で戦うか、燃料を使って獣を避けるかを選べる。',recipe:'spear',steps:[
  {id:'spear',label:'木材4・石2・繊維3で狩猟槍を作る',test:s=>has(s,'spear')},
  {id:'equip',label:'2 を押して槍を装備する',test:s=>s.equipped==='spear'},
  {id:'torch',label:'木材2・繊維3で松明を作る',test:s=>has(s,'torch')}]},
 {id:'camp',chapter:'03',name:'帰れる場所',type:'main',story:'遠くへ行く前に、戻ってこられる火と水を確保する。観測員の記録によれば、泉は島の中央東にある。',result:'野営地と補給の場所ができる。',recipe:'fire',steps:[
  {id:'fire',label:'木材6・石4で焚き火を設置する',test:s=>s.structures.some(b=>b.type==='fire')},
  {id:'spring',label:'森の湧き水で E を押して水筒を満たす',test:s=>s.journal.visited.includes('spring')}]},
 {id:'parts',chapter:'04',name:'最後の周波数',type:'main',story:'船長レンは沖で救難周波数を聞き続けている。島に残る3つの部品を集め、丘の無線塔へ声を届けよう。',result:'無線塔を修理できる。部品箱には金属片も入っている。',steps:[
  {id:'wreck',label:'座礁船で配線を回収する',site:'wreck',test:s=>s.claimed.includes('wreck')},
  {id:'cave',label:'採掘跡で蓄電池を回収する',site:'cave',test:s=>s.claimed.includes('cave')},
  {id:'station',label:'気象観測所でアンテナを回収する',site:'station',test:s=>s.claimed.includes('station')}]},
 {id:'rescue',chapter:'05',name:'灯は、海を渡る',type:'main',story:'仲間は島を見捨てていなかった。3部品と木材8・金属片6で無線塔を直し、船が着くまで生き延びる。',result:'救助船で島を離れる。灯台を直していれば待機は60秒になる。',steps:[
  {id:'signal',label:'丘の無線塔で E を押して修理する',site:'radio',test:s=>s.radio},
  {id:'survive',label:'救助船の到着まで生き延びる',test:s=>s.mode==='won'}]},
 {id:'beacon',chapter:'SIDE A',name:'灯台守との約束',type:'side',story:'補給所に残るエダの便り。北岬の航路灯を修理すれば、救助船が霧の中を迷わず進める。',result:'救助待機90秒 → 60秒。修理時に焼いた肉2・包帯1。',steps:[
  {id:'letter',label:'西の補給所で便りと補給を受け取る',site:'outpost',test:s=>s.journal.visited.includes('outpost')},
  {id:'light',label:'北岬の灯台を木材6・金属片3で修理する',site:'lighthouse',test:s=>s.journal.beacon}]},
 {id:'home',chapter:'SIDE B',name:'雨音を聞く屋根',type:'side',story:'島をただ通り過ぎる場所から、しばらく暮らせる場所へ。雨を集め、体を休める準備をしよう。',result:'夜を越す拠点と、泉から離れた場所での水源。',recipe:'shelter',steps:[
  {id:'shelter',label:'枝のシェルターを設置する',test:s=>s.structures.some(b=>b.type==='shelter')},
  {id:'collector',label:'雨水の集水器を設置する',test:s=>s.structures.some(b=>b.type==='collector')},
  {id:'rest',label:'安全な夜にシェルターで休む',test:s=>s.journal.rested}]},
 {id:'archive',chapter:'SIDE C',name:'島が覚えていること',type:'side',story:'この島で働いていた人々の声を、海の向こうへ持ち帰る。各地点を調べると記録が手帳に加わる。',result:'島に残された5冊の記録を読める。救助時の帰還記録にも残る。',steps:Object.keys(NOTES).filter(id=>id!=='arrival').map(id=>({id,label:`「${NOTES[id].title}」を見つける`,site:id,test:s=>s.journal.notes.includes(id)}))}
];
export const STEP_IDS=QUESTS.flatMap(q=>q.steps.map(step=>`${q.id}:${step.id}`));
export function newJournal(){return {introSeen:false,notes:['arrival'],visited:[],steps:[],completed:[],tracked:'axe',recipe:null,material:null,waypoint:null,beacon:false,rested:false};}
export function mainQuest(s){return QUESTS.find(q=>q.type==='main'&&!s.journal.completed.includes(q.id))||QUESTS.find(q=>q.id==='rescue');}
export function trackedQuest(s){return QUESTS.find(q=>q.id===s.journal.tracked&&!s.journal.completed.includes(q.id))||mainQuest(s);}
export function stepDone(s,q,step){return s.journal.steps.includes(`${q.id}:${step.id}`);}
export function refreshJournal(s){
 const completed=[];
 for(const q of QUESTS){
  for(const step of q.steps){const id=`${q.id}:${step.id}`;if(!s.journal.steps.includes(id)&&step.test(s))s.journal.steps.push(id);}
  if(q.steps.every(step=>stepDone(s,q,step))&&!s.journal.completed.includes(q.id)){s.journal.completed.push(q.id);completed.push(q);}
 }
 if(s.journal.completed.includes(s.journal.tracked))s.journal.tracked=mainQuest(s).id;
 return completed;
}
export function neededRecipe(s){
 if(s.journal.recipe&&!(['axe','spear','torch'].includes(s.journal.recipe)&&s.inventory[s.journal.recipe]))return s.journal.recipe;
 const q=trackedQuest(s);
 if(q.id==='axe')return 'axe';
 if(q.id==='tools')return !s.inventory.spear?'spear':!s.inventory.torch?'torch':null;
 if(q.id==='camp'&&!s.structures.some(b=>b.type==='fire'))return 'fire';
 if(q.id==='home')return !s.structures.some(b=>b.type==='shelter')?'shelter':!s.structures.some(b=>b.type==='collector')?'collector':null;
 return null;
}
export const NODE_NAMES={tree:'針葉樹',rock:'大きな岩',wood:'落ちた枝',stone:'小石',fiber:'繊維の草',berries:'木の実の茂み',scrap:'錆びた金属片'};
export function navigation(s,recipes,landmarks){
 const j=s.journal,all=[...landmarks,...SITES],recipe=neededRecipe(s);
 if(j.waypoint){const site=all.find(l=>l.id===j.waypoint);if(site)return {...site,kind:'site',label:site.name};}
 let material=j.material;
 if(material&&recipe&&(s.inventory[material]||0)>=(recipes[recipe].cost[material]||0))material=null;
 if(!material&&recipe)material=Object.keys(recipes[recipe].cost).find(k=>(s.inventory[k]||0)<recipes[recipe].cost[k]);
 if(material){
  const types={wood:s.inventory.axe?['wood','tree']:['wood'],stone:s.inventory.axe?['stone','rock']:['stone'],fiber:['fiber'],scrap:['scrap'],berries:['berries']}[material]||[];
  const node=s.nodes.filter(n=>n.hp>0&&types.includes(n.type)).sort((a,b)=>Math.hypot(a.x-s.player.x,a.z-s.player.z)-Math.hypot(b.x-s.player.x,b.z-s.player.z))[0];
  if(node)return {...node,kind:'material',material,label:NODE_NAMES[node.type]};
 }
 if(recipe)return null;
 const q=trackedQuest(s),step=q.steps.find(step=>!stepDone(s,q,step));
 const destination=all.find(l=>l.id===(step?.site||(q.id==='camp'?'spring':null)));
 return destination?{...destination,kind:'site',label:destination.name}:null;
}
export function itemIcon(id){
 const drawings={
  wood:'<path d="m9 32 26-20 5 7-26 20z" fill="#997342"/><path d="m12 32 23-17M16 34l20-16" stroke="#d7b77b"/>',
  stone:'<path d="m9 31 5-15 17-5 10 12-5 15-17 2z" fill="#849995"/><path d="m14 16 14 8 8 14M28 24l3-13" fill="none" stroke="#c1ccc0"/>',
  fiber:'<path d="M24 42Q6 22 8 10q16 10 16 32Q36 15 39 9q3 21-15 33Q19 13 23 5q10 20 1 37" fill="#8baf75"/>',
  axe:'<path d="m19 43 8-35 4 1-8 35" fill="#ae8550"/><path d="m12 8 14-3 3 14-13 5-8-6z" fill="#91a5a0"/><path d="m25 10 8 2m-9 3 8 2" stroke="#edd295" stroke-width="3"/>',
  spear:'<path d="m10 42 22-27 3 3-21 27" fill="#ae8550"/><path d="m27 17 15-13-4 21z" fill="#a6b6b0"/>',
  torch:'<path d="m20 42 3-23 5 1-3 23" fill="#ad804a"/><path d="M24 28C5 19 29 10 26 3c18 17 9 24-2 25" fill="#efbd70"/>',
  fire:'<path d="m8 38 29-8 2 6-28 7zm3-8 29 7-2 6-30-8" fill="#a78354"/><path d="M22 33C4 24 27 16 25 5c17 18 12 25-3 28" fill="#efb565"/>',
  shelter:'<path d="M4 39 24 7l20 32z" fill="#c3b48c"/><path d="m24 7 6 32H17z" fill="#314947"/>',
  collector:'<path d="M10 8v35m28-35v35" stroke="#b39462" stroke-width="3"/><path d="m6 10 18 14 18-14z" fill="#9dbaac"/><path d="M15 28h18v15H15z" fill="#819b9e"/>',
  berries:'<path d="M24 16Q13 1 8 12q3 9 16 4" fill="#8cac73"/><g fill="#dc9565"><circle cx="18" cy="26" r="9"/><circle cx="32" cy="25" r="9"/><circle cx="25" cy="37" r="8"/></g>',
  scrap:'<path d="m10 10 25-4 4 33-24 5z" fill="#bb8165"/><path d="m18 14 13-2m-12 9 13-2m-12 9 13-2" stroke="#e0af8c"/>',
  bandage:'<path d="m8 23 15-15 19 19-15 15z" fill="#dfd7bc"/><path d="m19 20 11 11m-6-16 11 11" stroke="#a3997e" stroke-width="3"/>',
 };
 return `<svg viewBox="0 0 48 48" class="item-icon" aria-hidden="true">${drawings[id]||'<path d="M10 12h28v28H10zM18 12V7h12v5" fill="none" stroke="currentColor" stroke-width="3"/>'}</svg>`;
}
