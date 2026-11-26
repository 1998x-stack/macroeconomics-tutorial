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
  if(type==="gdp"){
   const c=numeric(root,"c"),i=numeric(root,"i"),gg=numeric(root,"g"),nx=numeric(root,"nx");
   if([c,i,gg,nx].some(v=>!Number.isFinite(v)))return;
   const vals=[c,i,gg,nx,c+i+gg+nx],keys=["c","i","g","nx","total"];
   const mx=Math.max(50,...vals.map(v=>Math.abs(v))),base=290,scale=230/mx;
   keys.forEach((k,idx)=>{
    const bar=g.querySelector(".gdp-"+k),v=vals[idx];
    if(bar){const h=Math.abs(v)*scale;bar.setAttribute("height",f(h));bar.setAttribute("y",f(v>=0?base-h:base));}
    const t=g.querySelector(".gdp-txt-"+k);
    if(t){t.setAttribute("y",f(v>=0?base-Math.abs(v)*scale-8:base+Math.abs(v)*scale+18));t.textContent=f(v);}
   });
  }
  if(type==="cpi"){
   const a=numeric(root,"apple"),r=numeric(root,"rice");
   if(!Number.isFinite(a)||!Number.isFinite(r))return;
   const mx=Math.max(6,a,r),base=250,scale=200/mx;
   const bar=(cls,v)=>{const b=g.querySelector(".cpi-bar.cpi-"+cls);
    if(b){const h=v*scale;b.setAttribute("height",f(h));b.setAttribute("y",f(base-h));}
    const t=g.querySelector(".cpi-txt-"+cls);if(t){t.textContent=f(v);t.setAttribute("y",f(base-v*scale-8));}};
   bar("apple",a);bar("rice",r);
   const bl=(cls,v)=>{const n=g.querySelector(".cpi-base-"+cls);if(n){n.setAttribute("y1",f(base-v*scale));n.setAttribute("y2",f(base-v*scale));}};
   bl("apple",2);bl("rice",4);
  }
  if(type==="labor"){
   const e=numeric(root,"e"),u=numeric(root,"u"),o=numeric(root,"out"),d=e+u,p=d+o;
   if(!(d>0&&p>0))return;
   const vals=[u/d*100,d/p*100,e/p*100],keys=["unemp","part","emppop"],base=260,scale=2;
   keys.forEach((k,idx)=>{
    const bar=g.querySelector(".labor-"+k),v=vals[idx];
    if(bar){bar.setAttribute("height",f(v*scale));bar.setAttribute("y",f(base-v*scale));}
    const t=g.querySelector(".labor-txt-"+k);if(t){t.textContent=f(v)+"%";t.setAttribute("y",f(base-v*scale-8));}
   });
  }
  if(type==="loan"){
   const v=numeric(root,"loan");
   if(!Number.isFinite(v))return;
   const base=250,scale=1,h=Math.min(v,200)*scale;
   [["asset",v],["deposit",v]].forEach(([k,val])=>{
    const b=g.querySelector(".loan-"+k);if(b){b.setAttribute("height",f(h));b.setAttribute("y",f(base-h));}
    const t=g.querySelector(".loan-txt-"+k);if(t){t.textContent="+"+f(val);t.setAttribute("y",f(base-h-8));}
   });
  }
  if(type==="annual"){
   const a=numeric(root,"old"),b=numeric(root,"now");
   if(!(a>0&&b>0))return;
   const q=(b/a-1)*100,ann=(Math.pow(b/a,4)-1)*100;
   const mx=Math.max(5,Math.abs(q),Math.abs(ann)),base=210,scale=150/mx;
   [["q",q],["a",ann]].forEach(([k,v])=>{
    const bar=g.querySelector(".annual-"+k),h=Math.abs(v)*scale;
    if(bar){bar.setAttribute("height",f(h));bar.setAttribute("y",f(v>=0?base-h:base));}
    const t=g.querySelector(".annual-txt-"+k);if(t){t.textContent=f(v)+"%";t.setAttribute("y",f(v>=0?base-h-8:base+h+18));}
   });
  }
 }
 document.querySelectorAll("[data-experiment]").forEach(root=>{
  if(root.querySelector("svg[data-chart]")){
   root.querySelectorAll("input").forEach(i=>i.addEventListener("input",()=>render(root)));
   render(root);
  }
 });
});
