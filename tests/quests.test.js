import test from 'node:test';
import assert from 'node:assert/strict';
import {Survival,RECIPES,LANDMARKS,VERSION} from '../src/simulation.js';
import {Survival as PreviousSurvival} from '../evidence/2026-09-29-expansion/simulation-v1-baseline.js';
import {SITES,QUESTS,NOTES,refreshJournal,navigation} from '../src/content.js';
const at=(g,o)=>Object.assign(g.s.player,{x:o.x,z:o.z+2});
const visit=(g,id)=>{const site=SITES.find(s=>s.id===id)||LANDMARKS.find(s=>s.id===id);at(g,site);g.interact({...site,kind:SITES.includes(site)?'site':'landmark'});};
const gather=(g,n)=>{at(g,n);while(n.hp>0){g.gather(n.id);for(let i=0;i<19;i++)g.update(.05);}};

test('axe tutorial follows resources, survives spending and advances to spear',()=>{
 const g=new Survival();assert.equal(navigation(g.s,RECIPES,LANDMARKS).material,'wood');
 for(const n of g.s.nodes.slice(0,8))gather(g,n);
 assert.equal(g.s.journal.steps.filter(x=>x.startsWith('axe:')).length,3);
 g.trackRecipe('axe','wood');assert.equal(navigation(g.s,RECIPES,LANDMARKS),null);
 g.craft('axe');assert.ok(g.s.journal.completed.includes('axe'));assert.equal(g.s.journal.tracked,'tools');assert.equal(g.s.journal.recipe,null);
 assert.equal(g.s.journal.steps.filter(x=>x.startsWith('axe:')).length,4);
 const completeEvents=g.events.filter(e=>e.kind==='quest').length;g.eat();assert.equal(g.events.filter(e=>e.kind==='quest').length,completeEvents);
 assert.deepEqual(Survival.restore(g.serialize()).s.journal,g.s.journal);
});
test('navigation uses reachable material types and live nodes; manual waypoint clears on visit',()=>{
 const g=new Survival();g.trackRecipe('axe','stone');let n=navigation(g.s,RECIPES,LANDMARKS);assert.equal(n.type,'stone');g.s.nodes.find(x=>x.id===n.id).hp=0;assert.notEqual(navigation(g.s,RECIPES,LANDMARKS).id,n.id);
 g.s.journal.waypoint='outpost';assert.equal(navigation(g.s,RECIPES,LANDMARKS).id,'outpost');visit(g,'outpost');assert.equal(g.s.journal.waypoint,null);
 g.trackQuest('beacon');assert.equal(navigation(g.s,RECIPES,LANDMARKS).id,'lighthouse');
});
test('outpost supply is range-limited, awarded once and retained across save',()=>{
 const g=new Survival(),site=SITES[0];g.interact({...site,kind:'site'});assert.equal(g.s.inventory.scrap,0);
 visit(g,'outpost');assert.equal(g.s.inventory.scrap,3);assert.equal(g.s.inventory.bandage,2);assert.ok(g.s.journal.notes.includes('outpost'));
 const restored=Survival.restore(g.serialize());visit(restored,'outpost');assert.equal(restored.s.inventory.scrap,3);assert.equal(restored.s.inventory.bandage,2);
});
test('lighthouse inspection, shortage, repair costs and reward persist without duplication',()=>{
 const g=new Survival();visit(g,'lighthouse');assert.equal(g.s.journal.beacon,false);assert.ok(g.s.journal.notes.includes('lighthouse'));
 visit(g,'lighthouse');assert.equal(g.s.journal.beacon,false);visit(g,'outpost');g.s.inventory.wood=6;visit(g,'lighthouse');assert.equal(g.s.journal.beacon,true);assert.equal(g.s.inventory.wood,0);assert.equal(g.s.inventory.scrap,0);assert.equal(g.s.inventory.meat,2);assert.ok(g.s.journal.completed.includes('beacon'));
 const restored=Survival.restore(g.serialize());visit(restored,'lighthouse');assert.equal(restored.s.inventory.meat,2);assert.equal(restored.s.inventory.bandage,3);
});
test('restored lighthouse shortens rescue, archive records all five field notes',()=>{
 const g=new Survival();visit(g,'outpost');g.s.inventory.wood=14;visit(g,'lighthouse');visit(g,'lighthouse');for(const id of ['wreck','cave','station'])visit(g,id);
 assert.equal(g.s.journal.notes.length,Object.keys(NOTES).length);assert.ok(g.s.journal.completed.includes('archive'));visit(g,'radio');assert.equal(g.s.rescue,60);assert.equal(g.s.radio,true);
});
test('legacy save migrates real version 1 nodes, inventory, progress and construction',()=>{
 const old=new PreviousSurvival();Object.assign(old.s.inventory,{axe:1,spear:1,wood:23,stone:11,fiber:8});old.s.equipped='axe';old.s.nodes[0].hp=0;old.s.nodes[0].readyAt=240;
 old.s.structures.push({id:'b0',type:'fire',x:0,z:64,angle:0,fuel:122,water:0});old.s.claimed.push('wreck');old.s.inventory.wire=1;
 const g=Survival.restore(old.serialize());assert.equal(g.s.version,VERSION);for(const key of ['nodes','inventory','player','structures','claimed','wolves'])assert.deepEqual(g.s[key],old.s[key]);assert.ok(g.s.journal.notes.includes('wreck'));assert.ok(g.s.journal.completed.includes('axe'));assert.ok(g.s.journal.steps.includes('tools:equip'));assert.equal(g.s.journal.introSeen,false);
});
test('journal corruption rejected and completed milestones remain stable after restore',()=>{
 const g=new Survival();for(const patch of [{beacon:'yes'},{tracked:'unknown'},{recipe:'bad'},{notes:['arrival','arrival']},{steps:['axe:unknown']},{visited:['fake']},{material:'axe'},{waypoint:'none'}])assert.throws(()=>Survival.restore(JSON.stringify({...g.s,journal:{...g.s.journal,...patch}})));
 Object.assign(g.s.inventory,{axe:1,spear:1,torch:1});g.s.equipped='spear';refreshJournal(g.s);assert.ok(g.s.journal.completed.includes('tools'));g.s.equipped='axe';assert.deepEqual(Survival.restore(g.serialize()).s.journal,g.s.journal);
});
test('added site walls block movement while both interaction approaches remain open',()=>{
 const g=new Survival();assert.equal(g.blocked(-45,-67),true);assert.equal(g.blocked(-32,40),true);
 for(const l of SITES){assert.equal(g.blocked(l.x,l.z+2),false);at(g,l);g.interact({...l,kind:'site'});assert.ok(g.s.journal.visited.includes(l.id));}
});

