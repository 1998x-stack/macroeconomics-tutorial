"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const f=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const numeric=(root,name)=>{const input=root.querySelector('input[name="'+name+'"]');if(!input)return NaN;let x=Number(input.value);if(!Number.isFinite(x))return NaN;return Math.min(Number(input.max),Math.max(Number(input.min),x))};
 const put=(root,value)=>{const node=root.querySelector("output");if(node)node.textContent=value};
 const path=(svg,selector,value)=>{const element=svg?.querySelector(selector);if(element)element.setAttribute("d",value)};
 const points=(svg,selector,value)=>{const element=svg?.querySelector(selector);if(element)element.setAttribute("points",value)};
 const loc=(svg,selector,x,y)=>{const n=svg?.querySelector(selector);if(n){n.setAttribute("cx",f(x));n.setAttribute("cy",f(y))}};
 function render(root){
  const type=root.dataset.experiment;
  const graph=root.querySelector("svg[data-chart]");
  if(type==="realrate"){
   const i=numeric(root,"i")/100,p=numeric(root,"infl")/100,r=(1+i)/(1+p)-1;
   put(root,"事后实际年收益率 "+f(r*100)+"%；线性近似 "+f((i-p)*100)+"%。");
  }
  if(type==="yield"){
   const short=numeric(root,"short"),spread=numeric(root,"spread");
   put(root,"10年与短端利差 "+f(spread)+" 个百分点："+(spread<0?"倒挂":spread===0?"平坦":"正斜率")+"；仅用于观察形态，不保证预测经济周期。");
   if(graph){const scaleMin=Math.min(short,short+spread)-2,scaleMax=Math.max(short,short+spread)+2;
    const xy=(j,y)=>[82+j*130,285-(y-scaleMin)/(scaleMax-scaleMin)*218];
    points(graph,".lab-series",[0,1,2,3,4].map(j=>{const [x,y]=xy(j,short+spread*j/4);return f(x)+","+f(y)}).join(" "));
   }
  }
  if(type==="annual"){
   const a=numeric(root,"old"),b=numeric(root,"now"),q=b/a-1,annual=Math.pow(b/a,4)-1;
   put(root,"季度环比 "+f(q*100)+"%；复利年化 "+f(annual*100)+"%；两者不能混读。");
  }
  if(type==="keynes"){
   const a=numeric(root,"a"),c=numeric(root,"c"),y=a/(1-c);
   put(root,"均衡产出 Y*="+f(y)+"；计划支出 AE="+f(a)+"+"+f(c)+"Y。");
   if(graph){const top=Math.max(200,y*1.3,a*1.2),x=z=>72+z/top*528,yy=z=>286-z/top*245;
    path(graph,".line45", "M"+f(x(0))+" "+f(yy(0))+"L"+f(x(top))+" "+f(yy(top)));
    path(graph,".aeline","M"+f(x(0))+" "+f(yy(a))+"L"+f(x(top))+" "+f(yy(a+c*top)));
    loc(graph,".point",x(y),yy(y));
    const label=graph.querySelector(".intersect");if(label){label.setAttribute("x",f(x(y)+12));label.setAttribute("y",f(yy(y)-12));label.textContent="E ("+f(y)+")"}
   }
  }
  if(type==="is"){
   const r=numeric(root,"r"),dg=numeric(root,"dg"),c=0.6,a=120,b=4;
   const y=(a-b*r)/(1-c),y2=(a+dg-b*r)/(1-c);
   put(root,"基准 Y="+f(y)+"；政策后同一利率的 Y="+f(y2)+"；固定利率下差额 "+f(y2-y)+"。");
   if(graph){const x=z=>82+z/500*535,yy=z=>284-z/12*228,cb=z=>(a-b*z)/(1-c),cs=z=>(a+dg-b*z)/(1-c);
    path(graph,".is-base","M"+f(x(cb(12)))+" "+f(yy(12))+"L"+f(x(cb(0)))+" "+f(yy(0)));
    path(graph,".is-shift","M"+f(x(cs(12)))+" "+f(yy(12))+"L"+f(x(cs(0)))+" "+f(yy(0)));
    loc(graph,".is-point",x(y),yy(r));
   }
  }
  if(type==="lm"){
   const y=numeric(root,"y"),money=numeric(root,"money"),p=numeric(root,"policy"),rate=(0.5*y-money)/10;
   put(root,"经典 LM 名义利率 i="+f(rate)+"%；固定政策利率 MP 为 "+f(p)+"%。二者不是同一操作假设。");
   if(graph){const x=z=>80+(z-300)/600*525,yy=z=>283-z/22*228,low=2*money,high=2*(money+220);
    path(graph,".lm-line","M"+f(x(low))+" "+f(yy(0))+"L"+f(x(high))+" "+f(yy(22)));
    path(graph,".mp-line","M"+f(x(300))+" "+f(yy(p))+"L"+f(x(900))+" "+f(yy(p)));
    loc(graph,".lm-point",x(y),yy(rate));
   }
  }
 }
 document.querySelectorAll(".economics-lab").forEach(root=>{
  root.querySelectorAll("input").forEach(input=>input.addEventListener("input",()=>render(root)));
  render(root);
 });
});