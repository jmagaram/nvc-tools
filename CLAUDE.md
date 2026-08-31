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
  the demo page (and later, in the app). The exceptions are all the same shape —
  something that exists only for an instant and that no host could ever read
  back — and each is kept in a hook of its own in `src/` rather than loose in a
  component:
  - **Transient animation state.** `FeelingPrompt` and `NeedPrompt` keep the
    card just answered so it has something to fly off with; putting that in a
    machine would make every host own a timer just to end an animation.
  - **A timer that decides whether something happened at all.**
    `usePressDelay` holds a press long enough to be seen; `useHoverIntent`
    waits 150ms before calling a pointer resting on a word a request to read it.
    Neither has a state a host could act on: what is pending is precisely what
    has not happened yet.
  - **A measurement taken in an event handler.** `rowNeighbor` decides which
    pill is above or below another, which only the layout knows and only once it
    has happened — a wrapped row of variable-width pills has no column to count.
    The rule stays pure: `rowNeighbor` takes rectangles and imports nothing, and
    the single `getBoundingClientRect` sweep lives in the sift's `onKeyDown`.
    Nothing measures during render.
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
marked and carries `aria-selected`; marked is a wash of the ink, `color-mix`ed
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

The note badge keeps the same rule by leaving the flow altogether: it is
absolutely positioned over the pill's top-right corner and costs no width at
all. That is what lets it appear on *any* marked word rather than only on a
noted one — in flow it cost about a character, so a badge that came and went
with the pointer would have reflowed the row it was in. It overhangs upward and
never sideways: `right: 0` keeps it inside the pill's own right edge, because a
pill at the end of a row with a glyph hanging past it widens the grid, and a
442px modal has no room to give. `.words` pays for the upward overhang with a
taller row gap.

The two word pills once took a single `onShow` for both `onPointerEnter` and
`onFocus`, on the grounds that a host could not tell the two apart. It can, and
it must: they are now `onPreview` and `onAnchor`, and they mean opposite things.
Focus lands on a word deliberately, so it **anchors** — everything on the screen
then applies to that word. A pointer crosses a word on its way somewhere else,
so it only **previews** what the word means, and only after resting long enough
to mean it. See **The anchor**. Reading a definition still costs no mark; it now
costs no commitment of any kind.

Only the word pills are ever selected, and they say so as `role="option"` with
`aria-selected` — they sit in a listbox, where `aria-pressed` said nothing about
being one choice among twenty-eight.

## The note

A few words of your own against one word — *only about the meeting, not about
him* — written in a drawer the screen makes room for. `NoteLine`, `NoteDrawer`
and `NoteMark` are the three pieces, and all four screens (both grids, both
walks) use the same three.

**A note is only ever *shown* on a word that is picked — but unmarking hides it
rather than destroying it.** This used to be a rule about data: `withMarked` ran
the notes through the same filter as the marks, so dropping a mark dropped the
sentence under it and no host had to remember to. That is a tidy invariant and
it was the wrong trade. Unmarking is one tap, and on a phone it is the *same*
tap that reads a word — the only way to see what a feeling means there is to
pick it. One tap must not be able to delete a paragraph somebody wrote.

So `notesInSourceOrder` now enforces only what is still true: the category's own
order, and no blank notes (an emptied box is the delete, and the only one). The
picked-word rule moved to the two places that need it:

- `visibleNote` is what every screen reads. A note on an unmarked word returns
  null, so nothing draws it and no pencil claims it exists.
- `chosen` is the door everything leaves the picker by, and it filters each
  category's notes down to its picked words. Nothing outside has any use for a
  hidden note, and a host writing one into somebody's file would be writing down
  a thought about a feeling they had said did not apply.

`Visited.notes` deliberately keeps the hidden ones, because that is *how* the
undo survives leaving a category and coming back: they are handed straight back
to the sift as `alreadyNoted`. `noted`, which builds a card's word list, reads
from `words` and so cannot pair one with a word that was not picked.

**In a walk the note is part of the answer, not a substitute for it.** `Enter`
keeps what is written and leaves the card exactly where it was — nothing on a
card is decided until it is answered. The first version answered the card and
dealt the next one, on the grounds that writing about a word is a stronger yes
than the arrow; the card then flew off on the last keystroke and the note was
never once seen where it lives, and a typo could not be fixed. So a walk carries
its own `notes` and `fold` merges them on exactly the rule it already merges
marks by — what the walk asked about, the walk decides.

