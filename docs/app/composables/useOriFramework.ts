type Framework = 'vue' | 'svelte';

// Global preference for which framework code examples are shown in. The css layer is
// framework-agnostic, so every Example shows both; this picks the active one (persisted).
export function useOriFramework() {
    const framework = useState<Framework>('ori-framework', () => 'vue');

    function setFramework(value: Framework) {
        framework.value = value;
        if (import.meta.client) localStorage.setItem('ori-framework', value);
    }

    function init() {
        if (!import.meta.client) return;
        const saved = localStorage.getItem('ori-framework');
        if (saved === 'svelte' || saved === 'vue') framework.value = saved;
    }

    return { framework, setFramework, init };
}
