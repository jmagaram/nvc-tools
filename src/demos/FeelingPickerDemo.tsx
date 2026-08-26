import { useState } from 'react'
import FeelingPicker from '../components/FeelingPicker.tsx'
import { categories } from '../data/feelings.ts'
import { chosen, init, reduce } from '../machines/feelingPicker.ts'
import type {
  FeelingPickerAction,
  FeelingPickerState,
} from '../machines/feelingPicker.ts'

export default function FeelingPickerDemo() {
  const [state, setState] = useState<FeelingPickerState>(() => init(categories))

  const dispatch = (action: FeelingPickerAction) =>
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
      <FeelingPicker state={state} onAction={dispatch} />

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
