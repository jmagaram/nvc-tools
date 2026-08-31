import type { Feeling, FeelingCategory } from '../data/feelings.ts'
import { shuffle } from './shuffle.ts'

/** A feeling the walk has already asked about. */
type Answered = {
  feeling: Feeling
  /** Whether the person said this one applies. */
  picked: boolean
}

/**
 * Where the walk has got to. `current` is a field of `asking` so that a walk in
 * progress without a feeling to show cannot be written down.
 */
type Progress =
  | {
      status: 'asking'
      answered: Answered[]
      current: Feeling
      upcoming: Feeling[]
    }
  | { status: 'done'; answered: Answered[] }

/**
 * A few words of someone's own about one feeling, while the walk is still
 * asking about it. Never blank — an emptied box is how a note is deleted — and
 * never held for a word the walk has passed over.
 */
export type Note = {
  word: string
  text: string
}

/** The word a note is being written about, and what is in the box. */
export type Noting = {
  word: string
  draft: string
}

export type FeelingCategoryWalkState = {
  /** The category being walked through, e.g. 'Engaged'. */
  category: string
  /** Whether the category signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
  progress: Progress
  /**
   * What has been written, about the card on screen or about one already kept.
   * A note on an unanswered card is not yet a note on a picked word: nothing on
   * a card is decided until it is answered, and `feelingPicker.fold` is where
   * the two become the same thing.
   */
  notes: readonly Note[]
  /** The note being written, or null when the card is what is on top. */
  noting: Noting | null
}

/**
 * What the card can be told. Two of these answer it and deal the next one; the
 * rest are the note being written about the card on screen, which is part of
 * the answer rather than a substitute for it — keeping one leaves the card
 * exactly where it was.
 */
export type FeelingCategoryWalkAction =
  | { type: 'accept' }
  | { type: 'reject' }
  /** Write a note about the card on screen, or open the one already there. */
  | { type: 'note' }
  /** What is in the box now. */
  | { type: 'draft'; text: string }
  /** Keep what is in the box. An emptied box deletes the note there was. */
  | { type: 'keepNote' }
  /** Close the drawer and leave the note as it was found. */
  | { type: 'dropNote' }

/**
 * Start a walk through `category`. Feelings named in `alreadyPicked` are asked
 * about first, so re-opening a category is a quick pass of 'yes, still applies'
 * before the rest. Both groups are shuffled, so no feeling is always first.
 */
export function init(
  category: FeelingCategory,
  alreadyPicked: readonly string[] = [],
  alreadyNoted: readonly Note[] = [],
  rng: () => number = Math.random,
): FeelingCategoryWalkState {
  const wasPicked = new Set(alreadyPicked)
  const order = [
    ...shuffle(
      category.feelings.filter((feeling) => wasPicked.has(feeling.word)),
      rng,
    ),
    ...shuffle(
      category.feelings.filter((feeling) => !wasPicked.has(feeling.word)),
      rng,
    ),
  ]
  const [current, ...upcoming] = order

  return {
    category: category.name,
    kind: category.kind,
    // An empty category has nothing to ask, so the walk is over before it began.
    progress: current
      ? { status: 'asking', answered: [], current, upcoming }
      : { status: 'done', answered: [] },
    // Whatever the grid was told about these words comes along, so a word
    // walked after being written about arrives with its note on the card.
    notes: alreadyNoted.filter((note) => wasPicked.has(note.word)),
    noting: null,
  }
}

/** Answer the current feeling and move on. The walk only runs forwards. */

export function reduce(
  state: FeelingCategoryWalkState,
  action: FeelingCategoryWalkAction,
): FeelingCategoryWalkState {
  if (state.progress.status === 'done') return state
  const { answered, current, upcoming } = state.progress

  switch (action.type) {
    case 'note':
      return {
        ...state,
        noting: {
          word: current.word,
          draft: noteFor(state, current.word) ?? '',
        },
      }

    case 'draft':
      return state.noting
        ? { ...state, noting: { ...state.noting, draft: action.text } }
        : state

    case 'keepNote': {
      if (!state.noting) return state
      const { word, draft } = state.noting
      // A blank box is the delete, and the card stays where it was either way:
      // what was written is part of the answer, not the answer itself.
      const text = draft.trim()
      const rest = state.notes.filter((note) => note.word !== word)
      return {
        ...state,
        notes: text ? [...rest, { word, text }] : rest,
        noting: null,
      }
    }

    case 'dropNote':
      return state.noting ? { ...state, noting: null } : state

    case 'accept':
    case 'reject': {
      const picked = action.type === 'accept'
      const next = [...answered, { feeling: current, picked }]
      const [head, ...rest] = upcoming

      return {
        ...state,
        progress: head
          ? { status: 'asking', answered: next, current: head, upcoming: rest }
          : { status: 'done', answered: next },
        // Passing on a word takes what was written about it: there is no such
        // thing as a note on a feeling that does not apply.
        notes: picked
          ? state.notes
          : state.notes.filter((note) => note.word !== current.word),
        noting: null,
      }
    }
  }
}

/** What is written about `word`, if anything. */
export function noteFor(
  state: FeelingCategoryWalkState,
  word: string,
): string | null {
  return state.notes.find((note) => note.word === word)?.text ?? null
}

/** Whether the drawer is open over the card. */
export function isNoting(state: FeelingCategoryWalkState): boolean {
  return state.noting !== null
}

/** Whether every feeling in the category has been asked about. */
export function isDone(state: FeelingCategoryWalkState): boolean {
  return state.progress.status === 'done'
}

/**
 * The feelings the person said applied, in the order they were asked. Readable
 * part way through as well as at the end, so a host that closes a walk early
 * can still keep what was picked.
 */
export function picked(state: FeelingCategoryWalkState): Feeling[] {
  return state.progress.answered
    .filter((answer) => answer.picked)
    .map((answer) => answer.feeling)
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. A walk is the
 * prompt, and every answer puts a different feeling on it — or the drawer over
 * it, which is a screen of its own and has to be given the box to type in.
 */
export function screenKey(state: FeelingCategoryWalkState): string {
  if (state.noting) return `note:${state.category}:${state.noting.word}`
  return `prompt:${state.category}:${state.progress.answered.length}`
}
