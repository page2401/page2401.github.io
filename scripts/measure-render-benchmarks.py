#!/usr/bin/env python3
"""
Measure standardized browser viewing & rendering benchmarks across all 25 mounted SSGs
using Headless Chromium + W3C Performance / Paint / Resource Timing APIs over HTTP Gzip.

Persists `benchmark.viewRender` into each `docs/sites/<id>.json`.
"""

import json
import os
import statistics
import subprocess
import sys
import time
import urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT_DIR = Path(__file__).resolve().parent.parent
SITES_DOCS_DIR = ROOT_DIR / "docs" / "sites"
CONFIG_PATH = ROOT_DIR / "sites.config.json"

PORT = int(os.environ.get("RENDER_BENCH_PORT", "4215"))
BASE_URL = f"http://127.0.0.1:{PORT}"

# Standardized Desktop Broadband / CDN Edge profile (Lighthouse Desktop style: 15ms RTT, 24 Mbps down)
CDN_NETWORK_PROFILE = {
    "offline": False,
    "latency": 15,
    "downloadThroughput": int(24 * 1024 * 1024 / 8),
    "uploadThroughput": int(12 * 1024 * 1024 / 8),
}
PROFILE_LABEL = "Headless Chromium · HTTP Gzip · 15ms RTT / 24Mbps (3轮中位数)"

JS_WAIT_PROSE_READY = """
() => new Promise((resolve) => {
  const deadline = performance.now() + 8000;
  const check = () => {
    const h1s = Array.from(document.querySelectorAll('h1, h2'));
    const hasArticleHeading = h1s.some((h) => {
      const t = (h.textContent || '').trim();
      return t.includes('05') || t.includes('代码块') || t.includes('语法高亮');
    });
    const code = document.querySelector('pre, .code-table, .lntable, .giallo, .highlight');
    const paints = performance.getEntriesByType('paint');
    const fcpEntry = paints.find((p) => p.name === 'first-contentful-paint');
    const hasContent =
      hasArticleHeading &&
      code &&
      code.textContent &&
      code.textContent.trim().length >= 15;

    if ((hasContent && fcpEntry) || performance.now() >= deadline) {
      requestAnimationFrame(() => {
        const now = performance.now();
        const paintsNow = performance.getEntriesByType('paint');
        const fcp = paintsNow.find((p) => p.name === 'first-contentful-paint');
        const nav = performance.getEntriesByType('navigation')[0];
        const resources = performance.getEntriesByType('resource');
        let transferBytes = nav ? (nav.transferSize || nav.encodedBodySize || 0) : 0;
        for (const r of resources) {
          transferBytes += (r.transferSize || r.encodedBodySize || 0);
        }
        resolve({
          fcpMs: fcp ? fcp.startTime : now,
          proseReadyMs: fcp && nav && nav.domContentLoadedEventEnd > 0 && now < fcp.startTime
            ? fcp.startTime
            : now,
          transferBytes,
          requests: 1 + resources.length
        });
      });
      return;
    }
    setTimeout(check, 10);
  };
  check();
})
"""

JS_WAIT_DIAGRAM_READY = """
() => new Promise((resolve) => {
  const deadline = performance.now() + 8000;
  const check = () => {
    const svgs = Array.from(document.querySelectorAll('svg'));
    const renderedSvg = svgs.some((s) => {
      const rect = s.getBoundingClientRect();
      return (rect.width >= 100 && rect.height >= 45) || s.id.includes('mermaid') || s.classList.contains('flowchart');
    });
    if (renderedSvg || performance.now() >= deadline) {
      requestAnimationFrame(() => {
        resolve({
          diagramReadyMs: performance.now(),
          rendered: renderedSvg
        });
      });
      return;
    }
    setTimeout(check, 14);
  };
  check();
})
"""


def wait_for_server(url: str, timeout: float = 15.0) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        try:
            with urllib.request.urlopen(url, timeout=2) as resp:
                if resp.status == 200:
                    return
        except Exception:
            time.sleep(0.2)
    raise RuntimeError(f"Preview server failed to listen at {url}")


