import FeelingPrompt from './FeelingPrompt.tsx'
import { noteFor } from '../machines/feelingCategoryWalk.ts'
import type {
  FeelingCategoryWalkAction,
  FeelingCategoryWalkState,
} from '../machines/feelingCategoryWalk.ts'

type Props = {
  /** Where the walk has got to. */
  state: FeelingCategoryWalkState
  /**
   * Called with whatever was just done to the feeling on screen — answered, or
   * written about. A note is part of an answer rather than one of its own.
   */
  onAction: (action: FeelingCategoryWalkAction) => void
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
      note={noteFor(state, current.word)}
      noting={state.noting}
      onNote={() => onAction({ type: 'note' })}
      onDraft={(text) => onAction({ type: 'draft', text })}
      onKeepNote={() => onAction({ type: 'keepNote' })}
      onDropNote={() => onAction({ type: 'dropNote' })}
      onAccept={() => onAction({ type: 'accept' })}
      onReject={() => onAction({ type: 'reject' })}
    />
  )
}
