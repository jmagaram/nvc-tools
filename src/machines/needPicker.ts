import type { NeedCategory } from '../data/needs.ts'
import * as needCategorySift from './needCategorySift.ts'
import * as needCategoryWalk from './needCategoryWalk.ts'
import { shuffle } from './shuffle.ts'

/** A category that has been looked at, and what was picked in it. */
export type Visited = {
  category: string
  /** May be empty: the category was opened but nothing in it applied. */
  words: readonly string[]
}

/**
 * A category being looked at. Sifting is the screen; a walk runs *inside* a
 * visit rather than beside one, and hands its answers back when it ends — so
 * the sift is present either way and its `marked` is the only record of what
 * the category holds. A walk is a way of going through the words, never a
 * second answer competing with the grid.
 */
export type Visit =
  | { phase: 'sift'; sift: needCategorySift.NeedCategorySiftState }
  | {
      phase: 'walk'
      sift: needCategorySift.NeedCategorySiftState
      walk: needCategoryWalk.NeedCategoryWalkState
    }

export type NeedPickerState = {
  /**
   * Every category, shuffled once so no category is always first. Held in
   * state rather than read from the data module so that `reduce` can resolve
   * an 'open' action by name, and the component needs no data of its own.
   */
  categories: readonly NeedCategory[]
  /** Categories already looked at, most recently closed first. */
  visited: readonly Visited[]
  /** The category open right now, or null while browsing. */
  visit: Visit | null
}

export type NeedPickerAction =
  /** Open a category, by name. */
  | { type: 'open'; category: string }
  /** Mark, unmark, or read a definition on the grid. */
  | { type: 'sift'; action: needCategorySift.NeedCategorySiftAction }
  /** Go through this category one word at a time instead. */
  | { type: 'walk' }
  /** Answer the need the walk is showing. */
  | { type: 'answer'; answer: needCategoryWalk.NeedCategoryWalkAction }
  /**
   * Leave whatever is on top: a walk goes back to the grid it started from, and
   * the grid goes back to the categories. The same rule the modal's `x` and its
   * title bar already follow, which is why one action serves both.
   */
  | { type: 'close' }

/**
 * Start browsing. The category order is fixed here and never changes again, so
 * the pill row only ever shrinks as categories are visited — nothing a person
 * is part way through reading rearranges under them.
 *
 * There is no tab here and no `kind`: the CNVC inventory splits feelings into
 * needs met and needs unmet, but the needs themselves are one undivided list.
 */
export function init(
  categories: readonly NeedCategory[],
  rng: () => number = Math.random,
): NeedPickerState {
  return {
    categories: shuffle(categories, rng),
    visited: [],
    visit: null,
  }
}

/** What was picked in `category` last time it was open, if it was. */
function wordsPicked(
  state: NeedPickerState,
  category: string,
): readonly string[] {
  return state.visited.find((v) => v.category === category)?.words ?? []
}

/**
 * Fold a walk's answers back into the grid it started from.
 *
 * What the walk asked about, the walk decides — including words it turned up
 * that were never marked, which is the whole reason it goes through everything
 * rather than only the marks. What it never got to keeps whatever the grid
 * already said, so leaving a walk part way through cannot throw away a mark it
 * had not reached yet. That is the bug the old `close` had, and it would have
 * bitten far harder here: a walk is now something you enter *after* marking.
 */
function fold(
  sift: needCategorySift.NeedCategorySiftState,
  walk: needCategoryWalk.NeedCategoryWalkState,
): needCategorySift.NeedCategorySiftState {
  const asked = new Set(walk.progress.answered.map((a) => a.need.word))
  const answeredYes = needCategoryWalk.picked(walk).map((need) => need.word)
  const unasked = sift.marked.filter((word) => !asked.has(word))
  return needCategorySift.withMarked(sift, [...answeredYes, ...unasked])
}

/**
 * Record what the grid came to and go back to the categories. Moving the
 * category to the front of `visited` is what puts its card top-left, where the
 * person was last looking.
 *
 * Keyed by category, which matters: `safety` is listed under both `Connection`
 * and `Physical Wellbeing` upstream, so the same word can be picked twice and
 * each card has to keep its own copy.
 */
function closeVisit(
  state: NeedPickerState,
  sift: needCategorySift.NeedCategorySiftState,
): NeedPickerState {
  const closed: Visited = {
    category: sift.category,
    words: sift.marked,
  }
  return {
    ...state,
    visited: [
      closed,
      ...state.visited.filter((v) => v.category !== closed.category),
    ],
    visit: null,
  }
}

