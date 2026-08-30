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
  `src/index.css` only when it is genuinely global across components — today
  that is one line, `color-scheme: light dark`, which is what gives the gallery
  a dark mode: the components name no colour, so they follow the browser's own
  ink and canvas the way they follow an Obsidian theme. The one shared module is
  `src/components/pill.module.css` — see **The pill** below.
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
  `src/data/feelings.ts` and the CNVC source call it. The one exception is the
  `description` in the root `manifest.json`, which says "emotions" on purpose:
  `name`, `author` and `description` are the three fields the community
  directory searches, and *emotions* is the word someone looking for this will
  type. It is a search term, not a domain noun — it appears in no UI and no
  code, and it should not be "corrected". A **category** is a named
  group of feelings with a `kind` of `'met' | 'unmet'`; needs have categories
  too, but no `kind`. Name a component for the scope it covers: `*Picker` covers
  every category, `*Sift` shows one category's words all at once, `*Walk` goes
  through one category a word at a time, `*Prompt` asks about one word, `*Card`
  just displays one thing, and `*Pill` is one thing small enough to sit in a row
  of them. Prefer the singular (`NeedCategoryCard`, not `Needs…`) to match the
  data types.
- **Make impossible states unrepresentable.** Prefer a shape that cannot express
  a contradiction: a discriminated union over parallel optional fields, a
  required prop over an optional one with a silent fallback. Two caveats —
  redundancy is not contradiction (an unused fallback is fine), and a union buys
  nothing when the invalid case is a runtime property the type cannot see (an
  empty array, a blank string). Reach for it when the branches genuinely differ;
  otherwise just make the prop required.

## The pill

The pill shape is drawn in four places — a feeling, a need, a feeling category,
a need category — so there are four components (`FeelingPill`, `NeedPill`,
`FeelingCategoryPill`, `NeedCategoryPill`) and **one** stylesheet,
`src/components/pill.module.css`, which all four import. It is the one shared
CSS module in the project. Four copies of the shape would drift, and the point
of the shape is that a word you can tap looks the same wherever it is.

The four split two ways. A **word** pill (`FeelingPill`, `NeedPill`) can be
marked and carries `aria-pressed`; marked is a wash of the ink, `color-mix`ed
against `transparent` so it composites onto whatever the host's background is
and needs no colour named. A **category** pill cannot be marked at all: once
something is picked in a category, the picker draws it as a `*CategoryCard`
instead, so an outline pill always means *nothing chosen here*. The feeling
pills carry the source's met/unmet split as a solid or dashed border; the need
pills take neither, needs being one undivided list.

Nothing about a mark may change a pill's width. The heavier border grows into
padding given back and the wash is paint, so a row cannot reflow under the
finger that just tapped it. This is why marked is not a tick: a tick either
reserves room in every unmarked pill — three rows of a 28-word category at the
width the modal opens at — or shuffles the row when it appears.

Both word pills take one `onShow` rather than an `onPointerEnter` and an
`onFocus`, because to a host the two events mean the same thing: show what this
word means. Reading a definition must not cost a mark.

## The progress rule

`StepProgress` is a segmented rule: one flexing segment per step, the full width
of whatever holds it. It sits **between the card and the button row** in
`FeelingPrompt` and `NeedPrompt` — never above the card, which would make it the
first thing read on every question, and never inside it. Because the segments
flex, a four-word category and a twenty-eight-word one draw the same silhouette;
only the grain changes, so there is no responsive variant and no counter.

It answers two questions at once. **How far along** is the cursor, one segment
lifted from 2px to 6px; the container is held at 6px so the lift shifts nothing
above or below it. **What was kept** is the segment's own fill, and a kept
segment stays filled — a walk only runs forwards.

The design this came from named a red for kept. It is drawn in washes of
`currentColor` instead — kept at full strength, a step passed over at 45%, one
not yet reached at 18%, all `color-mix`ed against `transparent`. A colour of its
own would be the only one in any component besides `--nvc-ring`, and would read
wrong on a light ground; weight carries the difference in both themes and under
any Obsidian theme. The whole animation is the lift travelling one segment right
and the fill coming up under it, and `prefers-reduced-motion` drops both.

