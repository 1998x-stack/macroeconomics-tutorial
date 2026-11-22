#!/usr/bin/env python3
"""Playwright browser acceptance for homepage + chapters 01..25."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import sys

ROOT = Path(__file__).resolve().parents[1] / "docs"
FILES = ["index.html"] + [f"chapters/{n:02d}.html" for n in range(1, 26)]
WIDTHS = [1440, 390, 360]
EXPECTED = {
    "chapters/11.html": ["533.33", "6.67"],
    "chapters/12.html": ["108.33", "104.17"],
    "chapters/13.html": ["80.00", "120.00"],
    "chapters/14.html": ["70.00", "64.00", "6.00"],
    "chapters/15.html": ["6.00", "6.70", "53.00"],
    "chapters/16.html": ["80.55", "0.55"],
    "chapters/17.html": ["2.20", "1.00"],
    "chapters/18.html": ["8.00", "3.00", "3.16"],
    "chapters/19.html": ["-7.00", "-5.00"],
    "chapters/20.html": ["7.00", "1.00", "7.21"],
    "chapters/21.html": ["5.48", "1.31", "8.29"],
    "chapters/22.html": ["4.47", "1.95"],
    "chapters/23.html": ["1.30", "0.31"],
    "chapters/24.html": ["5.92", "0.08"],
    "chapters/25.html": ["0.0100", "0.0060"],
}
errors = []

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    for rel in FILES:
        for width in WIDTHS:
            page = browser.new_page(viewport={"width": width, "height": 850}, device_scale_factor=1)
            page.on("pageerror", lambda exc, rel=rel, width=width: errors.append(f"{rel}@{width}: JS {exc}"))
            page.on("console", lambda msg, rel=rel, width=width: errors.append(f"{rel}@{width}: console {msg.text}") if msg.type == "error" else None)
            try:
                page.goto((ROOT / rel).resolve().as_uri(), wait_until="load", timeout=30000)
                page.evaluate("""() => document.querySelectorAll('img[loading="lazy"]').forEach(img => img.loading="eager")""")
                page.wait_for_function("""() => [...document.images].every(img => img.complete)""", timeout=15000)
                page.wait_for_timeout(100)
                metrics = page.evaluate("""() => ({
                    outer: document.documentElement.scrollWidth,
                    inner: innerWidth,
                    images: [...document.images].map(x => ({src:x.getAttribute('src'), ok:x.complete && x.naturalWidth>0})),
                    math: [...document.querySelectorAll('math')].map(x => x.getBoundingClientRect().width)
                })""")
                if metrics["outer"] > metrics["inner"] + 1:
                    errors.append(f"{rel}@{width}: horizontal overflow {metrics['outer']}>{metrics['inner']}")
                for image in metrics["images"]:
                    if not image["ok"]:
                        errors.append(f"{rel}@{width}: broken image {image['src']}")
                if rel != "index.html" and (not metrics["math"] or any(v <= 0 for v in metrics["math"])):
                    errors.append(f"{rel}@{width}: invisible MathML")
                if width == 1440 and rel in EXPECTED:
                    output = page.locator(".economics-lab output").first.inner_text()
                    for token in EXPECTED[rel]:
                        if token not in output:
                            errors.append(f"{rel}: expected {token}, got {output}")
                if width == 1440 and rel != "index.html":
                    first_input = page.locator(".exercise input").first
                    if first_input.count():
                        before_output = page.locator(".exercise output").first.inner_text()
                        original = float(first_input.input_value())
                        minimum = float(first_input.get_attribute("min"))
                        maximum = float(first_input.get_attribute("max"))
                        changed = maximum if original < (minimum + maximum) / 2 else minimum
                        if changed == original:
                            changed = (minimum + maximum) / 2
                        first_input.fill(str(changed))
                        after_output = page.locator(".exercise output").first.inner_text()
                        if before_output == after_output:
                            errors.append(f"{rel}: input did not update output")
                    for lab in page.locator(".economics-lab").all():
                        chart = lab.locator("svg[data-chart]")
                        if not chart.count():
                            continue
                        input_el = lab.locator("input").first
                        before_svg = chart.inner_html()
                        original = float(input_el.input_value())
                        minimum = float(input_el.get_attribute("min"))
                        maximum = float(input_el.get_attribute("max"))
                        changed = maximum if original < (minimum + maximum) / 2 else minimum
                        if changed == original:
                            changed = (minimum + maximum) / 2
                        input_el.fill(str(changed))
                        if before_svg == chart.inner_html():
                            errors.append(f"{rel}: diagram {chart.get_attribute('data-chart')} did not update")
                    select_el = page.locator(".exercise select").first
                    if select_el.count():
                        before = page.locator(".exercise output").first.inner_text()
                        option = select_el.locator("option").nth(1).get_attribute("value")
                        select_el.select_option(option)
                        if before == page.locator(".exercise output").first.inner_text():
                            errors.append(f"{rel}: select control did not update output")
                if width in (1440, 390):
                    out = Path("qa-screenshots")
                    out.mkdir(exist_ok=True)
                    page.screenshot(path=str(out / (rel.replace("/", "-") + "-" + str(width) + ".png")), full_page=True)
            except Exception as exc:
                errors.append(f"{rel}@{width}: {exc}")
            finally:
                page.close()
    browser.close()

if errors:
    print("\\n".join(errors))
    sys.exit(1)
print(f"Browser QA passed: {len(FILES)} pages at widths {WIDTHS}, images, MathML, interactive outputs and charts, runtime errors")
