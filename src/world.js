import * as T from 'three';
import {FirstPersonRig,createWolfRig,animateWolf} from './actors.js';
import {terrain,rng,LANDMARKS,SCENERY_ROCKS,clamp} from './simulation.js';
import {SITES} from './content.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const UP=new T.Vector3(0,1,0), dummy=new T.Object3D();
const mat=(color,roughness=1,metalness=0)=>new T.MeshStandardMaterial({color,roughness,metalness,flatShading:true});
const M={bark:mat('#584e3e'),wood:mat('#a48b61'),end:mat('#d4b886'),pine:mat('#386951'),pineDark:mat('#294f40'),pineLight:mat('#688670'),rock:mat('#667b7b'),rockDark:mat('#3a5054'),sand:mat('#c4b288'),iron:mat('#434d4d',.57,.65),rust:mat('#9a5036',.88,.35),cloth:mat('#b3aa83'),rope:mat('#a1946d'),gold:mat('#f0b863',.5,.2),red:mat('#a74830'),black:mat('#101c20'),leaf:mat('#677d4f'),berry:mat('#c17645'),bone:mat('#ddd2b0'),fur:mat('#717777'),furDark:mat('#39474c')};
function mesh(g,m,parent,x=0,y=0,z=0){const a=new T.Mesh(g,m);a.position.set(x,y,z);a.castShadow=true;a.receiveShadow=true;if(parent)parent.add(a);return a;}
function box(parent,m,x,y,z,w,h,d){return mesh(new T.BoxGeometry(w,h,d),m,parent,x,y,z);}
function cylinder(parent,m,x,y,z,r1,r2,h,n=8){return mesh(new T.CylinderGeometry(r1,r2,h,n),m,parent,x,y,z);}
function beam(parent,m,a,b,r=.06){const va=new T.Vector3(...a),vb=new T.Vector3(...b),d=vb.clone().sub(va);const v=cylinder(parent,m,...va.clone().add(vb).multiplyScalar(.5).toArray(),r,r,d.length(),6);v.quaternion.setFromUnitVectors(UP,d.normalize());return v;}
function rock(parent,x,y,z,sx,sy,sz,m=M.rock){const a=mesh(new T.DodecahedronGeometry(1,0),m,parent,x,y,z);a.scale.set(sx,sy,sz);a.rotation.set(.2+x,.5+z,.1);return a;}
function flag(parent,x,y,z,w,h,color){const g=new T.PlaneGeometry(w,h,8,3);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)*4+p.getY(i)*3)*.09);g.computeVertexNormals();const a=mesh(g,new T.MeshStandardMaterial({color,side:T.DoubleSide,roughness:1}),parent,x,y,z);return a;}
function label(text,color='#eddbb4'){
 const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.fillStyle='#24393b';ctx.fillRect(0,0,512,128);ctx.strokeStyle='#b4a889';ctx.lineWidth=5;ctx.strokeRect(7,7,498,114);ctx.fillStyle=color;ctx.font='bold 44px monospace';ctx.textAlign='center';ctx.fillText(text,256,80);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;return new T.MeshBasicMaterial({map:tex});
}
// Layered boughs have irregular needle edges, rather than smooth cone silhouettes.
function pineCrown(){
 const geos=[],rand=rng(84);
 for(let tier=0;tier<7;tier++){
  const radius=3.3-tier*.39,height=2.6-tier*.12;
  const geo=new T.ConeGeometry(radius,height,11,2),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x);const rough=1+Math.sin(a*7+tier)*.12;const below=y<height*.3;p.setXYZ(i,x*rough+(tier%2?.13:-.13),y+(below?Math.sin(a*5+tier)*.25:0),z*rough);}
  geo.translate(0,tier*1.1,0);geo.computeVertexNormals();geos.push(geo);
 }
 const combined=mergeGeometries(geos);geos.forEach(g=>g.dispose());return combined;
}
function grassBlades(){
 const verts=[];
 for(let i=0;i<4;i++){const a=i*2.4,s=Math.sin(a),c=Math.cos(a),h=.38+i*.09,w=.038;verts.push(-c*w,0,-s*w,c*w,0,s*w,c*.07,h,s*.07);verts.push(c*w,0,s*w,-c*w,0,-s*w,c*.07,h,s*.07);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(verts,3));g.computeVertexNormals();return g;
}
function plantLeaves(){const geos=[];for(let i=0;i<7;i++){const a=i*2.4;const g=new T.SphereGeometry(.35,5,3);g.scale(.3,1.8,.13);g.rotateZ(.6);g.rotateY(a);g.translate(Math.sin(a)*.16,.42,Math.cos(a)*.16);geos.push(g);}const g=mergeGeometries(geos);geos.forEach(x=>x.dispose());return g;}
export function structureModel(type,ghost=false){
 const g=new T.Group();
 if(type==='fire'){
  for(let i=0;i<10;i++){const a=i*Math.PI/5;rock(g,Math.cos(a)*.72,.17,Math.sin(a)*.72,.24,.2,.22,M.rockDark);}
  for(let i=0;i<4;i++){const a=i*Math.PI/2;beam(g,M.bark,[-Math.cos(a)*.6,.16,-Math.sin(a)*.6],[Math.cos(a)*.6,.28,Math.sin(a)*.6],.13);}
  const flames=new T.Group();g.add(flames);g.userData.flames=flames;
  for(let i=0;i<5;i++){const f=mesh(new T.ConeGeometry(.23,.9,5),new T.MeshBasicMaterial({color:i%2?'#ffc774':'#f57b2e',transparent:true,opacity:.86}),flames,Math.sin(i)*.21,.63,Math.cos(i)*.2);f.rotation.z=(i-2)*.15;}
  const light=new T.PointLight('#ffb35d',16,14,2);light.position.y=1.2;g.add(light);g.userData.light=light;
 }else if(type==='shelter'){
  beam(g,M.bark,[-1.7,0,-1],[0,2.8,-1],.1);beam(g,M.bark,[1.7,0,-1],[0,2.8,-1],.1);beam(g,M.bark,[-1.7,0,1.5],[0,2.8,1.5],.1);beam(g,M.bark,[1.7,0,1.5],[0,2.8,1.5],.1);beam(g,M.bark,[0,2.8,-1.3],[0,2.8,1.8],.12);
  for(const side of [-1,1]){const a=box(g,M.cloth,side*.86,1.4,.2,.1,3.3,3);a.rotation.z=side*.55;for(let i=0;i<5;i++)beam(g,M.rope,[side*1.68,.03,-1+i*.6],[side*.03,2.82,-1+i*.6],.017);}
  box(g,M.pineDark,0,.1,.1,1.6,.2,2.2);box(g,M.cloth,0,.25,-.7,1.2,.24,.4);
 }else if(type==='collector'){
  for(const x of [-.8,.8])for(const z of [-.8,.8])beam(g,M.wood,[x,0,z],[x,2.2,z],.065);
  cylinder(g,M.iron,0,.5,0,.52,.45,1,12);const tarp=mesh(new T.ConeGeometry(1.35,.5,4,1,true),new T.MeshStandardMaterial({color:'#919c98',side:T.DoubleSide,roughness:.9}),g,0,1.9,0);tarp.rotation.z=Math.PI;tarp.rotation.y=Math.PI/4;
  cylinder(g,M.rope,0,1.35,0,.065,.065,.7,6);
 }
 if(ghost)g.traverse(o=>{if(o.isMesh){o.material=new T.MeshBasicMaterial({color:'#98ddb1',wireframe:true,transparent:true,opacity:.6});o.castShadow=false;}if(o.isLight)o.visible=false;});return g;
}
export class Island {
 constructor(canvas,state){
  this.renderer=new T.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(innerWidth,innerHeight);this.renderer.info.autoReset=false;this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.13;
  this.scene=new T.Scene();this.scene.fog=new T.FogExp2('#94b6b6',.008);this.camera=new T.PerspectiveCamera(68,innerWidth/innerHeight,.1,650);this.camera.rotation.order='YXZ';
  this.hemi=new T.HemisphereLight('#d6e9ef','#776c53',2);this.scene.add(this.hemi);this.sun=new T.DirectionalLight('#ffe0a3',3.1);this.sun.position.set(-60,95,30);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-100,right:100,top:100,bottom:-100,near:1,far:250});this.sun.shadow.normalBias=.06;this.sun.shadow.bias=-.0002;this.scene.add(this.sun);
  this.moon=new T.DirectionalLight('#93bccd',.2);this.moon.position.set(40,65,-60);this.scene.add(this.moon);
  this.nodeStates=new Map();this.dynamicNodes=new Map();this.buildings=new Map();this.wolfModels=new Map();this.landmarkModels=new Map();this.tmpColor=new T.Color();
  this.createSky();this.createTerrain();this.createOcean();this.createNodes(state.nodes);this.createLandmarks();this.createExpansion();this.createDetails();this.createRain();this.createTool();this.createRescueBoat();
  this.ghost=null;this.time=0;this.quality='high';this.particles=[];
 }
 createSky(){
  this.sky=mesh(new T.SphereGeometry(490,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,uniforms:{top:{value:new T.Color('#48879c')},bottom:{value:new T.Color('#d0d9bf')}},vertexShader:'varying vec3 v; void main(){v=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 v; uniform vec3 top; uniform vec3 bottom;void main(){float h=clamp(normalize(v).y*1.5,0.,1.);gl_FragColor=vec4(mix(bottom,top,pow(h,.65)),1.);}'}),this.scene);
  this.sunDisk=mesh(new T.SphereGeometry(8,12,8),new T.MeshBasicMaterial({color:'#ffe4ae',fog:false}),this.scene,-190,145,-260);
  const rand=rng(78);this.clouds=new T.Group();this.scene.add(this.clouds);const cm=new T.MeshLambertMaterial({color:'#c4d4d3',transparent:false});
  for(let i=0;i<14;i++){const a=i*2.4,r=150+rand()*160;const group=new T.Group();group.position.set(Math.sin(a)*r,65+rand()*35,Math.cos(a)*r);for(let j=0;j<3;j++){const c=mesh(new T.IcosahedronGeometry(1,1),cm,group,j*12,rand()*3,0);c.scale.set(15+rand()*10,6+rand()*3,10+rand()*4);c.castShadow=false;}this.clouds.add(group);}
 }
 createTerrain(){
  const g=new T.PlaneGeometry(250,250,140,140);g.rotateX(-Math.PI/2);const p=g.attributes.position,colors=[],c=new T.Color(),green=new T.Color('#617558'),sand=new T.Color('#b9ac87'),dirt=new T.Color('#8c8262');
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),h=terrain(x,z);p.setY(i,h);c.copy(h<.9?sand:green);const path=Math.abs(x-Math.sin(z*.07)*3);if(path<2.3&&z<67&&z> -32)c.lerp(dirt,.78);const noise=Math.sin(x*3.3+z*2.7)*.025+Math.cos(z*.73-x*1.3)*.045;c.offsetHSL(0,0,noise);colors.push(c.r,c.g,c.b);}g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();const ground=mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:1,flatShading:false}),this.scene);ground.castShadow=false;
 }
 createOcean(){
  this.water=mesh(new T.PlaneGeometry(1800,1800,1,1),new T.ShaderMaterial({transparent:true,uniforms:{time:{value:0},light:{value:1}},vertexShader:'varying vec3 wp;void main(){wp=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*viewMatrix*vec4(wp,1.);}',fragmentShader:`varying vec3 wp; uniform float time; uniform float light; void main(){float w=sin(wp.x*.28+time*.8+sin(wp.z*.2))*sin(wp.z*.32-time*.65);float line=pow(max(0.,sin(wp.x*.4+wp.z*.65+time*1.1)),24.);vec3 base=mix(vec3(.12,.31,.34),vec3(.29,.54,.52),w*.2+.5);float foam=smoothstep(.70,.96,sin(length(wp.xz)*.66-time*.9))* (1.-smoothstep(84.,95.,length(wp.xz)));gl_FragColor=vec4((base+line*.055+foam*.12)*light,.91);}`}),this.scene,0,-.85,0);this.water.rotation.x=-Math.PI/2;this.water.castShadow=false;this.water.receiveShadow=false;
 }
 createNodes(nodes){
  const byType={};nodes.forEach(n=>(byType[n.type]??=[]).push(n));this.instances={};
  for(const[type,items]of Object.entries(byType)){
   const parts=type==='tree'?[[new T.CylinderGeometry(.12,.4,9,9),M.bark,[0,4.5,0]],[pineCrown(),M.pine,[0,4.2,0]]]:
    type==='rock'?[[new T.DodecahedronGeometry(1.25,0),M.rock,[0,.58,0]]]:type==='wood'?[[new T.CylinderGeometry(.14,.19,1.8,7).rotateX(Math.PI/2),M.bark,[0,.17,0]],[new T.SphereGeometry(.145,7,4),M.end,[-.65,.17,-.63]]]:type==='stone'?[[new T.DodecahedronGeometry(.35,0),M.rock,[0,.17,0]]]:type==='fiber'?[[plantLeaves(),M.leaf,[0,.12,0]]]:type==='berries'?[[new T.IcosahedronGeometry(.8,0),M.pine,[0,.65,0]],[new T.IcosahedronGeometry(.16,0),M.berry,[.3,1.27,.25]],[new T.IcosahedronGeometry(.15,0),M.berry,[-.3,1.16,0]],[new T.IcosahedronGeometry(.13,0),M.berry,[.1,1.13,-.4]]]:[[new T.BoxGeometry(.5,.13,.8),M.rust,[0,.12,0]]];
   this.instances[type]=parts.map(([geo,material,offset])=>{const inst=new T.InstancedMesh(geo,material,items.length);inst.castShadow=true;inst.receiveShadow=true;inst.instanceMatrix.setUsage(T.DynamicDrawUsage);this.scene.add(inst);return {inst,offset};});
   items.forEach((n,i)=>{this.dynamicNodes.set(n.id,{index:i,type,scale:type==='tree'?.8+(i%7)*.065:1});this.nodeStates.set(n.id,-1);});
  }
  this.syncNodes(nodes);
 }
 syncNodes(nodes){for(const n of nodes){const visible=n.hp>0?1:0;if(this.nodeStates.get(n.id)===visible)continue;this.nodeStates.set(n.id,visible);const d=this.dynamicNodes.get(n.id);for(const{inst,offset}of this.instances[d.type]){dummy.position.set(n.x+offset[0]*d.scale,terrain(n.x,n.z)+offset[1]*d.scale,n.z+offset[2]*d.scale);dummy.scale.setScalar(visible?d.scale:0);dummy.rotation.set(0,n.type==='wood'?.8:n.x*.37,0);dummy.updateMatrix();inst.setMatrixAt(d.index,dummy.matrix);inst.instanceMatrix.needsUpdate=true;inst.computeBoundingSphere();}}}
 createLandmarks(){
  for(const l of LANDMARKS){const g=new T.Group();g.position.set(l.x,terrain(l.x,l.z),l.z);this.scene.add(g);this.landmarkModels.set(l.id,g);
   if(l.id==='radio'){
    for(const x of [-1.3,1.3])for(const z of [-1.3,1.3]){beam(g,M.iron,[x,0,z-3],[x*.25,20,z*.25-3],.095);box(g,M.rock,x,0,z-3,.7,.35,.7);}
    for(let i=0;i<8;i++){const y=i*2.5,wide=1.3-y*.05,next=1.3-(y+2.5)*.05,m=i%2?M.cloth:M.red;for(const z of [-1,1]){beam(g,m,[-wide,y,z*wide-3],[next,y+2.5,z*next-3],.07);beam(g,m,[wide,y,z*wide-3],[-next,y+2.5,z*next-3],.07);}beam(g,M.iron,[-wide,y,-wide-3],[wide,y,-wide-3],.07);}
    beam(g,M.iron,[0,19,-3],[0,25,-3],.07);beam(g,M.iron,[-2.3,22,-3],[2.3,22,-3],.045);beam(g,M.rope,[0,17,-3],[-8,0,-8],.018);beam(g,M.rope,[0,17,-3],[8,0,3],.018);
    box(g,M.iron,0,.7,0,1.6,1.4,1);box(g,M.gold,0,1.05,.515,1.3,.5,.025);const screen=box(g,new T.MeshStandardMaterial({color:'#1d473c',emissive:'#3bb18a',emissiveIntensity:.5}),-.25,1.09,.54,.65,.3,.025);g.userData.screen=screen;
    for(let i=0;i<3;i++)cylinder(g,M.black,.4,.98+i*.15,.54,.05,.05,.08,8).rotation.x=Math.PI/2;beam(g,M.iron,[-.4,1.4,0],[-.4,2.2,0],.02);const sign=box(g,label('SIGNAL 04'),0,2,-1.7,2.4,.6,.1);sign.rotation.y=0;
    this.signalLight=new T.PointLight('#ffb155',0,35);this.signalLight.position.set(l.x,terrain(l.x,l.z)+22,l.z-3);this.scene.add(this.signalLight);
   }else if(l.id==='wreck'){
    const boat=new T.Group();boat.position.set(0,-.3,-8);boat.rotation.set(.12,-.5,-.12);g.add(boat);
    const shape=new T.Shape();shape.moveTo(-2.6,-5);shape.lineTo(-2.6,3);shape.quadraticCurveTo(-2.4,6,0,7.5);shape.quadraticCurveTo(2.4,6,2.6,3);shape.lineTo(2.6,-5);shape.closePath();const hull=mesh(new T.ExtrudeGeometry(shape,{depth:1.6,bevelEnabled:true,bevelSize:.25,bevelThickness:.3,bevelSegments:1,steps:1}),M.rust,boat);hull.rotation.x=Math.PI/2;hull.position.y=1.2;
    box(boat,M.wood,0,1.28,0,4.6,.13,8);for(const side of [-1,1]){box(boat,M.rust,side*2.35,1.45,-1, .22,.65,8);for(let r=0;r<6;r++)box(boat,M.iron,side*2.47,1.1,-4+r*1.3,.05,.9,.1);}for(let i=-3;i<=3;i++)box(boat,M.bark,0,1.37,i,4.5,.03,.045);
    box(boat,M.cloth,0,2.35,-2,3,2,2.7);box(boat,M.iron,0,3.42,-2,3.3,.15,3);box(boat,M.black,0,2.6,-.62,2.3,.8,.03);
    for(const x of [-2.3,2.3]){beam(boat,M.iron,[x,1.4,-4],[x,2.3,-4]);beam(boat,M.iron,[x,1.4,3],[x,2.3,3]);beam(boat,M.iron,[x,2.3,-4],[x,2.3,3],.04);}
    beam(boat,M.bark,[.2,1.3,2],[.2,8,2],.12);beam(boat,M.rope,[.2,7.8,2],[-2.2,1.4,4],.02);flag(boat,.8,6.3,2,1.3,.7,'#cfc5a0');box(boat,label('NORTH 17'),0,2.35,-3.39,2.5,.55,.03).rotation.y=Math.PI;
    this.supplyBox(g);
   }else if(l.id==='cave'){
    const wall=rock(g,0,3,-6.5,7,5,3,M.rockDark);wall.rotation.set(0,0,0);for(const x of [-3.2,3.2])rock(g,x,2.2,0,2,3.2,2.5);rock(g,0,5,0,4,1.6,2.5);box(g,M.black,0,1.7,-.8,3.6,3.3,.2);beam(g,M.bark,[-2,0,.5],[-2,3.8,.5],.18);beam(g,M.bark,[2,0,.5],[2,3.8,.5],.18);beam(g,M.bark,[-2.2,3.8,.5],[2.2,3.8,.5],.2);box(g,M.wood,0,.12,1,3,.1,2);this.supplyBox(g);g.children[g.children.length-1].position.set(.1,0,1.5);
    box(g,label('MINE / 03'),0,4,.75,2.8,.65,.1);
   }else if(l.id==='station'){
    for(const x of [-3,3])for(const z of [-4,0])beam(g,M.bark,[x,0,z],[x,3,z],.14);
    box(g,M.wood,0,.1,-2,6.7,.2,5.4);box(g,M.pineDark,0,1.5,-4.1,6.3,3,.18);box(g,M.wood,3,1.1,-2,.18,2.2,4);box(g,M.wood,-3,1.1,-2,.18,2.2,4);
    for(const side of [-1,1]){const roof=box(g,M.rust,side*1.65,3.5,-2,3.5,.16,5.5);roof.rotation.z=side*-.32;for(let j=0;j<9;j++){const seam=box(g,M.iron,side*1.65,3.63,-4.3+j*.58,3.5,.025,.035);seam.rotation.z=side*-.32;}}
    beam(g,M.iron,[4,0,-2],[4,9,-2],.08);const rotor=new T.Group();rotor.position.set(4,9,-2);g.add(rotor);for(let i=0;i<3;i++){const a=i*2*Math.PI/3;beam(rotor,M.iron,[0,0,0],[Math.cos(a)*1.4,0,Math.sin(a)*1.4],.025);const cup=mesh(new T.SphereGeometry(.28,8,4,0,Math.PI),M.iron,rotor,Math.cos(a)*1.4,0,Math.sin(a)*1.4);cup.rotation.y=-a;}g.userData.rotor=rotor;box(g,label('WEATHER 02'),0,2.75,-.05,3.2,.6,.12);this.supplyBox(g);
   }else{
    const water=cylinder(g,new T.MeshStandardMaterial({color:'#71aaad',roughness:.14,metalness:.35}),0,.04,0,2.7,2.7,.06,32);water.receiveShadow=true;for(let i=0;i<12;i++){const a=i*Math.PI/6;rock(g,Math.cos(a)*2.6,.15,Math.sin(a)*2.6,.55,.3,.45);}beam(g,M.wood,[3,0,0],[3,2,0],.09);box(g,label('FRESH WATER'),3,1.8,0,2.5,.55,.12);
   }
  }
 }
 createExpansion(){
  this.siteModels=new Map();
  for(const site of SITES){
   const g=new T.Group();g.position.set(site.x,terrain(site.x,site.z),site.z);this.scene.add(g);this.siteModels.set(site.id,g);
   if(site.id==='outpost'){
    // An open supply hut: broad weathered roof, readable entrance, small traces of its keeper.
    box(g,M.rockDark,0,-.22,-1.8,6.8,.5,5.7);box(g,M.wood,0,.08,-1.8,6.4,.18,5.2);
    for(let z=-4;z<.7;z+=.42)box(g,M.bark,0,.18,z,6.3,.02,.035);
    for(const x of [-3,3])for(const z of [-4,0])beam(g,M.bark,[x,0,z],[x,3.3,z],.14);
    for(let y=.4;y<2.9;y+=.34){box(g,M.pineDark,0,y,-4,6,.3,.18);box(g,M.wood,-3,y,-2,.16,.3,4);if(y<1.7)box(g,M.wood,3,y,-2,.16,.3,4);}
    for(const side of [-1,1]){const roof=box(g,M.iron,side*1.7,3.6,-1.9,3.7,.18,5.7);roof.rotation.z=-side*.27;for(let z=-4.5;z<1;z+=.55){const seam=box(g,M.rust,side*1.7,3.7,z,3.7,.04,.05);seam.rotation.z=-side*.27;}}
    box(g,label('SUPPLY / 01'),0,2.8,.08,3.8,.6,.1);
    const crate=this.supplyBox(g);crate.position.set(0,.19,.1);g.userData.crate=crate;
    // Open letter and enamel cup beside the supply chest.
    box(g,M.bark,1.75,1.02,-1.4,1.8,.12,1);for(const x of [1.1,2.4])for(const z of [-1.7,-1.1])box(g,M.wood,x,.54,z,.08,1,.08);
    const paper=box(g,M.bone,1.7,1.095,-1.4,.57,.025,.44);paper.rotation.y=.23;
    for(let i=0;i<4;i++)box(g,M.rockDark,1.7,1.111,-1.51+i*.06,.37,.003,.013);
    cylinder(g,M.cloth,2.25,1.2,-1.5,.09,.07,.2);box(g,label('EDA / LOGBOOK'),0,1.45,-3.88,2.8,.7,.06);
    cylinder(g,M.iron,-2,1,-2.8,.42,.42,1.6,12);cylinder(g,M.rust,-2,1.05,-2.8,.44,.44,.07,12);
    beam(g,M.rope,[-2.8,2.7,0],[-2.8,2.2,0],.02);box(g,M.iron,-2.8,2.02,0,.23,.35,.23);box(g,new T.MeshStandardMaterial({color:'#f4d297',emissive:'#efac5a',emissiveIntensity:.7}),-2.8,2.03,.13,.16,.23,.02);
   }else{
    // The tower sits on a deep foundation; the service panel remains reachable from the south.
    const plaster=mat('#d5d2b8'),trim=mat('#8b3f31');
    cylinder(g,M.rockDark,0,-1.05,-3,3.3,3.6,2.2,16);cylinder(g,plaster,0,5.9,-3,1.7,2.5,12,16);
    for(const y of [4.3,9.1])cylinder(g,trim,0,y,-3,2.5-y*.067,2.5-(y-.65)*.067,.65,16);
    for(let y=1.4;y<11;y+=2.4){box(g,M.iron,0,y,-.68-y*.067,.5,.85,.09);box(g,M.black,0,y,-.62-y*.067,.3,.64,.025);}
    cylinder(g,M.iron,0,12.15,-3,2.3,2.3,.25,16);cylinder(g,M.iron,0,12.8,-3,2.25,2.25,.075,16);
    for(let i=0;i<16;i++){const a=i*Math.PI/8;beam(g,M.iron,[Math.sin(a)*2.2,12.1,-3+Math.cos(a)*2.2],[Math.sin(a)*2.2,12.82,-3+Math.cos(a)*2.2],.025);}
    const glass=new T.MeshStandardMaterial({color:'#accdba',transparent:true,opacity:.25,roughness:.15,metalness:.2});cylinder(g,glass,0,13.25,-3,1.5,1.5,2,12);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;beam(g,M.iron,[Math.sin(a)*1.5,12.2,-3+Math.cos(a)*1.5],[Math.sin(a)*1.5,14.3,-3+Math.cos(a)*1.5],.065);}
    cylinder(g,trim,0,14.65,-3,0,2,1.1,12);beam(g,M.iron,[0,15,-3],[0,16.4,-3],.045);
    const lamp=mesh(new T.SphereGeometry(.55,12,8),new T.MeshStandardMaterial({color:'#9c9874',emissive:'#ffc976',emissiveIntensity:0}),g,0,13.2,-3);g.userData.lamp=lamp;
    this.beaconLight=new T.PointLight('#ffce83',0,65,1.5);this.beaconLight.position.set(0,13.2,-3);g.add(this.beaconLight);
    const sweep=new T.Group();sweep.position.set(0,13.2,-3);g.add(sweep);g.userData.sweep=sweep;
    const beamLight=mesh(new T.ConeGeometry(5,55,20,1,true),new T.MeshBasicMaterial({color:'#ffe4a5',transparent:true,opacity:.045,depthWrite:false,side:T.DoubleSide}),sweep,0,0,27.5);beamLight.rotation.x=-Math.PI/2;beamLight.castShadow=false;
    box(g,M.iron,0,.7,0,1.65,1.4,.7);box(g,label('LANTERN / 05'),0,1.7,-.1,2.4,.45,.12);const panel=box(g,M.gold,0,.95,.36,1.35,.55,.04);g.userData.panel=panel;
    box(g,M.bone,.3,1.42,0,.45,.03,.4);for(const x of [-.45,.45])box(g,M.black,x,1,.4,.17,.2,.02);
   }
  }
  for(const [x,z,text]of [[-12,52,'SUPPLY ←'],[-36,-38,'LIGHTHOUSE ↑']]){const sign=new T.Group();sign.position.set(x,terrain(x,z),z);beam(sign,M.wood,[0,0,0],[0,2,0],.09);box(sign,label(text),0,1.7,0,2.9,.55,.1);this.scene.add(sign);}
  this.guidance=new T.Group();this.scene.add(this.guidance);const guideMat=new T.MeshBasicMaterial({color:'#ffe1a1',transparent:true,opacity:.88,side:T.DoubleSide});const ring=mesh(new T.RingGeometry(.7,.82,32),guideMat,this.guidance,0,.11,0);ring.rotation.x=-Math.PI/2;ring.castShadow=false;
  const diamond=mesh(new T.OctahedronGeometry(.16),guideMat,this.guidance,0,1.25,0);diamond.castShadow=false;this.guidance.userData.diamond=diamond;this.guidance.visible=false;
 }
 supplyBox(g){const b=new T.Group();g.add(b);box(b,M.gold,0,.4,0,1.4,.8,.9);for(const x of [-.55,.55])box(b,M.iron,x,.42,0,.08,.85,.94);box(b,M.black,0,.65,.46,.34,.13,.03);b.userData.supply=true;return b;}
 createDetails(){
  const rand=rng(412);const grass=new T.InstancedMesh(grassBlades(),M.leaf,2400);let n=0;
  for(let i=0;i<3100&&n<2400;i++){const x=(rand()-.5)*168,z=(rand()-.5)*168;if(terrain(x,z)<1||[...LANDMARKS,...SITES].some(l=>Math.hypot(l.x-x,l.z-z)<5)||Math.abs(x-Math.sin(z*.07)*3)<2.5)continue;dummy.position.set(x,terrain(x,z)+.01,z);dummy.scale.set(.6+rand(),.6+rand(),.6+rand());dummy.rotation.set(0,rand()*6,rand()*.1);dummy.updateMatrix();grass.setMatrixAt(n++,dummy.matrix);}grass.count=n;grass.receiveShadow=true;grass.castShadow=false;this.scene.add(grass);
  // Rocky headlands and far islands establish the coastline beyond the traversable forest.
  for(const b of SCENERY_ROCKS)rock(this.scene,b.x,terrain(b.x,b.z)+.3,b.z,b.sx,b.sy,b.sz);
  for(let i=0;i<9;i++){const a=i*.73;rock(this.scene,Math.sin(a)*310,-7,Math.cos(a)*310,30+rand()*35,15+rand()*25,30+rand()*40,M.rockDark);}
  const hut=structureModel('shelter');hut.position.set(-17,terrain(-17,24),24);hut.rotation.y=.6;hut.scale.y=.55;hut.rotation.z=.13;this.scene.add(hut);const oldFire=structureModel('fire');oldFire.userData.flames.visible=false;oldFire.userData.light.intensity=0;oldFire.position.set(-13,terrain(-13,28),28);this.scene.add(oldFire);
  for(let i=0;i<5;i++){const sign=new T.Group();const z=52-i*17,x=4+Math.sin(z*.07)*3;sign.position.set(x,terrain(x,z),z);beam(sign,M.wood,[0,0,0],[0,1.7,0],.09);box(sign,label(i<3?'SIGNAL ↑':'SIGNAL 04'),0,1.5,0,1.7,.43,.08);this.scene.add(sign);}
  const raft=new T.Group();for(let i=0;i<5;i++)beam(raft,M.bark,[-1.2+i*.5,0,-1.8],[-1.2+i*.5,.1,1.8],.23);beam(raft,M.rope,[-1.4,.23,-.9],[1,.23,-.9],.035);beam(raft,M.rope,[-1.4,.23,.9],[1,.23,.9],.035);raft.position.set(-3,terrain(-3,76)+.23,76);raft.rotation.y=-.5;this.scene.add(raft);
  this.birds=new T.Group();this.scene.add(this.birds);for(let i=0;i<7;i++){const g=new T.Group();beam(g,M.bone,[-.7,0,0],[0,.18,0],.045);beam(g,M.bone,[0,.18,0],[.7,0,0],.045);g.userData.phase=i;this.birds.add(g);}
 }
 createWolf(w){const g=createWolfRig(w);this.scene.add(g);this.wolfModels.set(w.id,g);return g;}
 createRain(){const geo=new T.BufferGeometry(),a=new Float32Array(450*6),rand=rng(71);for(let i=0;i<450;i++){const x=(rand()-.5)*45,y=rand()*28,z=(rand()-.5)*45;a.set([x,y,z,x-.07,y-.65,z],i*6);}geo.setAttribute('position',new T.BufferAttribute(a,3));this.rain=new T.LineSegments(geo,new T.LineBasicMaterial({color:'#c4dada',transparent:true,opacity:.3}));this.scene.add(this.rain);this.rain.visible=false;}
 createTool(){this.fp=new FirstPersonRig();this.fp.resize(innerWidth/innerHeight);this.scene.add(this.camera);this.torchLight=new T.PointLight('#ffb85e',0,15,1.8);this.torchLight.position.set(.35,-.3,-.7);this.camera.add(this.torchLight);}
 createRescueBoat(){const g=new T.Group();box(g,M.iron,0,.5,0,5,1,12);box(g,M.cloth,0,2,-1,3,2,4);box(g,M.black,0,2.3,1.03,2.3,.8,.03);beam(g,M.iron,[0,3,-2],[0,7,-2],.09);flag(g,.7,6,-2,1.3,.8,'#f1bb69');const light=new T.PointLight('#ffcc7a',35,30);light.position.set(0,4,3);g.add(light);g.position.set(120,-1,70);g.visible=false;this.scene.add(g);this.boat=g;}
 setQuality(value){this.quality=value;this.renderer.setPixelRatio(value==='low'?1:Math.min(devicePixelRatio,1.5));this.renderer.shadowMap.enabled=value!=='low';}
 resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.fp.resize(innerWidth/innerHeight);this.renderer.setSize(innerWidth,innerHeight);}
 setGhost(type){if(this.ghost){this.scene.remove(this.ghost);this.ghost.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose();}});}this.ghost=type?structureModel(type,true):null;if(this.ghost)this.scene.add(this.ghost);}
 update(game,dt,{title=false,reduced=false,jump=0,moving=false,running=false,angle=0,guidance=null}={}){
  this.time+=dt;const s=game.s,p=s.player,t=this.time;this.syncNodes(s.nodes);
  const daylight=clamp(Math.sin((game.hour-6)/12*Math.PI)*1.25,0,1),rain=game.rain;this.hemi.intensity=.7+daylight*1.65;this.sun.intensity=(.05+daylight*3)*(rain?.4:1);this.moon.intensity=.45*(1-daylight);this.sun.position.set(-60,35+daylight*60,30);
  this.sky.material.uniforms.top.value.set(daylight>.2?'#568b9f':'#122938').multiplyScalar(rain?.75:1);this.sky.material.uniforms.bottom.value.set(daylight>.2?'#ccd4b8':'#395258').multiplyScalar(rain?.72:1);this.scene.fog.color.copy(this.sky.material.uniforms.bottom.value);this.scene.fog.density=rain?.016:.0075;this.water.material.uniforms.time.value=t;this.water.material.uniforms.light.value=.25+daylight*.75;this.sunDisk.visible=daylight>.2&&!rain;this.clouds.rotation.y=t*.001;
  if(title){this.camera.position.set(7+Math.sin(t*.02)*2,terrain(7,63)+5.5,63);this.camera.lookAt(-6,7,-16);}
  else{this.camera.position.set(p.x,terrain(p.x,p.z)+1.7+jump+(moving&&!reduced?Math.sin(s.stats.distance*7)*.018:0),p.z);this.camera.rotation.set(p.pitch,-p.yaw,0,'YXZ');}
  this.fp.update(game,dt,{moving,running,reduced,title});this.torchLight.intensity=s.equipped==='torch'?7+Math.sin(t*12)*.6:0;
  for(const b of s.structures){let model=this.buildings.get(b.id);if(!model){model=structureModel(b.type);model.position.set(b.x,terrain(b.x,b.z),b.z);model.rotation.y=b.angle;this.scene.add(model);this.buildings.set(b.id,model);}if(b.type==='fire'){model.userData.flames.visible=b.fuel>0;model.userData.flames.scale.y=1+Math.sin(t*9)*.13;model.userData.light.intensity=b.fuel>0?13+Math.sin(t*17)*2:0;}}
  for(const w of s.wolves){const g=this.wolfModels.get(w.id)||this.createWolf(w);animateWolf(g,w,s,dt,terrain);}
  for(const[id,g]of this.landmarkModels){if(g.userData.rotor)g.userData.rotor.rotation.y=t*(rain?4:1.5);g.children.filter(c=>c.userData.supply).forEach(c=>c.visible=!s.claimed.includes(id));}
  const lit=s.journal.beacon,lighthouse=this.siteModels.get('lighthouse');lighthouse.userData.lamp.material.emissiveIntensity=lit?4:0;this.beaconLight.intensity=lit?35:0;lighthouse.userData.sweep.visible=lit;lighthouse.userData.sweep.rotation.y=t*.22;
  this.siteModels.get('outpost').userData.crate.visible=!s.journal.visited.includes('outpost');
  this.guidance.visible=!!guidance&&!title;if(guidance){this.guidance.position.set(guidance.x,terrain(guidance.x,guidance.z),guidance.z);this.guidance.userData.diamond.position.y=1.25+Math.sin(t*2)*.1;this.guidance.userData.diamond.rotation.y=t*.7;}
  if(this.ghost){const x=p.x+Math.sin(p.yaw)*4.2,z=p.z-Math.cos(p.yaw)*4.2,valid=game.validPlacement(x,z);this.ghost.position.set(x,terrain(x,z),z);this.ghost.rotation.y=angle;this.ghost.traverse(o=>{if(o.isMesh)o.material.color.set(valid?'#94e5aa':'#e67b68');});}
  this.rain.visible=rain;if(rain){this.rain.position.set(p.x,terrain(p.x,p.z),p.z);const a=this.rain.geometry.attributes.position;for(let i=0;i<a.count;i+=2){let y=a.getY(i)-dt*14;if(y<0)y+=28;a.setY(i,y);a.setY(i+1,y-.65);}a.needsUpdate=true;}
  this.birds.children.forEach((g,i)=>{const a=t*.075+i*.6;g.position.set(Math.cos(a)*30,26+i*2+Math.sin(t+i),Math.sin(a)*30+25);g.rotation.y=-a;g.rotation.z=Math.sin(t*.5+i)*.15;});
  if(s.radio){this.signalLight.intensity=Math.sin(t*3)>0?25:3;this.landmarkModels.get('radio').userData.screen.material.emissiveIntensity=2;this.boat.visible=true;this.boat.position.x=120-(1-s.rescue/(s.journal.beacon?60:90))*65;this.boat.position.y=-.8+Math.sin(t*1.5)*.15;}
  this.renderer.info.reset();this.renderer.render(this.scene,this.camera);if(!title){this.renderer.autoClear=false;this.renderer.clearDepth();this.renderer.render(this.fp.scene,this.fp.camera);this.renderer.autoClear=true;}
 }
 disposeModel(model){this.scene.remove(model);const shared=new Set(Object.values(M));model.traverse(o=>{if(o.isMesh){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.filter(m=>!shared.has(m)).forEach(m=>{m.map?.dispose();m.dispose();});}});}
 reset(){for(const m of this.buildings.values())this.disposeModel(m);for(const m of this.wolfModels.values())this.disposeModel(m);this.buildings.clear();this.wolfModels.clear();this.setGhost(null);this.boat.visible=false;this.signalLight.intensity=0;this.landmarkModels.get('radio').userData.screen.material.emissiveIntensity=.5;}
}
