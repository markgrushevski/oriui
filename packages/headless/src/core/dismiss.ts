/**
 * The shared "did the interaction land outside the overlay" test for `useDismissable`. Pure and
 * framework-agnostic (like `roving-dom.ts` `ownsArrowKeys`): it reads only the elements it is passed and
 * never queries `document` or mutates. `true` when `target` is outside EVERY one of `elements` (none
 * contains it) — i.e. the overlay should dismiss.
 */
export function isTargetOutside(target: Node | null, elements: (HTMLElement | null | undefined)[]): boolean {
    return !elements.some((el) => el?.contains(target));
}
