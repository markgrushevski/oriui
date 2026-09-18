---
'@oriui/vue': patch
---

**OriCard** drops the `image` prop. It was declared and typed on the component (and documented, with
the admission "not yet rendered by the template") but read by neither the template nor
`packages/css/src/components/card.css` — passing it did exactly nothing. A real hero image is a design
task (an `.ori-card__image` block, aspect-ratio handling, a defined position in the `ori-card_row`
flex mode), not a one-liner, so the prop goes rather than freezing an empty promise into the API.

Removing a prop is breaking after 1.0 and free now: nothing in the repo or the docs passed `image`,
and because it was never rendered no output can change. Consumers that did pass it lose only a
silently-ignored prop — `image` now falls through to the root `<div>` as a plain attribute.

A new card test probes **every** declared prop and fails if one changes nothing in the rendered DOM,
so a declared-but-unrendered prop cannot be reintroduced unnoticed.
