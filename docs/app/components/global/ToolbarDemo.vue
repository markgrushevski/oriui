<script setup lang="ts">
// Live "formatting toolbar" demo for the docs (MDC renders it as `:toolbar-demo`). Bold/Italic are
// standalone OriToolbarButton `pressed` toggles — each owns its own ref + @click, since they are not
// mutually exclusive and so are not a toggle group. Alignment is a single-select
// OriToolbarToggleGroup (mutually exclusive, deselectable). MDC's inline/block syntax can bind a
// v-model but cannot wire arbitrary @click handlers, so this wrapper is needed for the Bold/Italic half
// (same reason MenuDemo/DialogDemo exist — see their comments).
import { ref } from 'vue';
import {
    OriToolbar,
    OriToolbarButton,
    OriToolbarSeparator,
    OriToolbarToggleGroup,
    OriToolbarToggleItem
} from '@oriui/vue';

const bold = ref(false);
const italic = ref(false);
const align = ref('left');
</script>

<template>
    <OriToolbar label="Formatting">
        <OriToolbarButton
            :pressed="bold"
            tooltip="Bold"
            icon="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"
            @click="bold = !bold"
        />
        <OriToolbarButton
            :pressed="italic"
            tooltip="Italic"
            icon="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"
            @click="italic = !italic"
        />

        <OriToolbarSeparator />

        <OriToolbarToggleGroup v-model="align" type="single" label="Text alignment">
            <OriToolbarToggleItem value="left" tooltip="Align left" icon="M4 6h16v2H4z M4 11h10v2H4z M4 16h13v2H4z" />
            <OriToolbarToggleItem
                value="center"
                tooltip="Align center"
                icon="M4 6h16v2H4z M7 11h10v2H7z M5.5 16h13v2H5.5z"
            />
            <OriToolbarToggleItem
                value="right"
                tooltip="Align right"
                icon="M4 6h16v2H4z M10 11h10v2H10z M7 16h13v2H7z"
            />
        </OriToolbarToggleGroup>
    </OriToolbar>
</template>
