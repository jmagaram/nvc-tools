# TODO

## Source: the CNVC Feelings and Needs Inventory

Settled. `src/data/feelings.ts` and `src/data/needs.ts` reproduce the Center for
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

### Variants, and why they are not this

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

### Confirmed upstream, not transcription noise

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
  another person rather than feelings, yet the inventory lists them. Whether
  anything in the data should mark them is still open.

## Review: the definitions are ours, not the source's

Settled: needs carry definitions, and `Need` is structurally identical to
`Feeling` (`{ word, definition }`), so one component can render either dataset.

What that decision created is a separate problem. The CNVC inventory defines
nothing — it is a bare word list, confirmed by the research above, and no other
NVC handout we found glosses its words either. Every definition in both
`feelings.ts` and `needs.ts` was written for this project. They are
interpretations of doctrinal vocabulary, and some are deliberate judgement
calls:

- `to matter`, `contribution`, and `efficacy` are worded to pull apart, as are
  `competence` / `effectiveness` and `security` / `stability` / `consistency`.
  The source simply lists them side by side with no such distinction.
- `safety` is defined differently in each of its two categories — "being able to
  lower your guard" under `Connection`, "being out of harm's way" under
  `Physical Wellbeing`. That reading is ours.
- Needs definitions are phrased as what the met need looks like, feelings
  definitions as an experience from the inside. Two registers in one app.

To settle:

- Whether to ship our own glosses of doctrinal words at all, or show bare words
  and leave the meaning to the reader.
- If we keep them, whether someone with NVC training should review the wording
  before an app or plugin depends on it.
