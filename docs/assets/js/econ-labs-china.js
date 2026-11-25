"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(1):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawGA(root,svg){
   const gK=get(root,"gK"),gL=get(root,"gL"),gA=get(root,"gA"),a=get(root,"alpha");
   const cap=a*gK,lab=(1-a)*gL,tfp=gA,tot=cap+lab+tfp;
   const m=Math.max(tot,cap,lab,tfp,1)*1.15,H=v=>Math.max(0,v/m*220);
   const bar=(sel,v)=>{set(svg,sel,"y",290-H(v));set(svg,sel,"height",H(v));};
   const val=(sel,v)=>{const e=svg&&svg.querySelector(sel);if(e){e.setAttribute("y",290-H(v)-8);e.textContent=v.toFixed(1);}};
   bar(".ga-cap",cap);bar(".ga-lab",lab);bar(".ga-tfp",tfp);
   val(".ga-cap-v",cap);val(".ga-lab-v",lab);val(".ga-tfp-v",tfp);
   const share=cap+lab>0?(tfp/tot*100):0;
   output(root,"产出增速 ΔY/Y = α·ΔK/K + (1−α)·ΔL/L + ΔA/A = "+fmt(tot)+"%；其中资本贡献 "+fmt(cap)+"、劳动贡献 "+fmt(lab)+"、TFP 残差 "+fmt(tfp)+"（TFP 占比约 "+fmt(share)+"%）。");
 }
 function render(root){const svg=root.querySelector('svg[data-chart]');if(root.dataset.experiment==="growthaccounting")drawGA(root,svg);}
 document.querySelectorAll(".economics-lab").forEach(root=>{if(root.dataset.experiment!=="growthaccounting")return;root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));render(root);});
});