test('legacy positions inside new buildings relocate safely and ordinary movement works',()=>{
 for(const [x,z]of [[-45,-67],[-32,40],[-35,42]]){
  const old=new PreviousSurvival();Object.assign(old.s.player,{x,z});assert.equal(old.blocked(x,z),false);
  const g=Survival.restore(old.serialize());assert.equal(g.blocked(g.s.player.x,g.s.player.z),false);assert.ok(Math.hypot(g.s.player.x-x,g.s.player.z-z)<5);
  const before={...g.s.player};g.update(.1,{forward:1});assert.ok(Math.hypot(g.s.player.x-before.x,g.s.player.z-before.z)>.3);assert.deepEqual(g.s.inventory,old.s.inventory);
 }
});
test('legacy camp overlapping a new landmark moves nearby without losing its contents',()=>{
 const old=new PreviousSurvival();old.s.structures.push({id:'b0',type:'collector',x:-32,z:41,angle:1,fuel:0,water:4});
 const g=Survival.restore(old.serialize()),b=g.s.structures[0];assert.equal(b.id,'b0');assert.equal(b.water,4);assert.equal(b.angle,1);assert.ok(Math.hypot(b.x+32,b.z-41)<15);assert.ok(SITES.every(l=>Math.hypot(b.x-l.x,b.z-l.z)>=7));
});
test('owned tool cannot pin an impossible craft objective and stale saved pins recover',async()=>{
 const {crafting}=await import('../src/journal.js');const {neededRecipe}=await import('../src/content.js');
 const g=new Survival();g.s.inventory.axe=1;refreshJournal(g.s);g.trackRecipe('axe','wood');assert.equal(g.s.journal.recipe,null);assert.equal(neededRecipe(g.s),'spear');
 const buttons=crafting(g,'axe').match(/<button[^>]*data-material[^>]*>/g);assert.equal(buttons.length,3);assert.ok(buttons.every(b=>b.includes('disabled')));
 g.s.journal.recipe='axe';g.s.journal.material='wood';assert.equal(neededRecipe(g.s),'spear');const restored=Survival.restore(g.serialize());assert.equal(restored.s.journal.recipe,null);assert.equal(restored.s.journal.material,null);
});

test('home side quest requires both buildings and actual safe night rest, then persists',()=>{
 const g=new Survival();Object.assign(g.s.inventory,{wood:40,fiber:30,scrap:2});g.s.wolves=[];g.trackQuest('home');
 Object.assign(g.s.player,{x:0,z:78});assert.ok(g.craft('shelter'));assert.ok(g.place(0,74));
 Object.assign(g.s.player,{x:7,z:78});assert.ok(g.craft('collector'));assert.ok(g.place(7,74));assert.equal(g.s.journal.completed.includes('home'),false);
 g.s.elapsed=340;Object.assign(g.s.player,{x:0,z:77,food:80,water:80});g.interact({...g.s.structures[0],kind:'structure'});assert.equal(g.s.journal.rested,true);assert.ok(g.s.journal.completed.includes('home'));assert.ok(Survival.restore(g.serialize()).s.journal.completed.includes('home'));
});