The segments are `aria-hidden` decoration on one `role="progressbar"`, which is
spoken as a number — a walk of twenty-eight would otherwise announce
twenty-eight list items on every card.

Under the rule the two answers split the width between them rather than sitting
centred, so each is a target half the modal wide. Each label is pushed to the
edge its arrow points at, which puts the two glyphs at the far left and the far
right of the row — pointing out of the screen the way the card leaves it, and
the way the arrow keys read.

## Where the modal hangs

A modal is as tall as what is in it, and the picker changes height constantly:
switching tabs swaps a list of twelve categories for one of fourteen, opening a
category swaps either for a grid of up to twenty-eight words, and leaving a walk
swaps back. Centred — which is what Obsidian's `.modal-container` does, and what
the gallery's device screen did — half of every one of those changes went
*upwards*. The title bar and the tabs under it moved, and the tab you had just
clicked slid out from under the pointer.

So the modal hangs from a fixed line instead. The content still decides the
height; this only decides which end it grows from, and everything above the fold
holds still.

The line is where a modal at full height would start: half of what such a one
leaves over. Nothing is lost by not centring, because the *space* is centred —
the tallest screen comes out exactly where it always did, every shorter screen
hangs from that same line, and the bottom edge cannot leave the window, because
the cap is what set the line. The room above and the room below are one
measurement. That is why it is not a guess like a tenth or a third, which would
have to be checked against the cap by hand and rechecked whenever the cap moved.

The cap is Obsidian's `--dialog-max-height` — 85vh on a desktop, the whole window
less the safe area on a phone — and it is what `.modal` already reads for its own
`max-height`. The plugin reads the same variable rather than restating the
number, so the cap and the line follow each other wherever a theme or a platform
moves them. `styles.css` therefore sets no height at all: only `align-self` and
the line.

The two surfaces write the same sum differently, and the difference is not
cosmetic. In the plugin it is a `margin-top` in `vh`. In the gallery
`devices.module.css` plays the window: `.screen` is a grid that hands out a row
track the height of the cap and centres *that*, and `.frame.desktop` hangs from
the top of it. A margin would not do there — a percentage margin resolves against
the containing block's **width**, so `margin-top: calc((100% - 85%) / 2)` would
quietly measure the wrong axis, where a percentage row track resolves against the
height. The grid is also why `.screen` names `align-items: center` where the flex
box it replaced got that for free: a grid stretches an item to its row, and a
modal is as tall as what is in it.

Both leave a phone alone. There the modal is already most of the screen, so the
line works out at nothing anyway, and Obsidian's phone modal is a different shape
again — it comes up off the bottom edge.

The rejected fix is worth naming, because it is the obvious one: draw both tabs
stacked in a single grid cell and hide the unchosen one, so the picker is always
as tall as the taller list. It stops the tab switch outright, but it is the only
transition it stops — a walk is shorter than either list — and it charges for
that every time you look at the shorter tab, in a band of empty space above the
button row. Hanging the modal makes all of the transitions harmless and costs
nothing.

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
  focusScreen.ts     useFocusScreen() — a host puts focus on the screen showing
  index.css          global stylesheet, kept tiny
  components/        presentational components
  data/              NVC reference data (feelings, needs)
  demos/             one demo page per component, plus index.ts registry
  machines/          pure state machines (state + action + reduce, no React)
