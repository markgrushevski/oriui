<script setup lang="ts">
// A small drawing app built only from oriUI components: the home page's proof that the system holds
// together on one screen and reskins with it. The weave layer is drawn in role tokens, so it repaints with
// the skin; a stroke keeps the color it was drawn with.
import { computed, ref, useTemplateRef } from 'vue'
import {
    OriBadge,
    OriColorPicker,
    OriList,
    OriListItem,
    OriMenu,
    OriPopover,
    OriSegmentedControl,
    OriSlider,
    OriSwitch,
    OriToolbar,
    OriToolbarButton,
    OriToolbarSeparator,
    OriToolbarToggleGroup,
    OriToolbarToggleItem,
    useToast
} from '@oriui/vue'

type Tool = 'pen' | 'marker' | 'eraser'
type Cap = 'round' | 'square'

interface Stroke {
    cap: Cap
    color: string
    points: string
    tool: Tool
    width: number
}

const icons = {
    pen: 'M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z',
    marker: 'm18.5 1.15-12 12L5 18.5l-2 2 1.5 1.5 2-2 5.35-1.5 12-12zM7.3 15.7l.75-2.6 2.85 2.85-2.6.75z',
    eraser: 'M16.24 3.56 21.19 8.5a2 2 0 0 1 0 2.83L12 20.5h8V22H6.5l-4.06-4.06a2 2 0 0 1 0-2.82L13.41 3.56a2 2 0 0 1 2.83 0M4.22 16.53 7.76 20h3.42l3.29-3.29-4.95-4.95z',
    undo: 'M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62A8 8 0 0 1 20.36 16l2.37-.78A10.5 10.5 0 0 0 12.5 8',
    redo: 'M18.4 10.6A10.5 10.5 0 0 0 1.27 15.22l2.37.78A8 8 0 0 1 16.62 12.38L13 16h9V7z',
    more: 'M12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4m0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4m0 6a2 2 0 1 0 0 4 2 2 0 0 0 0-4'
}

const tool = ref<Tool>('pen')
const color = ref('#e11d48')
const width = ref(6)
const cap = ref<Cap>('round')
const showSketch = ref(true)
const showWeave = ref(true)
const strokes = ref<Stroke[]>([])
const undone = ref<Stroke[]>([])

const swatches = ['#e11d48', '#f59e0b', '#16a34a', '#0284c7', '#7c3aed', '#1f2937']
const caps = [
    { label: 'Round', value: 'round' },
    { label: 'Square', value: 'square' }
]

// The weave: horizontal weft over vertical warp, crossing over and under in turn (織り, "weaving").
const VIEW = { w: 640, h: 400 }
const weft = Array.from({ length: 7 }, (_, i) => 50 + i * 50)
const warp = Array.from({ length: 11 }, (_, i) => 60 + i * 52)
const overs = weft.flatMap((y, i) => warp.filter((_, j) => (i + j) % 2 === 0).map((x) => ({ x, y })))

const canvas = useTemplateRef<SVGSVGElement>('canvas')
let drawing: { stroke: Stroke; last: DOMPoint } | undefined

function toCanvas(event: PointerEvent): DOMPoint {
    const svg = canvas.value!
    return new DOMPoint(event.clientX, event.clientY).matrixTransform(svg.getScreenCTM()!.inverse())
}

function onPointerDown(event: PointerEvent): void {
    if (event.button !== 0 || !showSketch.value) return
    canvas.value!.setPointerCapture(event.pointerId)
    const p = toCanvas(event)
    const stroke: Stroke = {
        cap: cap.value,
        color: color.value,
        points: `${p.x.toFixed(1)},${p.y.toFixed(1)}`,
        tool: tool.value,
        width: tool.value === 'marker' ? width.value * 2.5 : width.value
    }
    strokes.value.push(stroke)
    undone.value = []
    drawing = { stroke: strokes.value.at(-1)!, last: p }
}

function onPointerMove(event: PointerEvent): void {
    if (!drawing) return
    const p = toCanvas(event)
    if (Math.hypot(p.x - drawing.last.x, p.y - drawing.last.y) < 2) return
    drawing.stroke.points += ` ${p.x.toFixed(1)},${p.y.toFixed(1)}`
    drawing.last = p
}

function onPointerUp(): void {
    drawing = undefined
}

// A single toggle group can be emptied by pressing its item again; a drawing app always has a tool.
function pickTool(value: string | string[] | undefined): void {
    if (typeof value === 'string' && value) tool.value = value as Tool
}

function undo(): void {
    const stroke = strokes.value.pop()
    if (stroke) undone.value.push(stroke)
}

function redo(): void {
    const stroke = undone.value.pop()
    if (stroke) strokes.value.push(stroke)
}

const { toast } = useToast()

function clearCanvas(): void {
    const cleared = strokes.value
    strokes.value = []
    undone.value = []
    toast({
        text: 'Canvas cleared.',
        action: { label: 'Undo', onClick: () => (strokes.value = cleared) }
    })
}

