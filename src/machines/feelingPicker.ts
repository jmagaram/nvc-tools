import type { FeelingCategory } from '../data/feelings.ts'
import * as categoryWalk from './categoryWalk.ts'
import { shuffle } from './shuffle.ts'

/** A category that has been walked through, and what was picked in it. */
export type Visited = {
  category: string
  kind: 'met' | 'unmet'
  /** May be empty: the walk happened but nothing in it applied. */
  words: readonly string[]
}

/** A category as the browse view needs it — no feelings, just the label. */
type Choice = {
  category: string
  kind: 'met' | 'unmet'
}

export type FeelingPickerState = {
  /**
   * Every category, shuffled once so no category is always first. Held in
   * state rather than read from the data module so that `reduce` can resolve
   * an 'open' action by name, and the component needs no data of its own.
   */
  categories: readonly FeelingCategory[]
  /** Which half of the list is on screen. Remembered across a walk. */
  tab: 'met' | 'unmet'
  /** Categories already walked, most recently closed first. */
  visited: readonly Visited[]
  /**
   * The walk in progress, or null while browsing. Never a finished walk: the
   * last answer closes it, so if this is set there is a feeling to answer.
   */
  walk: categoryWalk.CategoryWalkState | null
}

export type FeelingPickerAction =
  /** Show the other half of the list. */
  | { type: 'tab'; kind: 'met' | 'unmet' }
  /** Start walking a category, by name. */
  | { type: 'open'; category: string }
  /** Answer the feeling the walk is showing. */
  | { type: 'answer'; answer: categoryWalk.CategoryWalkAction }
  /** Leave the walk, keeping whatever was picked. */
  | { type: 'close' }

/**
 * Start browsing. The category order is fixed here and never changes again, so
 * the pill row only ever shrinks as categories are walked — nothing a person is
 * part way through reading rearranges under them.
 */
export function init(
  categories: readonly FeelingCategory[],
  rng: () => number = Math.random,
): FeelingPickerState {
  return {
    categories: shuffle(categories, rng),
    // Someone reaching for this tool usually has an unmet need on their mind.
    tab: 'unmet',
    visited: [],
    walk: null,
  }
}

/** What was picked in `category` last time it was walked, if it was. */
function wordsPicked(
  state: FeelingPickerState,
  category: string,
): readonly string[] {
  return state.visited.find((v) => v.category === category)?.words ?? []
}

/**
 * Record what a walk came to and go back to the categories. Moving the
 * category to the front of `visited` is what puts its card top-left, where the
 * person was last looking.
 */
function close(
  state: FeelingPickerState,
  walk: categoryWalk.CategoryWalkState,
): FeelingPickerState {
  const closed: Visited = {
    category: walk.category,
    kind: walk.kind,
    // Readable part way through, so backing out early still keeps picks.
    words: categoryWalk.picked(walk).map((f) => f.word),
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
  state: FeelingPickerState,
  action: FeelingPickerAction,
  rng: () => number = Math.random,
): FeelingPickerState {
  switch (action.type) {
    case 'tab':
      // The tabs are not on screen during a walk, so this cannot arrive then.
      return state.walk ? state : { ...state, tab: action.kind }

    case 'open': {
      if (state.walk) return state
      const category = state.categories.find((c) => c.name === action.category)
      if (!category) return state
      const opened = { ...state, tab: category.kind }
      const walk = categoryWalk.init(
        category,
        wordsPicked(state, category.name),
        rng,
      )
      // A category with nothing in it is over before it began, so there is no
      // walk screen to show.
      return categoryWalk.isDone(walk)
        ? close(opened, walk)
        : { ...opened, walk }
    }

    case 'answer': {
      if (!state.walk) return state
      const walk = categoryWalk.reduce(state.walk, action.answer)
      // The last answer ends the walk, and the screen it would leave behind
      // says no more than the card waiting on the other side — the category
      // just walked is the first one there. So go straight back.
      return categoryWalk.isDone(walk) ? close(state, walk) : { ...state, walk }
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
function shownAsCard(state: FeelingPickerState): Set<string> {
  const shown = new Set(
    state.visited.filter((v) => v.words.length > 0).map((v) => v.category),
  )
  const last = state.visited[0]
  if (last) shown.add(last.category)
  return shown
}

/** Cards for the current tab, most recently closed first. */
export function cards(state: FeelingPickerState): Visited[] {
  const shown = shownAsCard(state)
  return state.visited.filter(
    (v) => v.kind === state.tab && shown.has(v.category),
  )
}

/**
 * Pills for the current tab, in the order fixed at `init`. Together with
 * `cards` this is every category on this side of the split and nothing twice,
 * which is why neither group needs a heading to explain what it leaves out.
 */
export function pills(state: FeelingPickerState): Choice[] {
  const shown = shownAsCard(state)
  return state.categories
    .filter((c) => c.kind === state.tab && !shown.has(c.name))
    .map((c) => ({ category: c.name, kind: c.kind }))
}

/** How many feelings are picked on each side, for the tab labels. */
export function counts(state: FeelingPickerState): {
  met: number
  unmet: number
} {
  const total = (kind: 'met' | 'unmet') =>
    state.visited
      .filter((v) => v.kind === kind)
      .reduce((sum, v) => sum + v.words.length, 0)
  return { met: total('met'), unmet: total('unmet') }
}

/**
 * Everything picked, grouped by category and newest first — what a host would
 * insert. Categories walked without picking anything are left out.
 */
export function chosen(state: FeelingPickerState): Visited[] {
  return state.visited.filter((v) => v.words.length > 0)
}