obsidian/            the Obsidian plugin — the second surface, see below
scripts/             deploy-plugin.mjs, version-bump.mjs
manifest.json        the plugin's, at the root because that is where Obsidian
versions.json        reads them from — see **Releasing** below
```

## The Obsidian plugin

`obsidian/` is the second surface: two commands, `Insert feelings…` and
`Insert needs…` — Obsidian prefixes the plugin's `name` to both in the palette,
which is why neither says it itself — each opening a picker over the active note and inserting
grouped bullets at the cursor, fenced as an `nvc-list` block. It imports
straight from `src/` and adds nothing to it.

- **The modal is the host.** `FeelingPickerHost` / `NeedPickerHost` are their
  demo pages with the controls taken off — same `useState`, same `reduce`, same
  `chosen` on `Insert`. Obsidian glue stays in the `*Modal` files beside them.
- **`ModalFrame` is not imported here.** It stands in for Obsidian's chrome so
  the gallery can preview the shape; the plugin has the real thing. The modals
  add `mod-scrollable-content` — Obsidian's own three-row modal — and draw the
  heading and the button row through portals, because that modifier only works
  when `.modal-button-container` is a *sibling* of `.modal-content`, not inside
  it.
- **The block is the note's copy.** What goes in is a fence whose body is the
  same bullets as before, so the note still reads with the plugin off. The
  plugin redraws it as a list, a table, or one comma-separated line
  (`PickedEntries`), switched from a right-click menu or the block's corner
  button. `registerBlocks` in `obsidian/block.tsx` registers one processor per
  language — `nvc`, `nvc-list`, `nvc-table`, `nvc-inline` — because a code block
  processor is handed the body and never the info string, so a ```` ```nvc table
  ```` argument could not be read without going back to the file. Switching
  rewrites the fence line, so the choice lives in the note and each block keeps
  its own. A block whose body does not parse is shown verbatim rather than
  half-swallowed.
- **Editing reopens the picker on the block.** **Edit…**, first in the same
  menu, seeds the picker with what the block already holds and writes the
  answer back over the body, leaving the fence line — and so the layout — alone.
  Both machines take an `initWith` for this, and it seeds `visited` and nothing
  else: the cards, the counts and each sift's `alreadyPicked` all already follow
  from that one field, which is why an edit and a fresh pick are the same
  screens. The order is reversed on the way in and reversed again on the way
  out, so an edit that changes nothing writes back the text it opened. Saving
  with nothing marked deletes the block, since an empty fence is one that no
  longer parses.
- **The note never says which inventory a block is.** `obsidian/resolve.ts`
  works it out from the words, and that same pass is the validation. No word and
  no category name appears in both inventories, so a single bullet settles it and
  no block can resolve against both. A marker in the fence — `nvc-feelings-list`
  — would be a second source of truth for something the body already determines,
  and there is no answer to a block whose marker disagrees with its words; it
  would also double the languages and strand every block already written. The
  same reasoning rules out a version stamp: the language *is* the version, and
  an incompatible format would ship as a new one, which an older build renders
  verbatim rather than mangling.
- **Reading a block is all or nothing.** Case and spacing are forgiven —
  `Irate` is `irate`, and saving writes it back in the source's own spelling and
  order — but an unknown word, an unknown category, a word under a category that
  does not hold it, two bullets for one category, and feelings mixed with needs
  all come to the same answer: a notice saying the block can't be read. Half of
  a block resolving means someone has typed in it, and guessing which half they
  meant is worse than saying so. A block broken badly enough to fail
  `parseBlock` never gets a menu at all — `render` shows it verbatim. Saving
  re-reads the note and writes only over the picks the edit started from, so a
  note changed behind the modal is left alone.
- **There is a way out.** **Convert to Markdown**, in the same menu, replaces the
  whole fence with the layout on screen written as ordinary markdown — a real
  pipe table that Obsidian's own table editor can add columns to. One-way by
  design: past there the plugin has no claim on the text. Both that and a layout
  switch go through `rewrite`, which uses the editor holding the note when there
  is one so the change is a single undo, and falls back to `vault.process` where
  none has it.
- **Marking is the answer; the walk is the second gear.** A category opens as
  `*CategorySift` — every word in it at once, in source order, with whatever was
  picked there last time already marked. `Done` commits the marks as they
  stand, which is why the question is *which of these apply* and never *which
  might*: nothing asks again afterwards. **Ask me about each** starts a walk
  through the *whole* category with the marks first, so the walk keeps what it
  was for — being asked about words you would never pick off a list — rather
  than becoming a confirmation pass. A walk runs inside a visit and hands its answers back:
  what it asked about, it decides; what it never reached keeps whatever the grid
  said. That is why leaving a walk part way through cannot lose a mark, and it
  is the whole of `fold` in the two picker machines. The grid never shuffles —
  the walk does, so that no word is always first, but a grid shows every word at
  once and being able to find the one you saw a moment ago is worth more.
