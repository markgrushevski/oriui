<script lang="ts" setup>
import { ref } from 'vue';
import {
    OriToolbar,
    OriToolbarButton,
    OriToolbarSeparator,
    OriToolbarToggleGroup,
    OriToolbarToggleItem
} from '@oriui/vue';

// A real horizontal OriToolbar for the roving-focus e2e: four action buttons (one DISABLED), a
// separator, and a single-select toggle group. Plain `before`/`after` buttons bracket the toolbar so the
// spec can prove it is ONE tab stop — Tab enters onto the first item, Tab/Shift+Tab leave to after/before,
// and arrow keys never escape. Each action button pushes its id into `activated` (mirrored to
// [data-testid=activated]) so the spec can assert the disabled item never activates while an enabled one
// does. The toggle-group items are toolbar items too, so arrow navigation traverses into them.
const activated = ref<string[]>([]);
const align = ref<string>();

function activate(id: string): void {
    activated.value = [...activated.value, id];
}
</script>

<template>
    <div style="padding: 40px">
        <button type="button" data-testid="before">Before</button>

        <OriToolbar label="Formatting">
            <OriToolbarButton label="Bold" icon="x" @click="activate('bold')" />
            <OriToolbarButton label="Italic" icon="x" @click="activate('italic')" />
            <OriToolbarButton label="Underline" icon="x" :disabled="true" @click="activate('underline')" />
            <OriToolbarButton label="Strikethrough" icon="x" @click="activate('strikethrough')" />

            <OriToolbarSeparator />

            <OriToolbarToggleGroup v-model="align" type="single" label="Alignment">
                <OriToolbarToggleItem value="left" label="Align left" icon="x" />
                <OriToolbarToggleItem value="center" label="Align center" icon="x" />
                <OriToolbarToggleItem value="right" label="Align right" icon="x" />
            </OriToolbarToggleGroup>
        </OriToolbar>

        <button type="button" data-testid="after">After</button>

        <p data-testid="activated">{{ activated.join(',') }}</p>
        <p data-testid="align">{{ align ?? '' }}</p>
    </div>
</template>
