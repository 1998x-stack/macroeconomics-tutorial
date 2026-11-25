"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawAk(root,svg){
   const s=get(root,"s"),A=get(root,"A"),d=get(root,"delta"),alpha=get(root,"alpha");
   const g=s*A-d;
   const x=t=>90+t/50*540, vmin=0.4, vmax=Math.max(2.0,Math.exp(g*50),Math.pow(Math.pow(s/d,1/(1-alpha)),alpha))*1.08;
   const clamp=v=>Math.max(vmin,Math.min(vmax,v)), y=v=>290-(clamp(v)-vmin)/(vmax-vmin)*250;
   let ak="",so="",k=1,dt=0.1,y0=1;
   for(let i=0;i<=500;i++){const t=i*dt;ak+=(i?"L":"M")+fmt(x(t))+" "+fmt(y(Math.exp(g*t)));}
   for(let i=0;i<=500;i++){const t=i*dt;k=Math.max(0.0001,k+(s*Math.pow(k,alpha)-d*k)*dt);so+=(i?"L":"M")+fmt(x(t))+" "+fmt(y(Math.pow(k,alpha)/y0));}
   set(svg,".ak-path","d",ak);set(svg,".solow-path","d",so);
   const kstar=s>0&&d>0?Math.pow(s/d,1/(1-alpha)):NaN, ystar=Math.pow(kstar,alpha);
   output(root,"AK 长期增长率 g = s·A − δ = "+fmt(g*100)+"%；索洛稳态人均资本 k*="+fmt(kstar)+"、稳态人均产出 y*="+fmt(ystar)+"（此处设 n=g=0 便于对照）。");
 }
 function render(root){const svg=root.querySelector('svg[data-chart]');if(root.dataset.experiment==="ak")drawAk(root,svg);}
 document.querySelectorAll(".economics-lab").forEach(root=>{if(root.dataset.experiment!=="ak")return;root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));render(root);});
});
