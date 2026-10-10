/* ==================== Sizes ==================== */
//
// Every size type is the set of STEPS a class utility accepts (`ori-size-radius_md`,
// `ori-font-size_lg`, …), so a plain string-literal union is the honest model: a union of the steps,
// not a record whose values nothing reads. Each name below is consumed by at least one component
// prop — a size scale that no component exposes is a CSS concern and belongs in @oriui/css, not in
// the styled package's public types.

/** Steps of the action-size scale — the height/padding family shared by every interactive control
 *  (button, input, select, combobox, slider handle). `inherit` is the label-height step: the control takes
 *  the surrounding text size (1em) instead of a fixed one. */
export type ActionSize = 'inherit' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

/** Steps of the gap scale used by layout primitives (`<OriStack gap>`). `none` collapses the gap. */
export type GapSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Steps of the corner-radius scale. `none` squares the corners, `full` is the pill. */
export type RadiusSize = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

/* ==================== Positions ==================== */

/** The four edges a centered decoration can sit on — e.g. `<OriButton icon-position>`. `start` and `end`
 *  are logical, so they swap sides in RTL. */
export type CenteredPosition = 'top' | 'bottom' | 'start' | 'end'

/** The four sides an anchored panel can take. Building block of `AnchoredPlacement`. */
export type AnchoredSide = 'top' | 'bottom' | 'left' | 'right'

/** The 12-value anchored-panel placement grid for overlays (popover, menu, …): a bare side centers on
 *  the cross axis; `-start` / `-end` align to the trigger's start / end edge (logical, RTL-aware). */
export type AnchoredPlacement = AnchoredSide | `${AnchoredSide}-start` | `${AnchoredSide}-end`

/** What a trigger can announce it opens (`aria-haspopup`) — `<OriPopover haspopup>`. Deliberately not
 *  the panel's `role`: a popover panel is legitimately a `group`, a `region` or a `tooltip`, and none of
 *  those are legal `aria-haspopup` tokens. */
export type PopupRole = 'dialog' | 'menu' | 'listbox' | 'tree' | 'grid'

/** The viewport edge a drawer docks to. `start` / `end` are logical, so they swap sides in RTL. */
export type DrawerSide = 'start' | 'end' | 'top' | 'bottom'

/** The axis a row of items runs along (`<OriTabs>`, `<OriToolbar>`, `<OriDivider>`, `<OriJoin>`,
 *  `<OriRadioGroup>`). */
export type Orientation = 'horizontal' | 'vertical'

/* ==================== Colors ==================== */

/** The palette roles a component's `color` prop accepts — each one resolves the `--ori-color` /
 *  `--ori-color-on` alias pair through the `ori-color_*` utility. */
export type ThemeColor = 'primary' | 'secondary' | 'surface' | 'background' | 'success' | 'warning' | 'danger' | 'info'

/* ==================== Variants ==================== */

/** The emphasis ladder a component's `variant` prop accepts, loudest to quietest. */
export type Variant = 'solid' | 'soft' | 'outline' | 'text' | 'quiet'