- **The arrow keys need focus.** `FeelingPrompt` / `NeedPrompt` answer on ←
  and →, but only while focus is inside the region, and a walk opens from a
  card that is gone by the time it does. Browsing, ← and → move between the
  tabs, and the chrome that gets you there — Obsidian's own modal element, the
  portalled way back — all sits outside the picker. Hosts — the two modals and
  the four demo pages alike — call
  `useFocusScreen(screenKey(state))`. A machine's `screenKey` names the screen
  and everything about it worth moving focus for; the element to focus marks
  itself with a matching `data-prompt`, `data-sift` or `data-browse`. Nothing on
  any of them may carry a `role` or an `aria-label`: either becomes the region's
  accessible name and is announced on every card. A sift's key is the category
  and nothing else — marking a word is not a new screen, and a count in the key
  would take focus off whatever was just tapped, on every tap.
- **Coming back lands on the category just left.** `resumeAt` names it, the
  card carries `resume`, and the card's heading button takes the focus — so
  returning from a category shows what you just did rather than nothing. Before
  anything is opened `FeelingPicker` falls back to the chosen tab and
  `NeedPicker`, which has none, to the list itself. The tab is in
  `feelingPicker`'s `screenKey` for this reason: switching tabs takes that card
  off screen, and focus would otherwise be left on nothing and the arrow keys
  dead.
- **Focus has to be drawn, not just held.** The regions are focused
  programmatically, and `:focus-visible` does not match a programmatic focus
  that followed a click — so a region styles plain `:focus`, and anything a
  host may restyle spells out its own `outline` in `currentColor` rather than
  leaning on the UA default.
- **Closing leaves whatever is on top.** The corner `x` and Escape both mean
  the screen showing, not the session: from the categories they cancel the
  modal and insert nothing, from a grid they leave the category and keep its
  marks, and from a walk they leave the walk and land back on the grid. In the
  plugin all of it arrives at `Modal.close`, which is where the guard sits
  rather than on any one gesture; the host leaves the way off the top screen
  there through `onLeaveTopChange` whenever there is one, so the modal needs to
  know nothing about either picker or about how many screens deep they go, and
  `dismiss` is how the modal closes for real past the guard. The demo pages do
  the same through `ModalFrame`'s `onClose`.
- **The chrome speaks for the screen on top.** Both bars follow the rule the `x`
  already did. The button row changes with the screen: `Cancel` and `Insert`
  speak for the modal from the categories, **Ask me about each** and `Done`
  speak for the category on a grid — up in the row rather than in the body, where a list of
  28 would scroll them out of reach — and a walk is drawn with no button row at
  all, because it is one question and answering it is the only way to move.
- **The chord is drawn as a hint, not as a second label.** ⌘⏎ / Ctrl+⏎ presses
  the primary button on the screen, and it is printed on that button — but a
  size down and part way into the background, the way a menu draws a shortcut
  beside its command, so the word is still what is read first. Written in `em`
  and `currentColor` in the gallery and in Obsidian's own tokens in the plugin
  (`.nvc-chord`), never in a colour of its own. The return key keeps its glyph
  on both platforms: spelled out, `Ctrl+Enter` came to more width than the word
  it hung off, and a Mac and a PC drew buttons of quite different shapes. It is
  `aria-hidden` beside an `aria-keyshortcuts` on the button, or every commit
  button would be named 'Insert Ctrl Enter', and it is taken off a phone —
  `body.is-phone` in the plugin, the device frame in the gallery — which has
  neither key. The shortcut itself stays registered there: a phone with a
  keyboard attached still answers it, and simply says nothing about itself.

  **Which platform it is, the host says.** `src/keyboard.ts` spells the chord —
  label, `aria-keyshortcuts`, and what counts as a press — from one `isMac` it
  is handed, and asks nobody itself. The plugin answers with Obsidian's
  `Platform.isMacOS` in `obsidian/shortcut.ts`, which is the app's own answer to
  this exact question and true on iPhone and iPad too; the gallery, a web page
  with no such API, asks the user agent in `src/demos/shortcut.ts`. Detecting it
  in `src/keyboard.ts` put a browser's guess in code the plugin ships, which is
  what `obsidianmd/platform` flags — and the plugin's rules cannot be disabled
  in a comment, `eslint-comments/no-restricted-disable` being on. The gallery's
  copy is the one finding `lint:obsidian` still has, in the demo folder it
  already ignores.
