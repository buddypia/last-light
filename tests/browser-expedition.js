async (page) => {
 const evidenceDir=(typeof process !== 'undefined' && process.cwd().endsWith('last-light') ? 'evidence/' : 'last-light/evidence/');
 const check=(v,m)=>{if(!v)throw Error(m);},snap=()=>page.evaluate(()=>window.__lastLight.snapshot()),press=k=>page.keyboard.press(k),wait=ms=>page.waitForTimeout(ms),shot=n=>page.screenshot({path:evidenceDir+n+'.png'});
 if((await snap()).screen==='paused')await page.getByRole('button',{name:'探索を続ける'}).click({force:true});
 // Resource gathering uses E; positions are injected to avoid long repetitive travel in this regression scenario.
 for(let j=0;j<8;j++){await page.evaluate(()=>{const n=window.__lastLight.snapshot().state.nodes.find(n=>n.type==='tree'&&n.hp>0);window.__lastLight.teleport(n.x,n.z+2);});for(let i=0;i<3;i++){await press('KeyE');await wait(460);}}
 for(let j=0;j<3;j++){await page.evaluate(()=>{const n=window.__lastLight.snapshot().state.nodes.find(n=>n.type==='fiber'&&n.hp>0);window.__lastLight.teleport(n.x,n.z+2);});await press('KeyE');await wait(470);}
 await press('KeyC');await page.locator('[data-craft="spear"]').click({force:true});await page.locator('[data-craft="torch"]').click({force:true});await page.getByRole('button',{name:'手帳を閉じる'}).click({force:true});await press('Digit2');
 await page.evaluate(()=>{const w=window.__lastLight.snapshot().state.wolves.find(w=>w.id==='w3');window.__lastLight.teleport(w.x,w.z+3.2);});await wait(120);await shot('wolf-encounter');await page.mouse.click(720,450);await wait(720);await page.mouse.click(720,450);await wait(140);check((await snap()).state.stats.kills>=1,'spear kills wolf in two hits');await press('KeyE');check((await snap()).state.inventory.rawMeat>=2,'E loots wolf');
 await page.evaluate(()=>{const b=window.__lastLight.snapshot().state.structures[0];window.__lastLight.teleport(b.x,b.z+2);});await wait(150);await press('KeyE');check((await snap()).state.inventory.meat===1,'campfire cooks');await press('KeyQ');check((await snap()).state.inventory.meat===0,'Q consumes cooked meat');
 // Build shelter through the same UI and placement click as a player.
 await page.evaluate(()=>window.__lastLight.teleport(6,70));await press('KeyC');await page.locator('[data-craft="shelter"]').click({force:true});await wait(150);await page.mouse.click(720,450);await wait(150);check((await snap()).state.structures.some(b=>b.type==='shelter'),'shelter placed');
 await press('Digit3');
 for(const [id,x,z] of [['wreck',60,53],['cave',-47,-16],['station',32,-43]]){await page.evaluate(({x,z})=>window.__lastLight.teleport(x,z+3.2),{x,z});await wait(250);await shot(id);await press('KeyE');check((await snap()).state.claimed.includes(id),'landmark part '+id);}
 await page.evaluate(()=>window.__lastLight.teleport(-6,70));await press('KeyC');await page.locator('[data-craft="collector"]').click({force:true});await wait(150);await page.mouse.click(720,450);await wait(150);check((await snap()).state.structures.some(b=>b.type==='collector'),'collector placed');
 await page.evaluate(()=>{window.__lastLight.setTime(160);window.__lastLight.advance(10);window.__lastLight.teleport(-6,68);});await wait(150);await shot('rain-camp');
 await page.evaluate(()=>{window.__lastLight.setTime(335);window.__lastLight.setVitals({food:80,water:80,health:60,warmth:50});window.__lastLight.teleport(0,66);});await wait(200);await shot('night-camp');
 await page.evaluate(()=>window.__lastLight.teleport(6,68));await wait(150);await press('KeyE');check((await snap()).state.player.health>=85,'shelter restores health');check((await snap()).state.elapsed>650,'rest reaches morning');await shot('dawn-after-rest');
 await press('Tab');await page.locator('#refill-torch').click({force:true});await page.getByRole('button',{name:'手帳を閉じる'}).click({force:true});
 await page.evaluate(()=>window.__lastLight.teleport(22,6));await wait(150);await press('KeyE');check((await snap()).state.canteen===5,'spring refill');
 await page.evaluate(()=>window.__lastLight.teleport(0,-24.8));await wait(200);await shot('radio-before');await press('KeyE');check((await snap()).state.radio,'radio repaired');await shot('signal-sent');await press('Escape');await page.getByRole('button',{name:'記録を保存',exact:true}).click({force:true});
 console.log(JSON.stringify({state:(await snap()).state,performance:(await snap()).performance}));
}
