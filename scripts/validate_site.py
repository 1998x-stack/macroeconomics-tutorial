#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit
import xml.etree.ElementTree as ET, json, sys
R=Path(__file__).resolve().parents[1]/"docs"
err=[]
class H(HTMLParser):
 def __init__(self): super().__init__(); self.refs=[];self.h1=0;self.ids=set();self.img=[]
 def handle_starttag(self,t,a):
  d=dict(a);self.h1+=(t=="h1")
  if "id" in d:self.ids.add(d["id"])
  if t=="img":self.img.append(d)
  for key in ("href","src"):
   if d.get(key):self.refs.append(d[key])
for f in [R/"index.html"]+[R/"chapters"/f"{n:02d}.html" for n in range(1,29)]:
 if not f.exists():err.append("missing "+str(f));continue
 h=H();h.feed(f.read_text(encoding="utf-8"))
 if f==R/"index.html" or f.parent.name=="chapters" and int(f.stem)<=10:
  if h.h1!=1:err.append(f"{f}: {h.h1} H1 headings")
 for a in h.img:
  if not a.get("alt"):err.append(f"{f}: img missing alt")
 for link in h.refs:
  u=urlsplit(link)
  if u.scheme or link.startswith(("#","//","mailto:","javascript:")):continue
  t=(f.parent/u.path).resolve() if u.path else f.resolve()
  if not t.is_relative_to(R.resolve()) or not t.exists():err.append(f"{f}: bad link {link}")
for n in range(1,29):
 if not (R/f"{n:02d}.html").exists():err.append("missing legacy alias "+str(n))
for f in (R/"assets/svg").glob("*.svg"):
 try:
  x=ET.parse(f).getroot()
  if "viewBox" not in x.attrib or not {e.tag.split("}")[-1] for e in x}.issuperset({"title","desc"}):err.append(f"bad SVG accessibility {f}")
 except ET.ParseError as e:err.append(f"bad XML {f}: {e}")
for n in range(1,11):
 f=R/"chapters/evidence"/f"{n:02d}.json"
 if not f.exists():err.append("missing evidence "+str(f));continue
 j=json.loads(f.read_text(encoding="utf-8"))
 for item in j.get("claims",[]):
  if not all(k in item for k in ("id","claim","kind","source_url","locator","status","notes")):err.append(f"invalid ledger {f}")
 if not j.get("claims"):err.append("empty evidence "+str(f))
if err:print("\n".join(err));sys.exit(1)
print("Validated: 28 chapters, 28 URL aliases, SVG files, and ten evidence ledgers")
