import { test, expect } from '@playwright/test';

// Feasibility + capability probe: confirms this Chromium actually renders CSS Anchor Positioning
// (anchor-name / position-anchor / position-area). If this passes, e2e can verify the real geometry of
// the .ori-anchored floating components — the thing happy-dom can't assert.
const HTML = `<!doctype html><html><head><style>
  body { margin: 0; height: 1200px; }
  #anchor { position: absolute; top: 300px; left: 200px; width: 120px; height: 40px; anchor-name: --a; }
  #floater { position: fixed; position-anchor: --a; position-area: block-end span-inline-end; margin: 0; width: 160px; height: 60px; background: #ccc; }
</style></head><body>
  <button id="anchor">Trigger</button>
  <div id="floater">Panel</div>
</body></html>`;

test('headless chromium renders CSS anchor positioning', async ({ page }) => {
    await page.setContent(HTML);
    const anchor = await page.locator('#anchor').boundingBox();
    const floater = await page.locator('#floater').boundingBox();

    expect(anchor).not.toBeNull();
    expect(floater).not.toBeNull();
    // position-area block-end → the floater sits below the anchor's bottom edge.
    expect(floater!.y).toBeGreaterThanOrEqual(anchor!.y + anchor!.height - 1);
    // span-inline-end → the floater's inline-start aligns to the anchor's start (left) edge.
    expect(Math.abs(floater!.x - anchor!.x)).toBeLessThan(2);
});
