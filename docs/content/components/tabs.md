---
title: Tabs
---

# Tabs

An accessible tabs widget with automatic activation. The tablist holds a roving tabindex so
`Tab` / `Shift+Tab` enter and leave the group as a single keyboard stop; arrow keys move between
tabs and immediately select them. State is expressed through real ARIA attributes — `aria-selected`
drives both the active indicator and the label colour; `disabled` is the native button attribute.

The examples are organised by **layer**: the [class reference](#classes) is the standalone
**`@oriui/css`** layer, and the [Framework API](#framework-api) is the **`@oriui/vue`** component. Every
example is live — flip its code between **HTML** (the standalone classes, also your htmx / Astro / Svelte /
plain-HTML usage), **Vue**, and **Svelte** _(soon)_; HTML is the default.

## Classes

A tabs widget is a block class plus single-class token utilities — one class repoints one token, no
base class needed. The Vue props in [Framework API](#framework-api) map 1:1 to these.

<!-- prettier-ignore -->
:class-table{:rows='[{"class":"ori-tabs","type":"Block","description":"Required base class. Root flex container; column layout (horizontal) or row layout (vertical). Baked default accent is primary; override with ori-color_* to change the indicator and ring."},{"class":"ori-tabs_vertical","type":"Modifier","description":"Vertical orientation: row flex layout, column tablist, right side-bar indicator instead of bottom underline."},{"class":"ori-color_*","type":"Color","description":"<b>primary</b> · secondary · success · warn · danger · info · surface — indicator and focus ring accent."},{"class":"ori-tabs__list","type":"Part","description":"The role=tablist container; bottom border in horizontal layout, right border in vertical layout."},{"class":"ori-tabs__tab","type":"Part","description":"A real button with role=tab. Active state via aria-selected=true (indicator scales in, label colour shifts). Disabled via native disabled attribute."},{"class":"ori-tabs__panel","type":"Part","description":"A role=tabpanel with tabindex=0 and aria-labelledby its tab. Only the active panel is shown."},{"class":"aria-selected · disabled","type":"State","description":"Real attributes, not classes. aria-selected=true scales the after indicator; disabled dims and blocks."}]'}

## Anatomy

```
div.ori-tabs  [ori-color_primary]
  div.ori-tabs__list  [role=tablist, aria-orientation]
    button.ori-tabs__tab  [role=tab, aria-selected, aria-controls, tabindex]  × N
  div.ori-tabs__panel  [role=tabpanel, aria-labelledby, tabindex=0]  × N
```

## Basic

::example
:ori-tabs{:tabs='[{"value":"overview","label":"Overview"},{"value":"specs","label":"Specs"},{"value":"reviews","label":"Reviews"}]'}

#vue

```vue
<OriTabs
    v-model="active"
    :tabs="[
        { value: 'overview', label: 'Overview' },
        { value: 'specs', label: 'Specs' },
        { value: 'reviews', label: 'Reviews' }
    ]"
>
    <template #overview>Overview content goes here.</template>
    <template #specs>Technical specifications.</template>
    <template #reviews>Customer reviews.</template>
</OriTabs>
```

#html

```html
<div class="ori-tabs ori-color_primary">
    <div class="ori-tabs__list" role="tablist" aria-orientation="horizontal">
        <button
            id="tabs-1-tab-0"
            class="ori-tabs__tab"
            type="button"
            role="tab"
            aria-selected="true"
            aria-controls="tabs-1-panel-0"
            tabindex="0"
        >
            Overview
        </button>
        <button
            id="tabs-1-tab-1"
            class="ori-tabs__tab"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="tabs-1-panel-1"
            tabindex="-1"
        >
            Specs
        </button>
        <button
            id="tabs-1-tab-2"
            class="ori-tabs__tab"
            type="button"
            role="tab"
            aria-selected="false"
            aria-controls="tabs-1-panel-2"
            tabindex="-1"
        >
            Reviews
        </button>
    </div>
    <div id="tabs-1-panel-0" class="ori-tabs__panel" role="tabpanel" aria-labelledby="tabs-1-tab-0" tabindex="0">
        Overview content goes here.
    </div>
    <div id="tabs-1-panel-1" class="ori-tabs__panel" role="tabpanel" aria-labelledby="tabs-1-tab-1" tabindex="0" hidden>
        Technical specifications.
    </div>
    <!-- … -->
</div>
```

::

## Colors

Every semantic role. The accent color is shared by the active indicator and the focus ring.

::example
:ori-tabs{color="primary" :tabs='[{"value":"a","label":"Tab A"},{"value":"b","label":"Tab B"}]'}
:ori-tabs{color="secondary" :tabs='[{"value":"a","label":"Tab A"},{"value":"b","label":"Tab B"}]'}
:ori-tabs{color="success" :tabs='[{"value":"a","label":"Tab A"},{"value":"b","label":"Tab B"}]'}
:ori-tabs{color="danger" :tabs='[{"value":"a","label":"Tab A"},{"value":"b","label":"Tab B"}]'}

#vue

```vue
<OriTabs color="primary" :tabs="tabs" />
<OriTabs color="secondary" :tabs="tabs" />
<OriTabs color="success" :tabs="tabs" />
<OriTabs color="danger" :tabs="tabs" />
```

#html

```html
<!-- swap the color: ori-color_primary → _secondary / _success / _danger / _warn / _info -->
<div class="ori-tabs ori-color_secondary">…</div>
```

::

## Vertical orientation

`orientation="vertical"` stacks the tablist in a column to the left with a right side-bar indicator.
Arrow axis switches to Up / Down.

::example
:ori-tabs{orientation="vertical" :tabs='[{"value":"general","label":"General"},{"value":"security","label":"Security"},{"value":"notifications","label":"Notifications"}]'}

#vue

```vue
<OriTabs
    v-model="section"
    orientation="vertical"
    :tabs="[
        { value: 'general', label: 'General' },
        { value: 'security', label: 'Security' },
        { value: 'notifications', label: 'Notifications' }
    ]"
>
    <template #general>General settings.</template>
    <template #security>Security settings.</template>
    <template #notifications>Notification preferences.</template>
</OriTabs>
```

#html

```html
<!-- add ori-tabs_vertical; list gets aria-orientation="vertical" -->
<div class="ori-tabs ori-tabs_vertical ori-color_primary">
    <div class="ori-tabs__list" role="tablist" aria-orientation="vertical">
        <button class="ori-tabs__tab" role="tab" aria-selected="true" tabindex="0">General</button>
        <button class="ori-tabs__tab" role="tab" aria-selected="false" tabindex="-1">Security</button>
        <button class="ori-tabs__tab" role="tab" aria-selected="false" tabindex="-1">Notifications</button>
    </div>
    <div class="ori-tabs__panel" role="tabpanel" tabindex="0">General settings.</div>
    <!-- … -->
</div>
```

::

## Disabled tabs

Set `disabled: true` on individual tab items to lock those tabs. Disabled tabs are real `<button disabled>` — they are removed from tab order, unreachable by keyboard nav, and visually dimmed.

::example
:ori-tabs{:tabs='[{"value":"active","label":"Active"},{"value":"locked","label":"Locked","disabled":true},{"value":"another","label":"Another"}]'}

#vue

```vue
<OriTabs
    v-model="active"
    :tabs="[
        { value: 'active', label: 'Active' },
        { value: 'locked', label: 'Locked', disabled: true },
        { value: 'another', label: 'Another' }
    ]"
/>
```

#html

```html
<button class="ori-tabs__tab" role="tab" aria-selected="false" tabindex="-1" disabled>Locked</button>
```

::

## Panel slots — per-tab content

Use a named slot matching the tab's `value` to give each panel its own markup. A scoped `#default="{ tab }"` slot is the fallback for shared/uniform content across all panels.

::example
:ori-tabs{:tabs='[{"value":"preview","label":"Preview"},{"value":"code","label":"Code"},{"value":"docs","label":"Docs"}]'}

#vue

```vue
<!-- Primary: a named slot per value — distinct markup per panel -->
<OriTabs v-model="tab" :tabs="tabs">
    <template #preview>
        <p>Rendered preview of the component.</p>
    </template>
    <template #code>
        <pre>const x = 1;</pre>
    </template>
    <template #docs>
        <p>Documentation and API reference.</p>
    </template>
</OriTabs>

<!-- Fallback: one shared template that reads the active tab from scope -->
<OriTabs v-model="tab" :tabs="tabs">
    <template #default="{ tab }">
        <p>Content for: {{ tab.label }}</p>
    </template>
</OriTabs>
```

#html

```html
<!-- Panels are arbitrary markup inside each ori-tabs__panel -->
<div class="ori-tabs__panel" role="tabpanel" tabindex="0">
    <p>Rendered preview of the component.</p>
</div>
```

::

## Uncontrolled (no v-model)

When `v-model` is omitted, the component auto-selects the first non-disabled tab immediately and stays self-contained. If the active value ever points at a missing or disabled tab, it self-heals to the first non-disabled tab.

::example
:ori-tabs{:tabs='[{"value":"one","label":"First"},{"value":"two","label":"Second"},{"value":"three","label":"Third"}]'}

#vue

```vue
<!-- No v-model — the component manages its own active state -->
<OriTabs
    :tabs="[
        { value: 'one', label: 'First' },
        { value: 'two', label: 'Second' },
        { value: 'three', label: 'Third' }
    ]"
/>
```

#html

```html
<!-- Same markup; the first tab gets aria-selected="true" by default -->
<div class="ori-tabs ori-color_primary">…</div>
```

::

## Common patterns

Vertical orientation, a non-default color, and named panel slots — a common settings sidebar pattern.

::example
:ori-tabs{orientation="vertical" color="secondary" :tabs='[{"value":"profile","label":"Profile"},{"value":"account","label":"Account"},{"value":"privacy","label":"Privacy"}]'}

#vue

```vue
<OriTabs
    v-model="settingsSection"
    orientation="vertical"
    color="secondary"
    :tabs="[
        { value: 'profile', label: 'Profile' },
        { value: 'account', label: 'Account' },
        { value: 'privacy', label: 'Privacy' }
    ]"
>
    <template #profile>
        <h2>Profile settings</h2>
        <p>Update your name, avatar, and bio.</p>
    </template>
    <template #account>
        <h2>Account settings</h2>
        <p>Manage your email address and password.</p>
    </template>
    <template #privacy>
        <h2>Privacy settings</h2>
        <p>Control who can see your activity.</p>
    </template>
</OriTabs>
```

#html

```html
<div class="ori-tabs ori-tabs_vertical ori-color_secondary">
    <div class="ori-tabs__list" role="tablist" aria-orientation="vertical">
        <button class="ori-tabs__tab" role="tab" aria-selected="true" tabindex="0">Profile</button>
        <button class="ori-tabs__tab" role="tab" aria-selected="false" tabindex="-1">Account</button>
        <button class="ori-tabs__tab" role="tab" aria-selected="false" tabindex="-1">Privacy</button>
    </div>
    <div class="ori-tabs__panel" role="tabpanel" tabindex="0">
        <h2>Profile settings</h2>
        <p>Update your name, avatar, and bio.</p>
    </div>
    <!-- … -->
</div>
```

::

## Accessibility

The accessibility contract holds across every layer — the standalone classes and the Vue component
render the same attributes and keyboard behaviour.

- Full WAI-ARIA Tabs pattern, hand-rolled (no behaviour engine). `role="tablist"` on the list with
  `aria-orientation` reflecting the `orientation` prop.
- Each tab is a real `<button role="tab">` with a `useId()`-derived stable id, `aria-selected`
  (`"true"` / `"false"`), `aria-controls` pointing at its panel id, and a **roving tabindex**
  (selected = `0`, others = `-1`) so `Tab` / `Shift+Tab` enter and leave the group as a single stop.
- Each panel is `role="tabpanel"` with `tabindex="0"` and `aria-labelledby` its owning tab — the
  panel is focusable so keyboard users can reach its content.
- Activation is **automatic** — focus move also selects. Arrow keys move to the previous/next
  non-disabled tab with wrap-around.
- Disabled tabs are real `<button disabled>` — removed from tab order, not focusable, not selectable,
  and skipped by arrow-key navigation.
- Focus is always visible: `:focus-visible` on both the tab button and the panel, using
  `var(--ori-color, currentcolor)` so the ring colour matches the active indicator.
- Tab/panel id pairs are SSR-safe via `useId()`.

| Key                        | Action                                                                   |
| -------------------------- | ------------------------------------------------------------------------ |
| `Tab`                      | Moves focus into the tablist (to the selected tab) or past it.           |
| `Shift+Tab`                | Moves focus out of the tablist (or from the panel back before the list). |
| `ArrowRight` / `ArrowLeft` | Horizontal: selects and focuses the next / previous non-disabled tab.    |
| `ArrowDown` / `ArrowUp`    | Vertical: selects and focuses the next / previous non-disabled tab.      |
| `Home`                     | Selects and focuses the first non-disabled tab.                          |
| `End`                      | Selects and focuses the last non-disabled tab.                           |

## Framework API

The props, events, and slots of the **Vue** component. The standalone CSS layer has no component
API — its surface is the [classes](#classes) above. (Svelte bindings are planned.)

### Props

| Prop          | Type                                                                    | Default                      | Description                                                                                                         |
| ------------- | ----------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `color`       | `ThemeColor`                                                            | `'primary'`                  | Active-tab accent: drives the indicator (underline / side-bar), the active tab label colour, and the focus ring.    |
| `modelValue`  | `string \| number`                                                      | first non-disabled tab value | Active tab value (`v-model`). Auto-defaults to the first non-disabled tab; self-heals if the value becomes invalid. |
| `orientation` | `'horizontal' \| 'vertical'`                                            | `'horizontal'`               | Layout + keyboard axis. `horizontal` = row tablist with underline; `vertical` = column tablist with right side-bar. |
| `tabs`        | `Array<{ value: string \| number; label: string; disabled?: boolean }>` | — (**required**)             | The set of tabs. Each item: `value` (unique key), `label` (visible text), optional `disabled`.                      |

### Events & attributes

| Event               | Payload            | Description                                                                           |
| ------------------- | ------------------ | ------------------------------------------------------------------------------------- |
| `update:modelValue` | `string \| number` | Emitted when the user activates a tab (via click or keyboard). Use `v-model` to bind. |

OriTabs does not set `inheritAttrs: false`, so extra attributes (`class`, `data-*`, …) fall through
to the root `div.ori-tabs`.

### Slots

| Slot      | Scope                                                                     | Description                                                                                                                                                            |
| --------- | ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<value>` | `{ tab: { value: string \| number; label: string; disabled?: boolean } }` | **Primary.** A per-value named slot — name the slot by the tab's value (e.g. `#account` for value `'account'`). Numeric values are stringified for the slot name.      |
| `default` | `{ tab: { value: string \| number; label: string; disabled?: boolean } }` | **Fallback.** A scoped default slot rendered for any tab that has no matching named slot — one shared template for uniform content. Read the per-panel tab from scope. |
