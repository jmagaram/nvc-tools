import { useState } from 'react'
import CategoryWalk from '../components/CategoryWalk.tsx'
import { categories } from '../data/feelings.ts'
import { init, picked, reduce } from '../machines/categoryWalk.ts'
import type {
  CategoryWalkAction,
  CategoryWalkState,
} from '../machines/categoryWalk.ts'

export default function CategoryWalkDemo() {
  const [categoryIndex, setCategoryIndex] = useState(2)
  const [state, setState] = useState<CategoryWalkState>(() =>
    init(categories[2]),
  )
  // Standing in for whatever the app stores between sessions, so that
  // re-opening a category shows the previously picked feelings first.
  const [picksByCategory, setPicksByCategory] = useState<
    Record<string, string[]>
  >({})

  const dispatch = (action: CategoryWalkAction) =>
    setState((current) => reduce(current, action))

  const wordsPicked = picked(state).map((feeling) => feeling.word)

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
              {option.name} ({option.kind})
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
      <CategoryWalk state={state} onAction={dispatch} />

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
        you picked are asked about first.
      </p>
    </>
  )
}
