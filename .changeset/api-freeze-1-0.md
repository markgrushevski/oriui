---
'@oriui/vue': major
'@oriui/css': major
'@oriui/headless': major
---

**The last API changes before 1.0.** Each one makes a name agree with the rest of the library. After 1.0 the
same change would need a major version.

**`@oriui/vue`**

| Before                                                                 | After                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------- |
| `<OriButton icon-position="left">` / `"right"`                         | `icon-position="start"` / `"end"` (they mirror in RTL)        |
| `<OriDivider vertical>`, `<OriJoin vertical>`                          | `orientation="vertical"`                                      |
| `<OriRadioGroup inline>`                                               | `orientation="horizontal"`                                    |
| `<OriCombobox>` `#option="{ item }"`                                   | `#option="{ option }"` (`index` and `selected` are unchanged) |
| `<OriListItem>` `#start` / `#end`                                      | `#prepend` / `#append`                                        |
| `<OriListItem description hint>`                                       | `subtitle`, `meta`                                            |
| `<OriBadge label>`                                                     | `aria-label` (`ariaLabel`)                                    |
| `describedby` on `OriInput`, `OriSelect`, `OriTextarea`, `OriCombobox` | the `aria-describedby` attribute                              |

- `orientation` takes the new exported `Orientation` type (`'horizontal' | 'vertical'`), as on `OriTabs` and
  `OriToolbar`.
- `OriListItem` names its parts like `OriTag` and `OriCard`. Its `hint` was trailing text, not the helper
  text that `hint` means on a field.
- `OriBadge` renders `content`, so the name that is not rendered is `ariaLabel`.
- The `aria-describedby` attribute already did what the `describedby` prop did: it is joined with the
  control's own hint and error ids, inside an `OriField` too, where the prop used to be dropped.
- New `closeLabel` on `OriDialog`, `OriDrawer` (`'Close'`), `OriToast` and `OriToaster`
  (`'Dismiss notification'`), so the close button can be named in your language.
- Newly exported types: `Orientation`, `PopupRole`, `AnchoredSide`, `ColorFormat`, `ToastColor`. They
  already appeared in public props.

**`@oriui/css`**

| Before                                                                  | After                                                           |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- |
| `.ori-button_icon-position_left` / `_right` / `_top` / `_bottom`        | `.ori-button_icon-position-start` / `-end` / `-top` / `-bottom` |
| `.ori-radio-group_inline`                                               | `.ori-radio-group_horizontal`                                   |
| `.ori-list__start` / `__end` / `__description` / `__hint`               | `.ori-list__prepend` / `__append` / `__subtitle` / `__meta`     |
| `.ori-checkbox_disabled`, `.ori-switch_disabled`, `.ori-radio_disabled` | removed: the look follows the input's `disabled`                |
| `.ori-combobox__option_selected`                                        | removed: the look follows `aria-selected="true"`                |

- Every keyed modifier now joins key and value with a hyphen, like `.ori-surface_elevation-lg`.
- New `.ori-button_inherit`, `.ori-input_inherit`, `.ori-select_inherit`, `.ori-textarea_inherit`,
  `.ori-combobox_inherit` and `.ori-segmented-control_inherit`. Until now `size="inherit"` had no class on
  these blocks and fell back to `md`.

**`@oriui/headless`**

- `useCombobox`: the options `value` and `inputValue` were read once, at creation, so they are now
  `defaultValue` and `defaultInputValue`.
- `useTabs`: `idBase` is `id`, as in every other composable.
- `useDialog`: `dialogProps` is `contentProps`, as in `useDisclosure` and `useMenu`. This also applies to
  the `DialogControl` contract for a custom adapter.
- `useDismissable`: `pointerDownOutside` and `focusOutside` both default to `true`. Before, a call that set
  neither did nothing. Pass `false` for the one your overlay should not use.
- `useTheme`: assigning `theme.value` (or `v-model="theme"`) now applies and persists the theme, and
  `resolvedTheme` is read-only. Before, writing either ref changed the ref and nothing else.
