import { useState } from 'react'
import type { CSSProperties } from 'react'
import NeedPicker from '../components/NeedPicker.tsx'
import { useFocusScreen } from '../focusScreen.ts'
import ModalFrame from '../components/ModalFrame.tsx'
import type { ModalHeading } from '../components/ModalFrame.tsx'
import DeviceSelect from './DeviceSelect.tsx'
import { devices } from './devices.ts'
import styles from './devices.module.css'
import { categories } from '../data/needs.ts'
import {
  chosen,
  count,
  init,
  reduce,
  screen,
  screenKey,
  visitCategory,
} from '../machines/needPicker.ts'
import type {
  NeedPickerAction,
  NeedPickerState,
  Visited,
} from '../machines/needPicker.ts'

/** What the modal is called, and so what the way out of a walk points back at. */
const TITLE = 'Needs'

/** How the modal was last dismissed, so Insert and Cancel read as different. */
type LastClose =
  | { kind: 'open' }
  | { kind: 'cancelled' }
  | { kind: 'inserted'; entries: Visited[] }

export default function NeedPickerDemo() {
  const [state, setState] = useState<NeedPickerState>(() => init(categories))
  const [inModal, setInModal] = useState(false)
  const [device, setDevice] = useState(devices[0])
  /* Narrower than Obsidian's 560px default, matching FeelingPickerDemo. The
     walk shows one need at a time and the browse view is a wrap-flow of pills,
     so nothing here wants width. */
  const [dialogWidth, setDialogWidth] = useState(420)
  const [lastClose, setLastClose] = useState<LastClose>({ kind: 'open' })

  const dispatch = (action: NeedPickerAction) =>
    setState((current) => reduce(current, action))

  const restart = () => {
    setState(init(categories))
    setLastClose({ kind: 'open' })
  }

  /* A host closes the modal and starts the next one from scratch, so both of
     these throw the state away. What sets them apart is what they take with
     them, which is the whole point of showing them here. */
  const cancel = () => {
    setState(init(categories))
    setLastClose({ kind: 'cancelled' })
  }
  const ok = () => {
    setLastClose({ kind: 'inserted', entries: chosen(state) })
    setState(init(categories))
  }

  const picked = chosen(state)
  const total = count(state)

  /* Both bars speak for the screen on top, which is the same rule the close
     button follows. Three screens, and neither bar carries the same thing on
     all three: a grid has no title, a walk has no button row.

     The way back is labelled with the screen it returns to rather than with the
     move — 'back' alone leaves open what becomes of the answers already given.
     From a walk that is the category it started in, because that is where its
     answers land. */
  const view = screen(state)

  const leaveTop = () => dispatch({ type: 'close' })

  /* A grid's bar is empty. `Done` and the close button both leave the category
     keeping its marks, so a third control saying the same would be noise — and
     a '‹ Feelings' the size of the heading below reads as two titles
     disagreeing about which screen you are on. The grid names itself instead. */
  const heading: ModalHeading | null =
    view === 'browse'
      ? { kind: 'title', text: TITLE }
      : view === 'walk'
        ? {
            kind: 'back',
            label: visitCategory(state) ?? TITLE,
            onBack: leaveTop,
          }
        : null

  /* A walk is still drawn with no button row at all: it is one question, and
     answering it is the only way to move. The grid has two ways on and they
     both belong up here, out of reach of a list long enough to scroll. */
  const footer =
    view === 'browse' ? (
      <>
        <button type="button" onClick={cancel}>
          Cancel
        </button>
        <button type="button" onClick={ok}>
          {total > 0 ? `Insert (${total})` : 'Insert'}
        </button>
      </>
    ) : view === 'sift' ? (
      <>
        <button type="button" onClick={() => dispatch({ type: 'walk' })}>
          Ask me about each
        </button>
        <button type="button" onClick={leaveTop}>
          Done
        </button>
      </>
    ) : null

  /* Every screen here opens from a control that is gone the moment it does, so
     each one is handed the focus: the grid so Tab starts inside it, the prompt
     so the arrow keys answer straight away. A modal host does the same. */
  const bodyRef = useFocusScreen(screenKey(state))

  const picker = (
    <div ref={bodyRef}>
      <NeedPicker state={state} onAction={dispatch} />
    </div>
  )

  return (
    <>
      <label>
        <button type="button" onClick={restart}>
          Start over
        </button>
      </label>
      <label>
        <input
          type="checkbox"
          checked={inModal}
          onChange={(e) => setInModal(e.target.checked)}
        />{' '}
        Show in a modal frame
      </label>
      {inModal && <DeviceSelect value={device} onChange={setDevice} />}
      {/* A phone takes the whole screen either way, so this only bites on a
          desktop, which is the only place there is spare width to give back. */}
      {inModal && device.size === 'desktop' && (
        <label>
          Modal width{' '}
          <input
            type="number"
            min={280}
            max={900}
            step={20}
            value={dialogWidth}
            onChange={(e) => setDialogWidth(Number(e.target.value))}
          />
        </label>
      )}
      <hr />

      {inModal ? (
        <div
          className={`${styles.screen} ${styles[device.size]}`}
          style={
            {
              width: device.width,
              height: device.height,
              '--dialog-width': `${dialogWidth}px`,
            } as CSSProperties
          }
        >
          <ModalFrame
            heading={heading}
            size={device.size}
            /* Closing is leaving whatever is on top: the walk from a walk, the
               category from its grid, the modal from the categories. Same as
               the way back beside it, so nothing inside a category can lose a
               pick. */
            onClose={state.visit ? leaveTop : cancel}
            footer={footer}
          >
            {picker}
          </ModalFrame>
        </div>
      ) : (
        <>
          {picker}
          {/* Bare, the picker has no chrome to leave a category from or to go
              on with, so the demo stands in for the host the same way the modal
              bars do — same words, so what a host has to provide is plain. */}
          {state.visit && (
            <p>
              {view === 'sift' ? (
                <>
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'walk' })}
                  >
                    Ask me about each
                  </button>{' '}
                  <button type="button" onClick={leaveTop}>
                    Done
                  </button>
                </>
              ) : (
                <button type="button" onClick={leaveTop}>
                  <span aria-hidden="true">&lsaquo;</span>{' '}
                  {visitCategory(state) ?? TITLE}
                </button>
              )}
            </p>
          )}
        </>
      )}

      <h2>Chosen so far</h2>
      {picked.length === 0 ? (
        <p>Nothing chosen yet.</p>
      ) : (
        <ul>
          {picked.map((entry) => (
            <li key={entry.category}>
              {entry.category}: {entry.words.join(', ')}
            </li>
          ))}
        </ul>
      )}

      {/* What the host would have done with it — the difference between the two
          buttons that closing alone does not show. */}
      <h2>Last close</h2>
      {lastClose.kind === 'open' && <p>Still open.</p>}
      {lastClose.kind === 'cancelled' && <p>Cancelled — nothing inserted.</p>}
      {lastClose.kind === 'inserted' && (
        <p>
          Inserted:{' '}
          {lastClose.entries.length === 0
            ? 'nothing was chosen'
            : lastClose.entries.flatMap((entry) => entry.words).join(', ')}
        </p>
      )}

      <p>
        A category opens as all of its words at once, in the order the source
        lists them, with whatever was picked there before already marked.{' '}
        <strong>Ask me about each</strong> goes through the whole category
        as cards instead, marked words first, and hands its answers back to the
        grid — so leaving a walk part way through keeps both what it decided and
        what it never reached. Touch or hover a word to read its definition
        without marking it.
      </p>
      <p>
        The category order is shuffled once when the page loads and never
        changes, so the pill row only ever shrinks. Leave a category without
        marking anything and it shows as an empty card until you close another
        one, then it drops back to a pill. There are no tabs here: the met and
        unmet split belongs to the feelings, not to the needs.
      </p>
    </>
  )
}
