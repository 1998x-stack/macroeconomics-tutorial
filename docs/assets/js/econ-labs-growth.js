"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 function drawSolow(root,svg){
   const s=get(root,"s"),d=get(root,"delta"),n=get(root,"n"),g=get(root,"g"),a=get(root,"alpha");
   const b=d+n+g,kmax=20;
   const kstar=b>0?Math.pow(s/b,1/(1-a)):NaN, ystar=Math.pow(kstar,a);
   const vmax=Math.max(1.2,s*Math.pow(kmax,a),b*kmax)*1.15;
   const x=k=>90+k/kmax*540, y=v=>290-v/vmax*250, f=k=>Math.pow(Math.max(k,0),a);
   let inv="",be="";
   for(let i=0;i<=40;i++){const k=kmax*i/40;inv+=(i?"L":"M")+fmt(x(k))+" "+fmt(y(s*f(k)));be+=(i?"L":"M")+fmt(x(k))+" "+fmt(y(b*k));}
   set(svg,".solow-invest","d",inv);set(svg,".solow-breakeven","d",be);
   set(svg,".solow-point","cx",fmt(x(kstar)));set(svg,".solow-point","cy",fmt(y(ystar)));
   const lb=svg&&svg.querySelector(".solow-label");
   if(lb){lb.setAttribute("x",fmt(x(kstar)+10));lb.setAttribute("y",fmt(y(ystar)-10));lb.textContent="k*="+fmt(kstar)+" y*="+fmt(ystar);}
   output(root,"稳态人均资本 k*="+fmt(kstar)+"；稳态人均产出 y*="+fmt(ystar)+"；收支相抵投资需求 (δ+n+g) = "+(b*100).toFixed(1)+"%。");
 }
 function render(root){
   const type=root.dataset.experiment, svg=root.querySelector('svg[data-chart]');
   if(type==="solow")drawSolow(root,svg);
 }
 document.querySelectorAll('.economics-lab').forEach(root=>{
   if(root.dataset.experiment!=="solow")return;
   root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));
   render(root);
 });
});
