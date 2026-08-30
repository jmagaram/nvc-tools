import { useState } from 'react'
import FeelingCategoryCard from '../components/FeelingCategoryCard.tsx'
import FeelingCategoryPill from '../components/FeelingCategoryPill.tsx'
import { categories } from '../data/feelings.ts'
import styles from './FeelingCategoryPillDemo.module.css'

const KINDS: ('met' | 'unmet')[] = ['met', 'unmet']

/** Enough for the card to have something to list. */
/* One of them with a few words of someone's own about it, so the card shows
   what a note looks like once it is back on the browse screen: the pencil, and
   nothing else — the note itself belongs to the screen the word is on. */
const PICKED = [{ word: 'fascinated', note: 'the whole afternoon went' }, { word: 'absorbed' }]

export default function FeelingCategoryPillDemo() {
  const [category, setCategory] = useState('Engaged')
  const [kind, setKind] = useState<'met' | 'unmet'>('met')
  const [clicks, setClicks] = useState(0)

  return (
    <>
      <label>
        Category{' '}
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <label>
        Kind{' '}
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as 'met' | 'unmet')}
        >
          {KINDS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <hr />
      {/* The pill has no picked state of its own to put beside the plain one:
          picking something in a category is what turns it into a card. So the
          two shapes the picker swaps between are what go side by side. */}
      <div className={styles.pair}>
        <FeelingCategoryPill
          category={category}
          kind={kind}
          onClick={() => setClicks(clicks + 1)}
        />
        <FeelingCategoryCard
          category={category}
          kind={kind}
          feelings={PICKED}
          emptyText="Nothing picked yet"
          resume={false}
          onClick={() => setClicks(clicks + 1)}
        />
      </div>
      <p>
        A category with nothing picked in it, and the same one once something
        is. Clicked {clicks} times.
      </p>
      <hr />

      {/* The reason the pill exists: every category on screen at once. Display
          only — opening one is what the Feeling Picker page is for. */}
      <p>Every category at once, which is what the pill is small enough for.</p>
      <div className={styles.row}>
        {categories.map((sample) => (
          <FeelingCategoryPill
            key={sample.name}
            category={sample.name}
            kind={sample.kind}
            onClick={() => {}}
          />
        ))}
      </div>
    </>
  )
}