- **The title bar carries a control only where one is needed.** On a walk that is
  **‹ Angry** — the category it started in, since that is where its answers land,
  rather than *Back*, which left open what became of the answers already given —
  and it is the only way off a screen with no button row. On the categories the
  bar is the plain title. On a grid it is **empty**: `Done` and the `x` both leave
  the category and keep its marks, and all three called the same `leaveTop`, so a
  third control saying it was noise — and a **‹ Feelings** the size of the
  category heading below read as two titles disagreeing about which screen you
  were on. The grid names itself instead, in the sift's own heading: the
  inventory small and quiet over the category at full size. Obsidian floats the
  `x` over the bar rather than laying it out in one, so `.modal-title` holds its
  own height and does not follow its contents — otherwise an empty bar would drop
  the `x` onto the heading. `ModalFrame` takes a `null` heading for the same
  screen and reserves the line by hand, which is what its `min-height: 1lh` and
  the centred `x` are for.
- **Nothing inside a category can throw work away.** The `x` is a synonym for
  leaving the screen showing, which is why losing everything stays one gesture
  but only from the categories, where all of it is on screen to lose.
- **Styles.** Component CSS modules use only `currentColor` and `inherit`, so an
  Obsidian theme reaches them untouched and they ship as they are.
  `obsidian/styles.css` holds only the plugin's own chrome, for the modal and
  for a block in a note. `src/index.css` is
  gallery-only — every rule in it targets `body` or a bare element and would
  restyle the whole app.
- **`--nvc-ring` is the one colour a host may hand a component.** Focus rings
  take `var(--nvc-ring, …)`, falling back to `currentColor` softened towards the
  background. Pills and cards reset `box-shadow`, which is what Obsidian draws
  focus with, so its ring cannot survive them and they draw their own — and an
  undiluted one reads as hard black beside the app's quieter grey. The plugin
  points `--nvc-ring` at `--background-modifier-border-focus` so the picker
  speaks in the same voice as the buttons under it. Nothing else in a component
  names a colour.

## Commands

- `npm run dev` — dev server
- `npm run build` — the **plugin** build, not the gallery's. It is an alias for
  `plugin:build`, and it is named `build` because the community directory's
  scanner runs the first of `build`, `build:plugin` or `compile` it finds and
  checks the output against the release assets. Note it is not `plugin:build`
  the scanner looks for — the words are the other way round.
- `npm run gallery:build` — typecheck (`tsc -b`) and build the gallery
- `npm run lint` — **oxlint**, not ESLint. Config is `.oxlintrc.json`.
- `npm run lint:obsidian` — the community directory's own review, run locally
  via `eslint-plugin-obsidianmd`. Not the project's linter and not run on every
  change; it answers one question, which is whether a release would pass the
  scanner. Config is `eslint.obsidian.config.mjs`, scoped to what ships.
- `npm run plugin:build` — typecheck and build the plugin into `build/`
- `npm run plugin:deploy` — build, then copy it into the vault named by
  `OBSIDIAN_VAULT` in `.env.local` (gitignored)
- `npm run plugin:dev` — rebuild and redeploy on every change
- `npm run version:bump <x.y.z>` — set the plugin's version, see below

## Releasing

The plugin goes out through the community directory. Testers can still run
ahead of a release with BRAT, by repo path.

**Submission is not a pull request.** Until May 2026 a plugin was listed by
forking `obsidianmd/obsidian-releases` and adding itself to
`community-plugins.json`; pull requests are now disabled on that repo. A plugin
is submitted once, at `community.obsidian.md`, and reviewed by an automated
scanner rather than a person. That file is still what Obsidian reads, but the
directory writes it. After the first submission there is nothing to resubmit —
an update is only a new release.

- **The root is Obsidian's, not ours.** `manifest.json`, `versions.json`,
  `README.md` and `LICENSE` sit at the repo root because that is the only place
  the community directory looks — it reads the manifest at the HEAD of the
  default branch. Nothing else about the repo has to be plugin-shaped; the
  gallery stays where it is. `vite.plugin.config.ts` copies the two JSON files
  from the root into `build/`.