**Passing on a card hides its note; it does not delete it**, which is the same
rule unmarking follows on the grid and matters more here. A walk asks about
every word in the category, so its `asked` set covers the lot — when `reject`
deleted the note and `init` filtered its inbound ones down to what was already
picked, a single walk through a category quietly destroyed every hidden note in
it. Preservation that dies on the screen where an accidental rejection is
likeliest is not preservation. Answering the other way brings it back.

**The drawer parks what it covers.** The screen is pushed up, faded and
dissolved into the top edge; the drawer comes in off the bottom and grows
upwards as the note runs on, so the line being written stays where the thumbs
and the software keyboard are. Nothing outside changes height, so a modal
hanging from a fixed line does not move. What it parks is `inert` — the words,
the answers — and the host's button row reads `isNoting` and disables itself,
because that row belongs to the screen underneath. The `x` and Escape both mean
the drawer while it is open: `close` checks `isNoting` first, which is the same
"leave whatever is on top" rule one level down.

`--nvc-sheet` is the second and last colour a host may hand a component, after
`--nvc-ring`: the drawer covers what it parks, so it needs a surface, and the
plugin points it at Obsidian's modal background.

**The offer is a control that names its word; the edit is not.** Under the
definition, *Add note on livid* while there is nothing written, and simply
*Edit* once there is, with the note itself shown beside it. The whole row is the target, so clicking what was written opens it for
editing; only the label at the end is drawn as something to press, because a
border round three lines of somebody's own words reads as a field they are
sitting in rather than as a way to change them.

This was a line of prose for a long time, and the reasoning held while it
lasted: the definition strip followed the pointer, so to reach a target here the
pointer had to sweep across the words above, and every word it crossed changed
which word the line was about — a click aimed at one would land on whichever it
passed last. Naming a key cost the pointer nothing. **The anchor retired that
argument.** The word this names is chosen on purpose and holds still while the
pointer travels to it. What was left for a while was worse than either: a button
still wearing the costume of the prose it used to be, so it worked and looked
inert. *Press N* also read as an instruction rather than as a control, which
left a phone — with no key to press — nothing that looked like a way in.

It names the **anchored** word, never the previewed one. While the pointer is
dwelling somewhere else the strip describes word A above a control offering to
write about word B, and that is correct rather than a compromise: both words are
on screen, each is named, and this is the only thing in the strip that can act,
so it is the only thing that must not move. A control that followed the pointer
could not be reached by it.

**The word is dropped from the edit label.** Nothing else on the line says which
word an empty offer is about, so there it has to be named. Once something is
written the note is sitting right beside the control, in the reader's own words
— the most recognisable thing on the screen — and the pencil marks the pill it
belongs to, so naming the word again bought nothing and cost the room the note
needed.

It cost more than nothing. The word sat at the *end* of the label, so it was the
first thing the ellipsis took: a long note turned *Edit note on mortified* into
*Edit note …*, which is longer than *Edit* and says less — it failed at the one
job the word was there for, exactly when the note was long enough for it to
matter. The label is now longest where there is most room and shortest where
there is least.

The word stays in the accessible name, as text that is there and not seen, since
a screen reader has no equivalent of glancing at the note beside it. It cannot be
an `aria-label` — Obsidian draws those as tooltips.

**Nothing is drawn at all when the anchored word is not marked.** Not a disabled
control explaining that you must pick something first — that spends a line
teaching a rule nobody was going to break, and it would be the only text here
that lectures rather than naming an action. Discovering that notes exist after
picking a word is soon enough, since a note only ever belongs to a picked word.
The strip's reserve holds its height either way, so saying nothing moves
nothing. This is why `NoteLine` needs neither a `disabled` prop nor a word for
what the inventory calls its entries: it is only ever drawn with a word to name.

**Quiet on purpose, and quietest where it is largest.** It hugs its own words
rather than stretching to the width it is given: full width it read as the
screen's primary control, which is out of all proportion to something most
people will never use. On a touch screen the thumb's worth of target is bought
with padding rather than with ink, so how much room it takes and how much
attention it draws are set separately — the same split the note badge uses on a
pill.

