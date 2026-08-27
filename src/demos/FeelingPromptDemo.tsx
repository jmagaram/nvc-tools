import { useState } from 'react'
import FeelingPrompt from '../components/FeelingPrompt.tsx'
import type { StepMark } from '../components/StepProgress.tsx'
import { categories } from '../data/feelings.ts'

export default function FeelingPromptDemo() {
  const [categoryIndex, setCategoryIndex] = useState(2)
  const [index, setIndex] = useState(0)
  const [accepted, setAccepted] = useState(0)
  const [rejected, setRejected] = useState(0)

  const category = categories[categoryIndex]
  // Keep the feeling in range when a shorter category is chosen.
  const clamped = Math.min(index, category.feelings.length - 1)
  const feeling = category.feelings[clamped]
  // Stand-in history: this demo is about the card, so the answers behind
  // the cursor are made up rather than controlled.
  const past: StepMark[] = Array.from({ length: clamped }, (_, at) =>
    at % 3 === 0 ? 'chosen' : 'skipped',
  )

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
              {option.name} ({option.kind})
            </option>
          ))}
        </select>
      </label>
      <label>
        Feeling{' '}
        <select
          value={clamped}
          onChange={(e) => setIndex(Number(e.target.value))}
        >
          {category.feelings.map((option, optionIndex) => (
            <option key={option.word} value={optionIndex}>
              {option.word}
            </option>
          ))}
        </select>
      </label>
      <hr />
      <FeelingPrompt
        word={feeling.word}
        category={category.name}
        definition={feeling.definition}
        kind={category.kind}
        past={past}
        upcoming={category.feelings.length - clamped - 1}
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
