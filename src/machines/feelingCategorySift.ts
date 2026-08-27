import type { Feeling, FeelingCategory } from '../data/feelings.ts'

/**
 * Sifting one category: every word in it at once, with the ones that apply
 * marked. This is the answer, not a shortlist — a walk started from here only
 * ever refines what is marked, and leaving with `Done` commits it as it stands.
 *
 * Which is why the question a host puts at the top has to be *which of these
 * apply* rather than *which might*: nothing here asks again, so nothing may be
 * marked on the understanding that it will be checked later.
 *
 * Kept line for line alongside `needCategorySift`, the way the two walks and
 * the two pickers are.
 */
export type FeelingCategorySiftState = {
  /** The category being sifted, e.g. 'Engaged'. */
  category: string
  /** Whether the category signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
  /**
   * Every feeling in the category, in the order the source lists them and
   * never shuffled. The walk shuffles so that no word is always first; a grid
   * shows all of them at once, where order counts for much less than being
   * able to find the word you saw a moment ago — including on the way back in.
   */
  words: readonly Feeling[]
  /** What applies. Held in `words` order, so re-entering looks the same. */
  marked: readonly string[]
  /** Whose definition the gloss strip is showing, if any. */
  showing: string | null
}

export type FeelingCategorySiftAction =
  /** Mark or unmark a word, and show its definition. */
  | { type: 'toggle'; word: string }
  /**
   * Show a word's definition without marking it — hover, or focus arriving on
   * it. Without this, reading a gloss would mean marking a word and unmarking
   * it again, which is a state change to ask for a sentence.
   */
  | { type: 'show'; word: string }

/**
 * Put `words` in the order the category lists them, and drop anything not in
 * it. Every write to `marked` goes through here, so the field cannot drift out
 * of order or hold a word this category never had — and `surprised` sits on
 * both sides of the met/unmet split upstream, so that is not a hypothetical.
 */
function inSourceOrder(
  words: readonly Feeling[],
  chosen: readonly string[],
): string[] {
  const wanted = new Set(chosen)
  return words
    .filter((feeling) => wanted.has(feeling.word))
    .map((feeling) => feeling.word)
}

/**
 * Start sifting `category`, with `alreadyPicked` marked. That is what makes
 * re-opening a category an edit rather than a fresh start.
 */
export function init(
  category: FeelingCategory,
  alreadyPicked: readonly string[] = [],
): FeelingCategorySiftState {
  return {
    category: category.name,
    kind: category.kind,
    words: category.feelings,
    marked: inSourceOrder(category.feelings, alreadyPicked),
    showing: null,
  }
}

/** Replace what is marked, normalised. How a walk folds its answers back in. */
export function withMarked(
  state: FeelingCategorySiftState,
  chosen: readonly string[],
): FeelingCategorySiftState {
  return { ...state, marked: inSourceOrder(state.words, chosen) }
}

export function reduce(
  state: FeelingCategorySiftState,
  action: FeelingCategorySiftAction,
): FeelingCategorySiftState {
  switch (action.type) {
    case 'toggle': {
      const next = isMarked(state, action.word)
        ? state.marked.filter((word) => word !== action.word)
        : [...state.marked, action.word]
      return { ...withMarked(state, next), showing: action.word }
    }

    case 'show':
      return { ...state, showing: action.word }
  }
}

/** Whether `word` is marked. */
export function isMarked(
  state: FeelingCategorySiftState,
  word: string,
): boolean {
  return state.marked.includes(word)
}

/** How many are marked, for a host drawing `Done (3)`. */
export function count(state: FeelingCategorySiftState): number {
  return state.marked.length
}

/** The feeling the gloss strip is showing, or null before anything is touched. */
export function gloss(state: FeelingCategorySiftState): Feeling | null {
  return state.words.find((feeling) => feeling.word === state.showing) ?? null
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. The category and
 * nothing else: marking a word is not a new screen, and putting the count in
 * here would take focus off whatever was just tapped, on every tap.
 */
export function screenKey(state: FeelingCategorySiftState): string {
  return `sift:${state.category}`
}
