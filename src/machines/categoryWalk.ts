import { shuffle } from './shuffle.ts'

/** An item the walk has already asked about. */
type Answered<Item> = {
  item: Item
  /** Whether the person said this one applies. */
  picked: boolean
}

/**
 * Where the walk has got to. `current` is a field of `asking` so that a walk in
 * progress without an item to show cannot be written down.
 */
type Progress<Item> =
  | {
      status: 'asking'
      answered: Answered<Item>[]
      current: Item
      upcoming: Item[]
    }
  | { status: 'done'; answered: Answered<Item>[] }

export type CategoryWalkState<Item, Extra extends object = {}> = {
  /** The category being walked through, e.g. 'Engaged'. */
  category: string
  progress: Progress<Item>
} & Extra

export type CategoryWalkAction = { type: 'accept' } | { type: 'reject' }

/**
 * Start a walk through `category`. Items named in `alreadyPicked` are asked
 * about first, so re-opening a category is a quick pass of 'yes, still applies'
 * before the rest. Both groups are shuffled, so no item is always first.
 */
export function init<Item, Extra extends object = {}>(
  category: { name: string } & Extra,
  items: readonly Item[],
  getKey: (item: Item) => string,
  alreadyPicked: readonly string[] = [],
  rng: () => number = Math.random,
): CategoryWalkState<Item, Extra> {
  const wasPicked = new Set(alreadyPicked)
  const order = [
    ...shuffle(items.filter((item) => wasPicked.has(getKey(item))), rng),
    ...shuffle(items.filter((item) => !wasPicked.has(getKey(item))), rng),
  ]
  const [current, ...upcoming] = order

  return {
    ...category,
    category: category.name,
    // An empty category has nothing to ask, so the walk is over before it began.
    progress: current
      ? { status: 'asking', answered: [], current, upcoming }
      : { status: 'done', answered: [] },
  }
}

/** Answer the current item and move on. The walk only runs forwards. */
export function reduce<Item, Extra extends object = {}>(
  state: CategoryWalkState<Item, Extra>,
  action: CategoryWalkAction,
): CategoryWalkState<Item, Extra> {
  if (state.progress.status === 'done') return state

  const { answered, current, upcoming } = state.progress
  const next = [...answered, { item: current, picked: action.type === 'accept' }]
  const [head, ...rest] = upcoming

  return {
    ...state,
    progress: head
      ? { status: 'asking', answered: next, current: head, upcoming: rest }
      : { status: 'done', answered: next },
  }
}

/** Whether every item in the category has been asked about. */
export function isDone<Item, Extra extends object = {}>(
  state: CategoryWalkState<Item, Extra>,
): boolean {
  return state.progress.status === 'done'
}

/**
 * The items the person said applied, in the order they were asked. Readable
 * part way through as well as at the end, so a host that closes a walk early
 * can still keep what was picked.
 */
export function picked<Item, Extra extends object = {}>(
  state: CategoryWalkState<Item, Extra>,
): Item[] {
  return state.progress.answered
    .filter((answer) => answer.picked)
    .map((answer) => answer.item)
}

/**
 * Which screen a host is looking at, for `useFocusScreen`. A walk is only ever
 * the prompt, and every answer puts a different item on it.
 */
export function screenKey<Item, Extra extends object = {}>(
  state: CategoryWalkState<Item, Extra>,
): string {
  return `prompt:${state.category}:${state.progress.answered.length}`
}
