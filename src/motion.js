// Seconds are shared by the simulation's contact frame and the first-person rig.
export const ATTACKS={
 axe:{duration:.82,impact:.34,damage:22,reach:2.6,arc:.62,stamina:14},
 spear:{duration:.68,impact:.27,damage:34,reach:3.8,arc:.34,stamina:14},
 hands:{duration:.54,impact:.21,damage:9,reach:2.1,arc:.5,stamina:10},
 torch:{duration:.72,impact:.30,damage:12,reach:2.5,arc:.52,stamina:12}
};
export const WOLF_MOTION={windup:.65,lunge:.34,contact:.16,recovery:1.25};
const smooth=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
const key=(t,p,r,support=.34)=>({t,p,r,support});
const REST={
 axe:key(0,[.34,-.31,-.65],[-.18,.72,.13]),
 spear:key(0,[.36,-.34,-.52],[-1.40,.04,.19]),
 torch:key(0,[.35,-.36,-.78],[-.12,0,.1]),
 hands:key(0,[.30,-.39,-.58],[0,0,0])
};
export function restPose(tool){const p=REST[tool]||REST.hands;return {p:[...p.p],r:[...p.r],support:p.support};}
export function actionPose(tool,kind,age){
 const rest=REST[tool]||REST.hands,profile=ATTACKS[tool]||ATTACKS.hands;let frames;
 if(kind==='pickup')frames=[rest,key(.16,[.04,-.58,-.97],[-.8,0,-.12]),key(.28,[.02,-.6,-1.02],[-.9,0,-.1]),{...rest,t:.55}];
 else if(tool==='spear')frames=[rest,key(.16,[.43,-.29,-.37],[-1.42,-.09,.21],.39),key(profile.impact,[.13,-.20,-.98],[-1.50,0,.09],.27),key(.36,[.13,-.22,-.95],[-1.51,0,.1],.29),{...rest,t:profile.duration}];
 else if(tool==='axe')frames=[rest,key(.22,[.43,-.08,-.79],[.86,-.1,-.44]),key(profile.impact,[.12,-.28,-1.02],[-.78,.03,.19]),key(.46,[.02,-.48,-.82],[-1.25,.03,.32]),{...rest,t:profile.duration}];
 else if(tool==='torch')frames=[rest,key(.18,[.47,-.22,-.48],[.34,-.1,-.28]),key(profile.impact,[.15,-.28,-.94],[-.68,0,.17]),key(.42,[.07,-.43,-.84],[-.9,0,.28]),{...rest,t:profile.duration}];
 else frames=[rest,key(.11,[.38,-.29,-.43],[.05,-.1,-.1]),key(profile.impact,[.04,-.12,-1.02],[-.10,.1,.22]),{...rest,t:profile.duration}];
 if(age<=0)return restPose(tool);
 for(let i=1;i<frames.length;i++)if(age<=frames[i].t){const a=frames[i-1],b=frames[i],t=smooth((age-a.t)/(b.t-a.t));return {p:a.p.map((v,j)=>v+(b.p[j]-v)*t),r:a.r.map((v,j)=>v+(b.r[j]-v)*t),support:a.support+(b.support-a.support)*t};}
 return restPose(tool);
}
export function actionDuration(tool,kind){return kind==='pickup'?.55:(ATTACKS[tool]||ATTACKS.hands).duration;}
