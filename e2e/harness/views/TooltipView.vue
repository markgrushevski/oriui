<script lang="ts" setup>
import { ref } from 'vue'
import { OriTooltip } from '@oriui/vue'

// A tooltip between two plain buttons, so focus can arrive by Tab and by click and leave either way.
const saves = ref(0)
</script>

<template>
    <div style="display: flex; gap: 80px; padding: 120px">
        <button type="button" data-testid="before">Before</button>
        <OriTooltip content="Save the drawing" placement="bottom">
            <template #default="{ bubbleId }">
                <button type="button" data-testid="save" :aria-describedby="bubbleId" @click="saves++">
                    Save {{ saves }}
                </button>
            </template>
        </OriTooltip>
        <button type="button" data-testid="after">After</button>
    </div>
</template>
