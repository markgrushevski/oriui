<script lang="ts" setup>
/* ======================================================== */
import { onMounted, ref } from 'vue';

/* ============= production components =================== */
import { WrapperIcon, WeatherWidget } from 'vueinjar';

/* ================ dev components ====================== */
//import { WrapperIcon, WeatherWidget } from '../';

/* ===================== docs =========================== */
import { TheLogo, SectionDocs, SectionComponent } from '@docs/components';
import { IconCrescent, IconSun } from '@docs/icons';

/* ======================================================== */

type Theme = 'dark' | 'light';

const currentTheme = ref<Theme>('light');

function setTheme(theme: Theme) {
    localStorage.setItem('theme', theme);
    currentTheme.value = theme;
    document.documentElement.className = theme;
}

function toggleTheme() {
    if (currentTheme.value === 'light') setTheme('dark');
    else setTheme('light');
}

onMounted(() => {
    switch (localStorage.getItem('theme')) {
        case 'dark':
            setTheme('dark');
            return;
        case 'light':
            setTheme('light');
            return;
    }

    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
});
</script>

<template>
    <WrapperIcon style="position: absolute; top: 18px; right: 18px; width: 2rem; height: 2rem" @click="toggleTheme">
        <IconCrescent v-if="currentTheme === 'dark'" />
        <IconSun v-else />
    </WrapperIcon>

    <TheLogo />

    <SectionDocs title="Component List">
        <SectionComponent title="Wrapper for Icon">
            <div>
                <WrapperIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M21,3V15.5A3.5,3.5 0 0,1 17.5,19A3.5,3.5 0 0,1 14,15.5A3.5,3.5 0 0,1 17.5,12C18.04,12 18.55,12.12 19,12.34V6.47L9,8.6V17.5A3.5,3.5 0 0,1 5.5,21A3.5,3.5 0 0,1 2,17.5A3.5,3.5 0 0,1 5.5,14C6.04,14 6.55,14.12 7,14.34V6L21,3Z"
                        />
                    </svg>
                </WrapperIcon>
                <WrapperIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M10,10A2,2 0 0,1 8,12A2,2 0 0,1 6,10V8C6,7.37 6.1,6.77 6.27,6.2L10,9.93V10M12,2C12.74,2 13.44,2.13 14.09,2.38L11.97,6C11.14,6 10.44,6.5 10.15,7.25L7.24,4.34C8.34,2.92 10.06,2 12,2M17.76,6.31L14,10.07V8C14,7.62 13.9,7.27 13.72,6.97L15.83,3.38C16.74,4.13 17.42,5.15 17.76,6.31M18,13.09L14,17.09V12.9L18,8.9V13.09M18,20A2,2 0 0,1 16,22A2,2 0 0,1 14,20V19.91L18,15.91V20Z"
                        />
                    </svg>
                </WrapperIcon>
                <WrapperIcon>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                        <path
                            d="M5,3H19A2,2 0 0,1 21,5V19A2,2 0 0,1 19,21H5A2,2 0 0,1 3,19V5A2,2 0 0,1 5,3M7,5A2,2 0 0,0 5,7A2,2 0 0,0 7,9A2,2 0 0,0 9,7A2,2 0 0,0 7,5M17,15A2,2 0 0,0 15,17A2,2 0 0,0 17,19A2,2 0 0,0 19,17A2,2 0 0,0 17,15M17,10A2,2 0 0,0 15,12A2,2 0 0,0 17,14A2,2 0 0,0 19,12A2,2 0 0,0 17,10M17,5A2,2 0 0,0 15,7A2,2 0 0,0 17,9A2,2 0 0,0 19,7A2,2 0 0,0 17,5M7,10A2,2 0 0,0 5,12A2,2 0 0,0 7,14A2,2 0 0,0 9,12A2,2 0 0,0 7,10M7,15A2,2 0 0,0 5,17A2,2 0 0,0 7,19A2,2 0 0,0 9,17A2,2 0 0,0 7,15Z"
                        />
                    </svg>
                </WrapperIcon>
            </div>
        </SectionComponent>

        <SectionComponent title="Weather Widget">
            <WeatherWidget :theme="currentTheme" />
        </SectionComponent>
    </SectionDocs>
</template>

<style>
:root {
    --color-cookie: hsl(34deg 52% 58%);
    --color-glass: hsl(34deg 22% 87%);
    --color-lid: hsl(34deg 65% 72%);
    --color-text: hsl(0deg 0% 15%);
    color-scheme: only light;
}

:root.dark {
    --color-text: hsl(0deg 0% 85%);
    color-scheme: only dark;
}

* {
    box-sizing: border-box;
}

body {
    margin: 0;
}

svg {
    fill: var(--color-text);
}

#app {
    display: flex;

    flex-direction: column;

    align-items: center;
    justify-content: flex-start;

    padding: 24px 0;

    color: var(--color-text);

    font-family: Poppins, sans-serif;
    font-weight: 400;

    gap: 16px;
}

#app > h1,
#app > h2,
#app > h3,
#app > h4,
#app > h5,
#app > h6 {
    font-family: Raleway, sans-serif;
    font-weight: 500;
    letter-spacing: 2px;
}

#app > section {
    display: flex;
    flex-direction: column;
    align-items: center;

    width: 330px;
    max-height: 75vh;
    padding: 24px 12px;

    overflow-y: auto;

    border: 2px solid var(--color-glass);

    border-radius: 8px;
}
</style>
