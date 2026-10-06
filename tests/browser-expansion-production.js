async page => {
 const dir=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/2026-09-29-expansion/' : 'last-light/evidence/2026-09-29-expansion/');
 const check=(v,m)=>{if(!v)throw Error(m);};
 await page.setViewportSize({width:1440,height:900});
 check(!await page.evaluate(()=>document.hidden),'production tab visible');
 check(!await page.evaluate(()=>window.__lastLight),'development diagnostics absent');
 check(!await page.evaluate(()=>localStorage.getItem('last-light-save-v1')),'isolated test origin must start empty');
 await page.locator('#new-game').click({force:true});await page.locator('#arrival-craft').click({force:true});
 check((await page.locator('#journal-body').innerText()).includes('作業台は不要'),'production tutorial present');
 await page.locator('.ingredient [data-help=fiber]').focus();check(await page.locator('#field-tooltip').isVisible(),'keyboard tooltip visible');
 await page.keyboard.press('Escape');await page.locator('[data-material=wood]').click({force:true});
 await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(450);await page.keyboard.up('ArrowLeft');await page.keyboard.press('e');
 await page.keyboard.press('Escape');await page.locator('#save').click({force:true});
 const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('last-light-save-v1')));check(saved.inventory.wood===2,'ordinary production inputs collect a branch');check(saved.version===2,'production save version');
 await page.locator('#resume').click({force:true});await page.keyboard.press('2');check(await page.locator('.recipe-heading h3').innerText()==='狩猟槍','unowned spear opens recipe');await page.screenshot({path:dir+'17-production-spear.png'});
 await page.locator('[data-page=quests]').click({force:true});check(await page.locator('.quest').count()===8,'all eight quests present');
 await page.locator('#close-journal').click({force:true});await page.keyboard.press('Escape');await page.locator('#back-title').click({force:true});
 return {diagnostics:false,inventory:saved.inventory,journal:saved.journal,resources:await page.evaluate(()=>performance.getEntriesByType('resource').map(x=>({name:x.name,duration:x.duration,transferSize:x.transferSize})))};
}
