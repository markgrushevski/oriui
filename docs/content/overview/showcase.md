---
title: Showcase
---

# Showcase

Apps built with oriUI. Each entry says what the app does and which parts of oriUI it uses, so you can see the
library inside a whole product, not one component at a time.

## justpaint

A drawing game. Two players draw the same prompt, a model scores both drawings against it and picks the
winner, and the results feed an Elo leaderboard. A free-draw vector editor shares the same canvas.

- **Uses:** `@oriui/vue` and `@oriui/headless` — the editor toolbar, the color picker, dialogs, menus, lists,
  tabs and toasts.
- **Live:** [justpaint.onrender.com](https://justpaint.onrender.com/) — hosted on a free tier, so the first
  load can take up to a minute while the server wakes.
- **Source:** [github.com/markgrushevski/justpaint](https://github.com/markgrushevski/justpaint)

## This documentation

The site you are reading, on Nuxt and Nuxt Content.

- **Uses:** `@oriui/vue` for the navigation drawer, the toaster and the [editor on the home page](/), which
  is assembled from the toolbar, color picker, menu, slider, list and segmented control; `@oriui/headless`
  (`useDialog`) for the search palette.
- **Source:** [github.com/markgrushevski/oriui/tree/main/docs](https://github.com/markgrushevski/oriui/tree/main/docs)

## Add your app

Built something with oriUI?
[Open a pull request](https://github.com/markgrushevski/oriui/edit/main/docs/content/overview/showcase.md)
that adds it to this page: the name, a sentence or two about what it does, which parts of oriUI it uses, and
a link to try it.
