# Redesigning the need picker

An ASCII prototype of the screens worth considering, and what each would cost.
`FeelingPicker` has the same shape and inherits whatever is chosen; the numbers
below are the needs', because they are worse.

> **What was chosen.** **B** with the walk kept as a second gear, which is
> **C** with the two stages offered side by side rather than in sequence — a
> category opens as the grid, `Done` is primary, and **Ask me about each**
> starts a walk through the whole category with the marks first. No size
> threshold: every category sifts. Definitions live in a gloss strip at the foot
> of the grid.
> **A**, **E** and **F** are still open and still additive; **D** and **G** were
> not taken. See _Settled_ in `TODO.md` for why each call went the way it did.

## What is wrong

The inventory is 75 needs in 7 categories, and the categories are not the same
size:

| Category           | Needs |
| ------------------ | ----: |
| Connection         |    28 |
| Meaning            |    21 |
| Physical Wellbeing |     9 |
| Peace              |     7 |
| Autonomy           |     5 |
| Honesty            |     3 |
| Play               |     2 |

Two categories hold 49 of the 75 — two thirds of the inventory behind two of
the seven doors. Opening `Connection` commits you to 28 yes/no answers before
you are back where you started, and the walk shuffles, so you cannot even see
the end coming. `Play` is two.

That is two separate problems, and they want different fixes:

1. **It is long.** A walk costs one answer per word whether or not the word was
   ever a candidate — 28 taps to find the two that applied.
2. **You cannot see in.** `Connection` and `Meaning` are broad enough to mean
   almost anything. The only way to learn what is behind the name is to walk it
   one card at a time, and by then you have already paid for the answer.

Problem 2 is the cheaper of the two and the one nothing in the current design
addresses at all. Problem 1 has an escape hatch already — `‹ Needs` and `×`
leave a walk and keep the picks — but leaving early looks exactly like giving
up, so it feels like quitting rather than finishing.

## What the walk buys

Before replacing it: the one-at-a-time card is slow, but it is doing work.

A list optimises **recognition** — you scan for a word you half-knew you wanted
and stop when you see it. The walk optimises **discovery** — it puts a word and
a plain-language gloss in front of you and makes you answer, including for words
you would never have picked out of a list. In NVC that is much of the point: the
person using this often cannot name what they need, and a 28-word list read at
speed gives back only what they walked in with.

So the question is not *cards or list*. It is **which one is the default
surface, and how you get to the other**. Every option below is an answer to that.

## Today, for comparison

Browsing. Walked categories become cards, the rest stay pills; nothing says how
big any of them is or what is inside.

```
┌────────────────────────────────────────────┐
│ Needs                                    × │
├────────────────────────────────────────────┤
│ ┌────────────────────────────┐             │
│ │ Connection                 │             │
│ │  · empathy                 │             │
│ │  · trust                   │             │
│ │  · to see and be seen      │             │
│ └────────────────────────────┘             │
│                                            │
│ ( Autonomy )  ( Meaning )  ( Peace )       │
│ ( Play )  ( Honesty )                      │
│ ( Physical Wellbeing )                     │
├────────────────────────────────────────────┤
│                         Cancel      OK (3) │
└────────────────────────────────────────────┘
```