- **The plugin builds into `build/`.** The scanner does not just run
  `npm run build` — it then looks for the `main.js` it produced, and it looks in
  four places: the repo root, `dist/`, `build/` and `out/`. A folder of our own
  naming reads to it as a build that produced nothing, which is what
  `dist-plugin/` did. `dist/` is the gallery's, so `build/` it is; the root
  would work too but would put generated files beside the source they are
  generated from.
- **`main.js` is never committed.** It and `styles.css` are build output, and
  `.gitignore` excludes `build`. They reach people as assets attached to a
  release. The gallery's own build lands in `dist/` with hashed names, so the
  two never collide.
- **The manifest `name` is not an acronym.** The scanner rejects a name in all
  caps, which `NVC` was. It is *Nonviolent Communication* spelled out; the
  letters someone would actually search for stay in the `description`, which is
  one of the three fields the directory searches — see **Terminology**.
- **One version, three places.** Root `manifest.json`, `versions.json`, and the
  git tag, which must equal the manifest's `version` exactly — no `v` prefix, no
  pre-release suffix. `npm run version:bump` writes the first two and prints the
  tag commands rather than running them.
- **Pushing a tag cuts the release.** `.github/workflows/release.yml` checks the
  tag against the manifest, builds, and opens a *draft* release with `main.js`,
  `manifest.json` and `styles.css` attached. The draft is deliberate — it is
  where the notes get written, and the scanner asks for them — but nothing can
  see a draft, so it has to be
  published. It is not marked pre-release: the directory skips those, which is
  why every 0.1.x release was invisible to it.
- **The scanner runs `npm run build`.** It reproduces the release from source
  and compares, so `build` has to be the plugin build — see **Commands**. It
  also reads `src/` as plugin source, which is why `lint:obsidian` is scoped to
  what ships and the gallery's demo pages are ignored.
- **`minAppVersion` is the oldest app the plugin actually works on**, not the
  oldest it has been run on and not the newest available. `no-unsupported-api`
  rejects any API newer than the number in the manifest, so lowering it until
  that rule fires is how the real floor is found. Today it is `1.5.7`, set by
  `Vault.getFileByPath` in `obsidian/block.tsx` — the newest API the plugin
  calls, per the `@since` tags in `obsidian.d.ts`. `Vault.process` is the only
  other one above baseline, at 1.1.0.

  The deferred-view guard in `editorFor` is *not* what sets it. Deferred views
  arrived in 1.7.2, but `instanceof MarkdownView` is valid on every version and
  an older app simply has none to skip, so guarding against them costs no
  compatibility. Two other things the linter cannot see, both checked: every
  Obsidian CSS variable used either predates 1.5.7 or carries a fallback
  (`--dialog-max-height, 85vh`, `--dialog-width, 560px`,
  `--background-modifier-border-focus, currentColor`), and the bundle's newest
  syntax is logical assignment and `Array.at`, which the Chromium in 1.5.7
  already had.
- **The README is the shopfront, and it is rendered twice.** Obsidian's in-app
  plugin browser fetches it from `raw.githubusercontent.com/<repo>/HEAD/README.md`
  and renders it in the detail pane; the directory shows an excerpt on the web
  listing. So the value has to be at the top — what it does, then a screenshot —
  and the developer material lives in `CONTRIBUTING.md` instead.

  **Relative paths are the right form in there, for links and images alike**,
  and the docs say so. The pane rewrites a relative `src` on an `img` or `video`
  against the repo, and rewrites internal links too — Obsidian's parser counts a
  link whose target is not a URL as internal, so `[MIT](LICENSE)` resolves. Only
  genuinely external URLs are written out in full.

  What the rewrite does not cover: `<picture>` and `srcset` are never touched,
  and a Git LFS image comes back as its pointer text, so neither belongs in
  there. And because the rewrite resolves against `HEAD`, an image has to be
  committed on the **default branch** — attaching it to a release is not enough.
- **A bump is a broadcast.** The root `manifest.json` version is what tells
  every installed copy there is an update. So a beta gets a tag and a release
  *without* a manifest bump, or it ships to everyone.
- **The `id` is permanent.** `nvc-tools` is the directory's key and the folder
  name in a vault. Changing it after listing resets the download count and
  strands every install, which is why it was moved off `nvc-picker` before the
  first public release rather than after.
