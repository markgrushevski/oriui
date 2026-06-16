export type Theme = 'light' | 'dark';
export type SkinId = 'neutral' | 'ori' | 'tech' | 'health' | 'luxury' | 'cyber';

export interface SkinInfo {
    id: SkinId;
    label: string;
    // Representative light-mode hexes (primary / secondary / background) for the nav
    // picker swatches — they mirror the source tokens in the styles/themes skin files.
    swatches: [string, string, string];
}

export const SKINS: SkinInfo[] = [
    { id: 'neutral', label: 'Neutral', swatches: ['#4f46e5', '#e2e8f0', '#f5f6f8'] },
    { id: 'ori', label: 'Ori 織り', swatches: ['#2b2d42', '#ddb892', '#fffdf6'] },
    { id: 'tech', label: 'Tech', swatches: ['#0e7490', '#cffafe', '#eef6f8'] },
    { id: 'health', label: 'Health', swatches: ['#047857', '#d1fae5', '#eef8f2'] },
    { id: 'luxury', label: 'Luxury', swatches: ['#8a6d09', '#efe6cf', '#f6f1e6'] },
    { id: 'cyber', label: 'Cyber', swatches: ['#a21caf', '#f5d0fe', '#0d0612'] }
];

const SKIN_IDS = SKINS.map((s) => s.id);

// Theme (light/dark via html.dark) + skin (data-ori-skin) live on <html>, so they reskin the
// whole site. The pre-paint inline script in nuxt.config applies the saved values; this keeps
// the reactive nav state in sync and persists changes.
export function useOriTheme() {
    const theme = useState<Theme>('ori-theme', () => 'light');
    const skin = useState<SkinId>('ori-skin', () => 'neutral');

    function applyTheme(value: Theme) {
        document.documentElement.classList.toggle('dark', value === 'dark');
    }

    function applySkin(value: SkinId) {
        const el = document.documentElement;
        if (value === 'neutral') el.removeAttribute('data-ori-skin');
        else el.setAttribute('data-ori-skin', value);
    }

    function init() {
        if (!import.meta.client) return;
        theme.value = localStorage.getItem('ori-theme') === 'dark' ? 'dark' : 'light';
        const saved = localStorage.getItem('ori-skin') as SkinId | null;
        skin.value = saved && SKIN_IDS.includes(saved) ? saved : 'neutral';
    }

    function setTheme(value: Theme) {
        theme.value = value;
        localStorage.setItem('ori-theme', value);
        applyTheme(value);
    }

    function setSkin(value: SkinId) {
        skin.value = value;
        localStorage.setItem('ori-skin', value);
        applySkin(value);
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