The walk. Twenty-eight of these for `Connection`, in shuffled order.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Needs in Connection                        │
│ ✓ ✕ ✕ ✓ ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ …  │
│                                            │
│     ┌──────────────────────────────┐       │
│     │ Connection                   │       │
│     │                              │       │
│     │ empathy                      │       │
│     │                              │       │
│     │ Someone sensing what it is   │       │
│     │ like to be you.              │       │
│     └──────────────────────────────┘       │
│                                            │
│   [ ← Not this ]          [ Yes → ]        │
└────────────────────────────────────────────┘
```

---

## A · Say what is in the category

Not a new screen so much as the browse screen finally carrying information: the
count, and enough sample words to tell `Connection` from `Meaning`. Rows rather
than pills, because a pill has no room for a second line.

```
┌────────────────────────────────────────────┐
│ Needs                                    × │
├────────────────────────────────────────────┤
│ Connection                           28  › │
│ empathy · trust · belonging · warmth ·     │
│ safety · closeness · mutuality …           │
│                                            │
│ Meaning                              21  › │
│ purpose · growth · clarity · learning ·    │
│ hope · creativity · to matter …            │
│                                            │
│ Physical Wellbeing                    9  › │
│ rest · food · touch · shelter · water …    │
│                                            │
│ Peace                                 7  › │
│ ease · order · harmony · beauty …          │
│                                            │
│ Autonomy                              5  › │
│ choice · freedom · space …                 │
│                                            │
│ Honesty                               3  › │
│ authenticity · integrity · presence        │
├────────────────────────────────────────────┤
│                          Cancel         OK │
└────────────────────────────────────────────┘
```

The cheapest thing here, and orthogonal to everything below — it fixes problem 2
on its own and should probably ship whatever else happens. The count doubles as
a price tag: you know `Connection` is 28 before you spend it.

Open questions: which words to sample (the first few? a shuffle? the ones most
often picked?), and whether a shuffled sample makes the screen feel unstable
between visits. Fixing the sample once per session, as `init` already fixes the
category order, is the obvious answer.

## B · The category is a checklist

The walk stops being the default. A category opens as its whole word list with
toggles, and picking costs one tap per *pick* rather than one per word.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Connection                         3 of 28 │
│                                            │
│ [✓] acceptance                             │
│ [ ] affection                              │
│ [✓] appreciation                           │
│ [ ] belonging                              │
│ [ ] closeness                              │
│ [✓] communication                          │
│ [ ] community                              │
│ [ ] companionship                          │
│ [ ] compassion                             │
│ [ ] consideration                          │
│             ⋮  scrolls                     │
├────────────────────────────────────────────┤
│ One at a time ›                   Done (3) │
└────────────────────────────────────────────┘
```

The definitions are the problem: they are the walk's best feature and a list has
no room for them. Three ways out.

**B1 — on demand.** Tap the word to open its gloss, tap the box to pick it. The
list stays scannable and the gloss is one tap away when a word is unfamiliar.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Connection                         3 of 28 │
│                                            │
│ [ ] belonging                            ⌄ │
│ [✓] closeness                            ⌃ │
│       Little distance left between         │
│       you and someone.                     │
│ [✓] communication                        ⌄ │
│ [ ] community                            ⌄ │
│ [ ] companionship                        ⌄ │
│             ⋮                              │
├────────────────────────────────────────────┤
│ One at a time ›                   Done (3) │
└────────────────────────────────────────────┘
```

**B2 — always shown.** No hidden state, but `Connection` becomes 84 lines of
scroll and most of the scanning advantage evaporates.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Connection                         1 of 28 │
│                                            │
│ [ ] belonging                              │
│       Being one of the people here         │
│       rather than a guest.                 │
│ [✓] closeness                              │
│       Little distance left between         │
│       you and someone.                     │
│ [ ] communication                          │
│       Words passing between you and        │
│       landing.                             │
│             ⋮                              │
├────────────────────────────────────────────┤
│ One at a time ›                   Done (1) │
└────────────────────────────────────────────┘
```

**B3 — the walk kept as a second gear.** `One at a time ›` in the corner walks
the category exactly as today, seeded from whatever is already ticked. Cheap to
build, and it is what keeps the discovery mode alive for whoever wants it.

A checklist also quietly kills the open bug in `TODO.md`: it returns its whole
checked set on close rather than only the answers given this visit, so
re-opening a category and backing out cannot erase what it held.

## C · Shortlist, then walk

