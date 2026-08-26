import FeelingPrompt from './FeelingPrompt.tsx'
import type {
  CategoryWalkAction,
  CategoryWalkState,
} from '../machines/categoryWalk.ts'

type Props = {
  /** Where the walk has got to. */
  state: CategoryWalkState
  /** Called with the answer the person gave to the feeling on screen. */
  onAction: (action: CategoryWalkAction) => void
}

export default function CategoryWalk({ state, onAction }: Props) {
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
      index={answered.length}
      total={answered.length + 1 + upcoming.length}
      onAccept={() => onAction({ type: 'accept' })}
      onReject={() => onAction({ type: 'reject' })}
    />
  )
}
