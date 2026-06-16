import axe from 'axe-core';
import { expect } from 'vitest';

/**
 * Run axe-core against a mounted component's root element and assert zero violations.
 *
 * Component-scope testing: page-level rules (landmarks, a single <main>, a single <h1>) are
 * disabled — they target whole documents, not an isolated widget. Colour contrast is left to
 * tests/tokens.contrast.test.ts, which checks the token math deterministically; happy-dom has
 * no layout engine, so axe cannot measure rendered contrast here anyway.
 */
export async function expectNoA11yViolations(element: Element): Promise<void> {
    const { violations } = await axe.run(element as HTMLElement, {
        rules: {
            region: { enabled: false },
            'landmark-one-main': { enabled: false },
            'page-has-heading-one': { enabled: false }
        }
    });

    const summary = violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length} node[s])`);
    expect(summary).toEqual([]);
}
