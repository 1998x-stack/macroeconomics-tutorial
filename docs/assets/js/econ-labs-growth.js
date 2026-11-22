"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const clamp=(x,lo,hi)=>Math.min(hi,Math.max(lo,x));
 const read=(root,key)=>{
   const el=root.querySelector('[name="'+key+'"]');
   if(!el)return NaN;
   if(el.tagName==="SELECT")return el.value;
   const v=Number(el.value);
   if(!Number.isFinite(v))return NaN;
   return clamp(v,Number(el.min),Number(el.max));
 };
 const fmt=(x,d=2)=>Number.isFinite(x)?x.toFixed(d):"—";
 const out=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s;};
 const graph=root=>root.querySelector('svg[data-chart]');
 const setAttr=(svg,selector,key,value)=>{const el=svg?.querySelector(selector);if(el)el.setAttribute(key,String(value));};
 const pathFor=(values,x0,x1,y0,y1,min,max)=>{
   const span=Math.max(1e-9,max-min);
   return values.map((v,i)=>{
     const x=x0+(x1-x0)*(i/Math.max(1,values.length-1));
     const y=y1-(y1-y0)*((v-min)/span);
     return (i?"L":"M")+fmt(x,1)+" "+fmt(y,1);
   }).join(" ");
 };
 const updatePath=(svg,name,values,range)=>{
   const [min,max,x0=72,x1=640,y0=36,y1=292]=range;
   setAttr(svg,'[data-path="'+name+'"]',"d",pathFor(values,x0,x1,y0,y1,min,max));
 };
 function render(root){
   const type=root.dataset.experiment,svg=graph(root);
   if(type==="solow"){
     const s=read(root,"s"),alpha=read(root,"alpha"),n=read(root,"n")/100,g=read(root,"g")/100,delta=read(root,"delta")/100;
     const m=n+g+delta,kss=Math.pow(s/m,1/(1-alpha)),kgr=Math.pow(alpha/m,1/(1-alpha));
     const yss=Math.pow(kss,alpha),css=yss-m*kss,cgr=Math.pow(kgr,alpha)-m*kgr;
     out(root,"稳态 k*="+fmt(kss)+"，y*="+fmt(yss)+"，c*="+fmt(css)+"；黄金律 k_GR="+fmt(kgr)+"，s_GR="+fmt(alpha*100,1)+"%。黄金律稳态消费 "+fmt(cgr)+"。");
     const vals=[];let k=1,dt=.25;
     for(let t=0;t<=320;t++){vals.push(k);k=Math.max(0,k+dt*(s*Math.pow(Math.max(k,1e-9),alpha)-m*k));}
     const max=Math.max(kss,kgr,1)*1.12;
     updatePath(svg,"capital",vals,[0,max]);
     const y=292-(kss/max)*256;
     setAttr(svg,'[data-line="steady"]',"y1",fmt(y,1));
     setAttr(svg,'[data-line="steady"]',"y2",fmt(y,1));
   }
   if(type==="ideas"){
     const share=read(root,"share")/100,eta=read(root,"eta"),lambda=read(root,"lambda"),phi=read(root,"phi"),ha=100*share;
     const growth=eta*Math.pow(ha,lambda);
     const vals=[];let A=1,dt=.25;
     for(let t=0;t<=60;t++){vals.push(A);A+=dt*eta*Math.pow(ha,lambda)*Math.pow(A,phi);}
     out(root,"初始知识增长率 "+fmt(growth*100)+"%/年；15年后知识存量指数 "+fmt(A)+"（A₀=1）。研发人员 H_A="+fmt(ha,1)+" 个标准化单位。");
     const max=Math.max(1.1,A)*1.08;
     updatePath(svg,"ideas",vals,[0,max]);
   }
   if(type==="cycle"){
     const kind=read(root,"shockType"),rho=read(root,"rho"),size=read(root,"size");
     let x=0,pi=0;const xs=[],pis=[];
     for(let t=0;t<20;t++){
       const z=size*Math.pow(rho,t);
       x=.55*x+(kind==="demand"?1:.8)*z;
       pi=.5*pi+(kind==="demand"?.25:-.18)*z;
       xs.push(x);pis.push(pi);
     }
     const xmax=Math.max(...xs),pmin=Math.min(0,...pis),pmax=Math.max(0,...pis);
     updatePath(svg,"output",xs,[0,Math.max(.1,xmax)*1.1,72,640,36,164]);
     updatePath(svg,"inflation",pis,[pmin-.02,pmax+.02,72,640,207,326]);
     const typeName=kind==="demand"?"需求冲击":"技术冲击";
     const inflationText=kind==="demand"?"通胀响应峰值 "+fmt(pmax):"通胀响应最低 "+fmt(pmin);
     out(root,typeName+"：产出缺口峰值 "+fmt(xmax)+"；"+inflationText+"（构造单位）。冲击持久性 ρ="+fmt(rho,2)+"。");
   }
   if(type==="expectations"){
     const initial=read(root,"initial"),target=read(root,"target"),lambda=read(root,"lambda");
     let expected=initial;const adaptive=[initial],actual=[initial],benchmark=[initial];
     for(let t=1;t<=10;t++){expected=expected+lambda*(target-expected);adaptive.push(expected);actual.push(target);benchmark.push(target);}
     const min=Math.min(0,initial,target)-.5,max=Math.max(initial,target)+.5;
     updatePath(svg,"actual",actual,[min,max,72,640,35,292]);
     updatePath(svg,"adaptive",adaptive,[min,max,72,640,35,292]);
     updatePath(svg,"benchmark",benchmark,[min,max,72,640,35,292]);
     out(root,"第10期适应性预期 "+fmt(expected)+"%；距新通胀 "+fmt(Math.abs(target-expected))+" 个百分点。完全知晓新制度的基准为 "+fmt(target)+"%。");
   }
   if(type==="dsge"){
     const rho=read(root,"rho"),sigma=read(root,"sigma"),vals=[];
     let a=sigma;for(let t=0;t<=20;t++){vals.push(a);a*=rho;}
     const half=rho>0&&rho<1?Math.log(.5)/Math.log(rho):Infinity;
     out(root,"首期创新 "+fmt(sigma,4)+"；第10期冲击存量 "+fmt(vals[10],4)+"；半衰期约 "+fmt(half,1)+" 期。");
     updatePath(svg,"ar1",vals,[0,Math.max(sigma,.001)*1.08,72,640,36,292]);
   }
 }
 document.querySelectorAll(".economics-lab[data-experiment]").forEach(root=>{
   const type=root.dataset.experiment;
   if(!["solow","ideas","cycle","expectations","dsge"].includes(type))return;
   root.querySelectorAll("input,select").forEach(el=>{
     el.addEventListener("input",()=>render(root));
     el.addEventListener("change",()=>render(root));
   });
   render(root);
 });
});