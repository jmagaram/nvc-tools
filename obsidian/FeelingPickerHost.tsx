import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import FeelingPicker from '../src/components/FeelingPicker.tsx'
import { categories } from '../src/data/feelings.ts'
import {
  chosen,
  counts,
  init,
  initWith,
  reduce,
  screen,
  screenKey,
  visitCategory,
} from '../src/machines/feelingPicker.ts'
import type {
  FeelingPickerAction,
  FeelingPickerState,
  Visited,
} from '../src/machines/feelingPicker.ts'
import { useFocusScreen } from '../src/focusScreen.ts'
import { useSubmitShortcut } from '../src/keyboard.ts'
import { submitShortcut } from './shortcut.ts'
import Credit from './Credit.tsx'

/** What the modal is called, and so what the way out of a walk points back at. */
const TITLE = 'Feelings'

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
 * The host the picker has always been written for: it owns the state, dispatches
 * through the machine, and decides what the two bars say.
 *
 * This is `FeelingPickerDemo` with the demo controls taken off. What is left is
 * the same contract — `init` on mount, `reduce` on every action, `chosen` on
 * `Insert`. Everything Obsidian-shaped is next door in `FeelingPickerModal`.
 *
 * Both bars are drawn through portals, because Obsidian owns where they go: the
 * title bar is its own element, and the button row has to be a sibling of the
 * scrolling content rather than inside it, or it would scroll away with it.
 * One React root still drives all three.
 */
export default function FeelingPickerHost({
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
  const [state, setState] = useState<FeelingPickerState>(() =>
    initial ? initWith(categories, [...initial].reverse()) : init(categories),
  )

  const dispatch = (action: FeelingPickerAction) =>
    setState((current) => reduce(current, action))

  const bodyRef = useFocusScreen(screenKey(state))

  const view = screen(state)

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

  const totals = counts(state)
  const total = totals.met + totals.unmet
  /* An edit replaces a block that is already in the note, so the button is not
     offering to put anything anywhere. Saving nothing is how a block is taken
     back out, which is why the word has to hold with no count beside it. */
  const commit = initial ? 'Save' : 'Insert'

  /* Newest-closed first is what puts the last card top-left. Read top to
     bottom in a note, the order you visited them reads better. Shared by the
     button and the shortcut so the two commit identically. */
  const submit = () => onSubmit([...chosen(state)].reverse())

  /* ⌘/Ctrl+Enter stands in for the primary button on the screen: the modal
     commit on the categories and `Done` on a grid. A walk has none. */
  useSubmitShortcut(
    submitShortcut,
    view !== 'walk',
    view === 'browse' ? submit : leaveTop,
  )

  /* Both bars speak for the screen on top, which is the same rule the `x`
     follows. The way back is labelled with the screen it returns to rather than
     with the move — 'back' alone leaves open what becomes of the answers
     already given. From a walk that is the category it started in, because that
     is where its answers land. */
  const heading =
    view === 'browse' ? (
      <>{TITLE}</>
    ) : view === 'walk' ? (
      <button type="button" className="nvc-back" onClick={leaveTop}>
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
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className="mod-cta"
          aria-keyshortcuts={submitShortcut.keys}
          /* Newest-closed first is what puts the last card top-left. Read top
             to bottom in a note, the order you visited them reads better. */
          onClick={submit}
        >
          {total > 0 ? `${commit} (${total})` : commit}
          {/* The chord in its own element rather than in the label, so it can
              be drawn at a hint's weight and taken off a phone, which has
              neither key. `aria-hidden` because the button says the same thing
              properly in `aria-keyshortcuts` above; printed into the label it
              was read out as part of the button's name. */}
          <span className="nvc-chord" aria-hidden="true">
            {submitShortcut.label}
          </span>
        </button>
      </>
    ) : view === 'sift' ? (
      <>
        <button type="button" onClick={() => dispatch({ type: 'walk' })}>
          Ask me about each
        </button>
        <button
          type="button"
          className="mod-cta"
          onClick={leaveTop}
          aria-keyshortcuts={submitShortcut.keys}
        >
          Done
          <span className="nvc-chord" aria-hidden="true">
            {submitShortcut.label}
          </span>
        </button>
      </>
    ) : null

  return (
    <>
      {createPortal(heading, titleEl)}
      <div ref={bodyRef}>
        <FeelingPicker state={state} onAction={dispatch} />
        {/* Only while browsing: a screen inside a category is either one
            question or a long grid, and neither has room to spare — the credit
            is as visible either way. */}
        {view === 'browse' && <Credit />}
      </div>
      {createPortal(buttons, footerEl)}
    </>
  )
}
