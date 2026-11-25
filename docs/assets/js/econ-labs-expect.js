"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawAdaptive(root,svg){
   const lam=get(root,"lam"),act=get(root,"act"),e0=get(root,"e0"),T=20;
   const series=[];let e=e0;
   for(let t=0;t<=T;t++){series.push(e);e=e+lam*(act-e);}
   const top=Math.max(act,e0)*1.15+1,bot=Math.min(act,e0)*0.85-1;
   const x=t=>90+t/T*540,y=v=>290-(v-bot)/(top-bot)*250;
   let d="";series.forEach((E,t)=>{d+=(t?"L":"M")+fmt(x(t))+" "+fmt(y(E));});
   set(svg,".exp-path","d",d);
   set(svg,".exp-act","y1",fmt(y(act)));set(svg,".exp-act","y2",fmt(y(act)));
   let yrs="—";for(let t=1;t<=T;t++){if(Math.abs(series[t]-act)<0.1){yrs=t;break;}}
   const lastErr=act-series[T];
   output(root,"实际通胀 "+fmt(act)+"%；初始预期 "+fmt(e0)+"%。预期约在第 "+yrs+" 期进入实际值 ±0.1 以内；第 "+T+" 期残差 "+fmt(lastErr)+" 个百分点。λ 越小，追赶越慢、系统性偏低持续越久。");
 }
 function render(root){const svg=root.querySelector('svg[data-chart]');if(root.dataset.experiment==="adaptive")drawAdaptive(root,svg);}
 document.querySelectorAll(".economics-lab").forEach(root=>{if(root.dataset.experiment!=="adaptive")return;root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));render(root);});
});
