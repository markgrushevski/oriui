# Start here

The entry point for whoever is picking this repository up — including you, after a break. It answers
four questions in order: **what is this**, **how do I get it back in my head**, **what do I do next**,
and **how do I ship it**.

Written 2026-09-21, when the line was `1.0.0-rc.18` on npm and 73 changesets were waiting for the next
publish. Everything below is checkable — if a number here disagrees with the repo, trust the repo and
fix this file.

---

## 1. What this is, in sixty seconds

Three packages that can be used separately, woven around one set of CSS custom properties:

| package           | what it is                                                               | what it does NOT contain                    |
| ----------------- | ------------------------------------------------------------------------ | ------------------------------------------- |
| `@oriui/css`      | tokens + `.ori-*` classes + one stylesheet per component                 | no JavaScript at all                        |
| `@oriui/headless` | a framework-agnostic behaviour core + thin Vue / Svelte / React adapters | no styling, no markup                       |
| `@oriui/vue`      | 34 styled Vue SFCs — the two above, wired together                       | no CSS of its own (it imports `@oriui/css`) |

The load-bearing idea is that **each layer is useful without the others**. A React app can take the CSS
alone. An htmx page can take the CSS alone. A Svelte app can take the behaviour without the markup. That
constraint is what most of the odd-looking decisions in this repo are protecting, and
[DECISIONS.md](DECISIONS.md) is where each of them is argued.

The second idea is **zero-runtime theming**: switching skin, size, colour or variant is a class or an
attribute, never JavaScript. That is why prop values are interpolated into class names, and why a prop
rename is also a CSS class rename.

---

## 2. Getting the code back in your head

Four sittings of about an hour. Read in this order — each one makes the next cheaper. Open the file,
don't skim the summary.

**Sitting 1 — the shape of one component.** Read `packages/vue/src/components/button/ori-button.vue`
top to bottom, then `packages/css/src/components/button.css`. Between them they demonstrate every
convention in the library: reactive props destructure with defaults, props alphabetical and optional,
classes from prop values, state on real attributes (`disabled`, `aria-busy`, `aria-pressed`), and the
two-tier token pattern (`--ori-size-action_md` → `--ori-size-action`). Then read
[CLAUDE.md](CLAUDE.md) §"Code conventions", which is the same thing stated as rules.

**Sitting 2 — how behaviour is separated from markup.** Read
`packages/headless/src/core/menu/menu.connect.ts` (the machine and the prop-getters),
`packages/headless/src/vue/use-menu.ts` (twenty lines — the adapter resolves which engine to use), and
`packages/vue/src/components/menu/ori-menu.vue` (the styled shell that spreads the bags). That triangle
is the architecture. Then look at `packages/headless/src/react/use-menu.ts` to see the same core behind
a different framework — that is what "the behaviour travels" means in practice.

**Sitting 3 — how the tokens work.** Read `packages/css/src/themes/_themes-color-tokens.css`, then
`_themes-variant.css`, then `packages/css/src/sizes/_sizes-action.css`. Then open the docs page
`docs/content/guides/design-tokens.md`, which is the same system explained for a consumer. The thing to
internalise: a component reads only the resolved alias (`--ori-color`, `--ori-size-action`), never a raw
scale token, and a utility class is what repoints the alias.

**Sitting 4 — what the tests actually guard.** Run `npm run test` and `npm run test:e2e` once so you
know what green looks like. Then read three specs, because each covers something the other two cannot:
`tests/button.test.ts` (behaviour + axe in happy-dom), `e2e/text-contrast.spec.ts` (real Chromium, real
composited pixels — happy-dom has no layout engine and cannot evaluate `color-mix`), and
`e2e/non-text-contrast.spec.ts` (the same technique against the 3:1 boundary bar). Contrast is measured
here, never argued — that rule was learned the expensive way, twice.

After those four, you can change anything in the repo without archaeology.

---

## 3. Where every question is answered

Nine files at the root. Each answers exactly one kind of question — **that separation is the point**, so
put new writing in the file whose question it answers rather than wherever it fits.

| file                                                              | the question it answers                                 | when to write in it                                       |
| ----------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------- |
| [README.md](README.md)                                            | what is this, how do I install and use it               | consumer-facing surface changed                           |
| [ROADMAP.md](ROADMAP.md)                                          | what has been built, in phases                          | a phase moves                                             |
| [IDEAS.md](IDEAS.md)                                              | what we **might** build                                 | a candidate component, class or infra idea                |
| [DECISIONS.md](DECISIONS.md)                                      | **why** something is the way it is                      | you chose between real alternatives                       |
| [ISSUES-INNER.md](ISSUES-INNER.md)                                | what is broken **and still open here**                  | you found a defect (see the status vocabulary at its top) |
| [ISSUES-OUTER.md](ISSUES-OUTER.md)                                | what is broken in a **browser / dependency / registry** | the fix is not ours to make                               |
| [NOTES.md](NOTES.md)                                              | traps already paid for                                  | you lost an hour to something non-obvious                 |
| [REVIEW.md](REVIEW.md)                                            | the bar a change has to clear                           | the bar itself changes                                    |
| [RELEASING.md](RELEASING.md) · [CONTRIBUTING.md](CONTRIBUTING.md) | how to publish · how to branch and commit               | the process changes                                       |

**Two habits worth keeping.** A defect recorded in ISSUES-INNER should not be re-discovered later, so
read it before reviewing anything. And a status line there is load-bearing: `fixed` takes an entry off
everyone's radar, so use `mitigated` when you shipped a workaround and the root cause is still live.

---

## 4. What to do next, in priority order

