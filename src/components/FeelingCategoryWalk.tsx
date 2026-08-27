import FeelingPrompt from './FeelingPrompt.tsx'
import type {
  CategoryWalkAction,
  CategoryWalkState,
} from '../machines/categoryWalk.ts'
import type { Feeling } from '../data/feelings.ts'

type FeelingCategoryWalkState = CategoryWalkState<
  Feeling,
  { kind: 'met' | 'unmet' }
>

type Props = {
  /** Where the walk has got to. */
  state: FeelingCategoryWalkState
  /** Called with the answer the person gave to the feeling on screen. */
  onAction: (action: CategoryWalkAction) => void
}

export default function FeelingCategoryWalk({ state, onAction }: Props) {
  // A finished walk has nothing left to ask. What that looks like — a summary,
  // a closing dialog — belongs to whatever is hosting the picker.
  if (state.progress.status === 'done') return null

  const { answered, current, upcoming } = state.progress

  return (
    <FeelingPrompt
      word={current.word}
      category={state.category}
      definition={current.definition}
      kind={state.kind}
      past={answered.map((answer) => (answer.picked ? 'chosen' : 'skipped'))}
      upcoming={upcoming.length}
      onAccept={() => onAction({ type: 'accept' })}
      onReject={() => onAction({ type: 'reject' })}
    />
  )
}
