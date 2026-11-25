"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawTaylor(root,svg){
   const pp=get(root,"phipi"),px=get(root,"phix"),pi=get(root,"pi"),x=get(root,"x");
   const rn=2,pit=2,PMAX=6,IMAX=16;
   const line=p=>rn+pit+pp*(p-pit)+px*x;
   const i=line(pi),real=i-pi;
   const X=p=>90+p/PMAX*550,Y=v=>290-Math.max(0,v)/IMAX*250;
   let d="",ref="";for(let k=0;k<=30;k++){const p=PMAX*k/30;d+=(k?"L":"M")+fmt(X(p))+" "+fmt(Y(line(p)));ref+=(k?"L":"M")+fmt(X(Math.min(p,PMAX)))+" "+fmt(Y(Math.min(p,PMAX)));}
   set(svg,".taylor-line","d",d);set(svg,".taylor-ref","d",ref);
   set(svg,".taylor-point","cx",fmt(X(pi)));set(svg,".taylor-point","cy",fmt(Y(i)));
   const lb=svg&&svg.querySelector(".taylor-label");
   if(lb){lb.setAttribute("x",fmt(Math.min(X(pi)+10,560)));lb.setAttribute("y",fmt(Y(i)-10));lb.textContent="i="+fmt(i)+"%";}
   const principle=pp>1?"φπ>1，满足泰勒原则：名义利率对通胀反应超过一比一，实际利率随通胀上升而上升。":"φπ≤1，不满足泰勒原则：名义利率反应不足，实际利率可能随通胀上升而下降，难以稳定通胀。";
   output(root,"名义政策利率 i="+fmt(i)+"%；实际利率 i−π="+fmt(real)+"%；"+principle);
 }
 function render(root){const svg=root.querySelector('svg[data-chart]');if(root.dataset.experiment==="taylor")drawTaylor(root,svg);}
 document.querySelectorAll(".economics-lab").forEach(root=>{if(root.dataset.experiment!=="taylor")return;root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));render(root);});
});
