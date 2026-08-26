import { useState } from 'react'
import FeelingCategoryPill from '../components/FeelingCategoryPill.tsx'
import { categories } from '../data/feelings.ts'
import styles from './FeelingCategoryPillDemo.module.css'

const KINDS: ('met' | 'unmet')[] = ['met', 'unmet']

export default function FeelingCategoryPillDemo() {
  const [category, setCategory] = useState('Engaged')
  const [kind, setKind] = useState<'met' | 'unmet'>('met')
  const [clicks, setClicks] = useState(0)
  const [opened, setOpened] = useState<string | null>(null)

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
      <FeelingCategoryPill
        category={category}
        kind={kind}
        onClick={() => setClicks(clicks + 1)}
      />
      <p>Clicked {clicks} times</p>
      <hr />
      {/* The reason the pill exists: every category on screen at once. */}
      <p>{opened ? `Opened ${opened}` : 'No category opened yet'}</p>
      <div className={styles.row}>
        {categories.map((sample) => (
          <FeelingCategoryPill
            key={sample.name}
            category={sample.name}
            kind={sample.kind}
            onClick={() => setOpened(sample.name)}
          />
        ))}
      </div>
    </>
  )
}
