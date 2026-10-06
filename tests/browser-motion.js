async page => {
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 await page.evaluate(()=>{window.__motionReport={checks:[],shots:[]};});
 const snapshot=()=>page.evaluate(()=>window.__lastLight.snapshot());
 const wait=ms=>page.waitForTimeout(ms);
 async function setup(kind){
  await page.evaluate(kind=>{
   const d=window.__lastLight;d.freeze(true);
   const screen=d.snapshot().screen;
   if(screen==='title')document.querySelector('#continue-game').click();
   if(screen==='paused')document.querySelector('#resume').click();
   if(document.pointerLockElement)document.exitPointerLock();
   d.clearAction();d.setTime(d.snapshot().state.elapsed+2);d.setVitals({health:100,stamina:100});d.teleport(0,68);d.encounter([]);
   if(kind==='chop'){
    const n=d.snapshot().state.nodes.find(n=>n.type==='tree'&&n.hp>0&&n.z>30&&Math.abs(n.x)<40);
    window.__motionTree=n.id;d.teleport(n.x,n.z+1.9);document.querySelector('[data-equip=axe]').click();
   }else if(kind==='fight'){
    d.encounter([{id:'motion-wolf',x:0,z:65.7,home:{x:0,z:65.7},hp:64,state:'cooldown',timer:10,phase:0,facing:0,deadAt:0,looted:false}]);document.querySelector('[data-equip=spear]').click();
   }else if(kind==='pack'){
    d.encounter(Array.from({length:7},(_,i)=>({id:`pack-${i}`,x:(i-3)*1.3,z:56-i%2*1.5,home:{x:(i-3)*1.3,z:56},hp:64,state:'chase',timer:0,phase:i*2,facing:0,deadAt:0,looted:false})));document.querySelector('[data-equip=axe]').click();
   }
   d.render();d.render();
  },kind);
  await page.mouse.move(720,450);
  await page.evaluate(()=>window.__lastLight.freeze(false));
  check(await page.evaluate(()=>!document.hidden),'test tab must be visible');
 }
 async function capture(label){
  await page.evaluate(label=>new Promise(resolve=>requestAnimationFrame(()=>{const s=window.__lastLight.snapshot();window.__motionReport.shots.push({label,action:s.action,rig:s.rig,wolves:s.state.wolves,image:document.querySelector('#scene').toDataURL('image/png')});resolve();})),label);
 }
 try{
  await setup('chop');const before=await snapshot();
  await page.keyboard.press('KeyE');await wait(140);await capture('chop-windup');await wait(220);await capture('chop-contact');await wait(520);
  const after=await snapshot(),id=await page.evaluate(()=>window.__motionTree);
  check(after.state.nodes.find(n=>n.id===id).hp===before.state.nodes.find(n=>n.id===id).hp-1,'one E produces one timed chop');
  await page.evaluate(()=>window.__motionReport.checks.push('native E: one tree hit after visible axe swing'));
  await setup('fight');await page.mouse.click(720,450);await wait(130);await capture('spear-load');await wait(170);await capture('spear-contact');await wait(450);
  check((await snapshot()).state.wolves[0].hp===30,'native click hits wolf once');
  await page.mouse.click(720,450);await wait(850);await capture('wolf-defeated');
  check((await snapshot()).state.wolves[0].hp<=0,'second thrust defeats wolf');
  await page.keyboard.press('KeyE');check((await snapshot()).state.wolves[0].looted,'native E loots corpse');
  await page.evaluate(()=>window.__motionReport.checks.push('native clicks: spear 64 → 30 → defeated; E loots corpse'));
  await setup('pause');await page.mouse.click(720,450);await wait(100);await page.keyboard.press('Escape');const paused=await snapshot();await wait(250);const still=await snapshot();
  check(still.screen==='paused'&&still.state.elapsed===paused.state.elapsed&&still.action?.age===paused.action?.age,'pause must freeze action and simulation');
  await page.locator('#resume').click();await wait(800);check((await snapshot()).action===null,'action completes after resume');
  await page.evaluate(()=>window.__motionReport.checks.push('Escape freezes swing and elapsed time; resume finishes action'));
  await setup('pack');
  await page.evaluate(()=>new Promise((resolve,reject)=>{
   let last=0,dt=[],frames=0;const timer=setTimeout(()=>reject(Error('frame measurement timed out')),6000);
   function frame(now){if(document.hidden){clearTimeout(timer);reject(Error('test tab became hidden'));return;}if(last)dt.push(now-last);last=now;
    if(++frames===180){clearTimeout(timer);const s=window.__lastLight.snapshot();window.__motionReport.performance={frames,hidden:document.hidden,width:innerWidth,height:innerHeight,dpr:devicePixelRatio,quality:document.querySelector('#quality').value,mean:dt.reduce((a,b)=>a+b,0)/dt.length,p95:dt.sort((a,b)=>a-b)[Math.floor(dt.length*.95)],drawCalls:s.performance.drawCalls,triangles:s.performance.triangles,wolves:s.state.wolves.length};window.__lastLight.freeze(true);resolve();}else requestAnimationFrame(frame);
   }requestAnimationFrame(frame);
  }));await capture('wolf-pack');
  await page.evaluate(()=>{window.__motionReport.complete=true;});
 }catch(error){await page.evaluate(message=>{window.__lastLight.freeze(true);window.__motionReport.error=message;},error.message);throw error;}
}
