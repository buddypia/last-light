import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ATTACKS,WOLF_MOTION,actionPose,restPose} from './motion.js';
const UP=new T.Vector3(0,1,0),v=(x=0,y=0,z=0)=>new T.Vector3(x,y,z),clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const material=(color,roughness=.9)=>new T.MeshStandardMaterial({color,roughness,flatShading:true});
const A={skin:material('#bd936c'),cuff:material('#685b43'),sleeve:material('#7d8c75'),wood:material('#927049'),end:material('#c1a172'),stone:material('#778987'),edge:material('#b9c3af'),cord:material('#b5a17a'),iron:material('#505b5a',.5)};
function mesh(g,m,parent,p=[0,0,0]){const o=new T.Mesh(g,m);o.position.fromArray(p);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
function ellipsoid(parent,m,p,scale){const o=mesh(new T.SphereGeometry(1,10,7),m,parent,p);o.scale.fromArray(scale);return o;}
function box(parent,m,p,size){return mesh(new T.BoxGeometry(...size),m,parent,p);}
function setBone(o,a,b){const d=b.clone().sub(a);o.position.copy(a).add(b).multiplyScalar(.5);o.scale.set(1,d.length(),1);o.quaternion.setFromUnitVectors(UP,d.normalize());}
function bone(parent,m,r1,r2){return mesh(new T.CylinderGeometry(r1,r2,1,8),m,parent);}
function beam(parent,m,a,b,r=.02){const o=bone(parent,m,r,r);setBone(o,v(...a),v(...b));return o;}
function joint(a,b,l1,l2,bend){
 const d=b.clone().sub(a),length=Math.max(.001,d.length()),dir=d.normalize();
 const x=clamp((length*length+l1*l1-l2*l2)/(2*length),0,l1),height=Math.sqrt(Math.max(0,l1*l1-x*x));
 const normal=bend.clone().addScaledVector(dir,-bend.dot(dir)).normalize();return a.clone().addScaledVector(dir,x).addScaledVector(normal,height);
}
function fuse(group){
 group.updateMatrixWorld(true);const batches=new Map(),original=[];
 group.traverse(o=>{if(o.isMesh){const geos=batches.get(o.material)||[];geos.push(o.geometry.clone().applyMatrix4(o.matrixWorld));batches.set(o.material,geos);original.push(o);}});
 original.forEach(o=>{o.removeFromParent();o.geometry.dispose();});
 for(const [m,geos]of batches){mesh(mergeGeometries(geos),m,group);geos.forEach(g=>g.dispose());}
}
function fuseStatic(group){
 // Batch the rigid surfaces of a joint, retaining its animated child joints.
 const rigid=new T.Group();for(const child of [...group.children])if(child.isMesh)rigid.add(child);
 if(!rigid.children.length)return;fuse(rigid);while(rigid.children.length)group.add(rigid.children[0]);
}
function hand(side=1,open=false){
 const g=new T.Group();ellipsoid(g,A.skin,[side*.058,0,.022],[.065,.098,.047]);
 for(let i=0;i<4;i++){
  const y=.059-i*.04,start=[side*.082,y,-.011];
  const middle=open?[side*.036,y,-.09]:[side*.005,y,-.053],end=open?[side*.022,y,-.17]:[-side*.028,y,.004];
  beam(g,A.skin,start,middle,.017);ellipsoid(g,A.skin,middle,[.018,.018,.018]);beam(g,A.skin,middle,end,.015);
 }
 beam(g,A.skin,[side*.081,.088,.04],[side*.015,.068,.068],.021);beam(g,A.skin,[side*.015,.068,.068],[-side*.022,.025,.062],.018);
 fuse(g);return g;
}
function axeHead(){
 // Handle is +Y; the sharpened cutting edge faces local -Z, the direction of the chop.
 const outline=[[-.32,.43],[-.37,.57],[-.31,.75],[.05,.68],[.11,.57],[.05,.45]],vertices=[];
 for(const x of [-1,1])for(const [z,y]of outline)vertices.push(x*(z<-.3?.012:.085),y,z);
 const indices=[];for(let i=1;i<5;i++)indices.push(0,i+1,i,6,6+i,7+i);for(let i=0;i<6;i++){const j=(i+1)%6;indices.push(i,j,j+6,i,j+6,i+6);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
export class FirstPersonRig{
 constructor(){
  this.scene=new T.Scene();this.camera=new T.PerspectiveCamera(68,1,.025,5);this.root=new T.Group();this.scene.add(this.root);
  this.light=new T.HemisphereLight('#ecedd8','#5b6253',2.2);this.scene.add(this.light);const key=new T.DirectionalLight('#ffdeaa',2.2);key.position.set(-3,6,3);this.scene.add(key);
  this.grip=new T.Group();this.root.add(this.grip);this.tools={};
  const axe=new T.Group();beam(axe,A.wood,[0,-.26,0],[0,.67,0],.032);
  const head=new T.Group();head.position.y=.59;head.scale.set(.85,.76,.76);axe.add(head);const stone=mesh(axeHead(),A.stone,head);stone.position.y=-.59;
  beam(head,A.edge,[0,-.16,-.32],[0,-.02,-.37],.012);beam(head,A.edge,[0,-.02,-.37],[0,.16,-.31],.011);
  for(let i=0;i<3;i++){
   const y=.55+i*.032,loop=[[-.064,y,.070],[-.064,y,-.09],[-.049,y,-.117],[.049,y,-.117],[.064,y,-.09],[.064,y,.070],[.035,y,.088],[-.035,y,.088]];
   loop.forEach((p,j)=>beam(axe,A.cord,p,loop[(j+1)%loop.length],.008));
  }
  const spear=new T.Group();beam(spear,A.wood,[0,-.65,0],[0,1.23,0],.023);
  const tip=mesh(new T.OctahedronGeometry(1),A.stone,spear,[0,1.40,0]);tip.scale.set(.07,.29,.043);
  for(let i=0;i<5;i++){const band=mesh(new T.TorusGeometry(.029,.007,4,8),A.cord,spear,[0,1.14+i*.024,0]);band.rotation.x=Math.PI/2;}
  fuse(axe);fuse(spear);
  const torch=new T.Group();beam(torch,A.wood,[0,-.28,0],[0,.52,0],.037);mesh(new T.CylinderGeometry(.075,.055,.2,9),A.cord,torch,[0,.5,0]);
  this.flame=mesh(new T.ConeGeometry(.085,.30,7),new T.MeshBasicMaterial({color:'#ffc575'}),torch,[0,.73,0]);this.flameCore=mesh(new T.ConeGeometry(.04,.22,6),new T.MeshBasicMaterial({color:'#fff0b4'}),torch,[.006,.69,.007]);
  for(const [id,model]of Object.entries({axe,spear,torch})){this.tools[id]=model;this.grip.add(model);}
  this.right=hand(1);this.openHand=hand(1,true);this.grip.add(this.right,this.openHand);
  this.leftGrip=new T.Group();this.leftGrip.add(hand(-1));this.root.add(this.leftGrip);
  this.arms=[1,-1].map(side=>({side,upper:bone(this.root,A.sleeve,.089,.103),fore:bone(this.root,A.sleeve,.056,.087),elbow:ellipsoid(this.root,A.sleeve,[0,0,0],[.087,.09,.087]),cuff:bone(this.root,A.cuff,.059,.065)}));
  this.equipped='hands';this.drawAge=1;this.lastYaw=null;
 }
 update(game,dt,{moving=false,running=false,reduced=false,title=false}={}){
  const s=game.s,a=game.action,tool=a?.tool||s.equipped,age=a?s.elapsed-a.startedAt:0;
  this.root.visible=!title;if(title)return;
  if(tool!==this.equipped){this.equipped=tool;this.drawAge=0;}this.drawAge+=dt;
  const pose=a?actionPose(tool,a.kind,age):restPose(tool),walk=s.stats.distance*(running?2.9:3.5),bob=moving&&!reduced?Math.sin(walk)*.013:0,breath=reduced?0:Math.sin(s.elapsed*1.8)*.003;
  const yawDelta=this.lastYaw===null?0:Math.atan2(Math.sin(s.player.yaw-this.lastYaw),Math.cos(s.player.yaw-this.lastYaw));this.lastYaw=s.player.yaw;
  const draw=1-clamp(this.drawAge/.24,0,1),recoil=clamp(1-(s.elapsed-s.lastHurt)/.3,0,1);
  this.grip.position.fromArray(pose.p);this.grip.position.y+=bob+breath-draw*.28;this.grip.position.z+=draw*.18+recoil*.04;
  this.grip.rotation.set(...pose.r);if(!reduced)this.grip.rotation.z+=clamp(-yawDelta*2,-.08,.08)+(moving?Math.cos(walk*.5)*.017:0);this.grip.updateMatrixWorld(true);
  for(const [id,model]of Object.entries(this.tools))model.visible=id===tool&&a?.kind!=='pickup';
  this.openHand.visible=a?.kind==='pickup';this.right.visible=!this.openHand.visible;
  this.leftGrip.visible=tool==='spear'&&a?.kind!=='pickup';
  const leftLocal=v(0,pose.support,0);this.leftGrip.position.copy(leftLocal.applyMatrix4(this.grip.matrixWorld));this.leftGrip.quaternion.copy(this.grip.quaternion);
  for(const arm of this.arms){
   const left=arm.side<0;for(const o of [arm.upper,arm.fore,arm.elbow,arm.cuff])o.visible=!left||this.leftGrip.visible;if(left&&!this.leftGrip.visible)continue;
   const grip=left?this.leftGrip:this.grip;
   const wrist=v(arm.side*.065,-.075,.018).applyQuaternion(grip.quaternion).add(grip.position),shoulder=v(arm.side*.31,-.52,-.04);
   // A forward shoulder roll follows the spear's extension, keeping both arms connected.
   if(left&&tool==='spear')shoulder.z-=.15+Math.max(0,-this.grip.position.z-.55)*.45;
   const elbow=joint(shoulder,wrist,.46,.48,v(arm.side,-.6,.18));setBone(arm.upper,shoulder,elbow);setBone(arm.fore,elbow,wrist);arm.elbow.position.copy(elbow);
   const toward=elbow.clone().sub(wrist).normalize();setBone(arm.cuff,wrist,wrist.clone().addScaledVector(toward,.075));
  }
  this.flame.scale.set(1+Math.sin(s.elapsed*17)*.12,1+Math.sin(s.elapsed*13)*.19,1);this.flameCore.scale.y=1+Math.sin(s.elapsed*19)*.15;
  this.flame.visible=this.flameCore.visible=s.torchFuel>0;
  this.light.intensity=game.night?1.15:2.2;
 }
 resize(aspect){this.camera.aspect=aspect;this.camera.updateProjectionMatrix();}
 inspect(){this.grip.updateMatrixWorld(true);const tip=this.equipped==='spear'?v(0,1.69,0):v(0,.59,-.266);return {tool:this.equipped,grip:this.grip.position.toArray(),rotation:this.grip.rotation.toArray().slice(0,3),tip:tip.applyMatrix4(this.grip.matrixWorld).toArray(),support:this.leftGrip.visible?this.leftGrip.position.toArray():null};}
}

export function createWolfRig(w){
 const g=new T.Group(),coat=material(w.phase%4<2?'#807d6d':'#69777a'),dark=material('#535e56'),cream=material('#b7b39c'),nose=material('#192628',.5),inner=material('#936f60'),tooth=material('#dfd8bb'),eye=new T.MeshBasicMaterial({color:'#d3ae5e'});
 const body=new T.Group();g.add(body);ellipsoid(body,coat,[0,1.0,-.05],[.32,.36,.72]);ellipsoid(body,dark,[0,1.12,.38],[.37,.44,.38]);ellipsoid(body,coat,[0,.97,-.48],[.31,.34,.35]);ellipsoid(body,cream,[0,.92,.48],[.25,.30,.25]);
 for(let i=0;i<5;i++){const tuft=mesh(new T.ConeGeometry(.12,.27,4),dark,body,[0,1.45-i*.025,.44-i*.14]);tuft.rotation.x=-.5;}
 const neck=new T.Group();neck.position.set(0,1.23,.52);body.add(neck);ellipsoid(neck,coat,[0,.02,.02],[.27,.35,.29]);
 const head=new T.Group();head.position.set(0,.22,.22);neck.add(head);ellipsoid(head,coat,[0,0,0],[.255,.23,.29]);ellipsoid(head,cream,[0,-.075,.27],[.165,.105,.29]);ellipsoid(head,nose,[0,-.025,.52],[.118,.072,.061]);
 const jaw=new T.Group();jaw.position.set(0,-.15,.02);head.add(jaw);ellipsoid(jaw,cream,[0,-.022,.25],[.14,.055,.26]);box(jaw,nose,[0,.017,.25],[.20,.015,.36]);
 for(const side of [-1,1])for(const z of [.16,.31]){const fang=mesh(new T.ConeGeometry(.022,.06,5),tooth,head,[side*.116,-.14,z]);fang.rotation.z=Math.PI;}
 const ears=[];for(const side of [-1,1]){const ear=new T.Group();ear.position.set(side*.175,.16,-.075);head.add(ear);const o=mesh(new T.ConeGeometry(.11,.31,4),dark,ear,[0,.10,0]);o.scale.z=.55;const inset=mesh(new T.ConeGeometry(.075,.20,3),inner,ear,[0,.105,.037]);inset.scale.z=.25;ears.push(ear);ellipsoid(head,dark,[side*.193,.052,.172],[.088,.052,.05]);ellipsoid(head,eye,[side*.20,.035,.206],[.033,.024,.020]);ellipsoid(head,nose,[side*.201,.036,.225],[.012,.014,.008]);}
 const tail=new T.Group();tail.position.set(0,1.00,-.68);body.add(tail);const tailEnd=new T.Group();tailEnd.position.set(0,-.13,-.35);tail.add(tailEnd);beam(tail,dark,[0,0,0],[0,-.13,-.35],.11);beam(tailEnd,coat,[0,0,0],[0,-.23,-.36],.09);ellipsoid(tailEnd,dark,[0,-.23,-.36],[.073,.075,.12]);
 const legs=[];for(const side of [-1,1])for(const front of [true,false]){const hip=v(side*.255,front?1.04:.95,front?.43:-.48);const upper=bone(g,coat,front?.08:.095,front?.10:.14),lower=bone(g,dark,.054,.074),ankle=bone(g,cream,.048,.054),knee=ellipsoid(g,coat,[0,0,0],[.077,.081,.081]),paw=ellipsoid(g,dark,[0,0,0],[.09,.085,.15]);legs.push({side,front,hip,upper,lower,ankle,knee,paw});}
 for(const joint of [body,neck,head,jaw,...ears,tail,tailEnd])fuseStatic(joint);
 const skeleton=new T.Group();while(g.children.length)skeleton.add(g.children[0]);skeleton.position.y=-.82;const roll=new T.Group();roll.position.y=.82;roll.add(skeleton);g.add(roll);
 g.userData={roll,body,neck,head,jaw,ears,tail,tailEnd,legs,stride:0,lastX:w.x,lastZ:w.z,heading:w.facing||0};return g;
}
export function animateWolf(g,w,s,dt,terrain){
 const d=g.userData,travel=Math.hypot(w.x-d.lastX,w.z-d.lastZ);if(dt>0)d.speed=Math.min(7,travel/dt);const speed=d.speed||0;d.lastX=w.x;d.lastZ=w.z;if(travel<2)d.stride+=travel*(speed>1.5?3.8:5.1);
 const t=s.elapsed,dead=w.hp<=0,fall=dead?clamp((t-w.deadAt)/.48,0,1):0,wind=w.state==='windup'?1-clamp(w.timer/WOLF_MOTION.windup,0,1):0,lunge=w.state==='lunge'?Math.sin(clamp(1-w.timer/WOLF_MOTION.lunge,0,1)*Math.PI):0;
 const crouch=w.state==='windup'?.12+wind*.13:w.state==='lunge'?.06:0,bob=speed>.15?Math.sin(d.stride*2)*.035:Math.sin(t*2+w.phase)*.008;
 g.visible=!w.looted;g.position.set(w.x,terrain(w.x,w.z),w.z);
 const facing=Number.isFinite(w.facing)?w.facing:Math.atan2(s.player.x-w.x,s.player.z-w.z),diff=Math.atan2(Math.sin(facing-d.heading),Math.cos(facing-d.heading));if(dt>0)d.heading+=diff*Math.min(1,dt*12);
 g.rotation.set(0,d.heading,0);d.body.position.set(0,bob-crouch+lunge*.10,0);d.body.rotation.set(-lunge*.13,0,0);
 d.neck.rotation.x=wind*.33-lunge*.18;d.head.rotation.x=w.state==='idle'?.10+Math.sin(t*.9)*.08:wind*.13;d.head.rotation.y=w.state==='idle'?Math.sin(t*.55+w.phase)*.14:0;
 d.jaw.rotation.x=w.state==='lunge'?.75:w.state==='windup'?.35: speed>2?.18:0;d.ears.forEach((ear,i)=>{ear.rotation.x=wind*.6+(w.state==='flee'?.55:0);ear.rotation.z=(i?1:-1)*(.16+Math.sin(t*1.7+w.phase+i)*.025);});
 d.tail.rotation.y=Math.sin(t*2.5+w.phase)*.12;d.tail.rotation.x=w.state==='chase'?-.16:w.state==='flee'?.22:.08;d.tailEnd.rotation.y=Math.sin(t*2.5+w.phase-.7)*.1;
 const hurt=Number.isFinite(w.hurtAt)?clamp(1-(t-w.hurtAt)/.3,0,1):0;d.body.rotation.z=hurt*.10;d.neck.rotation.x+=hurt*.15;
 for(let i=0;i<d.legs.length;i++){
  const leg=d.legs[i],phase=(d.stride/(Math.PI*2)+(i===0||i===3?0:.5))%1,walking=speed>.12&&!['windup','stunned','cooldown'].includes(w.state),stance=phase<.62;
  let step=walking?(stance?.28-.56*phase/.62:-.28+.56*(phase-.62)/.38):0,lift=walking&&!stance?Math.sin((phase-.62)/.38*Math.PI)*.20:0;
  if(w.state==='lunge'){step=(leg.front?.30:-.25)*lunge;lift=(leg.front?.18:.08)*lunge;}
  const hip=leg.hip.clone();hip.y+=bob-crouch+lunge*.1;
  const paw=v(hip.x,.095+lift,hip.z+step+.055),sin=Math.sin(d.heading),cos=Math.cos(d.heading),wx=w.x+paw.x*cos+paw.z*sin,wz=w.z-paw.x*sin+paw.z*cos;
  paw.y+=clamp(terrain(wx,wz)-terrain(w.x,w.z),-.25,.25);if(dead)paw.lerp(hip.clone().add(v(leg.side*.12,-.30,.16)),fall);
  const hock=paw.clone().add(v(0,leg.front?.13:.21,leg.front?-.03:-.13)),knee=joint(hip,hock,leg.front?.43:.43,leg.front?.45:.38,v(0,0,leg.front?-1:1));
  setBone(leg.upper,hip,knee);setBone(leg.lower,knee,hock);setBone(leg.ankle,hock,paw);leg.knee.position.copy(knee);leg.paw.position.copy(paw);
 }
 d.roll.rotation.z=fall*1.48;d.roll.position.y=.82-fall*.40;if(dead){d.neck.rotation.x=.2;d.jaw.rotation.x=.22;}
}
