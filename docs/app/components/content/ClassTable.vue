<script setup lang="ts">
// Docs-only: a DaisyUI-style class reference table with a coloured "type" chip per row.
// Used in markdown via MDC: :class-table{:rows='[{"class":"ori-button","type":"Block","description":"…"}]'}
interface ClassRow {
    class: string;
    type: string;
    description: string;
}

defineProps<{ rows?: ClassRow[] }>();

const chipKey = (type: string) => type.toLowerCase().replace(/[^a-z]+/g, '-');
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
                <tr v-for="(row, i) in rows" :key="i">
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

    /* Neutral default; the type rules below override bg + color (equal specificity, later wins). */
    background: color-mix(in srgb, var(--ori-color-on-surface) 12%, transparent);
    color: var(--ori-color-on-surface);

    font-size: 0.78em;
    font-weight: 600;
    white-space: nowrap;
}

/* Distinct hue per type for scannability (docs-only palette). */
.ori-doc-chip_block,
.ori-doc-chip_element,
.ori-doc-chip_part,
.ori-doc-chip_parts {
    background: color-mix(in srgb, #7c3aed 16%, transparent);
    color: color-mix(in srgb, #7c3aed, var(--ori-color-on-surface) 18%);
}

.ori-doc-chip_style,
.ori-doc-chip_variant {
    background: color-mix(in srgb, #db2777 16%, transparent);
    color: color-mix(in srgb, #db2777, var(--ori-color-on-surface) 18%);
}

.ori-doc-chip_color,
.ori-doc-chip_accent {
    background: color-mix(in srgb, #0d9488 18%, transparent);
    color: color-mix(in srgb, #0d9488, var(--ori-color-on-surface) 18%);
}

.ori-doc-chip_size {
    background: color-mix(in srgb, #d97706 18%, transparent);
    color: color-mix(in srgb, #d97706, var(--ori-color-on-surface) 18%);
}

.ori-doc-chip_radius {
    background: color-mix(in srgb, #ea580c 16%, transparent);
    color: color-mix(in srgb, #ea580c, var(--ori-color-on-surface) 18%);
}

.ori-doc-chip_layout {
    background: color-mix(in srgb, #0891b2 16%, transparent);
    color: color-mix(in srgb, #0891b2, var(--ori-color-on-surface) 18%);
}

.ori-doc-chip_state,
.ori-doc-chip_behavior {
    background: color-mix(in srgb, #2563eb 16%, transparent);
    color: color-mix(in srgb, #2563eb, var(--ori-color-on-surface) 18%);
}
</style>
