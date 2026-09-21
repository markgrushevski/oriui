---
'@oriui/vue': minor
'@oriui/css': minor
'@oriui/headless': patch
---

**The pre-1.0 accessibility queue, closed.** Seven recorded defects, one of them the only
WCAG-normative failure in the register.

**`OriTooltip` now meets WCAG 1.4.13 Content on Hover or Focus (Level AA).** It failed two of the
three bullets. _Hoverable_ — the bubble was `pointer-events: none` with a gap to cross, so the pointer
could never reach it (failure technique F95) and the text could not be selected, copied, or read by
someone panning with screen magnification. It now takes pointer events while shown, and a transparent
bridge covers the gap. _Dismissible_ — there was no Escape, because the component had no JavaScript at
all. **It now has exactly one document listener for the whole page**, shared by every instance: on
Escape, each tooltip asks the DOM whether it is the one showing and sets `data-ori-dismissed` on
itself, which both show rules are gated on and which clears on `pointerleave` / `focusout`. The
show/hide mechanism is still pure CSS. A standalone `@oriui/css` consumer gets Hoverable for free and
wires the one listener themselves — the surface is that attribute.

**A busy button is no longer dimmed like a disabled one.** `loading` renders the native `disabled`
attribute, so the `opacity: .45` disabled dim applied to a button that is _working_, not inactive —
reported by justpaint (JP-O-10) at **1.68:1** on a solid primary. WCAG's contrast exemption covers
inactive components, not waiting ones. The dim now skips `[aria-busy='true']`; the pointer and
keyboard blocking are unchanged. Measured after the fix at a worst of **4.91:1** across every role,
skin and theme, and pinned by a new probe in the contrast guard.

**A mixed checkbox looks mixed.** `:indeterminate` is a DOM property, so it reached the real input and
assistive tech announced "mixed" — while the stylesheet drew the box from `:checked` alone and painted
it empty. Sighted and non-sighted users were told different things. The mixed state now paints the
checked fill with a horizontal bar.

**`OriCombobox` no longer submits the form on Enter with the listbox open.** Enter was prevented only
when an option was highlighted, and the machine clears the highlight on every keystroke — so after
typing, Enter fell through to the real `<input>`. It is now prevented whenever the list is open; the
list deliberately stays open, so "ArrowDown then Enter commits" is unchanged.

**`OriDialog` announces its body as the dialog's description.** The headless layer has always
published `descriptionProps`; the styled tier never bound it. Both halves now ship, and the
`aria-describedby` appears only when there is body content to point at.

Docs and comments: `field.md` named the two controls that are deliberately NOT field-integrated
(`OriCheckbox`, `OriSwitch`) and what happens if you ignore that; a fabricated "APG ColorArea
requirement" citation was replaced with what it actually is in both colour-picker adapters; and
`OriMenu`'s deliberate divergence from APG's Menubar text on disabled items is now written down
beside the code that does it.
