import type { Need, NeedCategory } from '../data/needs.ts'
import { shuffle } from './shuffle.ts'

/** A need the walk has already asked about. */
type Answered = {
  need: Need
  /** Whether the person said this one applies. */
  picked: boolean
}

/**
 * Where the walk has got to. `current` is a field of `asking` so that a walk in
 * progress without a need to show cannot be written down.
 */
type Progress =
  | {
      status: 'asking'
      answered: Answered[]
      current: Need
      upcoming: Need[]
    }
  | { status: 'done'; answered: Answered[] }

/**
 * A few words of someone's own about one need, while the walk is still
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

export type NeedCategoryWalkState = {
  /** The category being walked through, e.g. 'Autonomy'. */
  category: string
  progress: Progress
  /**
   * What has been written, about the card on screen or about one already kept.
   * A note on an unanswered card is not yet a note on a picked word: nothing on
   * a card is decided until it is answered, and `needPicker.fold` is where
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
export type NeedCategoryWalkAction =
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
 * Start a walk through `category`. Needs named in `alreadyPicked` are asked
 * about first, so re-opening a category is a quick pass of 'yes, still applies'
 * before the rest. Both groups are shuffled, so no need is always first.
 */
export function init(
  category: NeedCategory,
  alreadyPicked: readonly string[] = [],
  alreadyNoted: readonly Note[] = [],
  rng: () => number = Math.random,
): NeedCategoryWalkState {
  const wasPicked = new Set(alreadyPicked)
  const order = [
    ...shuffle(
      category.needs.filter((need) => wasPicked.has(need.word)),
      rng,
    ),
    ...shuffle(
      category.needs.filter((need) => !wasPicked.has(need.word)),
      rng,
    ),
  ]
  const [current, ...upcoming] = order

  return {
    category: category.name,
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

/** Answer the current need and move on. The walk only runs forwards. */

export function reduce(
  state: NeedCategoryWalkState,
  action: NeedCategoryWalkAction,
): NeedCategoryWalkState {
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
      const next = [...answered, { need: current, picked }]
      const [head, ...rest] = upcoming

      return {
        ...state,
        progress: head
          ? { status: 'asking', answered: next, current: head, upcoming: rest }
          : { status: 'done', answered: next },
        // Passing on a word takes what was written about it: there is no such
        // thing as a note on a need that does not apply.
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
  state: NeedCategoryWalkState,
  word: string,
): string | null {
  return state.notes.find((note) => note.word === word)?.text ?? null
}

/** Whether the drawer is open over the card. */
export function isNoting(state: NeedCategoryWalkState): boolean {
  return state.noting !== null
}

/** Whether every need in the category has been asked about. */
export function isDone(state: NeedCategoryWalkState): boolean {
  return state.progress.status === 'done'
}

/**
 * The needs the person said applied, in the order they were asked. Readable
 * part way through as well as at the end, so a host that closes a walk early
 * can still keep what was picked.
 */
export function picked(state: NeedCategoryWalkState): Need[] {
  return state.progress.answered
    .filter((answer) => answer.picked)
    .map((answer) => answer.need)
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. A walk is the
 * prompt, and every answer puts a different need on it — or the drawer over
 * it, which is a screen of its own and has to be given the box to type in.
 */
export function screenKey(state: NeedCategoryWalkState): string {
  if (state.noting) return `note:${state.category}:${state.noting.word}`
  return `prompt:${state.category}:${state.progress.answered.length}`
}
