export type Framework = 'vue' | 'svelte' | 'html';

const KNOWN: Framework[] = ['vue', 'svelte', 'html'];

// Global preference for which framework code examples are shown in. The css layer is
// framework-agnostic, so an Example can offer Vue (styled component), Svelte, and/or HTML
// (the standalone .ori-* classes — also the htmx / Astro / plain-HTML usage). Persisted.
export function useOriFramework() {
    const framework = useState<Framework>('ori-framework', () => 'vue');

    function setFramework(value: Framework) {
        framework.value = value;
        if (import.meta.client) localStorage.setItem('ori-framework', value);
    }

    function init() {
        if (!import.meta.client) return;
        const saved = localStorage.getItem('ori-framework') as Framework | null;
        if (saved && KNOWN.includes(saved)) framework.value = saved;
    }

    return { framework, setFramework, init };
}
