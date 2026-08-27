import { useState } from 'react'
import type { CSSProperties } from 'react'
import ModalFrame from '../components/ModalFrame.tsx'
import type { ModalHeading } from '../components/ModalFrame.tsx'
import DeviceSelect from './DeviceSelect.tsx'
import { devices } from './devices.ts'
import styles from './devices.module.css'

const PARAGRAPH =
  'Filler, so the body has something to scroll. The title bar and the ' +
  'button row should stay put while it does.'

export default function ModalFrameDemo() {
  const [title, setTitle] = useState('Feelings')
  const [device, setDevice] = useState(devices[0])
  const [paragraphs, setParagraphs] = useState(1)
  const [dialogWidth, setDialogWidth] = useState(420)
  const [closes, setCloses] = useState(0)
  const [backs, setBacks] = useState(0)
  const [aLevelDown, setALevelDown] = useState(false)

  const heading: ModalHeading = aLevelDown
    ? { kind: 'back', label: 'Back', onBack: () => setBacks((n) => n + 1) }
    : { kind: 'title', text: title }

  return (
    <>
      <label>
        Title <input value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <DeviceSelect value={device} onChange={setDevice} />
      <label>
        <input
          type="checkbox"
          checked={aLevelDown}
          onChange={(e) => setALevelDown(e.target.checked)}
        />{' '}
        A level down (title bar offers the way back)
      </label>
      {device.size === 'desktop' && (
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
      <label>
        Paragraphs{' '}
        <input
          type="number"
          min={1}
          max={20}
          value={paragraphs}
          onChange={(e) => setParagraphs(Number(e.target.value))}
        />
      </label>
      <hr />

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
          onClose={() => setCloses((n) => n + 1)}
          footer={
            <>
              <button type="button">Cancel</button>
              <button type="button">Done</button>
            </>
          }
        >
          {Array.from({ length: paragraphs }, (_, i) => (
            <p key={i}>
              {i + 1}. {PARAGRAPH}
            </p>
          ))}
        </ModalFrame>
      </div>

      <p>
        Close pressed {closes} times, back {backs} times.
      </p>
      <p>
        The dashed border is the screen, not the modal. On a phone the modal
        fills it; on a desktop it is a card centred in it. Nothing here is a
        real <code>&lt;dialog&gt;</code> — Obsidian brings its own backdrop and
        Escape handling, so only the shape is worth standing in for.
      </p>
    </>
  )
}
