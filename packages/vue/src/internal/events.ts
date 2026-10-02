// Ends a click on a control that is disabled but still receives one: an aria-disabled button stays focusable
// and Enter or Space clicks it, a router link navigates from its own handler. Bound in the capture phase, so
// stopImmediatePropagation keeps it from every listener the caller added.
export function swallowClick(event: Event): void {
    event.preventDefault()
    event.stopImmediatePropagation()
}
