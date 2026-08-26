# nvc-tools

A gallery of small React components for NVC tools. The home page lists every
component; clicking one opens a page with controls for its props and a live
preview below. These components will later be assembled into an app and/or an
Obsidian plugin — for now the gallery is the only surface.

## Design rules

- **Low fidelity.** Structure over polish. Do no color or typography work unless
  explicitly asked.
- **No UI library**, no CSS framework, no CSS-in-JS. Plain semantic HTML.
- All global CSS lives in `src/index.css` and stays tiny. Do not add
  per-component stylesheets.
- Components are **presentational only**: props in, JSX out. No state, no
  effects, no fetching, no globals, no awareness of routing. State belongs in
  the demo page (and later, in the app).
- Type props with an explicit `type Props = { ... }`.

## Adding a component

1. `src/components/Foo.tsx` — presentational, typed props, default export.
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
  index.css          the entire stylesheet
  components/        presentational components
  data/              NVC reference data (feelings, needs)
  demos/             one demo page per component, plus index.ts registry
```

## Commands

- `npm run dev` — dev server
- `npm run build` — typecheck (`tsc -b`) and build
- `npm run lint` — **oxlint**, not ESLint. Config is `.oxlintrc.json`.