The two-stage funnel, and the option that takes both problems seriously at once.
First a dense grid of bare words — no definitions, no commitment — tap anything
that *might* apply.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Connection                                 │
│ Tap anything that might apply.             │
│                                            │
│   acceptance    affection                  │
│   appreciation [ belonging ]               │
│   closeness     communication              │
│   community     companionship              │
│ [ compassion ]  consideration              │
│   consistency  [ empathy ]                 │
│   inclusion     intimacy                   │
│ [ love ]        mutuality                  │
│   nurturing     respect/self-respect       │
│   safety        security                   │
│             ⋮                              │
├────────────────────────────────────────────┤
│ Skip                       Walk these 4  → │
└────────────────────────────────────────────┘
```

Then walk only those, with the gloss and the yes/no, exactly as today.

```
┌────────────────────────────────────────────┐
│ ‹ Connection                             × │
├────────────────────────────────────────────┤
│ The 4 you marked                           │
│ ✓ ● ○ ○                                    │
│                                            │
│     ┌──────────────────────────────┐       │
│     │ Connection                   │       │
│     │                              │       │
│     │ compassion                   │       │
│     │                              │       │
│     │ Suffering met with care      │       │
│     │ rather than judgement.       │       │
│     └──────────────────────────────┘       │
│                                            │
│   [ ← Not this ]          [ Yes → ]        │
└────────────────────────────────────────────┘
```

`Connection` becomes one scan plus four cards instead of 28. The first screen
answers "what is in here"; the second keeps the deliberation where it is worth
paying for. The stage-one wording has to stay generous — *might apply*, not
*applies* — or people treat it as the answer and stage two becomes a formality.

Costs: two screens where there was one, and someone who marks 20 words has saved
nothing. `Skip` has to mean "walk the whole thing", or the fast path is a trap.

## D · The walk, four at a time

Keep a card and a gloss in front of every word, but stop making each one a
screen of its own. Pagination rather than a list.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Connection                      7–10 of 28 │
│                                            │
│ ┌──────────────────┐  ┌──────────────────┐ │
│ │ empathy          │  │ inclusion        │ │
│ │ Someone sensing  │  │ Being brought in │ │
│ │ what it is like  │  │ rather than left │ │
│ │ to be you.       │  │ outside.         │ │
│ │            [ ✓ ] │  │            [   ] │ │
│ └──────────────────┘  └──────────────────┘ │
│ ┌──────────────────┐  ┌──────────────────┐ │
│ │ intimacy         │  │ love             │ │
│ │ Letting someone  │  │ Caring deeply    │ │
│ │ see what you     │  │ and being deeply │ │
│ │ show no one else.│  │ cared for.       │ │
│ │            [   ] │  │            [ ✓ ] │ │
│ └──────────────────┘  └──────────────────┘ │
├────────────────────────────────────────────┤
│ Enough ›                         Next 4  → │
└────────────────────────────────────────────┘
```

28 becomes 7 screens rather than 28, and every word still arrives with its
definition — which no list variant manages. But on a 327px modal body two
columns of glossed cards is genuinely cramped; realistically this is one column
of four rows on a phone, at which point it is B2 with a **Next** button and the
pagination is buying only a sense of progress.

## E · Find, across every category

A filter over all 75 words and their definitions, categories ignored.

```
┌────────────────────────────────────────────┐
│ Needs                                    × │
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   │
│ │ Find:  rest                          │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ [ ] rest/sleep          Physical Wellbeing │
│       Stopping long enough to be           │
│       restored.                            │
│ [✓] ease                             Peace │
│       Doing what you do without strain.    │
│ [ ] space                         Autonomy │
│       Room around you that nobody else     │
│       is filling.                          │
├────────────────────────────────────────────┤
│                         Cancel      OK (1) │
└────────────────────────────────────────────┘
```

Not a replacement — it serves the person who already has a word in mind, which
is the person the walk exists to help. But it is small, it makes the inventory
usable as a reference, and it is the only screen here that copes gracefully with
`safety` being filed under two categories.

## F · Sub-groups inside the big categories

