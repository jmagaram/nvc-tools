import { useState } from 'react'
import FeelingCategoryWalk from '../components/FeelingCategoryWalk.tsx'
import { useFocusScreen } from '../focusScreen.ts'
import { categories } from '../data/feelings.ts'
import {
  init,
  picked,
  reduce,
  screenKey,
} from '../machines/categoryWalk.ts'
import type {
  CategoryWalkAction,
  CategoryWalkState,
} from '../machines/categoryWalk.ts'
import type { Feeling } from '../data/feelings.ts'

type FeelingCategoryWalkState = CategoryWalkState<
  Feeling,
  { kind: 'met' | 'unmet' }
>

export default function FeelingCategoryWalkDemo() {
  const [categoryIndex, setCategoryIndex] = useState(2)
  const [state, setState] = useState<FeelingCategoryWalkState>(() =>
    init<Feeling, { kind: 'met' | 'unmet' }>(
      { name: categories[2].name, kind: categories[2].kind },
      categories[2].feelings,
      (feeling) => feeling.word,
    ),
  )
  // Standing in for whatever the app stores between sessions, so that
  // re-opening a category shows the previously picked feelings first.
  const [picksByCategory, setPicksByCategory] = useState<
    Record<string, string[]>
  >({})

  const bodyRef = useFocusScreen(screenKey(state))

  const dispatch = (action: CategoryWalkAction) =>
    setState((current) => reduce(current, action))

  const wordsPicked = picked(state).map((feeling) => feeling.word)

  /** Start a fresh walk, keeping what the walk on screen picked. */
  const restart = (index: number) => {
    const remembered = { ...picksByCategory, [state.category]: wordsPicked }
    const category = categories[index]
    setPicksByCategory(remembered)
    setCategoryIndex(index)
    setState(
      init<Feeling, { kind: 'met' | 'unmet' }>(
        { name: category.name, kind: category.kind },
        category.feelings,
        (feeling) => feeling.word,
        remembered[category.name] ?? [],
      ),
    )
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
      {/* Focused as each word comes up, the way a modal host focuses it, so
          the arrow keys answer without a click first. */}
      <div ref={bodyRef}>
        <FeelingCategoryWalk state={state} onAction={dispatch} />
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
        up, so you can run the whole walk on → and ←.
      </p>
    </>
  )
}