Only the words give way when the modal is narrow. The keycap is `flex: none` and
the label ellipsises beside it, because what is worth losing is the end of a
phrase repeating what the control does, never the one mark on the line that says
a key will do it. The key is drawn the way the commit button draws its chord —
a size down, part way into the background, no box of its own — because there is
already one settled way to print a key in this modal and a second would read as
a different kind of thing.

**The note goes inside the card.** In a walk the card is thrown off the side when
it is answered, and everything belonging to the word has to leave with it — a
line under the card is left sitting there while the word flies away, already
offering a note about the card arriving behind it. `FeelingCard` and `NeedCard`
take a `note` slot for this. It is also the only place unambiguous enough: a
card is the one thing on that screen saying which word is being asked about.

**The pencil is both the sign and the way in, and it is the only control on a
pill that does not toggle the mark.** That last part is what earns it. Clicking
a word marks or unmarks it *and* anchors it, so without the badge there is no
way to say more about a word picked a moment ago without first un-picking it —
and un-picking it takes the note control away at the same time, so the gesture
meaning "say more about this" would deselect the word and remove the way to say
anything. Everything else about the badge follows from having to exist.

`NoteMark` draws it, over a pill's corner on the grid and beside the word listed
in a category card. `placement` is the whole of what the two callers disagree
about, and it is a discriminated union rather than two flags because `noted` is
not a question an inline mark has: a card only lists a pencil where there is a
note.

As a badge it is out of flow and costs the pill no width, which is what lets it
appear on **any marked word** rather than only a noted one. In flow it cost
about a character, so a badge that came and went with the mark would reflow the
row under the very tap that marked it — the one thing **The pill** forbids
outright. It overhangs upward only: `right: 0` keeps it inside the pill's own
edge, because a pill at the end of a row with a glyph past it widens the grid.

Three weights of one ink, never a colour: hidden, `0.55` when offered, full
strength once there is a note. A colour would be the only one in any component
besides `--nvc-ring` and would have to be picked twice over for a light ground
and a dark one — the same argument `StepProgress` makes for drawing *kept* in
weight rather than in red. It is never the only sign that a note exists; the
note itself shows in the control below.

**Touch is treated like a mouse here, which it did not used to be.** Visible at
rest on every marked word is the default, because nothing on a touch screen can
reveal it; where there *is* a hover it is hidden again until the word is pointed
at or focused, so a desktop grid is not speckled with pencils. The reveal rule
lives in `pill.module.css` on `[data-note-mark]` — the attribute that already
existed so the pill could tell a click on the pencil from a click on the word —
because `NoteMark` cannot name the pill's hashed class.

It was inert on a coarse pointer for a reason that has since expired: *a thumb
would miss a 0.72em glyph, and a miss unmarks the word, which takes the note with
it*. Unmarking no longer takes the note, so the worst a fat finger does now is
cost one more tap, and that is a much cheaper mistake than having no way at all
to write about a word without un-picking it. The hit box grows for a thumb,
upward and leftward and never rightward, for the reason `right: 0` gives.

**A note reaches the vault and comes back.** `insert.ts` writes an indented
bullet under the category for each noted word and `resolve.ts` reads them, so a
note now lives as long as the file does — see **The block is the note's copy**.
What still does not exist is a way to write one *from* the note: the picker is
the only author, and hand-editing the fence body is the supported path until a
per-note editor lands. The format already holds a category-level note (`> text`
under the category) and nothing reads or writes it yet; a block containing one
is shown verbatim rather than half-read.

## The anchor

A sift holds two words, not one, and keeping them apart is the whole of what
makes the grid usable with a mouse.

**`anchor` is the word the screen is about.** Everything applies to it — the
note button, `n`, the arrow keys, the definition strip when nothing else is
happening. It is set only on purpose: a click, focus arriving, an arrow key, the
pencil. It survives the pointer leaving the grid.

**`preview` is a word the pointer is resting on.** It overrides what the strip
*displays* and nothing else. It decides no action, takes no focus, and is
cleared when the pointer leaves the grid.

There used to be one field, `showing`, written by a click, by focus and by the
pointer merely passing over. Because it was also what actions applied to, there
was no mouse path from a word to a control about that word: the cursor crossed
other words on the way and retargeted the thing it was travelling towards. Hover
was doing a job only a persistent state can do. Two of this project's earlier
decisions — a note line that refused the pointer, and a pencil put on the pill
so the mouse had somewhere near to aim — were both workarounds for it.

