import FeelingPrompt from './FeelingPrompt.tsx'
import type {
  FeelingPickerAction,
  FeelingPickerState,
} from '../machines/feelingPicker.ts'

type Props = {
  /** Where the walk has got to. */
  state: FeelingPickerState
  /** Called with the answer the person gave to the feeling on screen. */
  onAction: (action: FeelingPickerAction) => void
}

export default function FeelingPicker({ state, onAction }: Props) {
  // A finished walk has nothing left to ask. What that looks like — a summary,
  // a closing dialog — belongs to whatever is hosting the picker.
  if (state.walk.status === 'done') return null

  const { answered, current, upcoming } = state.walk

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
