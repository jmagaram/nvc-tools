# TODO

Open questions first, then the decisions already made and the research behind
them. Before "fixing" anything in `src/data/`, check the settled half — most
oddities in there are faithful to the source.

## Open

### Miscellaneous

In the Feelings picker, no reason to show a total like "3 of 6". Same with Needs picker.

In the Feelings picker, when you select a feeling the description below changes, which is good. But some descriptions are shorter than others and it causes the dialog to resize vertically. Maybe better to allocate a minimum height of a couple lines, so it only resizes vertically if a very long description happens.

In Obsidian, the "One at a time>" button looks a little weird. There is no space before the ">". The desktop browser DOES show a space, which is nice. Also, the two buttons side by side are a bit non-standard. One shows a count like "Done (4)" and the other has that symbol. What if one just said "Done" without a count. Is the count necessary? You can see how many are selected assuming no scrolling. And is there better wording for the other button? "One at a time" is more explicit as "Review each feeling one at a time" or "Focus on each individually" or "Step through each" or "Decide on each withotu distractions" or ...

### What is left of the picker redesign

The sift landed (see _Settled_ below) and took the length problem with it. Three
directions from `docs/need-picker.md` are still open and are all additive:

- **Counts and sample words on the browse screen.** The pills still say only a
  name, so `Connection` and `Play` look alike until you open them. `pills` in
  both picker machines would return a name, a sample and a count.
- **A filter across every word.** The only screen that copes gracefully with
  `safety` sitting in two categories, and it makes the inventory usable as a
  reference. No machine needed if the box lives in the host.
- **Sub-groups inside the big categories.** `Connection` is really four or five
  ideas, and a 28-word grid would read far better in groups of six. The cost is
  editorial: the headings would be ours, sitting in a sourced list, so they
  belong in the data as a clearly-labelled second layer.

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

### A category is sifted, and only walked if you ask

`Connection` is 28 needs and `Meaning` 21 — two thirds of the inventory behind
two of seven doors — and a walk cost one answer per word whether or not the word
was ever a candidate. `docs/need-picker.md` drew eight ways out of that. What
shipped is the grid: a category opens as all of its words at once, marked from
whatever was picked there before, and marking is the answer.

The pivotal decision was making `Done` primary and the walk secondary rather
than offering them as peers. Once the grid can be a final answer, its question
cannot be _which of these might apply_ — you cannot write words into a note that
someone only said might apply. It became _which of these apply_, and the walk
stopped being a toll booth. That is also what dissolves the case that started
this: marking 23 words costs 23 taps, which is irreducible; what made it a
hassle was the 28 extra yes/no answers layered on top.

No size threshold, deliberately. Gating on "more than six" was considered and
dropped: it makes what tapping a category does unpredictable for no reason a
person can see — `Peace` (7) would sift where `Autonomy` (5) walked — and it
costs a branch in every machine and host. A two-word grid is no worse than two
cards.

The walk goes through the **whole** category with the marks first, not just the
marks. Walking only what was already marked can confirm but never discover, and
being asked about a word you would never have picked off a list is the thing the
walk exists for. `*CategoryWalk.init` already ordered `alreadyPicked` first, so
this needed no new code.

Definitions live in a strip at the foot of the grid showing whichever word was
last touched. Hovering or tabbing shows one as well as tapping, so reading a
gloss never costs a mark, and the strip holds its height so the grid does not
shift under a finger.

### Re-opening a category and backing out no longer erases what it held

Fixed by the sift above, and worth recording because the old shape made it
inevitable. `close` used to write `categoryWalk.picked(walk)` — only the walk
just performed — so backing out of a re-opened category overwrote everything
with an empty list. Reproduced in August 2026: `Angry` holding
`incensed · indignant · outraged`, re-opened, backed straight out, card came
back reading _none of these_.

Now the grid's `marked` is the record and a walk hands its answers back through
`fold`: what the walk asked about, it decides; what it never reached keeps what
the grid said. So leaving a walk part way through keeps both halves. The fix is
the second of the two options weighed here originally, and it stopped being
optional — a walk is now something entered _after_ marking, so bailing out of
one had far more to lose.

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