def measure_warm_navigation(page, base_url_prefix: str, target_route: str) -> float:
    """Measure warm in-site page switch from 05-code-blocks -> 01-annotations."""
    target_url = f"{base_url_prefix}{target_route}"
    if target_route.startswith("#"):
        ms = page.evaluate(
            """(newHash) => new Promise((resolve) => {
              const t0 = performance.now();
              const deadline = t0 + 5000;
              window.location.hash = newHash;
              const check = () => {
                const headings = Array.from(document.querySelectorAll('h1, h2'));
                const matched = headings.some((h) => {
                  const t = (h.textContent || '').trim();
                  return t.includes('01') || t.includes('专属标注');
                });
                if (matched || performance.now() >= deadline) {
                  requestAnimationFrame(() => resolve(performance.now() - t0));
                  return;
                }
                setTimeout(check, 6);
              };
              check();
            })""",
            target_route,
        )
        return float(ms)

    clicked_spa = page.evaluate(
        """() => {
          const links = Array.from(document.querySelectorAll('a[href]'));
          const match = links.find((a) => a.getAttribute('href') && a.getAttribute('href').includes('01-annotations'));
          if (!match) return false;
          window.__navStartPerf = performance.now();
          match.click();
          return true;
        }"""
    )
    if clicked_spa:
        t_wall0 = time.perf_counter()
        deadline = t_wall0 + 5.0
        while time.perf_counter() < deadline:
            try:
                ready = page.evaluate(
                    """() => {
                      const headings = Array.from(document.querySelectorAll('h1, h2'));
                      const matched = headings.some((h) => {
                        const t = (h.textContent || '').trim();
                        return t.includes('01') || t.includes('专属标注');
                      });
                      if (!matched) return null;
                      if (typeof window.__navStartPerf === 'number') {
                        return performance.now() - window.__navStartPerf;
                      }
                      return performance.now();
                    }"""
                )
                if ready is not None and ready > 0:
                    return min(float(ready), (time.perf_counter() - t_wall0) * 1000.0 + 10.0)
            except Exception:
                pass
            time.sleep(0.01)

    # Fallback warm navigation with browser cache populated
    t0 = time.perf_counter()
    page.goto(target_url, wait_until="domcontentloaded")
    page.evaluate(
        """() => new Promise((r) => {
          const check = () => {
            const h1 = document.querySelector('h1');
            if (h1 && h1.textContent && h1.textContent.trim().length > 1) {
              requestAnimationFrame(() => r(true));
            } else {
              setTimeout(check, 8);
            }
          };
          check();
        })"""
    )
    return (time.perf_counter() - t0) * 1000.0


def measure_single_site(browser, site: dict, runs: int = 3) -> dict:
    base_prefix = f"{BASE_URL}{site['basePath']}"
    prose_route = site["docs"]["05-code-blocks"]["route"]
    ann_route = site["docs"]["01-annotations"]["route"]
    diag_route = site["docs"]["02-diagrams"]["route"]

    prose_url = f"{base_prefix}{prose_route}"
    diag_url = f"{base_prefix}{diag_route}"

    fcp_list = []
    prose_list = []
    warm_nav_list = []
    transfer_list = []
    req_list = []

    for _ in range(runs):
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        cdp = ctx.new_cdp_session(page)
        cdp.send("Network.enable")
        cdp.send("Network.emulateNetworkConditions", CDN_NETWORK_PROFILE)

        page.goto(prose_url, wait_until="domcontentloaded")
        prose_res = page.evaluate(JS_WAIT_PROSE_READY)
        # Allow lazy hydration / post-paint chunks to settle briefly before warm navigation
        page.wait_for_timeout(180)
        post_res = page.evaluate(
            """() => {
              const nav = performance.getEntriesByType('navigation')[0];
              const resources = performance.getEntriesByType('resource');
              let bytes = nav ? (nav.transferSize || nav.encodedBodySize || 0) : 0;
              for (const r of resources) bytes += (r.transferSize || r.encodedBodySize || 0);
              return { bytes, requests: 1 + resources.length };
            }"""
        )

        fcp_list.append(float(prose_res["fcpMs"]))
        prose_list.append(float(prose_res["proseReadyMs"]))
        transfer_list.append(int(post_res["bytes"]))
        req_list.append(int(post_res["requests"]))

        warm_ms = measure_warm_navigation(page, base_prefix, ann_route)
        warm_nav_list.append(float(warm_ms))
        ctx.close()

    diag_list = []
    for _ in range(2):
        ctx = browser.new_context(viewport={"width": 1440, "height": 900})
        page = ctx.new_page()
        cdp = ctx.new_cdp_session(page)
        cdp.send("Network.enable")
        cdp.send("Network.emulateNetworkConditions", CDN_NETWORK_PROFILE)
        page.goto(diag_url, wait_until="domcontentloaded")
        d_res = page.evaluate(JS_WAIT_DIAGRAM_READY)
        diag_list.append(float(d_res["diagramReadyMs"]))
        ctx.close()

    fcp_med = max(8, round(statistics.median(fcp_list)))
    prose_med = max(fcp_med, round(statistics.median(prose_list)))
    warm_med = max(4, round(statistics.median(warm_nav_list)))
    diag_med = max(prose_med, round(statistics.median(diag_list)))

    return {
        "profile": PROFILE_LABEL,
        "fcpMs": fcp_med,
        "proseReadyMs": prose_med,
        "warmNavMs": warm_med,
        "diagramReadyMs": diag_med,
        "proseTransferBytes": round(statistics.median(transfer_list)),
        "proseRequests": round(statistics.median(req_list)),
    }


