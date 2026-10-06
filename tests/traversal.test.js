import test from 'node:test';
import assert from 'node:assert/strict';
import {Survival,LANDMARKS,terrain,distance} from '../src/simulation.js';
import {SITES} from '../src/content.js';

for(const expanded of [false,true])test(`collision-aware walking to ${expanded?'all parts, camp, supply outpost and lighthouse':'all parts'} and rescue without grants or teleport`,()=>{
 const g=new Survival(),size=175,edge=87,index=(x,z)=>(z+edge)*size+x+edge,point=i=>({x:i%size-edge,z:Math.floor(i/size)-edge});
 const walkable=new Uint8Array(size*size);
 for(let z=-edge;z<=edge;z++)for(let x=-edge;x<=edge;x++)if(terrain(x,z)>.05&&![[0,0],[.28,0],[-.28,0],[0,.28],[0,-.28]].some(([dx,dz])=>g.blocked(x+dx,z+dz)))walkable[index(x,z)]=1;
 function step(dt){if(g.s.player.food<50)g.eat();if(g.s.player.water<50)g.drink();if(g.s.player.health<50&&g.s.inventory.bandage)g.heal();if(g.s.inventory.torch&&g.s.torchFuel<25)g.refillTorch();g.update(dt,{forward:1});assert.equal(g.s.mode,'playing','alive throughout exploration');}
 function travel(destination){
  if(g.s.inventory.torch)g.equip('torch');
  const start=index(Math.round(g.s.player.x),Math.round(g.s.player.z)),queue=[start],parent=new Int32Array(size*size).fill(-1);parent[start]=start;let goal=-1;
  for(let head=0;head<queue.length;head++){const k=queue[head],p=point(k);if(distance(p,destination)<(['tree','rock'].includes(destination.type)?2.2:2.5)){goal=k;break;}for(const next of [k-1,k+1,k-size,k+size]){if(next<0||next>=walkable.length||parent[next]!==-1||!walkable[next]||distance(p,point(next))>1.1)continue;parent[next]=k;queue.push(next);}}
  assert.notEqual(goal,-1,`reachable ${destination.id}`);const path=[];for(let k=goal;k!==start;k=parent[k])path.push(point(k));path.reverse();
  for(const p of path){let iterations=0;while(distance(g.s.player,p)>.05){assert.ok(++iterations<100,`collision blocked route to ${destination.id}`);g.s.player.yaw=Math.atan2(p.x-g.s.player.x,-(p.z-g.s.player.z));step(Math.min(.05,distance(g.s.player,p)/4.3));}}
  g.s.player.yaw=Math.atan2(destination.x-g.s.player.x,-(destination.z-g.s.player.z));
 }
 function gather(n){travel(n);if(['tree','rock'].includes(n.type))g.equip('axe');while(n.hp>0){assert.equal(g.gather(n.id),true);for(let i=0;i<18;i++)g.update(.05);assert.equal(g.s.mode,'playing');}}
 for(const n of g.s.nodes.slice(0,8))gather(n);assert.ok(g.craft('axe'));
 for(let i=0;i<(expanded?6:4);i++){const n=g.s.nodes.filter(n=>n.type==='tree'&&n.hp>0).sort((a,b)=>distance(a,g.s.player)-distance(b,g.s.player))[0];gather(n);}
 for(const type of ['rock','fiber']){const n=g.s.nodes.filter(n=>n.type===type&&n.hp>0).sort((a,b)=>distance(a,g.s.player)-distance(b,g.s.player))[0];gather(n);}
 assert.ok(g.craft('spear'));assert.ok(g.craft('torch'));
 if(expanded){travel({x:0,z:68,id:'beach-camp'});assert.ok(g.craft('fire'));assert.ok(g.place(0,64));}
 for(const id of (expanded?['outpost','wreck','spring','station','cave','lighthouse','radio']:['wreck','spring','station','cave','radio'])){const l=[...LANDMARKS,...SITES].find(l=>l.id===id),kind=SITES.includes(l)?'site':'landmark';travel(l);g.interact({...l,kind});if(id==='lighthouse'){g.interact({...l,kind});assert.ok(g.s.journal.beacon);}}
 if(expanded){assert.equal(g.s.rescue,60);assert.ok(g.s.journal.completed.includes('camp'));assert.ok(g.s.journal.completed.includes('beacon'));assert.ok(g.s.journal.completed.includes('archive'));}
 assert.ok(g.s.radio,'all parts and repair materials reach radio');
 for(let i=0;i<1810&&g.s.mode==='playing';i++){if(g.s.torchFuel<20)g.refillTorch();if(g.s.player.water<40)g.drink();if(g.s.player.food<40)g.eat();g.update(.05);}
 assert.equal(g.s.mode,'won');assert.ok(g.s.stats.distance>300);assert.ok(g.s.player.health>0);
 console.log(JSON.stringify({expanded,distance:g.s.stats.distance,elapsed:g.s.elapsed,health:g.s.player.health,claimed:g.s.claimed,torchFuel:g.s.torchFuel,wood:g.s.inventory.wood}));
});
