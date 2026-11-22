"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const get=(root,name)=>{const el=root.querySelector('input[name="'+name+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const put=(root,s)=>{const out=root.querySelector("output");if(out)out.textContent=s};
 const attr=(root,selector,field,value)=>{const el=root?.querySelector(selector);if(el)el.setAttribute(field,String(value))};
 const movePoint=(root,selector,x,y)=>{attr(root,selector,"cx",fmt(x));attr(root,selector,"cy",fmt(y))};
 const path=(root,selector,points)=>attr(root,selector,"d","M"+points.map(p=>fmt(p[0])+" "+fmt(p[1])).join("L"));
 const bars=(root,items,maximum)=>items.forEach(([key,value])=>{const h=Math.max(0,Math.min(225,225*value/maximum));attr(root,'[data-bar="'+key+'"]',"y",fmt(290-h));attr(root,'[data-bar="'+key+'"]',"height",fmt(h))});
 function draw(root){
  const type=root.dataset.experiment,svg=root.querySelector("svg[data-chart]");
  if(type==="islm"){
   const dg=get(root,"dg"),dm=get(root,"dm"),A=220+dg,m=200+dm,D=0.4+4*0.5/10;
   const Y=(A+4*m/10)/D,i=(0.5*Y-m)/10;
   put(root,"基准 Y=500.00、i=5.00%；新均衡 Y="+fmt(Y)+"、i="+fmt(i)+"%；相对基准 ΔY="+fmt(Y-500)+"。");
   const x=y=>90+(y-350)/330*520,yaxis=r=>40+(15-r)/20*240;
   path(svg,".islm-is",[350,680].map(y=>[x(y),yaxis((A-0.4*y)/4)]));
   path(svg,".islm-lm",[350,680].map(y=>[x(y),yaxis((0.5*y-m)/10)]));
   movePoint(svg,".islm-point",x(Y),yaxis(i));
   const label=svg?.querySelector(".islm-label");if(label){label.setAttribute("x",fmt(x(Y)+12));label.setAttribute("y",fmt(yaxis(i)-12));label.textContent="E ("+fmt(Y)+", "+fmt(i)+"%)";}
  }
  if(type==="adas"){
   const D=get(root,"d"),S=get(root,"s");
   const Y=100+(D-S)/1.2,P=100+S+0.5*(Y-100);
   put(root,"短期均衡 Y="+fmt(Y)+"；综合价格水平 P="+fmt(P)+"；产出缺口 "+fmt(Y-100)+"。");
   const x=Y=>90+(Y-50)/100*530,y=P=>40+(140-P)/80*240;
   path(svg,".adas-ad",[50,150].map(Y=>[x(Y),y(100+D-0.7*(Y-100))]));
   path(svg,".adas-sras",[50,150].map(Y=>[x(Y),y(100+S+0.5*(Y-100))]));
   path(svg,".adas-lras",[[100,140],[100,60]].map(([Y,P])=>[x(Y),y(P)]));
   movePoint(svg,".adas-point",x(Y),y(P));
   const label=svg?.querySelector(".adas-label");if(label){label.setAttribute("x",fmt(x(Y)+12));label.setAttribute("y",fmt(y(P)-12));label.textContent="E ("+fmt(Y)+", "+fmt(P)+")";}
  }
  if(type==="consumption"){
   const y1=get(root,"y1"),y2=get(root,"y2"),credit=get(root,"credit");
   const desired=(y1+y2)/2,c1=Math.min(desired,y1+credit),c2=y1+y2-c1,borrowing=Math.max(0,c1-y1);
   put(root,"无约束平均消费 "+fmt(desired)+"；受约束 C₁="+fmt(c1)+"，C₂="+fmt(c2)+"；第一期借款 "+fmt(borrowing)+"。");
   const max=Math.max(200,y1,y2,c1,c2,1);
   bars(svg,[["inc1",y1],["con1",c1],["inc2",y2],["con2",c2]],max);
  }
  if(type==="collateral"){
   const asset=get(root,"asset"),LTV=get(root,"ltv")/100,cash=get(root,"cash");
   const need=Math.max(0,100-cash),limit=asset*LTV,gap=Math.max(0,need-limit);
   put(root,"外部资金需求 "+fmt(need)+"；抵押支持额度 "+fmt(limit)+"；资金缺口 "+fmt(gap)+"。");
   bars(svg,[["need",need],["limit",limit]],Math.max(120,need,limit,1));
  }
  if(type==="transmission"){
   const policy=get(root,"policy"),shock=get(root,"shock"),spread=get(root,"spread"),pass=get(root,"pass");
   const before=policy+spread,after=before+shock*pass;
   const q0=Math.max(0,120-10*before),q1=Math.max(0,120-10*after);
   put(root,"初始融资成本 "+fmt(before)+"%；冲击后 "+fmt(after)+"%；示意贷款需求 "+fmt(q0)+" → "+fmt(q1)+"。");
   bars(svg,[["before",before],["after",after]],Math.max(12,before,after,1));
  }
 }
 document.querySelectorAll(".economics-lab").forEach(root=>{
  if(!["islm","adas","consumption","collateral","transmission"].includes(root.dataset.experiment))return;
  root.querySelectorAll("input").forEach(input=>input.addEventListener("input",()=>draw(root)));
  draw(root);
 });
});