const menuItems = computed(() => [
    { value: 'clear', label: 'Clear canvas', disabled: strokes.value.length === 0 },
    { value: 'weave', label: showWeave.value ? 'Hide the weave' : 'Show the weave' }
])

function onMenu(value: string): void {
    if (value === 'clear') clearCanvas()
    if (value === 'weave') showWeave.value = !showWeave.value
}

function strokeColor(stroke: Stroke): string {
    // The eraser paints the paper, so it erases the weave too and follows the skin.
    return stroke.tool === 'eraser' ? 'var(--ori-color-surface)' : stroke.color
}

const strokeCount = computed(() => `${strokes.value.length} ${strokes.value.length === 1 ? 'stroke' : 'strokes'}`)
</script>

<template>
    <section class="home-editor" aria-label="Demo: a drawing app built from oriUI components">
        <header class="home-editor__header">
            <h2 class="home-editor__title">Untitled weave</h2>
            <OriBadge :content="strokeCount" variant="soft" color="secondary" />
        </header>

        <OriToolbar label="Drawing tools" class="home-editor__toolbar">
            <OriToolbarToggleGroup :model-value="tool" type="single" label="Tool" @update:model-value="pickTool">
                <OriToolbarToggleItem value="pen" tooltip="Pen" :icon="icons.pen" />
                <OriToolbarToggleItem value="marker" tooltip="Marker" :icon="icons.marker" />
                <OriToolbarToggleItem value="eraser" tooltip="Eraser" :icon="icons.eraser" />
            </OriToolbarToggleGroup>

            <OriToolbarSeparator />

            <OriPopover aria-label="Brush color" placement="bottom-start">
                <template #trigger="{ props }">
                    <OriToolbarButton v-bind="props" tooltip="Brush color">
                        <span class="home-editor__swatch" :style="{ background: color }"></span>
                    </OriToolbarButton>
                </template>
                <OriColorPicker v-model="color" :swatches="swatches" label="Brush color" />
            </OriPopover>

            <OriToolbarSeparator />

            <OriToolbarButton tooltip="Undo" :icon="icons.undo" :disabled="!strokes.length" @click="undo" />
            <OriToolbarButton tooltip="Redo" :icon="icons.redo" :disabled="!undone.length" @click="redo" />

            <span class="home-editor__spacer"></span>

            <OriMenu :items="menuItems" placement="bottom-end" @select="onMenu">
                <template #trigger="{ props }">
                    <OriToolbarButton v-bind="props" tooltip="More actions" :icon="icons.more" />
                </template>
            </OriMenu>
        </OriToolbar>

        <div class="home-editor__body">
            <svg
                ref="canvas"
                class="home-editor__canvas"
                :viewBox="`0 0 ${VIEW.w} ${VIEW.h}`"
                role="img"
                aria-label="Drawing canvas"
                @pointerdown="onPointerDown"
                @pointermove="onPointerMove"
                @pointerup="onPointerUp"
                @pointercancel="onPointerUp"
            >
                <g v-show="showWeave" class="home-editor__weave">
                    <line
                        v-for="y in weft"
                        :key="`f${y}`"
                        class="home-editor__weft"
                        x1="0"
                        :x2="VIEW.w"
                        :y1="y"
                        :y2="y"
                    />
                    <line
                        v-for="x in warp"
                        :key="`p${x}`"
                        class="home-editor__warp"
                        :x1="x"
                        :x2="x"
                        y1="0"
                        :y2="VIEW.h"
                    />
                    <line
                        v-for="o in overs"
                        :key="`o${o.x}-${o.y}`"
                        class="home-editor__weft"
                        :x1="o.x - 16"
                        :x2="o.x + 16"
                        :y1="o.y"
                        :y2="o.y"
                    />
                </g>
                <g v-show="showSketch">
                    <polyline
                        v-for="(s, i) in strokes"
                        :key="i"
                        :points="s.points"
                        fill="none"
                        :stroke-width="s.width"
                        :stroke-linecap="s.cap"
                        stroke-linejoin="round"
                        :style="{ stroke: strokeColor(s), opacity: s.tool === 'marker' ? 0.45 : 1 }"
                    />
                </g>
            </svg>

            <aside class="home-editor__panel">
                <OriList divided class="home-editor__layers" aria-label="Layers">
                    <OriListItem label="Sketch" :description="strokeCount">
                        <template #end>
                            <OriSwitch v-model="showSketch" size="sm" aria-label="Show the sketch" />
                        </template>
                    </OriListItem>
                    <OriListItem label="Weave" description="Drawn in role tokens">
                        <template #end>
                            <OriSwitch v-model="showWeave" size="sm" aria-label="Show the weave" />
                        </template>
                    </OriListItem>
                </OriList>

                <OriSlider v-model="width" label="Brush size" :min="1" :max="24" show-value />
                <OriSegmentedControl v-model="cap" :options="caps" label="Line ends" size="sm" fluid />
            </aside>
        </div>
    </section>
</template>
