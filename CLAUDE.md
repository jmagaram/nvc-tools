# nvc-tools

A gallery of small React components for NVC tools. The home page lists every
component; clicking one opens a page with controls for its props and a live
preview below. These components will later be assembled into an app and/or an
Obsidian plugin — for now the gallery is the only surface.

## Design rules

- **Low fidelity.** Minimal effort on making things look pretty — no colour or
  font work unless asked. Do use structural CSS (grid, table, flex, spacing) so
  the shape of a component is legible. Keep to one or two heading levels.
- **No UI library**, no CSS framework, no CSS-in-JS. Plain semantic HTML.
- Styles live in a **CSS Module** next to the component
  (`src/components/Foo.module.css`, imported as `styles`). Put a rule in
  `src/index.css` only when it is genuinely global across components.
- Components are **presentational only**: props in, JSX out. No state, no
  effects, no fetching, no globals, no awareness of routing. State belongs in
  the demo page (and later, in the app). The one exception is **transient
  animation state** — something that exists only for the length of a transition
  and that no host could ever read back. `FeelingPrompt` and `NeedPrompt` keep
  the card just answered so it has something to fly off with; putting that in a
  machine would make every host own a timer just to end an animation.
- **Flow state lives in a machine.** When a component walks someone through
  several steps, put the state in `src/machines/` as a pure module — a state
  type, an action type, `init`, `reduce`, and selectors, with no React import.
  The component takes `state` and `onAction` props; the demo page (later the
  app or an Obsidian modal) owns the `useState` that drives it. See
  `src/machines/feelingCategoryWalk.ts` and
  `src/components/FeelingCategoryWalk.tsx`.
- Type props with an explicit `type Props = { ... }`.
- **Terminology.** The domain noun is **feeling**, never *emotion* — that is what
  `src/data/feelings.ts` and the CNVC source call it. A **category** is a named
  group of feelings with a `kind` of `'met' | 'unmet'`; needs have categories
  too, but no `kind`. Name a component for the scope it covers: `*Picker` walks
  every category, `*Walk` walks one, `*Prompt` asks about one word, `*Card`
  just displays one thing. Prefer the singular (`NeedCategoryCard`, not
  `Needs…`) to match the data types.
- **Make impossible states unrepresentable.** Prefer a shape that cannot express
  a contradiction: a discriminated union over parallel optional fields, a
  required prop over an optional one with a silent fallback. Two caveats —
  redundancy is not contradiction (an unused fallback is fine), and a union buys
  nothing when the invalid case is a runtime property the type cannot see (an
  empty array, a blank string). Reach for it when the branches genuinely differ;
  otherwise just make the prop required.

## Adding a component

1. `src/components/Foo.tsx` — presentational, typed props, default export,
   plus `src/components/Foo.module.css` if it needs styles.
2. `src/demos/FooDemo.tsx` — one `useState` per prop, plain `<label>` controls,
   a `<hr />`, then `<Foo ... />`. A component with no options just renders
   itself and no controls.
3. Register it in the `demos` array in `src/demos/index.ts`.
4. `npm run dev`, then open `#/foo`.

## Layout

```
src/
  App.tsx            gallery shell: home list + demo page
  router.ts          useHashRoute() — hand-rolled, no router dependency
  index.css          global stylesheet, kept tiny
  components/        presentational components
  data/              NVC reference data (feelings, needs)
  demos/             one demo page per component, plus index.ts registry
  machines/          pure state machines (state + action + reduce, no React)
obsidian/            the Obsidian plugin — the second surface, see below
scripts/             deploy-plugin.mjs
```

## The Obsidian plugin

`obsidian/` is the second surface: two commands, `NVC: Insert feelings…` and
`NVC: Insert needs…`, each opening a picker over the active note and inserting
grouped bullets at the cursor, fenced as an `nvc-list` block. It imports
straight from `src/` and adds nothing to it.

- **The modal is the host.** `FeelingPickerHost` / `NeedPickerHost` are their
  demo pages with the controls taken off — same `useState`, same `reduce`, same
  `chosen` on OK. Obsidian glue stays in the `*Modal` files beside them.
- **`ModalFrame` is not imported here.** It stands in for Obsidian's chrome so
  the gallery can preview the shape; the plugin has the real thing. The modals
  add `mod-scrollable-content` — Obsidian's own three-row modal — and draw the
  heading and the button row through portals, because that modifier only works
  when `.modal-button-container` is a *sibling* of `.modal-content`, not inside
  it.
- **The block is the note's copy.** What goes in is a fence whose body is the
  same bullets as before, so the note still reads with the plugin off. The
  plugin redraws it as a list, a table, or one comma-separated line
  (`PickedEntries`), and the layout is switched from a right-click menu or the
  block's corner button. `registerBlocks` in `obsidian/block.tsx` registers one
  processor per language — `nvc`, `nvc-list`, `nvc-table`, `nvc-inline` —
  because a code block processor is handed the body and never the info string,
  so a ```` ```nvc table ```` argument could not be read without going back to
  the file. Switching rewrites the fence line through `vault.process`, so the
  choice lives in the note and each block keeps its own. A block whose body does
  not parse is shown verbatim rather than half-swallowed.
- **Closing cancels.** The corner `x` and Escape both land in `onClose` and
  insert nothing, on the walk screen as well as the browse screen. **Back** and
  **Skip Rest** are what keep your picks.
- **Styles.** Component CSS modules use only `currentColor` and `inherit`, so an
  Obsidian theme reaches them untouched and they ship as they are.
  `obsidian/styles.css` holds only the plugin's own chrome, for the modal and
  for a block in a note. `src/index.css` is
  gallery-only — every rule in it targets `body` or a bare element and would
  restyle the whole app.

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck (`tsc -b`) and build
- `npm run lint` — **oxlint**, not ESLint. Config is `.oxlintrc.json`.
- `npm run plugin:build` — build the plugin into `dist-plugin/`
- `npm run plugin:deploy` — build, then copy it into the vault named by
  `OBSIDIAN_VAULT` in `.env.local` (gitignored)
- `npm run plugin:dev` — rebuild and redeploy on every change
