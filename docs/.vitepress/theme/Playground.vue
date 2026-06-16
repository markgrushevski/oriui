<script setup>
import { OriButton, OriCard, OriAvatar, OriIcon, OriSpinner } from '@lib';

const variants = ['fill', 'tonal', 'outline', 'text', 'plain'];
const colors = ['primary', 'secondary', 'success', 'warn', 'danger', 'info'];
const sizes = ['xs', 'sm', 'md', 'lg', 'xl'];
const plus = 'M22,13H13V22H11V13H2V11H11V2H13V11H22V13Z';
</script>

<template>
    <div class="ori-pg">
        <section>
            <h3>Buttons — variants × colors</h3>
            <div v-for="c in colors" :key="c" class="ori-pg__row">
                <OriButton v-for="v in variants" :key="v" :variant="v" :color="c" :text="c" />
            </div>
        </section>

        <section>
            <h3>Sizes</h3>
            <div class="ori-pg__row">
                <OriButton v-for="s in sizes" :key="s" :size="s" :text="s" />
            </div>
        </section>

        <section>
            <h3>States — icon · loading · disabled · as link</h3>
            <div class="ori-pg__row">
                <OriButton :icon="plus" text="icon" />
                <OriButton :icon="plus" />
                <OriButton text="loading" loading />
                <OriButton text="disabled" disabled />
                <OriButton as="a" href="#" text="as link" variant="tonal" />
            </div>
        </section>

        <section>
            <h3>Card · Avatar · Icon · Spinner</h3>
            <div class="ori-pg__row">
                <OriCard
                    class="ori-pg__card"
                    title="Card title"
                    subtitle="On the surface color"
                    text="Cards sit on --ori-color-surface; text uses the matching on-color."
                    :prepend-icon="plus"
                />
                <OriAvatar text="Ada Lovelace" title="Ada Lovelace" subtitle="Engineer" />
                <OriAvatar text="Grace Hopper" />
                <OriIcon :icon="plus" color="primary" size="xl" />
                <OriSpinner color="primary" size="xl" />
            </div>
        </section>
    </div>
</template>

<style>
.ori-pg {
    margin-top: 24px;
    padding: 24px;

    border-radius: 12px;

    background: var(--ori-color-background);
    color: var(--ori-color-on-background);

    transition:
        background-color 0.2s,
        color 0.2s;
}

.ori-pg section {
    margin-bottom: 28px;
}

.ori-pg h3 {
    margin: 0 0 12px;

    border: 0;

    font-size: 13px;
    font-weight: 600;
    opacity: 0.7;
}

.ori-pg__row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    margin-bottom: 10px;
}

.ori-pg__card {
    max-width: 320px;
}
</style>
