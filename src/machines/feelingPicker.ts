import type { Feeling, FeelingCategory } from '../data/feelings.ts'

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
type Walk =
  | {
      status: 'asking'
      answered: Answered[]
      current: Feeling
      upcoming: Feeling[]
    }
  | { status: 'done'; answered: Answered[] }

export type FeelingPickerState = {
  /** The category being walked through, e.g. 'Engaged'. */
  category: string
  /** Whether the category signals needs met or needs unmet. */
  kind: 'met' | 'unmet'
  walk: Walk
}

export type FeelingPickerAction = { type: 'accept' } | { type: 'reject' }

/** Fisher-Yates, on a copy. `rng` is a parameter so a walk can be repeatable. */
function shuffle(feelings: readonly Feeling[], rng: () => number): Feeling[] {
  const result = [...feelings]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Start a walk through `category`. Feelings named in `alreadyPicked` are asked
 * about first, so re-opening a category is a quick pass of 'yes, still applies'
 * before the rest. Both groups are shuffled, so no feeling is always first.
 */
export function init(
  category: FeelingCategory,
  alreadyPicked: readonly string[] = [],
  rng: () => number = Math.random,
): FeelingPickerState {
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
    walk: current
      ? { status: 'asking', answered: [], current, upcoming }
      : { status: 'done', answered: [] },
  }
}

/** Answer the current feeling and move on. The walk only runs forwards. */
export function reduce(
  state: FeelingPickerState,
  action: FeelingPickerAction,
): FeelingPickerState {
  if (state.walk.status === 'done') return state

  const { answered, current, upcoming } = state.walk
  const next = [...answered, { feeling: current, picked: action.type === 'accept' }]
  const [head, ...rest] = upcoming

  return {
    ...state,
    walk: head
      ? { status: 'asking', answered: next, current: head, upcoming: rest }
      : { status: 'done', answered: next },
  }
}

/**
 * The feelings the person said applied, in the order they were asked. Readable
 * part way through as well as at the end, so a host that closes a walk early
 * can still keep what was picked.
 */
export function picked(state: FeelingPickerState): Feeling[] {
  return state.walk.answered
    .filter((answer) => answer.picked)
    .map((answer) => answer.feeling)
}
