<script setup lang="ts">
import { IconAdd, HeaderCard, IconDelete, IconDrag } from '../ui';
import { ref } from 'vue';

defineProps<{ placeNameList: string[]; loading: boolean }>();

defineEmits<{
    (event: 'dragend', placeName: string, startIndex: number, targetIndex: number): void;
    (event: 'add', userInput: string): void;
    (event: 'delete', placeName: string): void;
}>();

const userInput = ref('');

const targetIndex = ref(0);
</script>

<template>
    <div :class="CardPlacesEditor.card" @keyup.enter="$emit('add', userInput)">
        <HeaderCard :class="CardPlacesEditor.header" text="Settings" />
        <div
            v-for="(placeName, startIndex) in placeNameList"
            :key="placeName"
            :class="CardPlacesEditor.places"
            draggable="true"
            @dragover="targetIndex = startIndex"
            @dragend="$emit('dragend', placeName, startIndex, targetIndex)"
        >
            <IconDrag />
            <span>{{ placeName }}</span>
            <IconDelete :class="CardPlacesEditor['delete-icon']" @click="$emit('delete', placeName)" />
        </div>
        <div :class="CardPlacesEditor.form">
            <div>Add Location:</div>
            <div :class="CardPlacesEditor['input-wrapper']">
                <input v-show="!loading" v-model.trim="userInput" type="text" />
                <div v-show="loading" class="loading">
                    <div class="circle">
                        <div></div>
                    </div>
                </div>
                <IconAdd :class="CardPlacesEditor['add-icon']" @click="$emit('add', userInput)" />
            </div>
        </div>
    </div>
</template>

<style module="CardPlacesEditor">
.card {
    position: absolute;

    width: calc(100% - 8px * 2);
}

.card > *:not(:first-child) {
    margin-top: 16px;
}

.card > *:last-child {
    margin-top: 32px;
}

.header {
    align-self: flex-start;
}

.places {
    display: flex;
    padding: 8px 5px;
    background-color: var(--bg-secondary);
    cursor: grab;
}

.places:active {
    cursor: grabbing;
}

.places > *:nth-of-type(2) {
    flex-grow: 1;
    margin-left: 8px;
}

.places > *:last-of-type {
    cursor: pointer;
}

.form {
    display: flex;
    flex-direction: column;
}

.input-wrapper {
    display: flex;
}

.input-wrapper > input {
    flex-grow: 1;
}

.delete-icon,
.add-icon {
    cursor: pointer;
}

.add-icon {
    width: 1.5em;
    height: 1.5em;
    margin: 0 2px;
}

.loading {
    display: inline-block;
    width: 1.5em;
    height: 1.5em;
    margin: 0 2px;
    overflow: hidden;
}

.circle {
    position: relative;
    width: 100%;
    height: 100%;
    transform: translateZ(0) scale(1);
    transform-origin: 0 0; /* see note above */
    backface-visibility: hidden;
}

@keyframes circle {
    0% {
        transform: rotate(0deg);
    }

    50% {
        transform: rotate(180deg);
    }

    100% {
        transform: rotate(360deg);
    }
}

.circle div {
    position: absolute;
    top: 20px;
    left: 20px;
    box-sizing: content-box;
    width: 160px;
    height: 160px;
    transform-origin: 80px 82px;
    animation: circle 1s linear infinite;
    border-radius: 50%;
    box-shadow: 0 4px 0 0 #e15b64;
}
</style>
