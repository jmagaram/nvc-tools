# TODO

Open questions first, then the decisions already made and the research behind
them. Before "fixing" anything in `src/data/`, check the settled half — most
oddities in there are faithful to the source.

## Open

### Re-opening a category and backing out erases what it held

Re-open a category from its card and leave it — **Back** in the title bar or
**Skip Rest** in the button row — before answering anything, and everything
previously picked in that category is lost.
Reproduced in August 2026: `Angry` holding `incensed · indignant · outraged`,
re-opened, backed straight out — the card came back reading *none of these*.

The cause is `close` in `src/machines/feelingPicker.ts`, which writes
`categoryWalk.picked(walk)`. That reports only the walk just performed, so a
walk bailed out of has picked nothing and overwrites the earlier answers with an
empty list. Answering two words and then backing out loses the rest the same
way, so this is not only about untouched walks.

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

### What the modal's close button should do part way through a walk

`ModalFrame` puts an `x` in the title bar, and it cancels on both screens:
close, insert nothing. On the walk screen that leaves a destructive control an
inch from **Back**, which keeps everything picked so far. Both read as "get me
out of here", and only one of them costs you the session.

Not academic, because the gesture is not ours to remove. Obsidian's `Modal`
draws its own close button, and Escape dismisses it. It can be styled away —
Obsidian's own confirmation modals do exactly that, with
`.is-mobile .mod-confirmation .modal-close-button { display: none }` — but
whether Escape can be intercepted was not checked, and that is the half that
matters, since a key press cannot be aimed away from.

The candidates, roughly in order of how much they ask of the plugin:

- Leave it. Consistent, and the count on **OK** at least makes the loss
  visible before you reach for the corner.
- Hide the close button while a walk is running, so **Back** and **Skip Rest**
  are the only ways off that screen. Does nothing about Escape.
- Confirm on close when anything is picked. The usual guard, and the only one
  that also covers Escape.
- Treat closing with picks as **OK** rather than **Cancel**. Cheapest to build
  and never loses data, but it makes closing a modal commit something, which no
  other modal in Obsidian does.

Worth settling before the plugin exists, because the answer decides whether
`ModalFrame` needs to know a walk is running.

### Whether the data should mark the words NVC treats as thoughts

The evaluation-flavoured `Aversion` words — `hate`, `dislike`, `contempt`,
`animosity` — and `resentful` in `Angry`. NVC treats these as thoughts about
another person rather than feelings, yet the inventory lists them. They are
faithful to the source and must stay (see *Confirmed upstream* below); what is
open is whether anything in the data should flag them, and whether a tool built
on this should say something when one is picked.

### Whether to ship our own definitions of doctrinal words

Background in *The definitions are ours* below — every gloss in `feelings.ts`
and `needs.ts` was written for this project, because the source defines nothing.
To settle:

- Whether to ship our own glosses of doctrinal words at all, or show bare words
  and leave the meaning to the reader.
- If we keep them, whether someone with NVC training should review the wording
  before an app or plugin depends on it.

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

- *Nonviolent Communication: A Language of Life* (Rosenberg, PuddleDancer Press)
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
- Nouns that do not fit "I feel ___": `grief`, `turmoil`, `wonder`, `agony`,
  `dread`.
- The evaluation-flavoured `Aversion` words — `hate`, `dislike`, `contempt`,
  `animosity` — and `resentful` in `Angry`. NVC treats these as thoughts about
  another person rather than feelings, yet the inventory lists them. Whether the
  data should mark them is open, above.

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
