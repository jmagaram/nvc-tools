import type { FeelingCategory } from '../data/feelings.ts'
import * as feelingCategorySift from './feelingCategorySift.ts'
import * as feelingCategoryWalk from './feelingCategoryWalk.ts'
import { shuffle } from './shuffle.ts'

/** A category that has been looked at, and what was picked in it. */
export type Visited = {
  category: string
  kind: 'met' | 'unmet'
  /** May be empty: the category was opened but nothing in it applied. */
  words: readonly string[]
}

/** A category as the browse view needs it — no feelings, just the label. */
type Choice = {
  category: string
  kind: 'met' | 'unmet'
}

/**
 * A category being looked at. Sifting is the screen; a walk runs *inside* a
 * visit rather than beside one, and hands its answers back when it ends — so
 * the sift is present either way and its `marked` is the only record of what
 * the category holds. A walk is a way of going through the words, never a
 * second answer competing with the grid.
 */
export type Visit =
  | { phase: 'sift'; sift: feelingCategorySift.FeelingCategorySiftState }
  | {
      phase: 'walk'
      sift: feelingCategorySift.FeelingCategorySiftState
      walk: feelingCategoryWalk.FeelingCategoryWalkState
    }

export type FeelingPickerState = {
  /**
   * Every category, shuffled once so no category is always first. Held in
   * state rather than read from the data module so that `reduce` can resolve
   * an 'open' action by name, and the component needs no data of its own.
   */
  categories: readonly FeelingCategory[]
  /** Which half of the list is on screen. Remembered across a visit. */
  tab: 'met' | 'unmet'
  /** Categories already looked at, most recently closed first. */
  visited: readonly Visited[]
  /** The category open right now, or null while browsing. */
  visit: Visit | null
}

export type FeelingPickerAction =
  /** Show the other half of the list. */
  | { type: 'tab'; kind: 'met' | 'unmet' }
  /** Open a category, by name. */
  | { type: 'open'; category: string }
  /** Mark, unmark, or read a definition on the grid. */
  | { type: 'sift'; action: feelingCategorySift.FeelingCategorySiftAction }
  /** Go through this category one word at a time instead. */
  | { type: 'walk' }
  /** Answer the feeling the walk is showing. */
  | { type: 'answer'; answer: feelingCategoryWalk.FeelingCategoryWalkAction }
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
    visit: null,
  }
}

/** What was picked in `category` last time it was open, if it was. */
function wordsPicked(
  state: FeelingPickerState,
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
  sift: feelingCategorySift.FeelingCategorySiftState,
  walk: feelingCategoryWalk.FeelingCategoryWalkState,
): feelingCategorySift.FeelingCategorySiftState {
  const asked = new Set(walk.progress.answered.map((a) => a.feeling.word))
  const answeredYes = feelingCategoryWalk.picked(walk).map((f) => f.word)
  const unasked = sift.marked.filter((word) => !asked.has(word))
  return feelingCategorySift.withMarked(sift, [...answeredYes, ...unasked])
}

/**
 * Record what the grid came to and go back to the categories. Moving the
 * category to the front of `visited` is what puts its card top-left, where the
 * person was last looking.
 */
function closeVisit(
  state: FeelingPickerState,
  sift: feelingCategorySift.FeelingCategorySiftState,
): FeelingPickerState {
  const closed: Visited = {
    category: sift.category,
    kind: sift.kind,
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
  state: FeelingPickerState,
  action: FeelingPickerAction,
  rng: () => number = Math.random,
): FeelingPickerState {
  switch (action.type) {
    case 'tab':
      // The tabs are not on screen inside a category, so this cannot arrive
      // then.
      return state.visit ? state : { ...state, tab: action.kind }

    case 'open': {
      if (state.visit) return state
      const category = state.categories.find((c) => c.name === action.category)
      if (!category) return state
      // No special case for a category with nothing in it: an empty grid is a
      // screen that can be drawn, where an empty walk was a state that could
      // not be written down.
      return {
        ...state,
        tab: category.kind,
        visit: {
          phase: 'sift',
          sift: feelingCategorySift.init(
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
          sift: feelingCategorySift.reduce(state.visit.sift, action.action),
        },
      }
    }

    case 'walk': {
      if (state.visit?.phase !== 'sift') return state
      const { sift } = state.visit
      const category = state.categories.find((c) => c.name === sift.category)
      if (!category) return state
      // Marked first, which `feelingCategoryWalk.init` already does with
      // whatever it is handed — so this reads as 'confirm these, then meet the
      // rest' and discovery survives being able to skip the walk entirely.
      const walk = feelingCategoryWalk.init(category, sift.marked, rng)
      // A category with nothing to ask has no walk screen to show, so stay.
      return feelingCategoryWalk.isDone(walk)
        ? state
        : { ...state, visit: { phase: 'walk', sift, walk } }
    }

    case 'answer': {
      if (state.visit?.phase !== 'walk') return state
      const { sift } = state.visit
      const walk = feelingCategoryWalk.reduce(state.visit.walk, action.answer)
      // The last answer ends the walk and lands back on the grid, which now
      // shows what the walk came to — worth seeing before `Done`.
      return feelingCategoryWalk.isDone(walk)
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
 * insert. Categories opened without picking anything are left out.
 */
export function chosen(state: FeelingPickerState): Visited[] {
  return state.visited.filter((v) => v.words.length > 0)
}

/**
 * Which of the three screens is on top. Hosts draw a different title bar and a
 * different button row for each, and asking here keeps them from having to
 * learn the shape of a visit.
 */
export function screen(state: FeelingPickerState): 'browse' | 'sift' | 'walk' {
  return state.visit ? state.visit.phase : 'browse'
}

/** The category open right now — what a title bar a level down is named after. */
export function visitCategory(state: FeelingPickerState): string | null {
  return state.visit?.sift.category ?? null
}

/** How many are marked in the open category, for its `Done (3)`. */
export function visitCount(state: FeelingPickerState): number {
  return state.visit ? feelingCategorySift.count(state.visit.sift) : 0
}

/**
 * The category a returning browse screen puts focus on — the one just closed,
 * so long as its tab is the one showing. Null before anything has been closed,
 * and on the far tab from the last one, where `FeelingPicker` falls back to
 * the tab itself. Always drawn as a card: `shownAsCard` keeps the most recently
 * closed category there even when it came back empty.
 */
export function resumeAt(state: FeelingPickerState): string | null {
  const last = state.visited[0]
  return last && last.kind === state.tab ? last.category : null
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. Everything named
 * here is a reason to move focus: a new feeling to answer, a category just
 * opened, the other tab, the category just closed. The tab matters even though
 * only one card can hold focus — switching tabs takes that card off screen, and
 * focus would be left on nothing. Marking a word on the grid is deliberately
 * not one — see `feelingCategorySift.screenKey`.
 */
export function screenKey(state: FeelingPickerState): string {
  const visit = state.visit
  if (!visit) return `browse:${state.tab}:${resumeAt(state) ?? ''}`
  if (visit.phase === 'walk') {
    return feelingCategoryWalk.screenKey(visit.walk)
  }
  return feelingCategorySift.screenKey(visit.sift)
}
