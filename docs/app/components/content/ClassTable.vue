<script setup lang="ts">
import { computed } from 'vue'

// Docs-only: a DaisyUI-style class reference table with a colored "type" chip per row.
// Used in markdown via MDC: :class-table{:rows='[{"class":"ori-button","type":"Block","description":"…"}]'}
// MDC hands us `rows` as a parsed array — but if the attribute value contains a character it can't
// parse (a stray quote/apostrophe in a description), it passes the raw string instead. Normalize and
// guard so a malformed table degrades to empty rather than 500-ing the whole page.
interface ClassRow {
    class: string
    type: string
    description: string
}

const props = defineProps<{ rows?: ClassRow[] | string }>()

const items = computed<ClassRow[]>(() => {
    if (Array.isArray(props.rows)) return props.rows
    if (typeof props.rows === 'string') {
        try {
            const parsed = JSON.parse(props.rows)
            return Array.isArray(parsed) ? parsed : []
        } catch {
            return []
        }
    }
    return []
})

const chipKey = (type?: string) => (type ?? '').toLowerCase().replace(/[^a-z]+/g, '-')
</script>

<template>
    <div class="ori-doc-classtable">
        <table>
            <thead>
                <tr>
                    <th>Class</th>
                    <th>Type</th>
                    <th>Description</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(row, i) in items" :key="i">
                    <td>
                        <code>{{ row.class }}</code>
                    </td>
                    <td>
                        <span class="ori-doc-chip" :class="`ori-doc-chip_${chipKey(row.type)}`">{{ row.type }}</span>
                    </td>
                    <td v-html="row.description"></td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.ori-doc-classtable {
    overflow-x: auto;
    margin: 1rem 0;

    border: 1px solid color-mix(in srgb, var(--ori-color-on-surface) 12%, transparent);
    border-radius: 12px;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

thead th {
    padding: 0.7rem 1rem;

    border-bottom: 1px solid color-mix(in srgb, var(--ori-color-on-surface) 12%, transparent);

    background: color-mix(in srgb, var(--ori-color-on-surface) 4%, transparent);
    color: var(--ori-color-on-surface);

    font-weight: 700;
    text-align: left;
}

tbody td {
    padding: 0.6rem 1rem;

    border-bottom: 1px solid color-mix(in srgb, var(--ori-color-on-surface) 8%, transparent);

    vertical-align: middle;
}

tbody tr:last-child td {
    border-bottom: 0;
}

td code {
    background: color-mix(in srgb, var(--ori-color-on-surface) 7%, transparent);
    padding: 0.1em 0.4em;

    border-radius: 6px;

    font-size: 0.85em;
}

.ori-doc-chip {
    display: inline-flex;
    align-items: center;

    padding: 0.15em 0.7em;

    border-radius: 9999px;

    /* One hue per type; neutral when the type has none. The label clamps the hue's lightness the way the
       role text tones do (dark enough on a light page, light enough on a dark one), so it clears 4.5:1. */
    background: color-mix(in srgb, var(--chip, var(--ori-color-on-surface)) 14%, transparent);
    color: oklch(from var(--chip, var(--ori-color-on-surface)) min(l, 0.45) c h);

    font-size: 0.78em;
    font-weight: 600;
    white-space: nowrap;
}

:global(html.dark) .ori-doc-chip {
    color: oklch(from var(--chip, var(--ori-color-on-surface)) max(l, 0.85) c h);
}

/* Distinct hue per kind of class, for scanning (docs-only palette). */
.ori-doc-chip_block,
.ori-doc-chip_element,
.ori-doc-chip_part,
.ori-doc-chip_parts,
.ori-doc-chip_wrapper {
    --chip: #7c3aed;
}

.ori-doc-chip_style,
.ori-doc-chip_variant,
.ori-doc-chip_modifier {
    --chip: #db2777;
}

.ori-doc-chip_color,
.ori-doc-chip_accent {
    --chip: #0d9488;
}

.ori-doc-chip_size,
.ori-doc-chip_font {
    --chip: #d97706;
}

.ori-doc-chip_radius {
    --chip: #ea580c;
}

.ori-doc-chip_layout,
.ori-doc-chip_gap,
.ori-doc-chip_position,
.ori-doc-chip_placement,
.ori-doc-chip_placement-base {
    --chip: #0891b2;
}

.ori-doc-chip_state,
.ori-doc-chip_behavior,
.ori-doc-chip_semantics,
.ori-doc-chip_custom-prop {
    --chip: #2563eb;
}
</style>
