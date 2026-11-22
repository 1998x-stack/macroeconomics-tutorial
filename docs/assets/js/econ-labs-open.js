"use strict";
document.addEventListener("DOMContentLoaded",()=>{
 const fmt=x=>Number.isFinite(x)?x.toFixed(2):"—";
 const get=(root,key)=>{const el=root.querySelector('input[name="'+key+'"]');if(!el)return NaN;const v=Number(el.value);return Number.isFinite(v)?Math.min(Number(el.max),Math.max(Number(el.min),v)):NaN};
 const set=(svg,sel,attr,value)=>{const e=svg?.querySelector(sel);if(e)e.setAttribute(attr,String(value))};
 const bar=(svg,key,value,max,bottom=290)=>{const h=Math.min(235,Math.max(0,value)/Math.max(1,max)*225);set(svg,'[data-bar="'+key+'"]',"y",fmt(bottom-h));set(svg,'[data-bar="'+key+'"]',"height",fmt(h))};
 const output=(root,s)=>{const el=root.querySelector("output");if(el)el.textContent=s};
 const point=(svg,sel,x,y)=>{set(svg,sel,"cx",fmt(x));set(svg,sel,"cy",fmt(y))};
 function render(root){
   const type=root.dataset.experiment, svg=root.querySelector('svg[data-chart]');
   if(type==="debt"){
      const r=get(root,"rate")/100,g=get(root,"growth")/100,pb=get(root,"pb"),d=80*(1+r)/(1+g)-pb,delta=d-80;
      output(root,"本期债务率 "+fmt(d)+"%；较期初"+(delta>=0?"增加 ":"下降 ")+fmt(Math.abs(delta))+" 个百分点。");
      const max=Math.max(100,d,80);
      bar(svg,"before",80,max);bar(svg,"after",d,max);
   }
   if(type==="phillips"){
      const u=get(root,"u"),ex=get(root,"expected"),s=get(root,"shock"),pi=ex-0.8*(u-4)+s;
      output(root,"模型通胀 "+fmt(pi)+"%；失业缺口 "+(u-4>=0?"+":"")+fmt(u-4)+" 个百分点。");
      const x=z=>90+z/15*520, y=z=>289-(z+8)/28*242;
      const line=svg?.querySelector(".phillips-line");
      if(line)line.setAttribute("d","M"+fmt(x(0))+" "+fmt(y(ex+3.2+s))+"L"+fmt(x(15))+" "+fmt(y(ex-8.8+s)));
      point(svg,".phillips-point",x(u),y(pi));
      const label=svg?.querySelector(".phillips-label");
      if(label){label.setAttribute("x",fmt(x(u)+12));label.setAttribute("y",fmt(y(pi)-12));label.textContent="E ("+fmt(u)+"; "+fmt(pi)+")";}
   }
   if(type==="bankstress"){
      const assets=get(root,"assets"),liabilities=get(root,"debt"),loss=get(root,"loss"),initial=assets-liabilities,post=assets*(1-loss/100)-liabilities,remaining=assets*(1-loss/100);
      const capital=remaining>0?post/remaining*100:NaN;
      output(root,"期初权益 "+fmt(initial)+"；冲击后权益 "+fmt(post)+"；冲击后权益资产比 "+fmt(capital)+"%"+(post<0?"（负权益）":"")+"。");
      const max=Math.max(20,initial,post);
      bar(svg,"before",initial,max);bar(svg,"after",post,max);
   }
   if(type==="bop"){
      const ca=get(root,"x")-get(root,"imports")+get(root,"pi")+get(root,"si"),net=ca+get(root,"ka");
      output(root,"经常账户 CA = "+fmt(ca)+"；CA+KA = "+fmt(net)+"（"+(net>=0?"净贷出":"净借款")+"）。");
      const maximum=Math.max(20,Math.abs(ca),Math.abs(net));
      for(const [key,v] of [["ca",ca],["nl",net]]){
        const h=Math.abs(v)/maximum*105;
        set(svg,'[data-bar="'+key+'"]',"y",fmt(v>=0?160-h:160));
        set(svg,'[data-bar="'+key+'"]',"height",fmt(h));
      }
   }
   if(type==="fx"){
      const p=get(root,"pd"),pf=get(root,"pf"),spot=get(root,"spot"),i=get(root,"idom")/100,istar=get(root,"ifor")/100;
      const implied=p/pf,q=spot*pf/p,expected=spot*(1+i)/(1+istar);
      output(root,"PPP隐含E="+fmt(implied)+"；实际汇率q="+fmt(q)+"；无风险溢价UIP隐含未来预期E="+fmt(expected)+"。");
      const maximum=Math.max(20,spot,implied);
      bar(svg,"spot",spot,maximum);bar(svg,"ppp",implied,maximum);
   }
 }
 document.querySelectorAll('.economics-lab').forEach(root=>{
   if(!["debt","phillips","bankstress","bop","fx"].includes(root.dataset.experiment))return;
   root.querySelectorAll("input").forEach(el=>el.addEventListener("input",()=>render(root)));
   render(root);
 });
});