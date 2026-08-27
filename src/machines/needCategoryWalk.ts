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

export type NeedCategoryWalkState = {
  /** The category being walked through, e.g. 'Autonomy'. */
  category: string
  progress: Progress
}

export type NeedCategoryWalkAction = { type: 'accept' } | { type: 'reject' }

/**
 * Start a walk through `category`. Needs named in `alreadyPicked` are asked
 * about first, so re-opening a category is a quick pass of 'yes, still applies'
 * before the rest. Both groups are shuffled, so no need is always first.
 */
export function init(
  category: NeedCategory,
  alreadyPicked: readonly string[] = [],
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
  }
}

/** Answer the current need and move on. The walk only runs forwards. */
export function reduce(
  state: NeedCategoryWalkState,
  action: NeedCategoryWalkAction,
): NeedCategoryWalkState {
  if (state.progress.status === 'done') return state

  const { answered, current, upcoming } = state.progress
  const next = [...answered, { need: current, picked: action.type === 'accept' }]
  const [head, ...rest] = upcoming

  return {
    ...state,
    progress: head
      ? { status: 'asking', answered: next, current: head, upcoming: rest }
      : { status: 'done', answered: next },
  }
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
