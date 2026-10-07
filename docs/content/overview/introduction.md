---
title: Introduction
---

# Introduction

**oriUI** (織り, _ori_, "weaving") is a design system in plain CSS, with accessible Vue 3 components built
on it. It is made for our own apps first, so a component is added when one of them needs it.

## The packages

| Package           | What it gives you                                                                                                                             |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `@oriui/css`      | Design tokens and a stylesheet per component: `.ori-*` classes, eight skins, light and dark. No JavaScript and no build step.                 |
| `@oriui/vue`      | 38 Vue 3 components, such as `<OriButton variant="soft" />`. Each renders the CSS classes and adds keyboard, focus, ARIA and form behavior.   |
| `@oriui/headless` | That behavior without markup: composables that return state and prop bags for your own elements, as a framework-free core with a Vue adapter. |

The CSS is the foundation, and the other two build on it. `OriButton` is the `.ori-button` classes plus a
few props; `OriDialog` is `useDialog` from `@oriui/headless` plus markup that uses the same classes. So you
can use the CSS without Vue, use the composables with your own markup, or mix all three on one page, and
everything shares the same tokens.

## How it is built

- **Theming is CSS.** A skin or dark mode is set on `<html>` (`data-ori-skin`, `class="dark"`); a size or
  variant is one class on the element. All of them repoint CSS custom properties: no colors are computed in JavaScript, and there
  is no Tailwind dependency.
  See [Theming](/guides/theming).
- **State is real attributes.** `disabled`, `aria-pressed`, `aria-expanded`, `aria-invalid`: the CSS reads
  the same state whether Vue, another framework or hand-written HTML sets it.
- **The platform comes first.** Dialogs use the native `<dialog>`, popovers the Popover API and CSS anchor
  positioning, the accordion `<details>`. JavaScript fills in only what the platform lacks.
- **Accessibility is tested.** axe runs against every component, every color pair passes WCAG AA
  contrast in every skin, and keyboard behavior is exercised in real Chromium. See
  [Accessibility](/overview/accessibility).
- **The engine is replaceable.** Disclosure, dialog, combobox and menu run through the `OriHeadless`
  contract. The default engine has no dependencies; you can register another one for a single widget,
  for example your own wrapper around a library such as Zag, without changing its markup. See
  [@oriui/headless](/headless/core).

## Where it runs

The CSS works in any stack: plain HTML, htmx, Astro, or any framework. The components are Vue 3. The
headless composables have a Vue adapter. See
[Applicability](/overview/applicability) for each environment.

## Status

oriUI is a **release candidate** (`1.0.0-rc.*`): the public API is meant to be final. Open problems are
listed in [ISSUES-INNER.md](https://github.com/markgrushevski/oriui/blob/main/ISSUES-INNER.md).

## Next

- [Get started](/overview/get-started): a component on screen in a minute.
- [Installation](/overview/installation): each package, for each target.
- [Comparisons](/overview/comparisons): how oriUI differs from other libraries.
- [Accessibility](/overview/accessibility): what is guaranteed, and how it is checked.
