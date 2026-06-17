<script setup lang="ts">
// Social links pinned to the bottom of the side nav (shared by the desktop sidebar + the mobile
// drawer). Kept out of the header so the top bar stays compact on small screens.
const links = [
    {
        label: 'GitHub',
        href: 'https://github.com/markgrushevski/oriui',
        // GitHub mark (octocat) — single path, inherits currentColor.
        icon: 'M12 .5C5.37.5 0 5.78 0 12.29c0 5.2 3.44 9.6 8.21 11.16.6.11.82-.25.82-.56 0-.28-.01-1.02-.02-2-3.34.71-4.04-1.58-4.04-1.58-.55-1.37-1.34-1.74-1.34-1.74-1.09-.73.08-.72.08-.72 1.2.08 1.84 1.21 1.84 1.21 1.07 1.79 2.81 1.27 3.5.97.11-.76.42-1.27.76-1.56-2.67-.3-5.47-1.31-5.47-5.84 0-1.29.47-2.34 1.24-3.17-.12-.3-.54-1.52.12-3.17 0 0 1.01-.32 3.3 1.21.96-.26 1.98-.39 3-.4 1.02.01 2.04.14 3 .4 2.29-1.53 3.3-1.21 3.3-1.21.66 1.65.24 2.87.12 3.17.77.83 1.24 1.88 1.24 3.17 0 4.54-2.81 5.54-5.49 5.83.43.36.81 1.08.81 2.18 0 1.58-.01 2.85-.01 3.24 0 .31.22.68.83.56C20.56 21.88 24 17.49 24 12.29 24 5.78 18.63.5 12 .5z'
    }
];
</script>

<template>
    <div class="docs-social">
        <a v-for="l in links" :key="l.href" class="docs-social__link" :href="l.href" target="_blank" rel="noopener">
            <svg
                class="docs-social__icon"
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="currentColor"
                aria-hidden="true"
            >
                <path :d="l.icon" />
            </svg>
            {{ l.label }}
        </a>
    </div>
</template>
