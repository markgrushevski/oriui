<script setup lang="ts">
import { useToast } from '@oriui/vue';

const { success, error, warn, info, toast } = useToast();

const checkIcon = 'M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z';
</script>

<template>
    <div style="display: flex; flex-wrap: wrap; gap: 0.5rem">
        <OriButton
            variant="outline"
            color="success"
            text="Success"
            @click="success({ title: 'Saved', text: 'Your changes were saved.', icon: checkIcon })"
        />
        <OriButton
            variant="outline"
            color="danger"
            text="Error"
            @click="error({ title: 'Upload failed', text: 'The file could not be uploaded.' })"
        />
        <OriButton variant="outline" color="warn" text="Warning" @click="warn('Your session expires in 5 minutes.')" />
        <OriButton variant="outline" color="info" text="Info" @click="info('A new version is available.')" />
        <OriButton variant="outline" text="Plain" @click="toast('Just a plain notification.')" />
        <OriButton
            variant="outline"
            text="Sticky"
            @click="toast({ text: 'I stay until you dismiss me.', duration: 0, closable: true })"
        />
    </div>
</template>
