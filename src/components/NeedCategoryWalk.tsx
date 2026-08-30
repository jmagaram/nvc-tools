import NeedPrompt from './NeedPrompt.tsx'
import { noteFor } from '../machines/needCategoryWalk.ts'
import type {
  NeedCategoryWalkAction,
  NeedCategoryWalkState,
} from '../machines/needCategoryWalk.ts'

type Props = {
  /** Where the walk has got to. */
  state: NeedCategoryWalkState
  /**
   * Called with whatever was just done to the need on screen — answered, or
   * written about. A note is part of an answer rather than one of its own.
   */
  onAction: (action: NeedCategoryWalkAction) => void
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
