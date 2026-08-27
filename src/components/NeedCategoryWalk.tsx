import NeedPrompt from './NeedPrompt.tsx'
import type {
  CategoryWalkAction,
  CategoryWalkState,
} from '../machines/categoryWalk.ts'
import type { Need } from '../data/needs.ts'

type NeedCategoryWalkState = CategoryWalkState<Need>

type Props = {
  /** Where the walk has got to. */
  state: NeedCategoryWalkState
  /** Called with the answer the person gave to the need on screen. */
  onAction: (action: CategoryWalkAction) => void
}

export default function NeedCategoryWalk({ state, onAction }: Props) {
  // A finished walk has nothing left to ask. What that looks like — a summary,
  // a closing dialog — belongs to whatever is hosting the picker.
  if (state.progress.status === 'done') return null

  const { answered, current, upcoming } = state.progress

  return (
    <NeedPrompt
      word={current.word}
      category={state.category}
      definition={current.definition}
      past={answered.map((answer) => (answer.picked ? 'chosen' : 'skipped'))}
      upcoming={upcoming.length}
      onAccept={() => onAction({ type: 'accept' })}
      onReject={() => onAction({ type: 'reject' })}
    />
  )
}
