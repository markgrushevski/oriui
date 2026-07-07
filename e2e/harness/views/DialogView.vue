<script lang="ts" setup>
import { OriDialog } from '@oriui/vue';

// The dialog ships its own close button (the FIRST focusable), so two inputs in the default slot give
// exactly three focusables (close + first + last) for the Tab-cycle / focus-trap assertions. The
// `outside` button lives outside the dialog to prove focus can't escape while it is modal-open.
</script>

<template>
    <div style="padding: 40px">
        <button type="button" data-testid="outside">Outside</button>

        <OriDialog title="Edit profile">
            <template #trigger="{ props }">
                <button v-bind="props" type="button" data-testid="open">Open dialog</button>
            </template>

            <label>
                First
                <input type="text" data-testid="first" />
            </label>
            <label>
                Last
                <input type="text" data-testid="last" />
            </label>
        </OriDialog>
    </div>
</template>
