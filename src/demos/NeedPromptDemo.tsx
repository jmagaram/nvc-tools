import { useState } from 'react'
import NeedPrompt from '../components/NeedPrompt.tsx'
import { categories } from '../data/needs.ts'

export default function NeedPromptDemo() {
  const [categoryIndex, setCategoryIndex] = useState(1)
  const [index, setIndex] = useState(0)
  const [accepted, setAccepted] = useState(0)
  const [rejected, setRejected] = useState(0)

  const category = categories[categoryIndex]
  // Keep the need in range when a shorter category is chosen.
  const clamped = Math.min(index, category.needs.length - 1)
  const need = category.needs[clamped]

  return (
    <>
      <label>
        Category{' '}
        <select
          value={categoryIndex}
          onChange={(e) => setCategoryIndex(Number(e.target.value))}
        >
          {categories.map((option, optionIndex) => (
            <option key={option.name} value={optionIndex}>
              {option.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Need{' '}
        <select
          value={clamped}
          onChange={(e) => setIndex(Number(e.target.value))}
        >
          {category.needs.map((option, optionIndex) => (
            <option key={option.word} value={optionIndex}>
              {option.word}
            </option>
          ))}
        </select>
      </label>
      <hr />
      <NeedPrompt
        word={need.word}
        category={category.name}
        definition={need.definition}
        index={clamped}
        total={category.needs.length}
        onAccept={() => setAccepted(accepted + 1)}
        onReject={() => setRejected(rejected + 1)}
      />
      <p>
        Accepted {accepted} times, rejected {rejected} times
      </p>
      <p>
        Click the prompt or Tab into it, then answer with → and ←. A host that
        opens this in a modal would give it focus itself.
      </p>
    </>
  )
}
