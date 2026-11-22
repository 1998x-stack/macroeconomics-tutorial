#!/usr/bin/env python3
"""Playwright browser acceptance for new site + chapters 01..10.
Requires: pip install playwright && python -m playwright install chromium
"""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys
R=Path(__file__).resolve().parents[1]/"docs"
FILES=["index.html"]+[f"chapters/{n:02d}.html" for n in range(1,11)]
WIDTHS=[1440,390,360]
errors=[]
with sync_playwright() as p:
 browser=p.chromium.launch(headless=True)
 for rel in FILES:
  for w in WIDTHS:
   page=browser.new_page(viewport={"width":w,"height":850},device_scale_factor=1)
   page.on("pageerror",lambda exc,rel=rel,w=w:errors.append(f"{rel}@{w}: JS {exc}"))
   page.on("console",lambda msg,rel=rel,w=w:errors.append(f"{rel}@{w}: console {msg.text}") if msg.type=="error" else None)
   try:
    page.goto((R/rel).resolve().as_uri(),wait_until="load",timeout=30000)
    page.evaluate("""() => document.querySelectorAll("img[loading=lazy]").forEach(img => img.loading="eager")""")
    page.wait_for_function("""() => [...document.images].every(img => img.complete)""",timeout=15000)
    page.wait_for_timeout(100)
    metrics=page.evaluate("""() => ({outer:document.documentElement.scrollWidth,inner:innerWidth,images:[...document.images].map(x=>({src:x.getAttribute('src'),ok:x.complete&&x.naturalWidth>0})),math:[...document.querySelectorAll('math')].map(x=>x.getBoundingClientRect().width)})""")
    if metrics["outer"]>metrics["inner"]+1:errors.append(f"{rel}@{w}: horizontal document overflow {metrics['outer']}>{metrics['inner']}")
    for img in metrics["images"]:
     if not img["ok"]:errors.append(f"{rel}@{w}: broken image {img['src']}")
    if rel!="index.html" and (not metrics["math"] or any(v<=0 for v in metrics["math"])):errors.append(f"{rel}@{w}: invisible MathML")
    if w==1440 and rel!="index.html":
     t=page.locator(".exercise input").first
     if t.count():
      previous=page.locator(".exercise output").first.inner_text()
      before=t.input_value()
      t.fill(str(float(before)+1 if float(before)+1<=float(t.get_attribute("max")) else float(before)-1))
      after=page.locator(".exercise output").first.inner_text()
      if before==t.input_value() or previous==after:errors.append(f"{rel}: interaction not updated")
      for lab in page.locator(".economics-lab").all():
       graph=lab.locator("svg[data-chart]")
       if not graph.count():continue
       changed_input=lab.locator("input").first
       before_svg=graph.inner_html()
       original_value=changed_input.input_value()
       changed_input.fill(str(float(original_value)+1 if float(original_value)+1<=float(changed_input.get_attribute("max")) else float(original_value)-1))
       after_svg=graph.inner_html()
       if before_svg==after_svg:errors.append(f"{rel}: diagram {graph.get_attribute('data-chart')} did not update")
    if w in (1440,390):
     out=Path("qa-screenshots");out.mkdir(exist_ok=True)
     page.screenshot(path=str(out/(rel.replace("/","-")+"-"+str(w)+".png")),full_page=True)
   except Exception as exc:
    errors.append(f"{rel}@{w}: {exc}")
   finally:
    page.close()
 browser.close()
if errors:
 print("\n".join(errors));sys.exit(1)
print(f"Browser QA passed: {len(FILES)} pages at widths {WIDTHS}, images, MathML, basic experiments, runtime errors")
