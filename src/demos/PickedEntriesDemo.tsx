import { useState } from 'react'
import PickedEntries from '../components/PickedEntries.tsx'
import type { Format, Picked } from '../components/PickedEntries.tsx'

/* Every layout on the page at once, under its own heading — the point of the
   component is that these are five views of the same picks, and a dropdown
   would only let you see one of them at a time. */
const FORMATS: { format: Format; heading: string }[] = [
  { format: 'gloss', heading: 'Grouped' },
  { format: 'column', heading: 'One word per line' },
  { format: 'sentence', heading: 'Sentence' },
  { format: 'table', heading: 'Table' },
  { format: 'inline', heading: 'Plain line' },
]

/* Real categories and real words, in the source's own order, because a layout
   is only worth looking at with the lengths it will actually be given — the
   longest need is a five-word phrase and the shortest feeling is four letters. */
const FEELINGS: Picked[] = [
  {
    category: 'Angry',
    kind: 'unmet',
    words: ['enraged', 'irate', 'livid'],
    notes: [
      { word: 'irate', text: 'still not over it' },
      { word: 'livid', text: 'only about the meeting, not about him' },
    ],
  },
  {
    category: 'Disquiet',
    kind: 'unmet',
    words: ['rattled', 'unsettled'],
    notes: [{ word: 'rattled', text: 'every time the calendar pinged' }],
  },
  {
    category: 'Grateful',
    kind: 'met',
    words: ['moved', 'thankful'],
    notes: [{ word: 'moved', text: 'she noticed before I said anything' }],
  },
]

/* No kind anywhere, which is what makes it a needs block: the absence of the
   met/unmet headings is the only thing that says which inventory a block came
   from, so it is worth seeing beside one that has them. */
const NEEDS: Picked[] = [
  {
    category: 'Connection',
    words: ['belonging', 'to be seen', 'warmth'],
    notes: [{ word: 'to be seen', text: 'not agreed with — just seen' }],
  },
  { category: 'Autonomy', words: ['choice', 'space'] },
]

/** The same picks with their notes thinned out, to see each layout empty. */
function withNotes(entries: Picked[], density: 'none' | 'some' | 'all'): Picked[] {
  if (density === 'all') return entries
  if (density === 'none')
    return entries.map((entry) => ({ ...entry, notes: undefined }))
  return entries.map((entry, index) =>
    index === 0 ? entry : { ...entry, notes: undefined },
  )
}

export default function PickedEntriesDemo() {
  const [inventory, setInventory] = useState<'feelings' | 'needs'>('feelings')
  const [density, setDensity] = useState<'none' | 'some' | 'all'>('some')
  const [count, setCount] = useState(3)

  const source = inventory === 'feelings' ? FEELINGS : NEEDS
  const entries = withNotes(source, density).slice(0, count)

  return (
    <>
      <label>
        Inventory{' '}
        <select
          value={inventory}
          onChange={(e) => setInventory(e.target.value as 'feelings' | 'needs')}
        >
          <option value="feelings">Feelings (split met/unmet)</option>
          <option value="needs">Needs (no split)</option>
        </select>
      </label>
      <label>
        Notes{' '}
        <select
          value={density}
          onChange={(e) =>
            setDensity(e.target.value as 'none' | 'some' | 'all')
          }
        >
          <option value="none">None</option>
          <option value="some">One category</option>
          <option value="all">Most words</option>
        </select>
      </label>
      <label>
        Categories{' '}
        <select value={count} onChange={(e) => setCount(Number(e.target.value))}>
          {[0, 1, 2, 3].map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <hr />
      {FORMATS.map(({ format, heading }) => (
        <div key={format}>
          <h2>{heading}</h2>
          <PickedEntries entries={entries} format={format} />
        </div>
      ))}
      <p>
        The same picks five ways. Notes are sparse in real use, so every layout
        has to look deliberate with none of them — set <b>Notes</b> to none and
        nothing should read as missing. A needs block has no met/unmet headings,
        and their absence is what tells the two inventories apart.
      </p>
    </>
  )
}
