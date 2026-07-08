import { flushThemeInvalidation } from '@oriui/headless';

export type Theme = 'light' | 'dark';
export type SkinId = 'ori' | 'sumi' | 'indigo' | 'tech' | 'health' | 'luxury' | 'neutral' | 'cyber';

// The base skin (no data-ori-skin attribute) is "Ori" — the luminous azure/cyan default.
const BASE_SKIN: SkinId = 'ori';

export interface SkinInfo {
    id: SkinId;
    label: string;
    // Representative light-mode hexes (primary / accent / background) for the nav picker
    // swatches — they mirror the source tokens in styles/themes/.
    swatches: [string, string, string];
}

export const SKINS: SkinInfo[] = [
    { id: 'ori', label: 'Ori', swatches: ['#0369a1', '#38bdf8', '#bae6fd'] },
    { id: 'sumi', label: 'Sumi 墨', swatches: ['#2b2d42', '#ddb892', '#fffdf6'] },
    { id: 'indigo', label: 'Indigo', swatches: ['#4f46e5', '#e2e8f0', '#f5f6f8'] },
    { id: 'tech', label: 'Tech', swatches: ['#0e7490', '#cffafe', '#eef6f8'] },
    { id: 'health', label: 'Health', swatches: ['#047857', '#d1fae5', '#eef8f2'] },
    { id: 'luxury', label: 'Luxury', swatches: ['#8a6d09', '#efe6cf', '#f6f1e6'] },
    { id: 'neutral', label: 'Neutral', swatches: ['#17181c', '#e3e5ea', '#ffffff'] },
    { id: 'cyber', label: 'Cyber', swatches: ['#a21caf', '#f5d0fe', '#0d0612'] }
];

const SKIN_IDS = SKINS.map((s) => s.id);

// Theme (light/dark via html.dark) + skin (data-ori-skin) live on <html>, so they reskin the
// whole site. The pre-paint inline script in nuxt.config applies the saved values; this keeps
// the reactive nav state in sync, persists changes, and reconciles any stale saved value.
export function useOriTheme() {
    const theme = useState<Theme>('ori-theme', () => 'light');
    const skin = useState<SkinId>('ori-skin', () => BASE_SKIN);

    function applyTheme(value: Theme) {
        document.documentElement.classList.toggle('dark', value === 'dark');
    }

    function applySkin(value: SkinId) {
        const el = document.documentElement;
        if (value === BASE_SKIN) el.removeAttribute('data-ori-skin');
        else el.setAttribute('data-ori-skin', value);
    }

    function init() {
        if (!import.meta.client) return;
        theme.value = localStorage.getItem('ori-theme') === 'dark' ? 'dark' : 'light';
        const saved = localStorage.getItem('ori-skin') as SkinId | null;
        skin.value = saved && SKIN_IDS.includes(saved) ? saved : BASE_SKIN;
        // Reconcile the DOM with the validated state (fixes any stale/legacy attribute).
        applyTheme(theme.value);
        applySkin(skin.value);
    }

    function setTheme(value: Theme) {
        theme.value = value;
        localStorage.setItem('ori-theme', value);
        applyTheme(value);
        // Runtime theme change: re-resolve baked component colours (Chromium invalidation fix).
        // Not needed in init() — that runs against a fresh render (theme already set pre-paint).
        flushThemeInvalidation(document.body);
    }

    function setSkin(value: SkinId) {
        skin.value = value;
        localStorage.setItem('ori-skin', value);
        applySkin(value);
        flushThemeInvalidation(document.body); // same invalidation as a runtime mode change
    }

    return {
        theme,
        skin,
        init,
        setTheme,
        setSkin,
        toggleTheme: () => setTheme(theme.value === 'dark' ? 'light' : 'dark')
    };
}
