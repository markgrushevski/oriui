<script lang="ts" setup>
import type { RadiusSize } from '../../types';

// OriSurface — a minimal ELEVATED floating-surface primitive: a lifted panel (surface background +
// optional hairline + radius + a mode-aware elevation shadow) with NO padding or content semantics of
// its own. The building block for chrome that floats over content — a toolbar island, a zoom control, a
// side panel, a menu popout's container. Distinct from OriCard, which is a CONTENT card (gap_xl padding
// + header/title/body/actions semantics): OriSurface is just the box, the caller owns the layout inside.
// Reads oriUI's mode-aware `--ori-shadow-*` elevation tokens.
const {
    as = 'div',
    bordered = true,
    elevation = 'lg',
    radius = 'lg'
} = defineProps<{
    /** An HTML tag name, a Component name, or a Component class reference (default `div`). */
    as?: string | object;
    /** A hairline border around the surface (default `true`). */
    bordered?: boolean;
    /** Elevation shadow depth — maps to `--ori-shadow-{sm,md,lg}`. */
    elevation?: 'sm' | 'md' | 'lg';
    /** Corner radius; repoints `--ori-size-radius` via the utility (default `lg`). */
    radius?: RadiusSize;
}>();
</script>

<template>
    <component
        :is="as"
        :class="[
            'ori-surface',
            `ori-surface_elevation-${elevation}`,
            `ori-size-radius_${radius}`,
            { 'ori-surface_bordered': bordered }
        ]"
    >
        <slot></slot>
    </component>
</template>
