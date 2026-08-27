import { useState } from 'react'
import type { CSSProperties } from 'react'
import NeedPicker from '../components/NeedPicker.tsx'
import { useFocusPrompt } from '../focusPrompt.ts'
import ModalFrame from '../components/ModalFrame.tsx'
import type { ModalHeading } from '../components/ModalFrame.tsx'
import DeviceSelect from './DeviceSelect.tsx'
import { devices } from './devices.ts'
import styles from './devices.module.css'
import { categories } from '../data/needs.ts'
import { chosen, count, init, reduce } from '../machines/needPicker.ts'
import type {
  NeedPickerAction,
  NeedPickerState,
  Visited,
} from '../machines/needPicker.ts'

/** How the modal was last dismissed, so OK and Cancel read as different. */
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

  /* Two scopes, two regions. The title bar owns the walk: it names the modal at
     the top level and offers the way back a level down. The button row only
     ever speaks for the whole modal — never for the category — so during a walk
     it holds the one thing left to say, which is the same 'close' the back
     button raises, worded for someone who is counting questions rather than
     screens. */
  const heading: ModalHeading = state.walk
    ? { kind: 'back', label: 'Back', onBack: () => dispatch({ type: 'close' }) }
    : { kind: 'title', text: 'What do you need?' }

  const footer = state.walk ? (
    <button type="button" onClick={() => dispatch({ type: 'close' })}>
      Skip Rest
    </button>
  ) : (
    <>
      <button type="button" onClick={cancel}>
        Cancel
      </button>
      <button type="button" onClick={ok}>
        OK ({total})
      </button>
    </>
  )

  /* A walk opens from a card or a pill that is gone the moment it does, so
     the prompt is given focus and the arrow keys answer straight away. A
     modal host does the same. */
  const bodyRef = useFocusPrompt(state.walk)

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
            // Closing a modal is cancelling, on both screens.
            onClose={cancel}
            footer={footer}
          >
            {picker}
          </ModalFrame>
        </div>
      ) : (
        <>
          {picker}
          {/* Bare, the picker has no chrome to leave a walk from, so the demo
              stands in for the host the same way the modal footer does. */}
          {state.walk && (
            <p>
              <button type="button" onClick={() => dispatch({ type: 'close' })}>
                Skip Rest
              </button>
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
        The category order is shuffled once when the page loads and never
        changes, so the pill row only ever shrinks. Walk a category without
        picking anything and it shows as an empty card until you close another
        one, then it drops back to a pill. There are no tabs here: the met and
        unmet split belongs to the feelings, not to the needs.
      </p>
    </>
  )
}