export function reduce(
  state: NeedPickerState,
  action: NeedPickerAction,
  rng: () => number = Math.random,
): NeedPickerState {
  switch (action.type) {
    case 'open': {
      if (state.visit) return state
      const category = state.categories.find((c) => c.name === action.category)
      if (!category) return state
      // No special case for a category with nothing in it: an empty grid is a
      // screen that can be drawn, where an empty walk was a state that could
      // not be written down.
      return {
        ...state,
        visit: {
          phase: 'sift',
          sift: needCategorySift.init(
            category,
            wordsPicked(state, category.name),
          ),
        },
      }
    }

    case 'sift': {
      // The grid is not on screen during a walk, so this cannot arrive then.
      if (state.visit?.phase !== 'sift') return state
      return {
        ...state,
        visit: {
          phase: 'sift',
          sift: needCategorySift.reduce(state.visit.sift, action.action),
        },
      }
    }

    case 'walk': {
      if (state.visit?.phase !== 'sift') return state
      const { sift } = state.visit
      const category = state.categories.find((c) => c.name === sift.category)
      if (!category) return state
      // Marked first, which `needCategoryWalk.init` already does with whatever
      // it is handed — so this reads as 'confirm these, then meet the rest'
      // and discovery survives being able to skip the walk entirely.
      const walk = needCategoryWalk.init(category, sift.marked, rng)
      // A category with nothing to ask has no walk screen to show, so stay.
      return needCategoryWalk.isDone(walk)
        ? state
        : { ...state, visit: { phase: 'walk', sift, walk } }
    }

    case 'answer': {
      if (state.visit?.phase !== 'walk') return state
      const { sift } = state.visit
      const walk = needCategoryWalk.reduce(state.visit.walk, action.answer)
      // The last answer ends the walk and lands back on the grid, which now
      // shows what the walk came to — worth seeing before `Done`.
      return needCategoryWalk.isDone(walk)
        ? { ...state, visit: { phase: 'sift', sift: fold(sift, walk) } }
        : { ...state, visit: { phase: 'walk', sift, walk } }
    }

    case 'close': {
      if (!state.visit) return state
      if (state.visit.phase === 'walk') {
        const { sift, walk } = state.visit
        return { ...state, visit: { phase: 'sift', sift: fold(sift, walk) } }
      }
      return closeVisit(state, state.visit.sift)
    }
  }
}

/**
 * The categories drawn as cards rather than pills: everything with words to
 * show, plus — if the most recently closed category came back empty — that one.
 * An empty card says 'I looked here and found nothing', which is worth seeing
 * once; keeping every one of them would fill the view with cards saying nothing.
 */
function shownAsCard(state: NeedPickerState): Set<string> {
  const shown = new Set(
    state.visited.filter((v) => v.words.length > 0).map((v) => v.category),
  )
  const last = state.visited[0]
  if (last) shown.add(last.category)
  return shown
}

/** Cards, most recently closed first. */
export function cards(state: NeedPickerState): Visited[] {
  const shown = shownAsCard(state)
  return state.visited.filter((v) => shown.has(v.category))
}

/**
 * Pills, in the order fixed at `init`. Together with `cards` this is every
 * category and nothing twice, which is why neither group needs a heading to
 * explain what it leaves out.
 */
export function pills(state: NeedPickerState): string[] {
  const shown = shownAsCard(state)
  return state.categories
    .filter((c) => !shown.has(c.name))
    .map((c) => c.name)
}

/**
 * How many needs are picked in all. One number rather than the two
 * `feelingPicker` reports, because there are no tab labels to fill — a host
 * showing a count on its `Insert` button is what this is for.
 */
export function count(state: NeedPickerState): number {
  return state.visited.reduce((sum, v) => sum + v.words.length, 0)
}

/**
 * Everything picked, grouped by category and newest first — what a host would
 * insert. Categories opened without picking anything are left out.
 */
export function chosen(state: NeedPickerState): Visited[] {
  return state.visited.filter((v) => v.words.length > 0)
}

/**
 * Which of the three screens is on top. Hosts draw a different title bar and a
 * different button row for each, and asking here keeps them from having to
 * learn the shape of a visit.
 */
export function screen(state: NeedPickerState): 'browse' | 'sift' | 'walk' {
  return state.visit ? state.visit.phase : 'browse'
}

/** The category open right now — what a title bar a level down is named after. */
export function visitCategory(state: NeedPickerState): string | null {
  return state.visit?.sift.category ?? null
}

/**
 * The category a returning browse screen puts focus on — the one just closed.
 * Null before anything has been, where `NeedPicker` falls back to the list
 * itself. Always drawn as a card: `shownAsCard` keeps the most recently closed
 * category there even when it came back empty. There are no tabs to take it
 * off screen, so unlike `feelingPicker` this needs no further guard.
 */
export function resumeAt(state: NeedPickerState): string | null {
  return state.visited[0]?.category ?? null
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. Everything named
 * here is a reason to move focus: a new need to answer, a category just opened,
 * the category just closed. Marking a word on the grid is deliberately not one
 * — see `needCategorySift.screenKey`.
 */
export function screenKey(state: NeedPickerState): string {
  const visit = state.visit
  if (!visit) return `browse:${resumeAt(state) ?? ''}`
  if (visit.phase === 'walk') {
    return needCategoryWalk.screenKey(visit.walk)
  }
  return needCategorySift.screenKey(visit.sift)
}
