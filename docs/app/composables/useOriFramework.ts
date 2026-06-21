export type Framework = 'html' | 'js' | 'ts' | 'vue' | 'svelte';

// Two groups of code an Example can show. Framework-free (the standalone `@oriui/css` markup + any
// vanilla JS/TS for the headless core) and framework (the styled components). Each group has its own
// default + persisted preference, so framework-free sections default to HTML and framework sections
// default to Vue — independently.
export const NO_FRAMEWORK: Framework[] = ['html', 'js', 'ts'];
export const FRAMEWORKS: Framework[] = ['vue', 'svelte'];

export function useOriFramework() {
    // Framework-free code defaults to HTML; framework code defaults to Vue. Both persisted.
    const noFramework = useState<Framework>('ori-noframework', () => 'html');
    const framework = useState<Framework>('ori-framework', () => 'vue');

    function setCode(value: Framework) {
        const isFw = FRAMEWORKS.includes(value);
        const target = isFw ? framework : noFramework;
        target.value = value;
        if (import.meta.client) localStorage.setItem(isFw ? 'ori-framework' : 'ori-noframework', value);
    }

    function init() {
        if (!import.meta.client) return;
        const fw = localStorage.getItem('ori-framework') as Framework | null;
        if (fw && FRAMEWORKS.includes(fw)) framework.value = fw;
        const nofw = localStorage.getItem('ori-noframework') as Framework | null;
        if (nofw && NO_FRAMEWORK.includes(nofw)) noFramework.value = nofw;
    }

    return { noFramework, framework, setCode, init };
}