**Hover is an intention, so it is timed.** `useHoverIntent` waits 150ms before
previewing, so fast travel across the grid never retargets the strip and
deliberate dwelling does. Leaving the grid clears it immediately — leaving is
unambiguous in a way that arriving is not. Between two words nothing is cleared,
or a sweep would flicker back to the anchor between every pair.

**It is a mouse's idea.** `onPointerEnter` bails unless `pointerType` is
`'mouse'`. A tap fires a compatibility `pointerenter` too, and on a screen there
is no pointer to move away and so no leave to undo it — the preview would latch
onto whatever was last tapped and stay there. Asking the event what it is is not
sniffing the user agent; it is the event saying so.

**The grid is a listbox and one tab stop.** `role="listbox"` with
`aria-multiselectable`, pills as `role="option"` with `aria-selected`, and a
roving `tabIndex` so that a 28-word category is one stop rather than 28 sitting
between the words and the button row. ← and → move one word in source order and
wrap, because a wrapped row is one run of words the layout happened to break.
↑ and ↓ do not wrap — they are the shape of the paragraph, and jumping from the
last row to the first loses your place. Home and End go to the ends.

Nothing else is handled. A pill is a real `<button>`, so Enter and Space press it
natively and a handler here would fire the toggle twice; `n` is heard at the
window because the two ways off a sift are in the modal's button row outside the
grid; Escape is left to bubble; and Tab is what the roving stop exists to keep
working. A modifier bails first, the rule the tabs already used.

**Which pill is tabbable is not which pill is anchored.** They agree once
something is chosen, and differ before it: `data-sift` stays on the grid wrapper
while `anchor` is null, so entering a category shows the hint rather than
silently anchoring the first word, while `tabIndex={0}` sits on the first pill so
Tab can still get in. Two booleans, because no single one says both.

**Focus follows the anchor through `screenKey`, not through `.focus()`.** The
key is `sift:{category}:{anchor}`, so moving the anchor is a screen change and
the host's existing `useFocusScreen` carries the focus ring from pill to pill —
this component never touches the DOM to move focus. `preview` is deliberately
absent from the key: the pointer resting on a word must not steal the ring from
the keyboard. What is marked is absent for the reason it always was.

