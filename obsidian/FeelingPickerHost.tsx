import { useState } from 'react'
import { createPortal } from 'react-dom'
import FeelingPicker from '../src/components/FeelingPicker.tsx'
import { categories } from '../src/data/feelings.ts'
import { chosen, counts, init, reduce } from '../src/machines/feelingPicker.ts'
import type {
  FeelingPickerAction,
  FeelingPickerState,
  Visited,
} from '../src/machines/feelingPicker.ts'
import Credit from './Credit.tsx'
import { useFocusPrompt } from './useFocusPrompt.ts'

type Props = {
  /** Obsidian's title bar, which the heading is drawn into. */
  titleEl: HTMLElement
  /** The button row. A sibling of the scrolling body, not part of it. */
  footerEl: HTMLElement
  /** Called with what to insert. Cancelling never calls this. */
  onSubmit: (entries: Visited[]) => void
  /** Close, insert nothing. */
  onCancel: () => void
}

/**
 * The host the picker has always been written for: it owns the state, dispatches
 * through the machine, and decides what the two bars say.
 *
 * This is `FeelingPickerDemo` with the demo controls taken off. What is left is
 * the same contract — `init` on mount, `reduce` on every action, `chosen` on OK.
 * Everything Obsidian-shaped is next door in `FeelingPickerModal`.
 *
 * Both bars are drawn through portals, because Obsidian owns where they go: the
 * title bar is its own element, and the button row has to be a sibling of the
 * scrolling content rather than inside it, or it would scroll away with it.
 * One React root still drives all three.
 */
export default function FeelingPickerHost({
  titleEl,
  footerEl,
  onSubmit,
  onCancel,
}: Props) {
  const [state, setState] = useState<FeelingPickerState>(() => init(categories))

  const dispatch = (action: FeelingPickerAction) =>
    setState((current) => reduce(current, action))

  const bodyRef = useFocusPrompt(state.walk)

  const totals = counts(state)
  const total = totals.met + totals.unmet

  /* Two scopes, two regions. The title bar owns the walk: it names the modal at
     the top level and offers the way back a level down. The button row only
     ever speaks for the whole modal — never for the category — so during a walk
     it holds the one thing left to say, which is the same 'close' the back
     button raises, worded for someone who is counting questions rather than
     screens. */
  const heading = state.walk ? (
    <button
      type="button"
      className="nvc-back"
      onClick={() => dispatch({ type: 'close' })}
    >
      <span aria-hidden="true">&lsaquo;</span> Back
    </button>
  ) : (
    <>How are you feeling?</>
  )

  const buttons = state.walk ? (
    <button type="button" onClick={() => dispatch({ type: 'close' })}>
      Skip Rest
    </button>
  ) : (
    <>
      <button type="button" onClick={onCancel}>
        Cancel
      </button>
      <button
        type="button"
        className="mod-cta"
        /* Newest-walked first is what puts the last card top-left. Read top to
           bottom in a note, the order you walked them reads better. */
        onClick={() => onSubmit([...chosen(state)].reverse())}
      >
        OK ({total})
      </button>
    </>
  )

  return (
    <>
      {createPortal(heading, titleEl)}
      <div ref={bodyRef}>
        <FeelingPicker state={state} onAction={dispatch} />
        {/* Only while browsing: the walk screen is one question at a time and
            has no room to spare, and the credit is as visible either way. */}
        {!state.walk && <Credit />}
      </div>
      {createPortal(buttons, footerEl)}
    </>
  )
}
