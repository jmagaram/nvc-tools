# TODO

Open questions first, then the decisions already made and the research behind
them. Before "fixing" anything in `src/data/`, check the settled half — most
oddities in there are faithful to the source.

## Open

### The big categories are too long to walk

`Connection` is 28 needs and `Meaning` is 21 — two thirds of the inventory
behind two of the seven doors. Walking one costs an answer per word whether or
not the word was ever a candidate, and nothing on the browse screen says how
big a category is or what is inside it, so the only way to find out what
`Connection` covers is to pay for the walk.

Screens to consider are drawn in `docs/need-picker.md`: a browse row carrying a
sample and a count, the category as a checklist, a shortlist-then-walk funnel,
a paginated walk, a filter across all 75 words, sub-groups inside the big
categories, and the minimal change of offering the list part way through a
walk. Nothing decided.

### Animation on swipe

### Double-height tabs on the feeling picker

The two tabs read **Needs unmet** and **Needs met**. Both open on the same word,
so the one that tells them apart comes last, and the count pushes it further
right still — `Needs unmet (3)` beside `Needs met (5)`. The eye has to read to
the end of a tab to know which tab it is.

The direction chosen is a tab two lines tall: a large word, with the met/unmet
clause in smaller type beneath it. **Unpleasant** over _when needs are not met_,
**Pleasant** over _when needs are met_.

Not a width fix. Measured against a 375px iPhone, where the modal body is about
327px: a front-loaded single-line pair — `Unmet needs (3)` and `Met needs` —
wants roughly 180px of that, so it fits with room over. What does not fit is the
clause used as the label itself; `When needs are not satisfied` beside `When
needs are met` runs past the edge. The second line buys teaching, not room, and
it is paid for in height on the screen with the least of it.

Not **Positive** and **Negative**, which is where this started. NVC treats a
feeling as information about a need rather than a verdict on the person having
it, and the source inventory's own headings are "feelings when your needs are
satisfied" and "when they are not" — never good or bad (see _Source_ below, and
the note at the top of `feelings.ts`). A two-line tab in those words puts the
verdict in the large type and the frame in the small type, which files grief and
anger under _Negative_ in the loudest word on the screen. Met and unmet also
point somewhere: to the need under the feeling, which is the next tool here,
where a verdict is a dead end. And a word can sit on both sides of met/unmet —
`surprised` does — where it cannot be both good and bad.

**Unpleasant** and **Pleasant** describe how a feeling lands rather than valuing
it, which is the most a large word can honestly do. The cost is that they still
sort the feeling instead of pointing at the need, so the clause underneath is
carrying the NVC work and cannot be dropped later for tidiness.

What is open is the drawing of it: how the two lines sit against each other in
size, weight and opacity, given that the unselected tab is already dimmed and
the selected one already carries weight; where the count goes; whether a 2px
underline still reads as a tab under two lines of text; the vertical cost of
three lines of chrome before the first card; and the accessible name, since both
lines become the button's name and are announced on every press.

It lands in `TABS` in `src/components/FeelingPicker.tsx` and in `.tabs` /
`.tabs .tab` in `FeelingPicker.module.css`. The feeling picker is the only one
with tabs — needs are one undivided list, with no split to label.

### Re-opening a category and backing out erases what it held

Re-open a category from its card and leave it — **Back** in the title bar or
**Skip Rest** in the button row — before answering anything, and everything
previously picked in that category is lost.
Reproduced in August 2026: `Angry` holding `incensed · indignant · outraged`,
re-opened, backed straight out — the card came back reading _none of these_.

The cause is `close` in `src/machines/feelingPicker.ts`, which writes
`feelingCategoryWalk.picked(walk)`. That reports only the walk just performed,
so a walk bailed out of has picked nothing and overwrites the earlier answers
with an empty list. Answering two words and then backing out loses the rest the
same way, so this is not only about untouched walks.

`src/machines/needPicker.ts` was written as a deliberate copy of that file and
carries the same `close`, so the bug is now in both pickers and whichever fix is
chosen has to land in both. Keeping them identical was the point: two pickers
that disagree about what backing out means would be worse than one shared bug.

Left as is deliberately. The fix carries a semantic choice:

- Treat an untouched walk as a pure cancel and restore the previous words.
  Simplest, but still loses data on a partly-answered walk.
- On close, keep the words accepted this walk **plus** any previously-picked
  words this walk never got around to asking about. Never discards a decision
  that was not revisited, while still honouring a "not this" that removes a
  word. This is the better of the two.

Worth weighing against the intended model: `categoryWalk.init` deliberately
asks previously-picked words first, so re-walking a category is meant to be a
quick pass of "yes, still applies". Backing out of that pass currently reads as
re-deciding everything, which is not what the person did.

As of August 2026 this ships: `obsidian/` wraps both pickers as a plugin, so
the erasure now costs someone real words on their way into a note, not just a
demo page. Still not fixed — the semantic choice above has to be made first,
and it lands in `src/machines/`, which the plugin only consumes.

### Whether the data should mark the words NVC treats as thoughts

The evaluation-flavoured `Aversion` words — `hate`, `dislike`, `contempt`,
`animosity` — and `resentful` in `Angry`. NVC treats these as thoughts about
another person rather than feelings, yet the inventory lists them. They are
faithful to the source and must stay (see _Confirmed upstream_ below); what is
open is whether anything in the data should flag them, and whether a tool built
on this should say something when one is picked.

### Whether to ship our own definitions of doctrinal words

Background in _The definitions are ours_ below — every gloss in `feelings.ts`
and `needs.ts` was written for this project, because the source defines nothing.
To settle:

