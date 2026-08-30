import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import NeedPicker from '../src/components/NeedPicker.tsx'
import { categories } from '../src/data/needs.ts'
import {
  chosen,
  count,
  init,
  isNoting,
  initWith,
  reduce,
  screen,
  screenKey,
  visitCategory,
} from '../src/machines/needPicker.ts'
import type {
  NeedPickerAction,
  NeedPickerState,
  Visited,
} from '../src/machines/needPicker.ts'
import { useFocusScreen } from '../src/focusScreen.ts'
import { submitShortcutLabel, useSubmitShortcut } from '../src/keyboard.ts'
import Credit from './Credit.tsx'

/** What the modal is called, and so what the way out of a walk points back at. */
const TITLE = 'Needs'

type Props = {
  /** Obsidian's title bar, which the heading is drawn into. */
  titleEl: HTMLElement
  /** The button row. A sibling of the scrolling body, not part of it. */
  footerEl: HTMLElement
  /**
   * What a block already holds, in the order it reads in the note — present
   * only when this is an edit. One prop rather than a seed and a flag: there
   * is no such thing here as an edit of nothing, so the two could only ever
   * disagree.
   */
  initial?: readonly Visited[]
  /** Called with what to insert. Cancelling never calls this. */
  onSubmit: (entries: Visited[]) => void
  /** Close, insert nothing. */
  onCancel: () => void
  /**
   * Handed the way off whichever screen is on top, whenever that is not the
   * categories, and null on the way back to them — which is what tells the
   * modal's own `x` and Escape they are speaking for the whole modal again.
   */
  onLeaveTopChange: (leaveTop: (() => void) | null) => void
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
  initial,
  onSubmit,
  onCancel,
  onLeaveTopChange,
}: Props) {
  /* Reversed on the way in and reversed again on the way out, so an edit that
     changes nothing writes back the text it opened — see the `Insert` handler
     below for the other half of the round trip. */
  const [state, setState] = useState<NeedPickerState>(() =>
    initial ? initWith(categories, [...initial].reverse()) : init(categories),
  )

  const dispatch = (action: NeedPickerAction) =>
    setState((current) => reduce(current, action))

  const bodyRef = useFocusScreen(screenKey(state))

  const view = screen(state)
  /* While a note is being written, the drawer is the screen on top and this
     row belongs to the one parked under it. Nothing here can be answered until
     the note is kept or dropped — which the `x` and Escape both do, since they
     mean whatever is on top. */
  const noting = isNoting(state)

  const leaveTop = () => dispatch({ type: 'close' })

  /* Obsidian's title bar is its own, and so is the `x` in the corner of it.
     Both it and Escape land in `Modal.close`, which has no way to see which
     screen is on top from where it sits — so anything above the categories
     leaves the way off itself here, and takes it away again on the way back to
     them. `dispatch` reads the state it is given rather than the one it closed
     over, so what is left here does not go stale between renders. */
  useEffect(() => {
    onLeaveTopChange(state.visit ? leaveTop : null)
    return () => onLeaveTopChange(null)
  })

  const total = count(state)
  /* An edit replaces a block that is already in the note, so the button is not
     offering to put anything anywhere. Saving nothing is how a block is taken
     back out, which is why the word has to hold with no count beside it. */
  const commit = initial ? 'Save' : 'Insert'

  /* Newest-closed first is what puts the last card top-left. Read top to
     bottom in a note, the order you visited them reads better. Shared by the
     button and the shortcut so the two commit identically. */
  const submit = () => onSubmit([...chosen(state)].reverse())

  /* ⌘/Ctrl+Enter stands in for the commit button itself, so it only fires
     while that button is the one on screen — a walk or a sift has no such
     button to commit the modal early. */
  useSubmitShortcut(view === 'browse', submit)

  /* Both bars speak for the screen on top, which is the same rule the `x`
     follows. The way back is labelled with the screen it returns to rather than
     with the move — 'back' alone leaves open what becomes of the answers
     already given. From a walk that is the category it started in, because that
     is where its answers land. */
  const heading =
    view === 'browse' ? (
      <>{TITLE}</>
    ) : view === 'walk' ? (
      <button
        type="button"
        className="nvc-back"
        disabled={noting}
        onClick={leaveTop}
      >
        <span aria-hidden="true">&lsaquo;</span>{' '}
        {visitCategory(state) ?? TITLE}
      </button>
    ) : null

  /* A walk is still drawn with no button row at all: it is one question, and
     answering it is the only way to move. The grid has two ways on and they
     both belong here, out of reach of a list long enough to scroll. */
  const buttons =
    view === 'browse' ? (
      <>
        <button type="button" disabled={noting} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="mod-cta"
          disabled={noting}
          title={`${commit} (${submitShortcutLabel})`}
          /* Newest-closed first is what puts the last card top-left. Read top
             to bottom in a note, the order you visited them reads better. */
          onClick={submit}
        >
          {total > 0 ? `${commit} (${total})` : commit} {submitShortcutLabel}
        </button>
      </>
    ) : view === 'sift' ? (
      <>
        <button
          type="button"
          disabled={noting}
          onClick={() => dispatch({ type: 'walk' })}
        >
          Ask me about each
        </button>
        <button
          type="button"
          className="mod-cta"
          disabled={noting}
          onClick={leaveTop}
        >
          Done
        </button>
      </>
    ) : null

  return (
    <>
      {createPortal(heading, titleEl)}
      <div ref={bodyRef}>
        <NeedPicker state={state} onAction={dispatch} />
        {/* Only while browsing: a screen inside a category is either one
            question or a long grid, and neither has room to spare — the credit
            is as visible either way. */}
        {view === 'browse' && <Credit />}
      </div>
      {createPortal(buttons, footerEl)}
    </>
  )
}
