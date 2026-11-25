"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(1):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawStag(root,svg){
   const d=get(root,"demand"),shock=get(root,"shock"),Yn=100,P0=100;
   const Y=(140+d-0.8*shock)/1.4,P=P0+shock+0.5*(Y-Yn);
   const YMIN=85,YMAX=115,PMIN=90,PMAX=120;
   const X=y=>90+(y-YMIN)/(YMAX-YMIN)*550,Yp=p=>290-(p-PMIN)/(PMAX-PMIN)*250;
   const ad=y=>P0+(100+d-y)/0.8, sras=(y,s)=>P0+s+0.5*(y-Yn);
   const line=(fn,step)=>fn.map(()=>"");let dl=(fn,s)=>{let t="";for(let k=0;k<=20;k++){const y=YMIN+(YMAX-YMIN)*k/20;t+=(k?"L":"M")+fmt(X(y))+" "+fmt(Yp(fn(y,s)));}return t;};
   set(svg,".ad-line","d",dl((y)=>ad(y)));
   set(svg,".sras0-line","d",dl((y)=>sras(y,0)));
   set(svg,".sras1-line","d",dl((y,s)=>sras(y,shock)));
   set(svg,".eq-point","cx",fmt(X(Y)));set(svg,".eq-point","cy",fmt(Yp(P)));
   const lb=svg&&svg.querySelector(".eq-label");if(lb){lb.setAttribute("x",fmt(X(Y)+10));lb.setAttribute("y",fmt(Yp(P)-10));lb.textContent="E ("+fmt(Y)+", "+fmt(P)+")";}
   const gapY=Y-Yn;let kind="基准（无供给冲击）";if(shock>0.1){kind=gapY<0?"供给冲击占优：产出下降、物价上升（类滞胀）":"需求回升抵消部分供给冲击";}else if(d>0.1){kind="需求扩张：产出与物价同升";}
   output(root,"短期均衡 Y="+fmt(Y)+"（潜在产出 100）、价格水平 P="+fmt(P)+"；产出缺口 "+fmt(gapY)+"。判定："+kind+"。SRAS 左移幅度由“供给冲击”滑块控制。");
 }
 function render(root){const svg=root.querySelector('svg[data-chart]');if(root.dataset.experiment==="stagflation")drawStag(root,svg);}
 document.querySelectorAll(".economics-lab").forEach(root=>{if(root.dataset.experiment!=="stagflation")return;root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));render(root);});
});
