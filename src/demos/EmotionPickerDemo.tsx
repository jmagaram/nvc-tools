import { useState } from 'react'
import EmotionPicker from '../components/EmotionPicker.tsx'
import { categories } from '../data/feelings.ts'
import { chosen, init, reduce } from '../machines/emotionPicker.ts'
import type {
  EmotionPickerAction,
  EmotionPickerState,
} from '../machines/emotionPicker.ts'

export default function EmotionPickerDemo() {
  const [state, setState] = useState<EmotionPickerState>(() => init(categories))

  const dispatch = (action: EmotionPickerAction) =>
    setState((current) => reduce(current, action))

  const picked = chosen(state)

  return (
    <>
      <label>
        <button type="button" onClick={() => setState(init(categories))}>
          Start over
        </button>
      </label>
      <hr />
      <EmotionPicker state={state} onAction={dispatch} />

      {/* What the app — or an Obsidian modal — would write out. */}
      <h2>Chosen</h2>
      {picked.length === 0 ? (
        <p>Nothing chosen yet.</p>
      ) : (
        <ul>
          {picked.map((entry) => (
            <li key={entry.category}>
              {entry.category} ({entry.kind}): {entry.words.join(', ')}
            </li>
          ))}
        </ul>
      )}
      <p>
        The category order is shuffled once when the page loads and never
        changes, so the pill row only ever shrinks. Walk a category without
        picking anything and it shows as an empty card until you close another
        one, then it drops back to a pill.
      </p>
    </>
  )
}