The structural fix: `Connection` is not one idea, it is four or five. Sub-heads
turn 28 words into groups of six, which is a length the eye handles.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Connection                         2 of 28 │
│                                            │
│ Being close to someone                     │
│   [ ] affection    [ ] warmth              │
│   [✓] closeness    [ ] intimacy            │
│   [ ] love         [ ] nurturing           │
│                                            │
│ Being known as you are                     │
│   [ ] acceptance   [ ] empathy             │
│   [✓] to see and be seen                   │
│   [ ] to know and be known                 │
│                                            │
│ Being able to count on it                  │
│   [ ] trust        [ ] safety              │
│   [ ] security     [ ] stability           │
│             ⋮                              │
├────────────────────────────────────────────┤
│ One at a time ›                   Done (2) │
└────────────────────────────────────────────┘
```

This makes both B and C substantially better, and it is the only option that
addresses *why* those two categories are hard rather than working around it.

The cost is editorial and it is real. The category names come from CNVC and the
word list is reproduced unchanged, deliberately; sub-headings would be ours,
invented, sitting in the middle of a sourced list. It is the same line
`src/data/needs.ts` already walks with the definitions — so if it is done, it
belongs in the data as a clearly-labelled second layer, not folded into the
categories as though the source had them.

## G · No categories at all

One alphabetical list of 75 with a filter on top; the category becomes a tag
rather than a door.

```
┌────────────────────────────────────────────┐
│ Needs                                    × │
├────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐   │
│ │ Find:                                │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ A                                          │
│ [ ] acceptance     [ ] affection           │
│ [ ] air            [ ] appreciation        │
│ [ ] authenticity   [ ] awareness           │
│ B                                          │
│ [ ] beauty         [✓] belonging           │
│ C                                          │
│ [ ] celebration of life                    │
│ [ ] challenge      [ ] choice              │
│             ⋮  73 more                     │
├────────────────────────────────────────────┤
│                         Cancel      OK (1) │
└────────────────────────────────────────────┘
```

Honest about what the categories do and do not buy, and it removes the
big-category problem by removing big categories. It also removes the only
scaffolding a person who cannot name what they need has, and it makes the picks
harder to group on the way back out into the note. Listed for completeness; hard
to recommend.

## H · Leave the walk alone, add a way out

The minimal change. The walk stays exactly as it is, and after a handful of
cards it offers to become a list.

```
┌────────────────────────────────────────────┐
│ ‹ Needs                                  × │
├────────────────────────────────────────────┤
│ Needs in Connection                        │
│ ✓ ✕ ✕ ✓ ✕ ● ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ ○ …  │
│                                            │
│     ┌──────────────────────────────┐       │
│     │ Connection                   │       │
│     │                              │       │
│     │ inclusion                    │       │
│     │                              │       │
│     │ Being brought in rather      │       │
│     │ than left outside.           │       │
│     └──────────────────────────────┘       │
│                                            │
│   [ ← Not this ]          [ Yes → ]        │
│                                            │
│       Show the other 22 as a list ›        │
└────────────────────────────────────────────┘
```

Costs almost nothing, keeps discovery as the default, and turns the existing
early exit from *quitting* into *switching*. It does nothing for problem 2.

---

## Putting it together

The three that compose well:

- **A** on the browse screen, always. It is the fix for problem 2 and it is one
  extra line per row.
- **B1 + B3** inside a category — a checklist with glosses on demand, and
  `One at a time ›` still there for whoever wants to be walked. Or **C**, which
  is the same two modes wired in sequence rather than offered side by side.
- **F** underneath either, if the editorial cost is acceptable. It is what makes
  a 28-word screen readable at all.

**C** is the most interesting single answer, because it is the only one where
the fast path and the deliberate path are the same path. **A + B1 + B3** is the
safer one: each piece works alone, nothing is sequenced, and the walk survives
untouched for the people it was built for.

**E** is worth building whenever, independent of all of this.

## What each would cost in the code

- **A** — `pills` in `src/machines/needPicker.ts` returns names; it would return
  a name, a sample and a count. `NeedCategoryPill` becomes a row, or gains a
  sibling. No new state.
- **B / F / G** — a new pure module, say `src/machines/needCategoryList.ts`,
  holding the category and a `Set` of chosen words, with `init` seeded from
  `wordsPicked`. `needPicker`'s `walk` field becomes a union of a list and a
  walk — the shape `Progress` in `needCategoryWalk` already uses — and `close`
  reads the chosen set rather than `picked(walk)`.
- **C** — one machine, not two: `Progress` grows a `'shortlisting'` arm holding
  the category's words and the marked set, and `reduce` moves it to `'asking'`
  with `upcoming` set to the marks. `isDone`, `picked` and `screenKey` keep
  their shape. The smallest diff of the structural options.
- **D** — `current: Need` becomes `current: Need[]`, plus an answer action
  carrying which of them were taken.
- **F** also needs a `group` on `Need`, or a `groups` field on `NeedCategory`.
- **E** — no machine at all, if the filter box lives in the host, which is where
  the rest of the state already lives.

Whatever is chosen lands twice: `feelingPicker` and `needPicker` are deliberate
copies of each other, and the feeling categories are only a little kinder than
`Connection`'s 28.
