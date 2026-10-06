async (page) => {
 await page.setViewportSize({width:1440,height:900});
 const check=(v,m)=>{if(!v)throw Error(m);}, snapshot=()=>page.evaluate(()=>window.__lastLight.snapshot()), press=k=>page.keyboard.press(k), wait=ms=>page.waitForTimeout(ms);
 const evidenceDir=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/' : 'last-light/evidence/');
 const shot=name=>page.screenshot({path:evidenceDir+name+'.png'});
 const initial=await snapshot();
 if(initial.screen==='title')await page.getByRole('button',{name:'記録から再開'}).click({force:true});
 if((await snapshot()).screen==='paused')await page.getByRole('button',{name:'探索を続ける'}).click({force:true});
 await wait(300);
 const before=await snapshot();await page.keyboard.down('KeyW');await wait(800);await page.keyboard.up('KeyW');const walked=await snapshot();check(walked.state.player.z<before.state.player.z-2,'W moves player forward');
 await press('Space');await wait(160);const camera=await page.evaluate(()=>window.__lastLight.view());check(camera.position[1]>walked.state.player.y+1.8,'Space raises camera');await wait(800);
 // Teleports shorten travel only; gathering and recipes use actual controls.
 for(let i=0;i<8;i++){await page.evaluate(i=>{const n=window.__lastLight.snapshot().state.nodes[i];window.__lastLight.teleport(n.x,n.z+2);},i);await wait(150);await press('KeyE');await wait(470);}
 const gathered=await snapshot();check(gathered.state.inventory.wood===6&&gathered.state.inventory.stone===6&&gathered.state.inventory.fiber===6,'E gathers arrival resources');
 await press('KeyC');await page.locator('[data-craft="axe"]').click({force:true});check((await snapshot()).state.inventory.axe===1,'recipe makes axe');await shot('crafting');await page.getByRole('button',{name:'手帳を閉じる'}).click({force:true});await wait(200);
 await page.evaluate(()=>{const n=window.__lastLight.snapshot().state.nodes.find(n=>n.type==='tree');window.__lastLight.teleport(n.x,n.z+2);});for(let i=0;i<3;i++){await press('KeyE');await wait(480);}check((await snapshot()).state.inventory.wood===8,'axe harvests tree');
 await page.evaluate(()=>{const n=window.__lastLight.snapshot().state.nodes.find(n=>n.type==='rock');window.__lastLight.teleport(n.x,n.z+2);});for(let i=0;i<2;i++){await press('KeyE');await wait(480);}
 await press('KeyM');check(await page.locator('#map-canvas').isVisible(),'map opens');const t=(await snapshot()).state.elapsed;await wait(400);check((await snapshot()).state.elapsed===t,'journal pauses');await shot('map');await page.getByRole('button',{name:'手帳を閉じる'}).click({force:true});
 await page.evaluate(()=>window.__lastLight.teleport(0,68));await wait(150);await press('KeyC');await page.locator('[data-craft="fire"]').click({force:true});await wait(150);check((await snapshot()).build==='fire','build preview');await shot('build-preview');
 await page.mouse.click(720,450);await wait(250);const built=await snapshot();check(built.state.structures.length===1,'click places fire');check(built.state.inventory.wood===2,'cost consumed once');await shot('first-camp');
 await press('Escape');await wait(150);const paused=await snapshot();check(paused.screen==='paused','Escape pauses');await wait(350);check((await snapshot()).state.elapsed===paused.state.elapsed,'time frozen');await page.getByRole('button',{name:'記録を保存',exact:true}).click({force:true});check(await page.locator('#save-note').textContent()==='記録を保存しました','save success');
 console.log(JSON.stringify({walk:walked.state.player,jump:camera.position[1],gathered:gathered.state.inventory,crafted:built.state.inventory,structures:built.state.structures,pause:paused.screen,performance:built.performance}));
}
