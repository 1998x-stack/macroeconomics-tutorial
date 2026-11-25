"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(1):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawCycle(root,svg){
   const c=get(root,"c"),acc=get(root,"acc"),shock=get(root,"shock"),G=100,T=50;
   const base=G/(1-c);
   const series=[];let prev=base,prev2=base,max=base,min=base;
   for(let t=0;t<=T;t++){
     const Gt=(t>=1&&t<=2)?G+shock:G;
     const Y=c*prev+acc*(prev-prev2)+Gt;
     series.push(Y);max=Math.max(max,Y);min=Math.min(min,Y);prev2=prev;prev=Y;
   }
   const span=Math.max(max-base,base-min,1)*1.15;
   const top=base+span,bot=base-span;
   const x=t=>90+t/T*540,y=v=>290-(v-bot)/(top-bot)*250;
   let d="";series.forEach((Y,t)=>{d+=(t?"L":"M")+fmt(x(t))+" "+fmt(y(Y));});
   set(svg,".cycle-path","d",d);
   set(svg,".cycle-base","y1",fmt(y(base)));set(svg,".cycle-base","y2",fmt(y(base)));
   const peak=Math.max(...series),trough=Math.min(...series),last=series[series.length-1];
   const damp=Math.abs(last-base)<0.5? "回到稳态（衰减振荡）": (Math.abs(series[48]-base)>Math.abs(series[40]-base)? "振幅未衰减（可能发散）":"仍在振荡");
   output(root,"稳态 Y*=G/(1−c)="+fmt(base)+"；峰值 "+fmt(peak)+"、谷底 "+fmt(trough)+"；末期偏离 "+(last-base).toFixed(1)+"，形态：" +damp+"。");
 }
 function render(root){const svg=root.querySelector('svg[data-chart]');if(root.dataset.experiment==="cycle")drawCycle(root,svg);}
 document.querySelectorAll(".economics-lab").forEach(root=>{if(root.dataset.experiment!=="cycle")return;root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));render(root);});
});
