async (page) => {
 await page.setViewportSize({width:1440,height:900});
 await page.evaluate(async()=>{const samples=[];let previous;
  await Promise.race([new Promise(resolve=>{function tick(t){if(previous!==undefined)samples.push(t-previous);previous=t;if(samples.length<180)requestAnimationFrame(tick);else resolve();}requestAnimationFrame(tick);}),new Promise((_,reject)=>setTimeout(()=>reject(Error('Test tab was hidden or rendering stalled during timing')),8000))]);
  samples.sort((a,b)=>a-b);const gl=document.getElementById('scene').getContext('webgl2'),ext=gl.getExtension('WEBGL_debug_renderer_info');
  window.__productionPerformance={frames:samples.length,mean:samples.reduce((a,b)=>a+b,0)/samples.length,p95:samples[Math.floor(samples.length*.95)],max:samples.at(-1),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,hidden:document.hidden,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),userAgent:navigator.userAgent};
 });
}
