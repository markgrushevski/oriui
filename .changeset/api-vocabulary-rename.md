---
'@oriui/vue': minor
'@oriui/css': minor
'@oriui/headless': minor
---

**The public vocabulary now follows the industry plurality — every prop VALUE and the content prop
are renamed.** This is the vocabulary pass the 1.0 freeze makes permanent; each item was measured
against the API of thirteen libraries, and only the outliers moved. Ten concepts already matched
(`variant`, `color`, `size`, `loading`, `disabled`, `open` / `defaultOpen`, `modelValue`, `as`,
`outline`) and were deliberately left alone.

**Migration — values.** Every one of these is interpolated into a class name, so each is also a
`@oriui/css` class rename, and the colour is a public TOKEN rename:

| Before                       | After             | Also renamed                                                                                                            |
| ---------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `color="warn"`               | `color="warning"` | `--ori-color-warn` / `-on-warn` / `-warn-text`, `.ori-color_warn`, `ToastColor`, `useToast().warn()` → `.warning()`     |
| `variant="fill"`             | `variant="solid"` | `.ori-variant_fill`, `.ori-input_fill`, `.ori-textarea_fill`                                                            |
| `variant="tonal"`            | `variant="soft"`  | `.ori-variant_tonal`                                                                                                    |
| `radius="zero"`              | `radius="none"`   | `.ori-size-radius_zero`, `--ori-size-radius_zero`                                                                       |
| `radius="rounded"`           | `radius="full"`   | `.ori-size-radius_rounded`, `--ori-size-radius_rounded`                                                                 |
| `gap="zero"`                 | `gap="none"`      | `.ori-size-gap_zero`, `--ori-size-gap_zero`                                                                             |
| `size="text"` (`ActionSize`) | `size="inherit"`  | `--ori-size-action_text`, `--ori-size-action-space_text`, `--ori-font-size_text`, `.ori-icon_text`, `.ori-spinner_text` |

`warn` was the smallest-weight spelling in the whole audit (PrimeVue alone); `fill` exists in no
library while `solid` is AntD + Chakra v3 + Radix Themes + Nuxt UI + Park UI; `tonal` is Material-3
jargon only Vuetify exposes; `zero` is ours alone where `none` is the CSS keyword, and
`radius="rounded"` read as "radius=radius" because `rounded` is the PROP name in Vuetify, PrimeVue
and Chakra. The action-size step is `inherit` (MUI's word for the same step) rather than `inline`,
because `OriIcon`, `OriSpinner` and `OriAvatar` each already ship an `inline` BOOLEAN whose class is
`.ori-<block>_inline` — `size="inline"` would have silently switched them to `display: inline-flex`
with a margin.

**Migration — the content prop.** `text` becomes `label` on the components whose text names the
control, which is what PrimeVue, Quasar and Nuxt UI all call it, and what oriUI's own collection
items (`OriTabs`, `OriAccordion`, `OriSelect`) have always called it:

| Component                                     | Before  | After       |
| --------------------------------------------- | ------- | ----------- |
| `OriButton`, `OriTag`, `OriKbd`, `OriDivider` | `text`  | `label`     |
| `OriToolbarButton`, `OriToolbarToggleItem`    | `text`  | `label`     |
| `OriToolbarButton`, `OriToolbarToggleItem`    | `label` | `ariaLabel` |
| `OriAvatar`                                   | `text`  | `name`      |

`OriAlert`, `OriCard` and `OriToast` keep `text`: there it is a message body paired with `title`,
not a label — which is also how Vuetify names it. `OriAvatar.name` is the person the avatar stands
for: it was never rendered verbatim, it drives the initials and the image `alt` (Chakra's word for
the same prop).

On the two toolbar components the old `label` was the accessible name of an icon-only button and is
now `ariaLabel`, so the visible-text prop can be `label` like everywhere else. That split also fixed
a rendering defect nothing had caught: `<OriToolbarButton label="New" />` with no icon and no
tooltip used to render an **empty** button carrying only `aria-label` — as four demos on the Toolbar
page did.

No aliases ship. One set of names, because a pair of spellings that reaches 1.0 never gets removed.
