import { useState } from 'react'
import DateDisplay from '../components/DateDisplay.tsx'

export default function DateDisplayDemo() {
  const [format, setFormat] = useState<'short' | 'long'>('short')

  return (
    <>
      <label>
        Format{' '}
        <select
          value={format}
          onChange={(e) => setFormat(e.target.value as 'short' | 'long')}
        >
          <option value="short">short</option>
          <option value="long">long</option>
        </select>
      </label>
      <hr />
      <DateDisplay date={new Date()} format={format} />
    </>
  )
}
