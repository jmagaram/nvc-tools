import { useState } from 'react'
import NeedCategoryWalk from '../components/NeedCategoryWalk.tsx'
import { useFocusPrompt } from '../focusPrompt.ts'
import { categories } from '../data/needs.ts'
import { init, picked, reduce } from '../machines/needCategoryWalk.ts'
import type {
  NeedCategoryWalkAction,
  NeedCategoryWalkState,
} from '../machines/needCategoryWalk.ts'

export default function NeedCategoryWalkDemo() {
  const [categoryIndex, setCategoryIndex] = useState(1)
  const [state, setState] = useState<NeedCategoryWalkState>(() =>
    init(categories[1]),
  )
  // Standing in for whatever the app stores between sessions, so that
  // re-opening a category shows the previously picked needs first.
  const [picksByCategory, setPicksByCategory] = useState<
    Record<string, string[]>
  >({})

  const bodyRef = useFocusPrompt(state)

  const dispatch = (action: NeedCategoryWalkAction) =>
    setState((current) => reduce(current, action))

  const wordsPicked = picked(state).map((need) => need.word)

  /** Start a fresh walk, keeping what the walk on screen picked. */
  const restart = (index: number) => {
    const remembered = { ...picksByCategory, [state.category]: wordsPicked }
    const category = categories[index]
    setPicksByCategory(remembered)
    setCategoryIndex(index)
    setState(init(category, remembered[category.name] ?? []))
  }

  return (
    <>
      <label>
        Category{' '}
        <select
          value={categoryIndex}
          onChange={(e) => restart(Number(e.target.value))}
        >
          {categories.map((option, optionIndex) => (
            <option key={option.name} value={optionIndex}>
              {option.name} ({option.needs.length})
            </option>
          ))}
        </select>
      </label>
      <label>
        <button type="button" onClick={() => restart(categoryIndex)}>
          Start over
        </button>
      </label>
      <hr />
      {/* Focused as each word comes up, the way a modal host focuses it, so
          the arrow keys answer without a click first. */}
      <div ref={bodyRef}>
        <NeedCategoryWalk state={state} onAction={dispatch} />
      </div>

      {/* The walk renders nothing once it is done, so the chrome around
          it — here the demo page, later a modal — shows the result. */}
      <h2>Picked so far ({state.progress.status})</h2>
      {wordsPicked.length === 0 ? (
        <p>Nothing picked yet.</p>
      ) : (
        <ul>
          {wordsPicked.map((word) => (
            <li key={word}>{word}</li>
          ))}
        </ul>
      )}
      <p>
        Walk through a category, pick a few, then switch away and back: the ones
        you picked are asked about first. The prompt takes focus as each word comes
        up, so you can run the whole walk on → and ←. The word safety sits in both Connection and
        Physical Wellbeing upstream, so it can be picked in each.
      </p>
    </>
  )
}