- Whether to ship our own glosses of doctrinal words at all, or show bare words
  and leave the meaning to the reader.
- If we keep them, whether someone with NVC training should review the wording
  before an app or plugin depends on it.

This grew teeth in August 2026: `NeedCard` now puts a project-written gloss on
screen for all 75 needs, one word at a time, and `NeedPrompt` asks the person to
answer it. A definition nobody outside this project wrote is no longer a footnote
in the data — it is the question being asked.

## Settled

### Source: the CNVC Feelings and Needs Inventory

`src/data/feelings.ts` and `src/data/needs.ts` reproduce the Center for
Nonviolent Communication's four-page **Feelings and Needs Inventory**, © 2023
Center for Nonviolent Communication, www.cnvc.org. Both files were verified
against it word-for-word in August 2026 and match exactly, including the
category headings.

CNVC is the authority here — the nonprofit Marshall Rosenberg founded, and the
copyright holder. It publishes both lists in one document, given away at
<https://www.cnvc.org/store/feelings-and-needs-inventory> behind a name/email
form, so there is no stable file URL to link. The older standalone
`cnvc.org/training/resource/needs-inventory` and `/feelings-inventory` pages
(© 2005) now 404 after a site redesign; their wording is identical apart from
`PHYSICAL WELL-BEING` respelled `PHYSICAL WELLBEING`.

**Licence.** Not Creative Commons — a permission grant in the document's own
footer: "you are free to share or copy this document; we request CNVC is
credited as follows: The Center for Nonviolent Communication © 2023 /
www.CNVC.org / cnvc@cnvc.org." Shipping the list in an app or plugin is fine;
crediting CNVC is expected. The gallery does so in `src/App.tsx`.

#### Variants, and why they are not this

- _Nonviolent Communication: A Language of Life_ (Rosenberg, PuddleDancer Press)
  carries an older list — "Some Basic Needs We All Have", grouped as Autonomy,
  Celebration, Integrity, Interdependence, Play, Spiritual Communion, Physical
  Nurturance. The ancestor of the CNVC handout, not a competing edition.
- PuddleDancer Press (nonviolentcommunication.com), the official NVC publisher,
  reprints that book-era list as "Feelings and Needs We All Have".
- BayNVC / the Kashtans' "Universal Human Needs" (<https://baynvc.org/list-of-needs/>)
  is widely circulated and adds Max-Neef-derived categories. Respected, but not
  CNVC's.
- NVC Academy and individual trainers circulate further reshuffles. None carry
  CNVC's copyright.

If someone reports a "missing" word or an odd grouping, check it against the
CNVC inventory before changing the data — they are probably thinking of one of
the variants above.

#### Confirmed upstream, not transcription noise

Everything below was once suspected to be an error in our data. All of it is
faithful to the source, so do not "fix" it:

- `safety` under both `Connection` and `Physical Wellbeing`.
- `amazed` (Excited, Inspired), `restless` (Disquiet, Tense), and `surprised`
  (Excited, Disquiet — spanning both polarities).
- `Play` containing only `joy` and `humor`.
- Phrase entries: `to know and be known`, `to see and be seen`,
  `to understand and be understood`. `respect/self-respect` is one entry
  upstream, not two.
- Nouns that do not fit "I feel \_\_\_": `grief`, `turmoil`, `wonder`, `agony`,
  `dread`.
- The evaluation-flavoured `Aversion` words — `hate`, `dislike`, `contempt`,
  `animosity` — and `resentful` in `Angry`. NVC treats these as thoughts about
  another person rather than feelings, yet the inventory lists them. Whether the
  data should mark them is open, above.

### What the modal's close button does part way through a walk

**It cancels** — the corner `x` and Escape alike, on the walk screen as well as
the browse screen. Nothing is inserted, on either.

Decided August 2026, when `obsidian/` was built. The alternatives considered
were hiding the close button mid-walk (does nothing about Escape, which cannot
be aimed away from), confirming before discarding, and treating a close with
picks as **OK**.

What settled it: closing a modal cancels it everywhere else in Obsidian, and
making this one modal commit — or argue back — would be the surprising thing.
The count on **OK (6)** already says what is at stake before you reach for the
corner, and **Back** and **Skip Rest** both sit on screen keeping everything
picked. The gesture that loses work is the one that looks like leaving; the two
that look like going back are the ones that don't.

It costs nothing to build, which is the other half of it: closing already lands
in `Modal.onClose`, which unmounts without submitting. And it answers the
question the section used to end on — **`ModalFrame` does not need to know a
walk is running**, and neither does the plugin.

Worth reopening if it bites in practice. The confirm-on-close guard is the
fallback, and it is the only candidate that also covers Escape.

### The definitions are ours, not the source's

Needs carry definitions, and `Need` is structurally identical to `Feeling`
(`{ word, definition }`), so one component can render either dataset.

What that decision created is a separate problem, still open above. The CNVC
inventory defines nothing — it is a bare word list, confirmed by the research
above, and no other NVC handout we found glosses its words either. Every
definition in both `feelings.ts` and `needs.ts` was written for this project.
They are interpretations of doctrinal vocabulary, and some are deliberate
judgement calls:

- `to matter`, `contribution`, and `efficacy` are worded to pull apart, as are
  `competence` / `effectiveness` and `security` / `stability` / `consistency`.
  The source simply lists them side by side with no such distinction.
- `safety` is defined differently in each of its two categories — "being able to
  lower your guard" under `Connection`, "being out of harm's way" under
  `Physical Wellbeing`. That reading is ours.
- Needs definitions are phrased as what the met need looks like, feelings
  definitions as an experience from the inside. Two registers in one app.
