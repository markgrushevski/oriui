---
'@oriui/vue': patch
---

`OriCard` renders only the header parts that have content. An empty leading area, trailing area or subtitle no
longer takes a gap, so the title lines up with the body text, and a card with only `text` has no empty header
above it. The output now matches the documented HTML.
