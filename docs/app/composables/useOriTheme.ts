type Theme = 'light' | 'dark';
type Skin = 'neutral' | 'ori';

// Theme (light/dark via html.dark) + skin (data-ori-skin) live on <html>, so they reskin the
// whole site. The pre-paint inline script in nuxt.config applies the saved values; this keeps
// the reactive nav state in sync and persists changes.
export function useOriTheme() {
    const theme = useState<Theme>('ori-theme', () => 'light');
    const skin = useState<Skin>('ori-skin', () => 'neutral');

    function applyTheme(value: Theme) {
        document.documentElement.classList.toggle('dark', value === 'dark');
    }

    function applySkin(value: Skin) {
        const el = document.documentElement;
        if (value === 'ori') el.setAttribute('data-ori-skin', 'ori');
        else el.removeAttribute('data-ori-skin');
    }

    function init() {
        if (!import.meta.client) return;
        theme.value = localStorage.getItem('ori-theme') === 'dark' ? 'dark' : 'light';
        skin.value = localStorage.getItem('ori-skin') === 'ori' ? 'ori' : 'neutral';
    }

    function setTheme(value: Theme) {
        theme.value = value;
        localStorage.setItem('ori-theme', value);
        applyTheme(value);
    }

    function setSkin(value: Skin) {
        skin.value = value;
        localStorage.setItem('ori-skin', value);
        applySkin(value);
    }

    return {
        theme,
        skin,
        init,
        toggleTheme: () => setTheme(theme.value === 'dark' ? 'light' : 'dark'),
        toggleSkin: () => setSkin(skin.value === 'ori' ? 'neutral' : 'ori')
    };
}
