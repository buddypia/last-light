async page => {
 const evidence=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/2026-09-29-expansion/' : 'last-light/evidence/2026-09-29-expansion/');
 const check=(value,message)=>{if(!value)throw Error(message);};
 const state=()=>page.evaluate(()=>window.__lastLight.snapshot());
 const result={};
 check(!await page.evaluate(()=>document.hidden),'test tab must be visible');
 await page.locator('.ingredient [data-help=wood]').focus();
 check(await page.locator('#field-tooltip').isVisible(),'tooltip opens with keyboard focus');
 await page.keyboard.press('Escape');
 check(await page.locator('#journal').evaluate(el=>el.open),'Escape dismisses tooltip before journal');
 await page.locator('#close-journal').click({force:true});
 // Remaining travel is shortened with test-only teleport. Collection and crafting use real input.
 for(const id of ['n1','n2','n3','n4','n5','n6','n7']){
  await page.evaluate(id=>{const d=window.__lastLight,n=d.snapshot().state.nodes.find(n=>n.id===id);d.teleport(n.x,n.z+2);d.advance(.5);},id);
  await page.keyboard.press('e');
 }
 await page.keyboard.press('c');
 check(await page.locator('[data-craft=axe]').isEnabled(),'initial resources permit axe');
 await page.locator('[data-craft=axe]').click({force:true});
 let s=await state();check(s.state.inventory.axe===1&&s.state.equipped==='axe','axe crafted and equipped');check(s.state.journal.completed.includes('axe'),'axe quest completes');
 result.axe={inventory:s.state.inventory,quest:s.state.journal.tracked};
 await page.locator('#close-journal').click({force:true});
 await page.keyboard.press('2');
 check(await page.locator('.recipe-heading h3').innerText()==='狩猟槍','missing spear shortcut opens exact recipe');
 await page.screenshot({path:evidence+'05-spear-help.png'});
 await page.locator('#close-journal').click({force:true});
 for(const type of ['tree','tree','rock','fiber']){
  const n=(await state()).state.nodes.find(n=>n.type===type&&n.hp>0);
  await page.evaluate(n=>window.__lastLight.teleport(n.x,n.z+2),n);
  for(let hit=0;hit<n.hp;hit++){await page.evaluate(()=>window.__lastLight.advance(.5));await page.keyboard.press('e');}
 }
 await page.keyboard.press('2');await page.locator('[data-craft=spear]').click({force:true});
 s=await state();check(s.state.inventory.spear===1&&s.state.equipped==='spear','spear crafted and equipped');result.spear=s.state.inventory;
 await page.locator('[data-recipe=torch]').click({force:true});await page.locator('[data-craft=torch]').click({force:true});
 s=await state();check(s.state.journal.completed.includes('tools'),'equipment quest completes');
 await page.locator('[data-page=quests]').click({force:true});await page.screenshot({path:evidence+'06-quests.png'});
 await page.locator('[data-quest=beacon]').click({force:true});
 check((await page.locator('#waypoint-label').innerText()).includes('補給所'),'side quest guides to outpost');
 await page.evaluate(()=>window.__lastLight.teleport(-32,52));
 await page.waitForTimeout(250);await page.screenshot({path:evidence+'07-outpost.png'});
 await page.evaluate(()=>window.__lastLight.teleport(-32,46));await page.keyboard.press('e');
 s=await state();check(s.state.journal.notes.includes('outpost'),'outpost letter discovered');result.outpost={scrap:s.state.inventory.scrap,bandage:s.state.inventory.bandage};
 await page.keyboard.press('e');check((await state()).state.inventory.scrap===result.outpost.scrap,'outpost not duplicated');
 await page.keyboard.press('j');await page.locator('[data-page=notes]').click({force:true});await page.screenshot({path:evidence+'08-island-records.png'});
 check((await page.locator('#journal-body').innerText()).includes('灯台守 エダ'),'lore record readable');
 await page.locator('[data-page=map]').click({force:true});await page.screenshot({path:evidence+'09-map.png'});
 await page.locator('[data-waypoint=lighthouse]').click({force:true});
 await page.evaluate(()=>window.__lastLight.teleport(-40,-44,-.21));await page.waitForTimeout(200);await page.screenshot({path:evidence+'10-lighthouse-day.png'});
 // Axe-funded wood from actual tree harvest, no inventory grant.
 await page.keyboard.press('1');const tree=(await state()).state.nodes.find(n=>n.type==='tree'&&n.hp>0);
 await page.evaluate(n=>window.__lastLight.teleport(n.x,n.z+2),tree);
 for(let i=0;i<3;i++){await page.evaluate(()=>window.__lastLight.advance(.5));await page.keyboard.press('e');}
 await page.evaluate(()=>window.__lastLight.teleport(-45,-62));await page.keyboard.press('e');await page.keyboard.press('e');
 s=await state();check(s.state.journal.beacon,'lighthouse repaired');check(s.state.journal.completed.includes('beacon'),'lighthouse side quest completes');result.lighthouse={inventory:s.state.inventory,journal:s.state.journal};
 await page.keyboard.press('e');check((await state()).state.inventory.meat===2,'repair reward cannot duplicate');
 await page.evaluate(()=>{window.__lastLight.teleport(-35,-49,-.48);window.__lastLight.setTime(350);});await page.waitForTimeout(300);await page.screenshot({path:evidence+'11-lighthouse-restored.png'});
 await page.keyboard.press('Escape');await page.locator('#save').click({force:true});
 check((await page.locator('#save-note').innerText()).includes('保存しました'),'save UI success');
 await page.locator('#back-title').click({force:true});await page.locator('#continue-game').click({force:true});
 s=await state();check(s.state.journal.beacon&&s.state.journal.notes.includes('outpost'),'journal and beacon restored');result.restored=true;
 await page.keyboard.press('Escape');
 return result;
}
