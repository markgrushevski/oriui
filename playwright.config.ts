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
        trace: 'on-first-retry'
    },
    projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }]
});
