import type { NeedCategory } from '../data/needs.ts'
import * as needCategoryWalk from './needCategoryWalk.ts'
import { shuffle } from './shuffle.ts'

/** A category that has been walked through, and what was picked in it. */
export type Visited = {
  category: string
  /** May be empty: the walk happened but nothing in it applied. */
  words: readonly string[]
}

export type NeedPickerState = {
  /**
   * Every category, shuffled once so no category is always first. Held in
   * state rather than read from the data module so that `reduce` can resolve
   * an 'open' action by name, and the component needs no data of its own.
   */
  categories: readonly NeedCategory[]
  /** Categories already walked, most recently closed first. */
  visited: readonly Visited[]
  /**
   * The walk in progress, or null while browsing. Never a finished walk: the
   * last answer closes it, so if this is set there is a need to answer.
   */
  walk: needCategoryWalk.NeedCategoryWalkState | null
}

export type NeedPickerAction =
  /** Start walking a category, by name. */
  | { type: 'open'; category: string }
  /** Answer the need the walk is showing. */
  | { type: 'answer'; answer: needCategoryWalk.NeedCategoryWalkAction }
  /** Leave the walk, keeping whatever was picked. */
  | { type: 'close' }

/**
 * Start browsing. The category order is fixed here and never changes again, so
 * the pill row only ever shrinks as categories are walked — nothing a person is
 * part way through reading rearranges under them.
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
    walk: null,
  }
}

/** What was picked in `category` last time it was walked, if it was. */
function wordsPicked(
  state: NeedPickerState,
  category: string,
): readonly string[] {
  return state.visited.find((v) => v.category === category)?.words ?? []
}

/**
 * Record what a walk came to and go back to the categories. Moving the
 * category to the front of `visited` is what puts its card top-left, where the
 * person was last looking.
 *
 * Keyed by category, which matters: `safety` is listed under both `Connection`
 * and `Physical Wellbeing` upstream, so the same word can be picked twice and
 * each card has to keep its own copy.
 */
function close(
  state: NeedPickerState,
  walk: needCategoryWalk.NeedCategoryWalkState,
): NeedPickerState {
  const closed: Visited = {
    category: walk.category,
    // Readable part way through, so backing out early still keeps picks.
    // This reports only the walk just performed, so backing out of a re-opened
    // category overwrites what it held — the same open bug `feelingPicker` has,
    // copied deliberately so the two stay in step. See TODO.md.
    words: needCategoryWalk.picked(walk).map((n) => n.word),
  }
  return {
    ...state,
    visited: [
      closed,
      ...state.visited.filter((v) => v.category !== closed.category),
    ],
    walk: null,
  }
}

export function reduce(
  state: NeedPickerState,
  action: NeedPickerAction,
  rng: () => number = Math.random,
): NeedPickerState {
  switch (action.type) {
    case 'open': {
      if (state.walk) return state
      const category = state.categories.find((c) => c.name === action.category)
      if (!category) return state
      const walk = needCategoryWalk.init(
        category,
        wordsPicked(state, category.name),
        rng,
      )
      // A category with nothing in it is over before it began, so there is no
      // walk screen to show.
      return needCategoryWalk.isDone(walk)
        ? close(state, walk)
        : { ...state, walk }
    }

    case 'answer': {
      if (!state.walk) return state
      const walk = needCategoryWalk.reduce(state.walk, action.answer)
      // The last answer ends the walk, and the screen it would leave behind
      // says no more than the card waiting on the other side — the category
      // just walked is the first one there. So go straight back.
      return needCategoryWalk.isDone(walk) ? close(state, walk) : { ...state, walk }
    }

    case 'close':
      return state.walk ? close(state, state.walk) : state
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
 * showing a count on an OK button is what this is for.
 */
export function count(state: NeedPickerState): number {
  return state.visited.reduce((sum, v) => sum + v.words.length, 0)
}

/**
 * Everything picked, grouped by category and newest first — what a host would
 * insert. Categories walked without picking anything are left out.
 */
export function chosen(state: NeedPickerState): Visited[] {
  return state.visited.filter((v) => v.words.length > 0)
}

/**
 * The category a returning browse screen puts focus on — the one just walked.
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
 * here is a reason to move focus: a new need to answer, the category just
 * walked.
 */
export function screenKey(state: NeedPickerState): string {
  const walk = state.walk
  if (walk) {
    return `prompt:${walk.category}:${walk.progress.answered.length}`
  }
  return `browse:${resumeAt(state) ?? ''}`
}
