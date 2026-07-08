import { test, expect, type Page } from '@playwright/test';
import path from 'node:path';
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';

/**
 * Role-as-TEXT contrast guard (the P2 axis the token unit test can't reach). oriUI's role tokens are
 * tuned as fill BACKGROUNDS; the non-fill variants (text / outline / tonal), the selected tab, alert +
 * tag paint the role as FOREGROUND text via --ori-color-<role>-text (an on-surface tone derived from the
 * role by color-mix, with explicit AA overrides where the derivation misses). color-mix(in oklch, …)
 * only resolves to a concrete colour in a real engine, so this must run in Chromium — happy-dom axe has
 * no layout engine and the Node token guard can't evaluate color-mix. Every role × surface-text kind is
 * measured across every skin and both themes; the effective background composites a tonal tint over the
 * opaque surface. Anything below WCAG AA (4.5:1 body text) is collected and reported at once.
 */
extend([a11yPlugin]);

const STYLES = path.resolve('packages/css/dist/styles.css');

const SKINS = ['', 'sumi', 'indigo', 'tech', 'health', 'luxury', 'neutral', 'cyber'] as const;
const THEMES = ['light', 'dark'] as const;
const ROLES = ['primary', 'secondary', 'success', 'warn', 'danger', 'info'] as const;
const AA = 4.5;

// Each measured element carries its own foreground `color` AND its own `background-color` (transparent for
// text/outline/tab/link, a tonal tint for tonal/alert/tag), so one read per element captures the pair. The
// `[data-active]` tonal probes exercise the raised hover/active tint (the worst-contrast state — WCAG 1.4.3
// has no hover exemption). The `bare-*` probes carry NO `.ori-color_*` utility, so they exercise each block's
// BAKED `--ori-color-text` (the :root default can't derive a block-baked role) — baked defaults are
// button/tag/tabs → primary, alert → info. The `plain` variant (0.5 opacity, intentionally muted, like a
// disabled control) is deliberately NOT guarded — 50% opacity is sub-AA by design.
function markup(): string {
    const cell = (role: string) => `
        <button class="ori-button ori-color_${role} ori-variant_text" data-role="${role}" data-kind="button-text">Text</button>
        <button class="ori-button ori-color_${role} ori-variant_outline" data-role="${role}" data-kind="button-outline">Outline</button>
        <button class="ori-button ori-color_${role} ori-variant_tonal" data-role="${role}" data-kind="button-tonal">Tonal</button>
        <button class="ori-button ori-color_${role} ori-variant_tonal" data-active data-role="${role}" data-kind="button-tonal-active">Tonal</button>
        <a class="ori-link ori-color_${role}" href="#" data-role="${role}" data-kind="link">Link</a>
        <span class="ori-tag ori-color_${role}" data-role="${role}" data-kind="tag"><span class="ori-tag__text">Tag</span></span>
        <div class="ori-alert ori-color_${role}" data-role="${role}" data-kind="alert"><div class="ori-alert__content"><div class="ori-alert__title">Alert</div></div></div>
        <div class="ori-tabs ori-color_${role}"><div class="ori-tabs__list" role="tablist"><button class="ori-tabs__tab" role="tab" aria-selected="true" data-role="${role}" data-kind="tab-selected">Selected</button></div></div>`;
    const bare = `
        <button class="ori-button ori-variant_text" data-role="baked-primary" data-kind="bare-button-text">Bare</button>
        <button class="ori-button ori-variant_tonal" data-active data-role="baked-primary" data-kind="bare-button-tonal-active">Bare</button>
        <span class="ori-tag" data-role="baked-primary" data-kind="bare-tag"><span class="ori-tag__text">Bare</span></span>
        <div class="ori-alert" data-role="baked-info" data-kind="bare-alert"><div class="ori-alert__content"><div class="ori-alert__title">Bare</div></div></div>
        <div class="ori-tabs"><div class="ori-tabs__list" role="tablist"><button class="ori-tabs__tab" role="tab" aria-selected="true" data-role="baked-primary" data-kind="bare-tab-selected">Bare</button></div></div>`;
    return `<div id="surface" style="background-color: var(--ori-color-surface); padding: 24px">${ROLES.map(cell).join('\n')}${bare}</div>`;
}

type Reading = { role: string; kind: string; fg: string; bg: string };

// getComputedStyle returns color-mix results in their mix space (oklch(…) / color(srgb … / .25)), which
// colord can't parse. Resolve authoritatively in the engine: stack the colours on a 1×1 canvas (opaque
// surface first, then the element's own possibly-translucent bg) and read back the composited sRGB pixel.
async function readState(page: Page, skin: string, theme: string): Promise<Reading[]> {
    return page.evaluate(
        ({ skin, theme }) => {
            const html = document.documentElement;
            if (skin) html.setAttribute('data-ori-skin', skin);
            else html.removeAttribute('data-ori-skin');
            html.className = `ori-theme_${theme}`;

            const cv = document.createElement('canvas');
            cv.width = cv.height = 1;
            const ctx = cv.getContext('2d')!;
            const paint = (stack: string[]): string => {
                ctx.clearRect(0, 0, 1, 1);
                for (const c of stack) {
                    ctx.fillStyle = c;
                    ctx.fillRect(0, 0, 1, 1);
                }
                const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
                return `rgb(${r} ${g} ${b})`;
            };

            const surface = getComputedStyle(document.getElementById('surface')!).backgroundColor;
            return [...document.querySelectorAll<HTMLElement>('[data-kind]')].map((el) => {
                const cs = getComputedStyle(el);
                return {
                    role: el.dataset.role!,
                    kind: el.dataset.kind!,
                    fg: paint([cs.color]),
                    bg: paint([surface, cs.backgroundColor])
                };
            });
        },
        { skin, theme }
    );
}

test.describe('role-as-text contrast — WCAG AA (4.5:1) across every skin, theme, role and text kind', () => {
    test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.setContent(`<!doctype html><html><head></head><body>${markup()}</body></html>`);
        await page.addStyleTag({ path: STYLES });
        await page.addStyleTag({ content: '* { transition: none !important; animation: none !important; }' });
    });

    test('every role-as-text pairing meets AA in both themes and all preset skins', async ({ page }) => {
        const failures: string[] = [];
        const rows: string[] = [];
        for (const skin of SKINS) {
            for (const theme of THEMES) {
                for (const r of await readState(page, skin, theme)) {
                    const ratio = colord(r.fg).contrast(r.bg);
                    const label = `${skin || 'ori'} · ${theme} · ${r.role} · ${r.kind}`;
                    rows.push(`${ratio.toFixed(2)}  ${label}  (${r.fg} on ${r.bg})`);
                    if (ratio < AA) failures.push(`${label} → ${ratio.toFixed(2)}:1 (${r.fg} on ${r.bg})`);
                }
            }
        }
        // Surfaced for tuning: the full matrix, worst first.
        console.log(rows.sort((a, b) => parseFloat(a) - parseFloat(b)).join('\n'));
        expect(failures, `${failures.length} role-as-text pairings below AA:\n${failures.join('\n')}`).toEqual([]);
    });
});
