<script lang="ts" setup>
import { ref } from 'vue';
import { OriColorPicker } from '@oriui/vue';

// A mid-grey start so a drag to the top-right corner (max saturation + brightness) clearly changes the
// color. Count live updates (update:modelValue) and commits (change) alongside the model so the spec can
// prove a pointer drag STREAMS live yet commits exactly ONCE on release — the invariant happy-dom's
// synthetic events can't exercise (real pointer capture + drag geometry). v-model and the extra
// @update:model-value listener are merged by Vue, so both run.
const model = ref('#808080');
const inputs = ref(0);
const changes = ref(0);
</script>

<template>
    <div style="max-width: 320px; padding: 40px">
        <OriColorPicker v-model="model" label="Fill color" @update:model-value="inputs++" @change="changes++" />
        <p data-testid="cp-model">{{ model }}</p>
        <p data-testid="cp-inputs">{{ inputs }}</p>
        <p data-testid="cp-changes">{{ changes }}</p>
    </div>
</template>