The register is **97 entries: 90 fixed, 4 accepted (deliberately won't-fix, with reasons), 1 mitigated,
2 genuinely open.** Nothing open is a blocker. The WCAG-normative failure that was blocking 1.0
(`OriTooltip` vs 1.4.13) is closed.

### 4.1 Ship the release that is already built up

73 changesets are waiting. Everything in them is done, tested and merged; the only thing between them
and npm is running the release. **Do this first** — it is the highest value per unit of effort in the
whole list, and two of justpaint's open problems close on it with zero work downstream.

One thing must happen before the publish, and [RELEASING.md](RELEASING.md) carries it as a standing
note: **the vocabulary rename in this batch is breaking for justpaint** — roughly 38 call sites, and it
pins `1.0.0-rc.18` exactly. Migrate it, or at least tell it, before the packages go out. The migration
table is in `.changeset/api-vocabulary-rename.md`.

### 4.2 The two open defects, in the order they are worth doing

1. **ORI-I-94 — RTL arrow keys.** Toolbar takes a `dir` prop that nothing sets; Tabs has none; neither
   reads the computed direction. So an RTL app cannot fix the tabs at all. The entry names two fixes and
   recommends reading the computed `direction` once with a prop override.
2. **ORI-I-95 — toasts auto-dismiss after 4s with no way to pause, extend or disable.** Read the entry
   before acting: it establishes that today's toasts are _probably_ compliant only because they carry no
   action, and that adding an action affordance (which Radix, Reka and Ark all have) makes pause-on-hover
   mandatory rather than optional. **Decide those two together.**

And one that is mitigated rather than closed: **ORI-I-87** — `OriAccordion`'s `#default` slot still
renders once per item, so a template with an `id` in it still duplicates. There is now a correct path
(`#panel-<value>`), which is why it is not urgent, but the fan-out itself is unchanged.

### 4.3 After that

[IDEAS.md](IDEAS.md) is the backlog, and its own rule is the one to keep: **build what a real screen
needs.** The most useful next move is usually not a new component — it is putting the library in front of
a real screen (justpaint) and fixing what that hurts. Every one of the last three review passes found
more by looking outward than by re-reading our own code.

---

## 5. The working loop

Branch, change, gate, changeset, merge. The gates are the part that replaces a reviewer.

```bash
git checkout -b fix/some-thing        # or feat/, refactor/, docs/
# … make the change …
npm run types                          # vue-tsc across all three packages
npm run test                           # 1312 unit tests + axe
npm run lint:all                        # prettier + stylelint + eslint, with --fix
npm run build && npm run size           # the gzip budgets
npm run test:e2e                        # 132 tests in real Chromium
npm run docs:build                      # the docs must still generate
npx changeset                           # write the consumer-facing note
git commit && git checkout main && git merge --no-ff -
```

CI runs the same set on Node 22 and 24, so a green local run is a green PR. The one gate that is easy to
forget is `docs:build` — the docs render live components, so a prop rename can break the site while every
test passes.

**Write the changeset as if you will not be there to explain it**, because you will not be. The ones in
`.changeset/` right now are the model: what changed, what it breaks, what to do about it, and the number
that justified it.

---

## 6. Releasing, alone

Full runbook in [RELEASING.md](RELEASING.md); the short version:

1. Merge to `main`. A GitHub Action opens a **"Version Packages"** PR that aggregates the changesets.
2. Merge that PR. Publishing happens in CI over OIDC trusted publishing — no token to hold.
3. The three packages are a **fixed lockstep group**: they always bump together.

Two things to know that are not obvious:

- The line is in changesets **pre mode** (`rc`), so publishes land on the `rc` dist-tag, not `latest`.
  `changeset pre exit` is the act that makes the next release **1.0** — it is one command and it is not
  reversible in the eyes of consumers, so do it deliberately.
- npm's registry is eventually consistent. A fresh publish can 404 for several minutes even with
  cache-busting. **An immediate read is not evidence that a publish failed** — this cost a whole
  debugging session once, and is recorded in NOTES.md.

---

## 7. Keeping the bar without a reviewer

The five habits that caught the most real defects here, in order of how much they returned:

1. **Measure; do not reason.** Every contrast claim in this repo that was reasoned turned out wrong, and
   every one that was measured held. The rigs already exist (`e2e/text-contrast.spec.ts`,
   `e2e/non-text-contrast.spec.ts`) — add a probe rather than an argument.
2. **Check the claim against the source, not the summary.** Two decisions here were nearly made on
   "library X does Y" that turned out not to be true of library X's actual code. Open the file.
3. **Look outward.** The review that compared this library against thirteen others found things no
   amount of internal review could, because internal review checks the code against itself.
4. **After any rename, grep the prose too.** Prescriptive lines in NOTES.md and the docs go silently
   false — a rule that said "the role is `warn`, not `warning`" survived a rename and started telling
   people to write the one value that fails type-check.
5. **Write down what you rejected and why.** Half of DECISIONS.md is that, and it is the half that stops
   the same argument being re-litigated in six months.

---

## 8. The traps, if you only read one section

- **A prop value is a CSS class.** `variant="solid"` renders `.ori-variant_solid`. Renaming a value
  without renaming the class silently unstyles the component — no error, no warning.
- **`docs/content/**/*.md` is executable.** The inline `:ori-button{...}` demos are real components with
  real props. A stale prop there renders wrong on the live site.
- **happy-dom has no layout engine** and cannot evaluate `color-mix` or anchor positioning. Anything
  about pixels, geometry or composited colour belongs in `e2e/`, not `tests/`.
- **`@oriui/css` must work with no JavaScript.** If a fix needs JS, the CSS consumer needs a documented
  attribute to drive themselves — see how `data-ori-dismissed` is handled on the tooltip.
- **Vue never warns about an unconsumed slot.** A typo in a named slot is silent, which is why two
  components ship a DEV warning for exactly that.
