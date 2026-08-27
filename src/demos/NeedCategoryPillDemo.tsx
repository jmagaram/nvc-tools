import { useState } from 'react'
import NeedCategoryPill from '../components/NeedCategoryPill.tsx'
import { categories } from '../data/needs.ts'
import styles from './NeedCategoryPillDemo.module.css'

export default function NeedCategoryPillDemo() {
  const [category, setCategory] = useState('Autonomy')
  const [clicks, setClicks] = useState(0)
  const [opened, setOpened] = useState<string | null>(null)

  return (
    <>
      <label>
        Category{' '}
        <input value={category} onChange={(e) => setCategory(e.target.value)} />
      </label>
      <hr />
      <NeedCategoryPill
        category={category}
        onClick={() => setClicks(clicks + 1)}
      />
      <p>Clicked {clicks} times</p>
      <hr />
      {/* The reason the pill exists: every category on screen at once. */}
      <p>{opened ? `Opened ${opened}` : 'No category opened yet'}</p>
      <div className={styles.row}>
        {categories.map((sample) => (
          <NeedCategoryPill
            key={sample.name}
            category={sample.name}
            onClick={() => setOpened(sample.name)}
          />
        ))}
      </div>
    </>
  )
}
