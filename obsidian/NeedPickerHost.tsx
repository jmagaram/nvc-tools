import { useState } from 'react'
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
}: Props) {
  const [state, setState] = useState<NeedPickerState>(() => init(categories))

  const dispatch = (action: NeedPickerAction) =>
    setState((current) => reduce(current, action))

  const bodyRef = useFocusScreen(screenKey(state))

  const total = count(state)

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
    <>Needs</>
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
        <NeedPicker state={state} onAction={dispatch} />
        {/* Only while browsing: the walk screen is one question at a time and
            has no room to spare, and the credit is as visible either way. */}
        {!state.walk && <Credit />}
      </div>
      {createPortal(buttons, footerEl)}
    </>
  )
}
