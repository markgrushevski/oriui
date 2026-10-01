// Shows or hides a `popover="manual"` panel. The top layer frees an anchored panel from its ancestors: a
// `transform` there would become its containing block and misplace it, and an `overflow` or a stacking
// context would clip or bury it. Without the Popover API the panel stays in place, under its z-index.
export function setTopLayer(el: HTMLElement | null | undefined, open: boolean): void {
    if (!el || typeof el.showPopover !== 'function') return
    if (open === el.matches(':popover-open')) return
    if (open) el.showPopover()
    else el.hidePopover()
}
