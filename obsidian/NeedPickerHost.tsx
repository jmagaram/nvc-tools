import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import NeedPicker from '../src/components/NeedPicker.tsx'
import { categories } from '../src/data/needs.ts'
import {
  chosen,
  count,
  init,
  reduce,
  screenKey,
} from '../src/machines/needPicker.ts'
import type {
  NeedPickerAction,
  NeedPickerState,
  Visited,
} from '../src/machines/needPicker.ts'
import { useFocusScreen } from '../src/focusScreen.ts'
import Credit from './Credit.tsx'

/** What the modal is called, and so what the way out of a walk points back at. */
const TITLE = 'Needs'

type Props = {
  /** Obsidian's title bar, which the heading is drawn into. */
  titleEl: HTMLElement
  /** The button row. A sibling of the scrolling body, not part of it. */
  footerEl: HTMLElement
  /** Called with what to insert. Cancelling never calls this. */
  onSubmit: (entries: Visited[]) => void
  /** Close, insert nothing. */
  onCancel: () => void
  /**
   * Handed the way out of a walk whenever there is one, and null on the way
   * back to the categories — which is what tells the modal's own `x` and
   * Escape they are speaking for the whole modal again.
   */
  onWalkChange: (leaveWalk: (() => void) | null) => void
}

/**
 * The needs half of the plugin, kept line for line alongside
 * `FeelingPickerHost` the way `needPicker.ts` is kept alongside
 * `feelingPicker.ts`. Two hosts that disagreed about what Back means would be
 * worse than two that repeat themselves.
 *
 * What differs is only what the data differs by: one count rather than two,
 * because there is no met/unmet split here to label tabs with.
 *
 * Both bars are drawn through portals, because Obsidian owns where they go: the
 * title bar is its own element, and the button row has to be a sibling of the
 * scrolling content rather than inside it, or it would scroll away with it.
 * One React root still drives all three.
 */
export default function NeedPickerHost({
  titleEl,
  footerEl,
  onSubmit,
  onCancel,
  onWalkChange,
}: Props) {
  const [state, setState] = useState<NeedPickerState>(() => init(categories))

  const dispatch = (action: NeedPickerAction) =>
    setState((current) => reduce(current, action))

  const bodyRef = useFocusScreen(screenKey(state))

  /* Obsidian's title bar is its own, and so is the `x` in the corner of it.
     Both it and Escape land in `Modal.close`, which has no way to see a walk
     from where it sits — so the walk leaves the way out of itself here, and
     takes it away again on the way back to the categories. `dispatch` reads
     the state it is given rather than the one it closed over, so what is left
     here does not go stale between renders. */
  useEffect(() => {
    onWalkChange(state.walk ? () => dispatch({ type: 'close' }) : null)
    return () => onWalkChange(null)
  })

  const total = count(state)

  /* Two scopes, two regions, and only one way out of a walk. The title bar owns
     the walk: it names the modal at the top level and holds the way back a
     level down, labelled with the title it is going back to rather than with
     the move — 'back' alone leaves open what becomes of the answers already
     given. The button row only ever speaks for the whole modal, never for the
     category, so a walk gives it nothing to say and it is not drawn at all. */
  const heading = state.walk ? (
    <button
      type="button"
      className="nvc-back"
      onClick={() => dispatch({ type: 'close' })}
    >
      <span aria-hidden="true">&lsaquo;</span> {TITLE}
    </button>
  ) : (
    <>{TITLE}</>
  )

  const buttons = state.walk ? null : (
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
        <NeedPicker state={state} onAction={dispatch} />
        {/* Only while browsing: the walk screen is one question at a time and
            has no room to spare, and the credit is as visible either way. */}
        {!state.walk && <Credit />}
      </div>
      {createPortal(buttons, footerEl)}
    </>
  )
}
