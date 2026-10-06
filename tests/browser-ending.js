async (page) => {
 const evidenceDir=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/' : 'last-light/evidence/');
 const check=(v,m)=>{if(!v)throw Error(m);},snap=()=>page.evaluate(()=>window.__lastLight.snapshot()),shot=n=>page.screenshot({path:evidenceDir+n+'.png'});
 check((await snap()).screen==='paused','starts from saved signal checkpoint');
 await page.locator('#volume').focus();await page.keyboard.press('Home');await page.locator('#quality').selectOption('low');await page.locator('#reduced').check({force:true});
 check(await page.evaluate(()=>JSON.parse(localStorage.getItem('last-light-settings-v1')).volume)===0,'mute is persisted');
 await page.locator('#quality').selectOption('high');await page.getByRole('button',{name:'保存してタイトルへ'}).click({force:true});await page.getByRole('button',{name:'記録から再開'}).click({force:true});
 const loaded=await snap();check(loaded.state.radio&&loaded.state.claimed.length===3&&loaded.state.structures.length===3,'save/continue restores full world');
 await page.evaluate(()=>window.__lastLight.advance(82));
 // Actual rAF timings while rendering the rescue scene; diagnostic acceleration is excluded.
 await page.evaluate(async()=>{const values=[];let previous=performance.now();await Promise.race([new Promise(resolve=>{function tick(t){values.push(t-previous);previous=t;if(values.length<240)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Test tab hidden or rendering stalled')),8000))]);const v=values.slice(1).sort((a,b)=>a-b);window.__frameReport={count:v.length,mean:v.reduce((a,b)=>a+b,0)/v.length,p95:v[Math.floor(v.length*.95)],max:v.at(-1),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,hidden:document.hidden,userAgent:navigator.userAgent};});
 await page.waitForTimeout(5200);check((await snap()).state.mode==='won','90 second signal leads to rescue');await shot('rescue-ending');
 await page.getByRole('button',{name:'最後の記録から再開'}).click({force:true});check((await snap()).state.mode==='playing','ending loads last live save');
 await page.evaluate(()=>{window.__lastLight.setVitals({health:.1,food:0,water:0,warmth:0});window.__lastLight.advance(1);});check((await snap()).state.mode==='dead','survival failure opens death state');await shot('death-ending');
 await page.getByRole('button',{name:'最後の記録から再開'}).click({force:true});check((await snap()).state.player.health>1,'death recovery restores saved vitals');await page.keyboard.press('Escape');
 check((await snap()).screen==='paused','pause after resume');
}
