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

export type CategoryWalkState = {
  /** The category being walked through, e.g. 'Engaged'. */
  category: string
  /** Whether the category signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
  progress: Progress
}

export type CategoryWalkAction = { type: 'accept' } | { type: 'reject' }

/**
 * Start a walk through `category`. Feelings named in `alreadyPicked` are asked
 * about first, so re-opening a category is a quick pass of 'yes, still applies'
 * before the rest. Both groups are shuffled, so no feeling is always first.
 */
export function init(
  category: FeelingCategory,
  alreadyPicked: readonly string[] = [],
  rng: () => number = Math.random,
): CategoryWalkState {
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
  }
}

/** Answer the current feeling and move on. The walk only runs forwards. */
export function reduce(
  state: CategoryWalkState,
  action: CategoryWalkAction,
): CategoryWalkState {
  if (state.progress.status === 'done') return state

  const { answered, current, upcoming } = state.progress
  const next = [...answered, { feeling: current, picked: action.type === 'accept' }]
  const [head, ...rest] = upcoming

  return {
    ...state,
    progress: head
      ? { status: 'asking', answered: next, current: head, upcoming: rest }
      : { status: 'done', answered: next },
  }
}

/** Whether every feeling in the category has been asked about. */
export function isDone(state: CategoryWalkState): boolean {
  return state.progress.status === 'done'
}

/**
 * The feelings the person said applied, in the order they were asked. Readable
 * part way through as well as at the end, so a host that closes a walk early
 * can still keep what was picked.
 */
export function picked(state: CategoryWalkState): Feeling[] {
  return state.progress.answered
    .filter((answer) => answer.picked)
    .map((answer) => answer.feeling)
}
