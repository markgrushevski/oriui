/* TEMPORARY (poc/compound-tabs) — reproduce the blocker the plan recorded, to show which design it
 * belongs to. The plan says "with naive provide/inject registration the SSR tablist serializes EMPTY
 * (0 tab buttons)". That is true of a root that RENDERS THE BUTTONS ITSELF from what children
 * registered, and false of a root whose children render themselves. Both are "provide/inject
 * registration"; only one survives SSR. */
import { describe, it } from 'vitest'
import { createSSRApp, defineComponent, h, inject, provide, reactive } from 'vue'
import { renderToString } from '@vue/server-renderer'

const KEY = Symbol('registry')

/** Design A — the root owns the rendering; children only register metadata. */
const RootA = defineComponent({
    setup(_, { slots }) {
        const reg = reactive<{ value: string; label: string }[]>([])
        provide(KEY, reg)
        return () =>
            h('div', [
                h(
                    'div',
                    { role: 'tablist' },
                    reg.map((t) => h('button', { role: 'tab' }, t.label))
                ),
                slots.default?.()
            ])
    }
})
const ChildA = defineComponent({
    props: { value: { type: String, required: true }, label: { type: String, required: true } },
    setup(props) {
        const reg = inject<{ value: string; label: string }[]>(KEY)!
        reg.push({ value: props.value, label: props.label })
        return () => null
    }
})

/** Design B — children render themselves; the root only holds the registry (the prototype's shape). */
const RootB = defineComponent({
    setup(_, { slots }) {
        const reg = reactive<string[]>([])
        provide(KEY, reg)
        return () => h('div', [h('div', { role: 'tablist' }, slots.default?.())])
    }
})
const ChildB = defineComponent({
    props: { value: { type: String, required: true }, label: { type: String, required: true } },
    setup(props) {
        const reg = inject<string[]>(KEY)!
        reg.push(props.value)
        return () => h('button', { role: 'tab' }, props.label)
    }
})

const count = (html: string) => html.match(/role="tab"/g)?.length ?? 0

describe('SSR — which compound design loses its tabs', () => {
    it('root-renders-from-registry vs children-render-themselves', async () => {
        const a = await renderToString(
            createSSRApp({
                render: () =>
                    h(RootA, null, () => [
                        h(ChildA, { value: 'one', label: 'One' }),
                        h(ChildA, { value: 'two', label: 'Two' })
                    ])
            })
        )
        const b = await renderToString(
            createSSRApp({
                render: () =>
                    h(RootB, null, () => [
                        h(ChildB, { value: 'one', label: 'One' }),
                        h(ChildB, { value: 'two', label: 'Two' })
                    ])
            })
        )
        // eslint-disable-next-line no-console
        console.log(`\n[ssr-design] A root-renders-from-registry: ${count(a)} tabs\n  ${a}`)
        // eslint-disable-next-line no-console
        console.log(`[ssr-design] B children-render-themselves: ${count(b)} tabs\n  ${b}`)
    })
})
