import {
    OriButton,
    OriCard,
    OriAvatar,
    OriCheckbox,
    OriIcon,
    OriInput,
    OriRadioGroup,
    OriSpinner,
    OriSwitch
} from 'oriui';

// Register oriUI globally so it is usable in pages, layouts, and markdown (MDC).
export default defineNuxtPlugin((nuxtApp) => {
    const components = {
        OriButton,
        OriCard,
        OriAvatar,
        OriCheckbox,
        OriIcon,
        OriInput,
        OriRadioGroup,
        OriSpinner,
        OriSwitch
    };

    for (const [name, component] of Object.entries(components)) {
        nuxtApp.vueApp.component(name, component);
    }
});
