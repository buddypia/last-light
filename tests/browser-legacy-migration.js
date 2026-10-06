async page => {
 const check=(v,m)=>{if(!v)throw Error(m);};
 // On the isolated production-test origin, project the preceding test save to the
 // original v1 schema and place its player on formerly open lighthouse ground.
 const original=await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('last-light-save-v1'));s.version=1;delete s.journal;Object.assign(s.player,{x:-45,z:-67});Object.assign(s.inventory,{axe:1,spear:1});s.equipped='spear';const raw=JSON.stringify(s);localStorage.setItem('last-light-save-v1',raw);return raw;});
 await page.locator('#continue-game').click({force:true});check(await page.locator('#arrival').evaluate(el=>el.open),'legacy save gets the new guide');
 await page.locator('#arrival-explore').click({force:true});
 await page.keyboard.press('Escape');await page.locator('#save').click({force:true});
 const before=await page.evaluate(()=>JSON.parse(localStorage.getItem('last-light-save-v1')));
 check(before.version===2,'legacy version migrated');check(Math.hypot(before.player.x+45,before.player.z+67)>1,'new solid tower avoided');check(before.inventory.axe===1&&before.inventory.spear===1,'tools preserved');
 check(await page.evaluate(()=>localStorage.getItem('last-light-save-v1-before-journal'))===original,'original v1 save retained as backup');
 await page.locator('#resume').click({force:true});await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
 await page.keyboard.press('Escape');await page.locator('#save').click({force:true});
 const after=await page.evaluate(()=>JSON.parse(localStorage.getItem('last-light-save-v1')));check(Math.hypot(after.player.x-before.player.x,after.player.z-before.player.z)>.5,'normal movement works after migration');
 return {before:{x:before.player.x,z:before.player.z},after:{x:after.player.x,z:after.player.z},version:after.version,inventory:after.inventory,originalBackup:true};
}