This also retired the sift's `resume` field. Opening the drawer anchors the word
it is about, so closing it flips the key from `note:` back to `sift:` with that
same anchor still named, and focus lands on the pill it came from without
anything saying so.

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
- **The block is the note's copy.** What goes in is a fence whose body is
  bullets, so the note still reads with the plugin off:

  ```
  - Angry: enraged, irate, livid
    - livid: only about the meeting, not about him
  ```

  One bullet per category with its words inline, and an indented bullet under it
  for each word carrying a note. A note is addressed by the pair *(category,
  word)*, which the nesting already carries — a word appears at most once in a
  category, where the word alone would not settle it: `surprised` is in both
  Excited and Disquiet. So nothing is written into the text to say which is
  meant, and there are no keys or ids anywhere.

  **A note is one line**, collapsed on the way out of the drawer. That is what
  lets it be a bullet: a line break would need a continuation rule in every
  reader of the format. The parser is tolerant of one anyway — a note somebody
  has hand-wrapped over several indented lines is read and joined with a space,
  and the next save writes it back as one. Tolerant read, strict write.

  The plugin redraws the body five ways (`PickedEntries`), switched from a
  right-click menu or the block's corner button. `registerBlocks` in
  `obsidian/block.tsx` registers one processor per language, because a code
  block processor is handed the body and never the info string, so a
  ```` ```nvc table ```` argument could not be read without going back to the
  file. Switching rewrites the fence line, so the choice lives in the note and
  each block keeps its own. A block whose body does not parse is shown verbatim
  rather than half-swallowed — including one holding a `>` line, which is the
  category-level note the grammar leaves room for and this plugin does not yet
  write or read.

- **`nvc-list` is kept forever and never written again.** The default layout was
  called `list` before it was called `gloss`, and every block the plugin has
  ever written carries that word. The bodies did not change — a note bullet is
  an addition to the grammar, not a change to it — so an old block reads as a
  new one, and dropping the registration would have left each of them drawn as a
  grey code block. New blocks are written `nvc-gloss`.

- **A layout is drawn from the resolved entries, not the parsed ones.** Which
  side of the met/unmet split a category sits on is not in the note and should
  not be: `resolve` works it out from the words, the same pass that validates
  them. A block that parses but does not resolve is still drawn, without the
  headings — the honest answer, rather than guessing a side for a word the
  inventory does not know.
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
  design: past there the plugin has no claim on the text. It is generated from
  the parsed entries and never from what is on screen: the commas between words
  are drawn by CSS and would not come across, and an empty note cell and a
  missing one look identical in the DOM. Bold on a category is the only emphasis
  that survives, so each converted form is written to read on its own rather
  than to look like the view it came from. Both that and a layout
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
  card that is gone by the time it does. Browsing, the arrows move between the
  *categories* — ← and → in the order they are drawn, wrapping, and ↑ and ↓ to
  the nearest one in the row above or below, which is the same pair of rules a
  sift moves between words by. They used to switch tabs from anywhere on the
  screen, which is why they could never do this: the handler sat on the whole
  picker, so the categories underneath never saw a keystroke. It sits on the tab
  strip now, where sideways is the obvious reading of the key and the list below
  is left the arrows it is pointing at.

  Focus is moved directly there rather than through the machine, which is the
  one place this differs from a sift. A sift's arrows move an *anchor* — the
  word its definition strip and its note button are about — and browsing has no
  such state: nothing depends on which category has focus except the focus. A
  machine field would only ever mirror the DOM. Every category also stays its
  own tab stop, where a sift's grid is one: the arrows are a faster way through
  the same list, not the only way.

  The chrome that gets you there — Obsidian's own modal element, the portalled
  way back — all sits outside the picker. Hosts — the two modals and
  the four demo pages alike — call
  `useFocusScreen(screenKey(state))`. A machine's `screenKey` names the screen
  and everything about it worth moving focus for; the element to focus marks
  itself with a matching `data-prompt`, `data-sift` or `data-browse`. Nothing on
  any of them may carry a `role` or an `aria-label`: either becomes the region's
  accessible name and is announced on every card. The sift's listbox role is not
  an exception to that — it sits on the inner row of words, and the outer
  `data-sift` wrapper stays bare.

  A sift's key is the category **and the anchored word**. That is not the same
  as the count this rule was written against: a count changes whenever any word
  is marked and would move focus to the grid root, off whatever was just tapped,
  where the anchor names the very thing that was touched and so moves focus onto
  it. That is what a roving tabindex needs, and it is how the arrow keys carry
  the focus ring without a component calling `.focus()` — see **The anchor**.
  What is marked is still absent, and so is `preview`.
- **Coming back lands on the category just left.** `resumeAt` names it, the
  card carries `resume`, and the card's heading button takes the focus — so
  returning from a category shows what you just did rather than nothing. Before
  anything is opened `FeelingPicker` falls back to the chosen tab and
  `NeedPicker`, which has none, to the list itself. This is the *browse* screen
  only; the sift once had a `resume` of its own for coming back out of the note
  drawer, and the anchor does that job now. The tab is in
  `feelingPicker`'s `screenKey` for this reason: switching tabs takes that card
  off screen, and focus would otherwise be left on nothing and the arrow keys
  dead.
- **An `aria-label` is a tooltip in Obsidian.** The app draws one on hover for
  any element carrying it — that is its tooltip mechanism, and the plugin uses
  it on purpose for the block's corner button (`obsidian/block.tsx`). So a label
  added for a screen reader is also a black box that appears over whatever is
  below it. A label on the sift's listbox hung one over the definition strip
  whenever the pointer was anywhere in the grid, and one on the note control put
  a second box under the pointer every time it crossed the control.

  Neither was reachable before: the listbox is new, and the note line refused
  the pointer until it became a real control. Prefer `aria-labelledby` pointing
  at something already on screen — the sift names its listbox with its own
  heading — or let a control's own contents name it, which is what the note
  button does. Reach for `aria-label` only where a tooltip is genuinely wanted.
  `StepProgress` still carries one, on the progress rule a walk draws between
  the card and the answers.

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
  the primary button on the screen — except while a note is open, where the
  screen on top is the drawer and the chord landed on `leaveTop`, which for a
  drawer means `dropNote`: the one chord that everywhere else keeps something
  was the only one that threw a note away. The box ignores a modified `Enter`
  for the other half of the same bug, where it kept the note and the window
  listener then left the category on the same keystroke. It is printed on the
  button — but a
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
