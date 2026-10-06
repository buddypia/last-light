async page => {
 const dir=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/2026-09-29-expansion/' : 'last-light/evidence/2026-09-29-expansion/');
 const check=(v,m)=>{if(!v)throw Error(m);}, snap=()=>page.evaluate(()=>window.__lastLight.snapshot());
 await page.setViewportSize({width:1440,height:900});
 if((await snap()).screen==='title')await page.locator('#continue-game').click({force:true});
 if((await snap()).screen==='paused')await page.locator('#resume').click({force:true});
 check(!await page.evaluate(()=>document.hidden),'visible rendering required');
 await page.evaluate(()=>{window.__lastLight.teleport(-40,-44,-.21);window.__lastLight.setTime(350);});
 await page.waitForTimeout(300);await page.screenshot({path:dir+'12-lighthouse-light.png'});
 const performance=await page.evaluate(()=>new Promise(resolve=>{const samples=[];let prev=performance.now();function tick(t){samples.push(t-prev);prev=t;if(samples.length<181)requestAnimationFrame(tick);else{samples.shift();const sorted=[...samples].sort((a,b)=>a-b),s=window.__lastLight.snapshot();resolve({frames:samples.length,mean:samples.reduce((a,b)=>a+b,0)/samples.length,p95:sorted[Math.floor(sorted.length*.95)],width:innerWidth,height:innerHeight,dpr:devicePixelRatio,hidden:document.hidden,drawCalls:s.performance.drawCalls,triangles:s.performance.triangles});}}requestAnimationFrame(tick);}));
 check(!performance.hidden&&performance.p95<40,'active play performance target');
 await page.evaluate(()=>{window.__lastLight.setTime(25);window.__lastLight.teleport(0,68);});
 await page.keyboard.press('c');await page.locator('[data-recipe=axe]').click({force:true});
 check(await page.locator('[data-material=wood]').isDisabled(),'owned axe cannot track material');
 await page.locator('[data-recipe=fire]').click({force:true});await page.locator('[data-craft=fire]').click({force:true});
 await page.locator('#scene').click({position:{x:720,y:450},force:true});
 check((await snap()).state.structures.some(b=>b.type==='fire'),'fire placed with normal click');
 await page.keyboard.press('1');
 for(let i=0;i<2;i++){
  const n=(await snap()).state.nodes.find(n=>n.type==='tree'&&n.hp>0);
  await page.evaluate(n=>window.__lastLight.teleport(n.x,n.z+2),n);
  for(let j=0;j<3;j++){await page.evaluate(()=>window.__lastLight.advance(.5));await page.keyboard.press('e');}
 }
 await page.keyboard.press('3');
 for(const [x,z]of [[22,5],[60,55],[-47,-14],[32,-41]]){await page.evaluate(([x,z])=>window.__lastLight.teleport(x,z),[x,z]);await page.keyboard.press('e');}
 let s=await snap();check(s.state.journal.completed.includes('camp'),'camp quest completes');check(s.state.journal.completed.includes('parts'),'parts quest completes');check(s.state.journal.completed.includes('archive'),'all field notes found');
 await page.keyboard.press('j');await page.locator('[data-page=notes]').click({force:true});await page.screenshot({path:dir+'13-all-records.png'});
 await page.setViewportSize({width:800,height:650});await page.locator('[data-page=craft]').click({force:true});await page.locator('[data-recipe=spear]').click({force:true});
 const small=await page.locator('#journal').evaluate(el=>({client:el.clientWidth,scroll:el.scrollWidth,bottom:el.getBoundingClientRect().bottom,innerHeight}));check(small.scroll<=small.client+1&&small.bottom<=small.innerHeight,'journal fits smaller desktop');
 await page.screenshot({path:dir+'14-small-desktop.png'});
 await page.setViewportSize({width:1440,height:900});await page.locator('#close-journal').click({force:true});
 await page.evaluate(()=>window.__lastLight.teleport(0,-26));await page.keyboard.press('e');
 s=await snap();check(s.state.radio&&s.state.rescue<=60&&s.state.rescue>59,'beacon rescue starts at 60 seconds');
 await page.screenshot({path:dir+'15-shorter-rescue.png'});
 await page.evaluate(()=>window.__lastLight.advance(60.1));
 s=await snap();check(s.state.mode==='won','rescued through expanded content');check(s.state.journal.completed.includes('rescue'),'final quest completed');
 await page.screenshot({path:dir+'16-rescue-record.png'});
 return {performance,small,won:s.state.mode,journal:s.state.journal,inventory:s.state.inventory,ending:await page.locator('#ending-stats').innerText()};
}
