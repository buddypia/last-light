async (page) => {
 const check=(v,m)=>{if(!v)throw Error(m);};
 const evidenceDir=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/' : 'last-light/evidence/');
 await page.setViewportSize({width:1440,height:900});
 check(await page.evaluate(()=>typeof window.__lastLight)==='undefined','production does not expose diagnostics');
 if(await page.locator('#title').isVisible())await page.screenshot({path:evidenceDir+'production-title.png'});
 if(await page.locator('#title').isVisible())await page.getByRole('button',{name:'島で生き延びる'}).click({force:true});
 if(await page.locator('#pause').isVisible())await page.getByRole('button',{name:'探索を続ける'}).click({force:true});
 await page.keyboard.down('KeyW');await page.waitForTimeout(550);await page.keyboard.up('KeyW');
 await page.keyboard.down('ArrowLeft');await page.waitForTimeout(420);await page.keyboard.up('ArrowLeft');await page.waitForTimeout(180);
 check((await page.locator('#interaction').textContent()).includes('枝を拾う'),'normal walking and turning acquire resource');await page.keyboard.press('KeyE');await page.waitForTimeout(150);
 check((await page.locator('#objective-sub').textContent()).includes('木材 2/3'),'normal E collects branch');
 await page.screenshot({path:evidenceDir+'production-arrival.png'});
 await page.keyboard.press('KeyC');check(await page.locator('[data-craft="axe"]').isDisabled(),'insufficient materials disable recipe');
 const focus1=await page.evaluate(()=>document.activeElement.id);await page.keyboard.press('Tab');const focus2=await page.evaluate(()=>document.activeElement.id||document.activeElement.dataset.page);check(focus1!==focus2,'Tab navigates journal controls');
 await page.getByRole('button',{name:'手帳を閉じる'}).click({force:true});await page.keyboard.press('Escape');check(await page.locator('#pause').isVisible(),'production pauses');await page.getByRole('button',{name:'記録を保存',exact:true}).click({force:true});check((await page.locator('#save-note').textContent()).includes('保存しました'),'production save');
 await page.getByRole('button',{name:'保存してタイトルへ'}).click({force:true});await page.getByRole('button',{name:'記録から再開'}).click({force:true});await page.waitForTimeout(150);check((await page.locator('#objective-sub').textContent()).includes('木材 2/3'),'production continue restores inventory');
 await page.keyboard.press('Escape');await page.getByRole('button',{name:'保存してタイトルへ'}).click({force:true});
}
