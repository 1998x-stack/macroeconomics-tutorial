"use strict";
// Interactive charts for chapters 01–05 and 07. Numbers are recomputed from the
// same inputs used for the text output; every chart is a construct, not a statistic.
document.addEventListener("DOMContentLoaded",()=>{
 const f=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const numeric=(root,name)=>{const i=root.querySelector('input[name="'+name+'"]');if(!i)return NaN;let x=Number(i.value);return Number.isFinite(x)?Math.min(Number(i.max),Math.max(Number(i.min),x)):NaN};
 const path=(svg,sel,value)=>{const e=svg&&svg.querySelector(sel);if(e)e.setAttribute("d",value)};
 const put=(svg,sel,x,y)=>{const n=svg&&svg.querySelector(sel);if(n){n.setAttribute("cx",f(x));n.setAttribute("cy",f(y))}};
 const label=(svg,sel,text)=>{const n=svg&&svg.querySelector(sel);if(n)n.textContent=text};
 function render(root){
  const type=root.dataset.experiment;
  const g=root.querySelector("svg[data-chart]");
  if(!g)return;
  if(type==="multiplier"){
   const c=numeric(root,"c"),dg=numeric(root,"g");
   if(!Number.isFinite(c)||!Number.isFinite(dg))return;
   const y=dg/(1-c),top=Math.max(200,y*1.3,dg*1.2);
   const x=z=>72+z/top*528,yy=z=>286-z/top*245;
   path(g,".mul-45","M"+f(x(0))+" "+f(yy(0))+"L"+f(x(top))+" "+f(yy(top)));
   path(g,".mul-ae","M"+f(x(0))+" "+f(yy(dg))+"L"+f(x(top))+" "+f(yy(dg+c*top)));
   put(g,".mul-point",x(y),yy(y));
   label(g,".mul-label","E ("+f(y)+")");
  }
 }
 document.querySelectorAll("[data-experiment]").forEach(root=>{
  if(root.querySelector("svg[data-chart]")){
   root.querySelectorAll("input").forEach(i=>i.addEventListener("input",()=>render(root)));
   render(root);
  }
 });
});
