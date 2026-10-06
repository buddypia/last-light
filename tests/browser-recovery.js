async (page) => {
 const evidenceDir=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/' : 'last-light/evidence/');
 const check=(v,m)=>{if(!v)throw Error(m);},snap=()=>page.evaluate(()=>window.__lastLight.snapshot()),shot=n=>page.screenshot({path:evidenceDir+n+'.png'});
 check((await snap()).state.mode==='won','rescue reached terminal win');
 await page.getByRole('button',{name:'最後の記録から再開'}).click({force:true});check((await snap()).state.mode==='playing','victory returns to last live save');check((await snap()).state.structures.length===3,'all camp structures restored');
 await page.evaluate(()=>{window.__lastLight.setVitals({health:.1,food:0,water:0,warmth:0});window.__lastLight.advance(1);});check((await snap()).state.mode==='dead','survival failure reaches death');await shot('death-ending');
 await page.getByRole('button',{name:'最後の記録から再開'}).click({force:true});check((await snap()).state.player.health>1,'saved vitals restored after death');
 await page.keyboard.press('Escape');check((await snap()).screen==='paused','Escape consistently pauses');
 await page.getByRole('button',{name:'保存してタイトルへ'}).click({force:true});check((await snap()).screen==='title','save and exit reaches title');
}
