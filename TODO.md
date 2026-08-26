# TODO

## Research: the official NVC feelings and needs lists

`src/data/feelings.ts` was transcribed from a feelings inventory pasted into a
chat, not from a cited source. Before building anything on top of it, confirm
what the authoritative list actually is and where it comes from.

The wording of these lists is doctrinal in NVC circles, and the app will be
judged against whichever version a user already knows. Getting this wrong is
cheap to fix now and expensive to fix once components, saved user data, and an
Obsidian plugin all depend on the word list.

### Questions

- **Which list is canonical?** CNVC (cnvc.org) publishes one; the Center for
  Nonviolent Communication's "Feelings Inventory" and "Needs Inventory" handouts
  are the usual reference. Marshall Rosenberg's *Nonviolent Communication: A
  Language of Life* has its own lists in the appendix, and they differ. NVC
  Academy, PuddleDancer Press, and various trainers circulate further variants.
  Find out which one people actually mean by "the official list."
- **Does our transcription match it?** Diff the 231 words and 25 categories in
  `src/data/feelings.ts` against the source. Check for words we're missing and
  categories that don't exist upstream.
- **Are the category headings official?** Our data treats `Affectionate`,
  `Yearning`, and the other 23 as group labels only. Confirm the real list
  groups words this way at all — some versions are a flat alphabetical list with
  no categories, which would make our whole grouping an invention.
- **Licensing.** CNVC materials are generally CC-licensed but check the specific
  terms, and whether attribution is required if we ship the list in an app or
  plugin.

### Known wrinkles to resolve against the source

- Three words appear in two categories: `amazed`, `surprised` (which spans both
  polarities), and `restless`. Verify these duplicates exist upstream and aren't
  transcription noise.
- Several entries are nouns, not adjectives, so they don't fit "I feel ___":
  `grief`, `turmoil`, `wonder`, `agony`, `dread`. Check whether the source has
  them this way or whether we should normalize.
- Several entries in `Aversion` — `hate`, `dislike`, `contempt`, `animosity` —
  and `resentful` in `Angry` read as evaluations of another person rather than
  felt states. NVC elsewhere calls these "faux feelings" and teaches people to
  translate them. Find out whether the official inventory includes them, and
  whether anything in the data should mark them.

### Then

Needs has no data file yet. Once the feelings source is settled, transcribe the
needs inventory the same way, reusing the `FeelingCategory` shape if the
structure matches.
