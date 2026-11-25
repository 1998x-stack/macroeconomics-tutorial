"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawSim(root,svg){
   const dg=get(root,"dg"),dm=get(root,"dm");
   const A=220+dg,m=200+dm,D=0.6;
   const Y=(A+4*m/10)/D,i=(0.5*Y-m)/10;
   const x=y=>90+(y-350)/330*520,yax=r=>40+(15-r)/20*240;
   const isPath=(a)=>[350,680].map(y=>[x(y),yax((a-0.4*y)/4)]);
   const lmPath=(mm)=>[350,680].map(y=>[x(y),yax((0.5*y-mm)/10)]);
   const path=(sel,pts)=>set(svg,sel,"d","M"+pts.map(p=>fmt(p[0])+" "+fmt(p[1])).join("L"));
   path(".is-base",isPath(220));path(".lm-base",lmPath(200));
   path(".is-curr",isPath(A));path(".lm-curr",lmPath(m));
   set(svg,".sim-point","cx",fmt(x(Y)));set(svg,".sim-point","cy",fmt(yax(i)));
   const lb=svg&&svg.querySelector(".sim-label");if(lb){lb.setAttribute("x",fmt(x(Y)+12));lb.setAttribute("y",fmt(yax(i)-12));lb.textContent="E ("+fmt(Y)+", "+fmt(i)+"%)";}
   output(root,"新均衡产出 Y="+fmt(Y)+"（基准 500），利率 i="+fmt(i)+"%（基准 5%）；ΔY="+fmt(Y-500)+"、Δi="+fmt(i-5)+"。财政扩张使 IS 右移、降息使 LM 右移。量级为构造演算，不构成对真实政策的预测。");
 }
 function render(root){const svg=root.querySelector('svg[data-chart]');if(root.dataset.experiment==="policysim")drawSim(root,svg);}
 document.querySelectorAll(".economics-lab").forEach(root=>{if(root.dataset.experiment!=="policysim")return;root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));render(root);});
});
