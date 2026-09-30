"""index.html을 그대로 렌더해 1200x630 소셜 공유 이미지(og-image.png)를 만든다.

사용법: python3 og/make-og.py   (프로젝트 루트에서, playwright + Chrome 필요)
갱신 기준: index.html의 카드 구성이나 문구가 바뀌면 다시 실행한다.
페이지는 위 두 장, 아래 세 장이지만 공유 이미지는 가로 1200px에 맞춰 다섯 장을 한 줄로 놓는다.
원본은 건드리지 않고, 공유 이미지용 CSS만 렌더 시점에 덧씌운다.
"""
import pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "og-image.png"

OG_CSS = """
body { min-height: 630px; height: 630px; padding: 0 60px; justify-content: center; }
body::after { position: absolute; }
.wrap { max-width: none; }
header { padding-bottom: 26px; }
.eyebrow { font-size: 15px; margin-bottom: 14px; }
h1 { font-size: 44px; }
.cards { margin-top: 28px; gap: 18px; grid-template-columns: repeat(5, minmax(0, 1fr)); }
.card, .card:nth-child(-n+2) { padding: 18px 18px 20px; grid-column: auto; }
.meta { flex-wrap: nowrap; gap: 6px; }
.pill { height: 22px; padding: 0 9px; font-size: 11px; letter-spacing: .02em; }
.art { padding: 16px 0 18px; }
.plate { width: 92%; }
.tag { font-size: 14px; margin-top: 6px; }
.desc, .go, footer { display: none; }
"""

with sync_playwright() as p:
    browser = p.chromium.launch(channel="chrome")
    # reduced motion: 모든 등장 애니메이션을 건너뛰고 완성된 상태(새 떼, 획, 해, 마블링)로 바로 그린다
    page = browser.new_page(viewport={"width": 1200, "height": 630}, device_scale_factor=1, reduced_motion="reduce")
    page.goto((ROOT / "index.html").as_uri())
    page.wait_for_load_state("networkidle")
    page.add_style_tag(content=OG_CSS)
    page.evaluate("document.fonts.ready")
    page.wait_for_timeout(1000)
    page.screenshot(path=str(OUT))
    browser.close()
print(OUT)
