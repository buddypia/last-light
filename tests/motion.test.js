import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {Survival} from '../src/simulation.js';
import {ATTACKS,WOLF_MOTION,actionPose,restPose} from '../src/motion.js';
import {FirstPersonRig,createWolfRig,animateWolf} from '../src/actors.js';

function advance(g,seconds){for(let t=0;t<seconds-1e-8;t+=.01)g.update(Math.min(.01,seconds-t));}
function fixture(tool='spear'){
 const g=new Survival();g.s.nodes=[];g.s.inventory[tool]=1;g.equip(tool);
 const w={id:'test-wolf',x:0,z:65.5,home:{x:0,z:65.5},hp:64,state:'cooldown',timer:10,phase:0,deadAt:0,looted:false,facing:0};g.s.wolves=[w];return {g,w};
}
test('contact is delayed, single, and cannot change weapon during a committed action',()=>{
 const {g,w}=fixture();g.s.inventory.axe=1;assert.equal(g.attack(),true);g.equip('axe');assert.equal(g.s.equipped,'spear');
 advance(g,ATTACKS.spear.impact-.02);assert.equal(w.hp,64);assert.equal(g.attack(),false);
 advance(g,.03);assert.equal(w.hp,30);advance(g,.1);assert.equal(w.hp,30);
 advance(g,.6);assert.equal(g.action,null);g.equip('axe');assert.equal(g.s.equipped,'axe');
});
test('contact uses current aim and range; obstacles stop strikes',()=>{
 for(const mode of ['turn','up','away','wall']){
  const {g,w}=fixture();assert.equal(g.attack(),true);
  if(mode==='turn')g.s.player.yaw=Math.PI;
  if(mode==='up')g.s.player.pitch=.9;
  if(mode==='away')g.s.player.z+=5;
  if(mode==='wall')g.s.nodes=[{id:'wall',type:'tree',x:0,z:66.6,hp:3,readyAt:0}];
  advance(g,.3);assert.equal(w.hp,64,mode);
 }
});
test('chopping only harvests on contact and misses after stepping away',()=>{
 const {g}=fixture('axe');g.s.wolves=[];const n={id:'tree',type:'tree',x:0,z:66,hp:1,readyAt:0};g.s.nodes=[n];
 const wood=g.s.inventory.wood;assert.equal(g.gather(n.id),true);advance(g,.3);assert.equal(n.hp,1);assert.equal(g.s.inventory.wood,wood);
 advance(g,.06);assert.equal(n.hp,0);assert.equal(g.s.inventory.wood,wood+5);advance(g,.6);assert.equal(g.s.inventory.wood,wood+5);
 n.hp=1;assert.equal(g.gather(n.id),true);g.s.player.z=72;advance(g,.9);assert.equal(n.hp,1);assert.equal(g.s.inventory.wood,wood+5);
});
test('saving during a swing does not repeat the attack on load',()=>{
 const {g,w}=fixture();g.attack();advance(g,.3);assert.equal(w.hp,30);
 g.s.nodes=new Survival().s.nodes;const restored=Survival.restore(g.serialize());assert.equal(restored.action,null);advance(restored,.1);assert.equal(restored.s.wolves[0].hp,30);
});
test('axe edge sweeps forward and down; spear thrust stays along its shaft',()=>{
 const rig=new FirstPersonRig(),{g}=fixture('axe');
 const sample=(tool,age)=>{g.s.equipped=tool;g.action={tool,kind:'attack',startedAt:0};g.s.elapsed=age;rig.update(g,1,{reduced:true});return rig.inspect();};
 const raised=sample('axe',.22),contact=sample('axe',ATTACKS.axe.impact);
 assert.ok(contact.tip[1]<raised.tip[1]-.25,'cutting edge moves down');assert.ok(contact.tip[2]<raised.tip[2]-.5,'cutting edge moves toward target');
 const direction=new T.Vector3(0,0,-1).applyEuler(new T.Euler(...contact.rotation));assert.ok(direction.z<-.65,'edge faces forward at contact');
 const loaded=sample('spear',.16),thrust=sample('spear',ATTACKS.spear.impact);
 assert.ok(thrust.tip[2]<loaded.tip[2]-.55,'tip extends into thrust');
 for(const pose of [loaded,thrust]){
  const axis=new T.Vector3(...pose.tip).sub(new T.Vector3(...pose.grip)).normalize(),support=new T.Vector3(...pose.support).sub(new T.Vector3(...pose.grip)).normalize();
  assert.ok(axis.dot(support)>.999,'both grips and spearhead share the shaft axis');assert.ok(axis.z<-.95,'spearhead points forward');
 }
 for(const tool of Object.keys(ATTACKS)){
  const end=actionPose(tool,'attack',ATTACKS[tool].duration),rest=restPose(tool);assert.ok([...end.p,...end.r].every((n,i)=>Math.abs(n-[...rest.p,...rest.r][i])<1e-10));
  for(let t=0;t<ATTACKS[tool].duration;t+=.01){const p=actionPose(tool,'attack',t);assert.ok([...p.p,...p.r].every(Number.isFinite));}
 }
});
test('wolf warns, commits a direction, bites once, and exposes a recovery window',()=>{
 const {g,w}=fixture('axe');w.z=66;w.state='chase';w.timer=0;advance(g,.01);assert.equal(w.state,'windup');
 advance(g,.6);assert.equal(g.s.player.health,100);assert.equal(w.z,66);
 advance(g,.24);assert.equal(g.s.player.health,84);assert.equal(w.biteDone,true);const after=w.z;
 advance(g,.25);assert.equal(w.state,'cooldown');assert.equal(g.s.player.health,84);assert.ok(w.z>after);
 const rest=w.z;advance(g,.7);assert.equal(w.z,rest);assert.equal(g.s.player.health,84);
});
test('sideways evasion works and a restored lunge cannot bite twice',()=>{
 const {g,w}=fixture('axe');w.z=66;w.state='chase';w.timer=0;advance(g,.05);const heading=w.facing;
 for(let i=0;i<85;i++)g.update(.01,{side:1});assert.equal(w.attackYaw,heading);assert.equal(g.s.player.health,100);
 const f=fixture('axe');f.w.z=66;f.w.state='lunge';f.w.timer=WOLF_MOTION.lunge-.17;f.w.attackYaw=0;f.w.biteDone=true;
 f.g.s.nodes=new Survival().s.nodes;const restored=Survival.restore(f.g.serialize());advance(restored,.1);assert.equal(restored.s.player.health,100);
});
test('wolf gait is driven by travel; idle feet are planted and death retains the body',()=>{
 const {g,w}=fixture();const rig=createWolfRig(w),flat=()=>0;w.state='idle';
 animateWolf(rig,w,g.s,.016,flat);const feet=rig.userData.legs.map(l=>l.paw.position.toArray());
 g.s.elapsed+=1;animateWolf(rig,w,g.s,.016,flat);assert.deepEqual(rig.userData.legs.map(l=>l.paw.position.toArray()),feet);
  w.state='chase';w.z+=.08;animateWolf(rig,w,g.s,.025,flat);assert.ok(rig.userData.legs.some((l,i)=>l.paw.position.z!==feet[i][2]));
 const moving=rig.userData.legs.map(l=>l.paw.position.toArray());animateWolf(rig,w,g.s,0,flat);assert.deepEqual(rig.userData.legs.map(l=>l.paw.position.toArray()),moving,'pause holds the current gait pose');
 w.hp=0;w.deadAt=g.s.elapsed;g.s.elapsed+=.6;animateWolf(rig,w,g.s,.016,flat);assert.ok(rig.userData.roll.rotation.z>1.4);assert.equal(rig.scale.x,1);assert.equal(rig.visible,true);
 w.looted=true;animateWolf(rig,w,g.s,.016,flat);assert.equal(rig.visible,false);
});
