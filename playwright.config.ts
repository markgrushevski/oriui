import { defineConfig, devices } from '@playwright/test';

// Playwright drives a real (headless) Chromium — it renders CSS Anchor Positioning + the Popover API,
// which happy-dom (the Vitest env) cannot. So e2e covers exactly what the unit suite can't: the visual
// geometry of the floating components (.ori-anchored placement + collision flip) and real keyboard flows.
export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    reporter: process.env.CI ? 'github' : 'list',
    use: {
        // Kill the popover open/close opacity transition so geometry reads are deterministic (the
        // .ori-popover transition lives under `@media (prefers-reduced-motion: no-preference)`).
        reducedMotion: 'reduce',
        // The interaction specs navigate to the harness (`page.goto('/#combobox')`); the static
        // setContent-based specs never navigate, so this baseURL leaves them untouched.
        baseURL: 'http://localhost:5199',
        trace: 'on-first-retry'
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
    // Serve the Vite harness (real mounted Vue components) for the interaction specs. The static
    // geometry/reset specs don't rely on it, but starting it is cheap and idempotent. `npx vite`
    // resolves the workspace's vite devDependency; `--strictPort` fails fast rather than drifting ports.
    webServer: {
        command: 'npx vite --config e2e/harness/vite.config.ts --port 5199 --strictPort',
        url: 'http://localhost:5199',
        reuseExistingServer: !process.env.CI,
        timeout: 120_000
    }
});
