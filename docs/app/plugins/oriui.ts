import {
    OriButton,
    OriCard,
    OriAvatar,
    OriCheckbox,
    OriIcon,
    OriInput,
    OriField,
    OriRadioGroup,
    OriSpinner,
    OriSwitch,
    OriTextarea,
    OriBadge,
    OriTag,
    OriAlert,
    OriProgress,
    OriSelect,
    OriCombobox,
    OriTooltip,
    OriPopover,
    OriAccordion,
    OriTabs,
    OriDivider,
    OriStack,
    OriJoin,
    OriLink,
    OriSkeleton,
    OriKbd,
    OriToast,
    OriToaster,
    OriSlider
} from '@oriui/vue';

// Register oriUI globally so it is usable in pages, layouts, and markdown (MDC).
export default defineNuxtPlugin((nuxtApp) => {
    const components = {
        OriButton,
        OriCard,
        OriAvatar,
        OriCheckbox,
        OriIcon,
        OriInput,
        OriField,
        OriRadioGroup,
        OriSpinner,
        OriSwitch,
        OriTextarea,
        OriBadge,
        OriTag,
        OriAlert,
        OriProgress,
        OriSelect,
        OriCombobox,
        OriTooltip,
        OriPopover,
        OriAccordion,
        OriTabs,
        OriDivider,
        OriStack,
        OriJoin,
        OriLink,
        OriSkeleton,
        OriKbd,
        OriToast,
        OriToaster,
        OriSlider
    };

    for (const [name, component] of Object.entries(components)) {
        nuxtApp.vueApp.component(name, component);
    }
});
