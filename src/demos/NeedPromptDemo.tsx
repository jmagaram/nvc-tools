import { useState } from 'react'
import NeedPrompt from '../components/NeedPrompt.tsx'
import type { Noting } from '../components/NoteDrawer.tsx'
import type { StepMark } from '../components/StepProgress.tsx'
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
  // Stand-in history: this demo is about the card, so the answers behind
  // the cursor are made up rather than controlled.
  const past: StepMark[] = Array.from({ length: clamped }, (_, at) =>
    at % 3 === 0 ? 'chosen' : 'skipped',
  )

  /* The prompt is presentational, so writing a note is the host's to keep —
     the same as answering is. In the picker this lives in the walk machine;
     here it is the smallest thing that behaves the same way: opening seeds the
     box from what is there, keeping trims it, and an emptied box deletes. */
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [noting, setNoting] = useState<Noting | null>(null)

  const keepNote = () => {
    if (!noting) return
    const text = noting.draft.trim()
    setNotes(({ [noting.word]: _dropped, ...rest }) =>
      text ? { ...rest, [noting.word]: text } : rest,
    )
    setNoting(null)
  }

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
        past={past}
        upcoming={category.needs.length - clamped - 1}
        note={notes[need.word] ?? null}
        noting={noting}
        onNote={() =>
          setNoting({ word: need.word, draft: notes[need.word] ?? '' })
        }
        onDraft={(text) => setNoting(noting && { ...noting, draft: text })}
        onKeepNote={keepNote}
        onDropNote={() => setNoting(null)}
        onAccept={() => setAccepted(accepted + 1)}
        onReject={() => setRejected(rejected + 1)}
      />
      <p>
        Accepted {accepted} times, rejected {rejected} times
      </p>
      <p>
        Click the prompt or Tab into it, then answer with → and ←, or press N
        to write a few words of your own about the word on the card. This page
        moves no focus of its own, so the box wants a Tab once the drawer is
        open; a host with a machine behind it calls <code>useFocusScreen</code>,
        which puts focus in the box as the drawer arrives and hands it back
        when it closes.
      </p>
    </>
  )
}
