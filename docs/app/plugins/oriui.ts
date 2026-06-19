import {
    OriButton,
    OriCard,
    OriAvatar,
    OriCheckbox,
    OriIcon,
    OriInput,
    OriRadioGroup,
    OriSpinner,
    OriSwitch,
    OriTextarea,
    OriBadge,
    OriTag,
    OriAlert,
    OriProgress,
    OriSelect,
    OriTooltip,
    OriAccordion,
    OriTabs,
    OriDivider,
    OriStack,
    OriJoin,
    OriLink,
    OriSkeleton,
    OriKbd,
    OriToast,
    OriToaster
} from '@oriui/ui';

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
        OriSwitch,
        OriTextarea,
        OriBadge,
        OriTag,
        OriAlert,
        OriProgress,
        OriSelect,
        OriTooltip,
        OriAccordion,
        OriTabs,
        OriDivider,
        OriStack,
        OriJoin,
        OriLink,
        OriSkeleton,
        OriKbd,
        OriToast,
        OriToaster
    };

    for (const [name, component] of Object.entries(components)) {
        nuxtApp.vueApp.component(name, component);
    }
});
