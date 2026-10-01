<script lang="ts" setup>
import { ref } from 'vue'
import { OriSegmentedControl } from '@oriui/vue'

// Three segments with one disabled ("Auto" between them) so arrow keys show the skip; a form around it
// shows the value submits like a native radio group; `?rtl` mirrors the row.
const theme = ref('light')
const rtl = new URLSearchParams(location.search).has('rtl')
const submitted = ref('')
const options = [
    { label: 'Light', value: 'light' },
    { label: 'Auto', value: 'auto', disabled: true },
    { label: 'Dark', value: 'dark' },
    { label: 'Sepia', value: 'sepia' }
]
function onSubmit(event: Event) {
    submitted.value = String(new FormData(event.target as HTMLFormElement).get('theme'))
}
</script>

<template>
    <form style="padding: 40px" :dir="rtl ? 'rtl' : undefined" @submit.prevent="onSubmit">
        <button type="button" data-testid="before">Before</button>
        <OriSegmentedControl v-model="theme" label="Theme" name="theme" :options="options" />
        <p data-testid="model">{{ theme }}</p>
        <button type="submit" data-testid="submit">Submit</button>
        <p data-testid="submitted">{{ submitted }}</p>
    </form>
</template>