def main() -> int:
    only_arg = next((a for a in sys.argv[1:] if a.startswith("--only=")), None)
    only_set = (
        {s.strip() for s in only_arg.split("=", 1)[1].split(",") if s.strip()}
        if only_arg
        else None
    )
    skip_existing = "--skip-existing" in sys.argv[1:]

    cfg = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    sites = [
        s
        for s in cfg["sites"]
        if not s.get("isMaster") and (only_set is None or s["id"] in only_set)
    ]

    env = os.environ.copy()
    env["PORT"] = str(PORT)
    server = subprocess.Popen(
        ["node", "scripts/preview-all.mjs"],
        cwd=str(ROOT_DIR),
        env=env,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )

    try:
        wait_for_server(f"{BASE_URL}/")
        updated = 0
        with sync_playwright() as p:
            for site in sites:
                sid = site["id"]
                json_path = SITES_DOCS_DIR / f"{sid}.json"
                if not json_path.exists():
                    continue
                doc = json.loads(json_path.read_text(encoding="utf-8"))
                if skip_existing and doc.get("benchmark", {}).get("viewRender"):
                    vr = doc["benchmark"]["viewRender"]
                    print(
                        f"[measure-render] ↷ {sid:17s} (cached) | FCP {vr['fcpMs']:4d}ms | Prose {vr['proseReadyMs']:4d}ms | WarmNav {vr['warmNavMs']:4d}ms | Mermaid {vr['diagramReadyMs']:4d}ms",
                        flush=True,
                    )
                    continue

                vr = None
                for attempt in range(3):
                    browser = p.chromium.launch(
                        args=["--disable-dev-shm-usage"]
                    )
                    try:
                        vr = measure_single_site(browser, site, runs=3)
                        break
                    except Exception as exc:
                        if attempt == 2:
                            raise
                        print(f"[measure-render] retrying {sid} after {exc}...", flush=True)
                    finally:
                        browser.close()

                if "benchmark" in doc and isinstance(doc["benchmark"], dict):
                    doc["benchmark"]["viewRender"] = vr
                    json_path.write_text(
                        json.dumps(doc, ensure_ascii=False, indent=2) + "\n",
                        encoding="utf-8",
                    )
                    updated += 1
                print(
                    f"[measure-render] ✓ {sid:17s} | FCP {vr['fcpMs']:4d}ms | Prose {vr['proseReadyMs']:4d}ms | WarmNav {vr['warmNavMs']:4d}ms | Mermaid {vr['diagramReadyMs']:4d}ms | Transfer {vr['proseTransferBytes']/1024:6.1f} KB ({vr['proseRequests']} reqs)",
                    flush=True,
                )

        print(f"\n[measure-render] Updated viewRender telemetry in {updated} docs/sites/<id>.json files.")
        return 0
    finally:
        server.terminate()
        try:
            server.wait(timeout=5)
        except subprocess.TimeoutExpired:
            server.kill()


if __name__ == "__main__":
    sys.exit(main())
