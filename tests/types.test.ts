import { describe, it, expect, expectTypeOf } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, type ButtonHTMLAttributes } from 'vue'
import {
    OriPopover,
    type ActionSize,
    type AnchoredPlacement,
    type CenteredPosition,
    type GapSize,
    type RadiusSize,
    type ThemeColor,
    type Variant
} from '../packages/vue/src'

/**
 * The public TYPE surface of `@oriui/vue`, pinned before 1.0.
 *
 * `packages/vue/src/index.ts` is `export * from './types'`, so every name in that file becomes public
 * API the moment 1.0 ships — after which removing one is a breaking change. Two things are frozen here:
 *
 *   1. WHICH names are exported. Thirteen were exported and consumed by nothing — not a component, not
 *      a test, not the docs. They are gone; the `@ts-expect-error` block below fails if one comes back
 *      (either by being re-added, or by a barrel change re-exposing it).
 *   2. WHAT each surviving name means. Each was an `interface` whose keys were read back out with
 *      `keyof` — a record whose VALUES nothing ever used, modelling a set the long way round. They are
 *      plain string-literal unions now, and the assertions below pin every member, so the flattening
 *      cannot have quietly dropped a scale step.
 *
 * These are type-level assertions: the real gate is `npm run test:types` (vue-tsc over `tests/`).
 */

/* eslint-disable @typescript-eslint/no-unused-vars */
import type {
    // @ts-expect-error — pruned before 1.0: `Sizes` was the intersection of six size records, and
    // nothing read a size RECORD — only the key sets, which are now unions in their own right.
    Sizes,
    // @ts-expect-error — pruned before 1.0: no component prop takes the block-size scale.
    BlockSize,
    // @ts-expect-error — pruned before 1.0: the screen/breakpoint scale is a @oriui/css concern; no
    // styled component exposes it as a prop.
    ScreenSize,
    // @ts-expect-error — pruned before 1.0: the action-SPACE scale is internal to the CSS layer.
    ActionSpaceSize,
    // @ts-expect-error — pruned before 1.0: the union of every step across every scale, which no prop
    // could accept without accepting steps its own utility does not define.
    Size,
    // @ts-expect-error — pruned before 1.0: a one-member alias (`'center'`) with no consumer.
    CenterPosition,
    // @ts-expect-error — pruned before 1.0: a building block of `CenteredPosition`, which is flattened.
    InlinePosition,
    // @ts-expect-error — pruned before 1.0: as `InlinePosition`.
    BlockPosition,
    // @ts-expect-error — pruned before 1.0: the corner set, unused by any prop.
    CustomPosition,
    // @ts-expect-error — pruned before 1.0: the union of every position vocabulary; overlays take
    // `AnchoredPlacement`, and no component took this.
    Position,
    // @ts-expect-error — pruned before 1.0: still exists as a private building block of
    // `AnchoredPlacement`, but is no longer public on its own.
    AnchoredSide,
    // @ts-expect-error — pruned before 1.0: no component narrows `color` to the severity roles —
    // OriAlert and OriToast both take the full `ThemeColor`.
    SeverityColor,
    // @ts-expect-error — pruned before 1.0: a general-purpose TS helper, not UI vocabulary, and unused.
    DeepPartial
} from '../packages/vue/src'
/* eslint-enable @typescript-eslint/no-unused-vars */

describe('@oriui/vue public types', () => {
    // -------------------------------------------------------------------------
    // Sizes — unions of the steps their class utility accepts
    // -------------------------------------------------------------------------

    it('ActionSize is the action scale, `text` step included', () => {
        expectTypeOf<ActionSize>().toEqualTypeOf<'text' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'>()
    })

    it('GapSize is the gap scale, `zero` included and no `xxl`', () => {
        expectTypeOf<GapSize>().toEqualTypeOf<'zero' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'>()
    })

    it('RadiusSize is the radius scale, `zero` and `rounded` included', () => {
        expectTypeOf<RadiusSize>().toEqualTypeOf<'zero' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'rounded'>()
    })

    // -------------------------------------------------------------------------
    // Positions and colors
    // -------------------------------------------------------------------------

    it('CenteredPosition is the four edges a centered decoration can take', () => {
        expectTypeOf<CenteredPosition>().toEqualTypeOf<'top' | 'bottom' | 'right' | 'left'>()
    })

    it('AnchoredPlacement is the full 12-value grid', () => {
        expectTypeOf<AnchoredPlacement>().toEqualTypeOf<
            | 'top'
            | 'bottom'
            | 'left'
            | 'right'
            | 'top-start'
            | 'top-end'
            | 'bottom-start'
            | 'bottom-end'
            | 'left-start'
            | 'left-end'
            | 'right-start'
            | 'right-end'
        >()
    })

    it('ThemeColor is the eight palette roles', () => {
        expectTypeOf<ThemeColor>().toEqualTypeOf<
            'primary' | 'secondary' | 'surface' | 'background' | 'success' | 'warn' | 'danger' | 'info'
        >()
    })

    it('Variant is the five-step emphasis ladder', () => {
        expectTypeOf<Variant>().toEqualTypeOf<'fill' | 'tonal' | 'outline' | 'text' | 'plain'>()
    })

    // -------------------------------------------------------------------------
    // OriPopover's #trigger bag — spreadable onto a real <button>, no cast
    // -------------------------------------------------------------------------
    //
    // The documented usage is `<template #trigger="{ props }"><button v-bind="props">`. That only
    // type-checks if every value in the bag is as narrow as the attribute it feeds. `aria-haspopup`
    // used to be typed from the panel's `role?: string`, so the bag carried `'aria-haspopup': string`,
    // which Vue's `ButtonHTMLAttributes` (a literal union) rejects — and the one real consumer worked
    // around it with `as Record<string, unknown>`, discarding type-checking on the WHOLE bag.

    type TriggerScope = Parameters<NonNullable<InstanceType<typeof OriPopover>['$slots']['trigger']>>[0]
    type TriggerBag = TriggerScope['props']

    it('types aria-haspopup as the ARIA popup vocabulary, never a bare string', () => {
        expectTypeOf<TriggerBag['aria-haspopup']>().toEqualTypeOf<'dialog' | 'menu' | 'listbox' | 'tree' | 'grid'>()
        expectTypeOf<TriggerBag['aria-haspopup']>().not.toEqualTypeOf<string>()
    })

    it('the whole bag is assignable to a <button> without a cast', () => {
        expectTypeOf<TriggerBag>().toExtend<ButtonHTMLAttributes>()
    })

    it('and the bag actually lands on the button at runtime', () => {
        const wrapper = mount(OriPopover, {
            slots: {
                trigger: (scope: { props: Record<string, unknown> }) =>
                    // The spread is the documented call site, typed exactly as a consumer writes it.
                    h('button', { ...scope.props, type: 'button', 'data-testid': 'trigger' }, 'Open')
            },
            attachTo: document.body
        })

        const trigger = wrapper.find('[data-testid="trigger"]')
        expect(trigger.attributes('aria-haspopup')).toBe('dialog')
        expect(trigger.attributes('popovertarget')).toBe(wrapper.find('.ori-popover').attributes('id'))
        wrapper.unmount()
    })
})
