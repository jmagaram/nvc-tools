import { useState } from 'react'
import NumberDisplay from '../components/NumberDisplay.tsx'

export default function NumberDisplayDemo() {
  const [value, setValue] = useState(1234567.891)
  const [decimals, setDecimals] = useState(2)
  const [thousandsSeparator, setThousandsSeparator] = useState(true)

  return (
    <>
      <label>
        Value{' '}
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.valueAsNumber)}
        />
      </label>
      <label>
        Decimal places{' '}
        <input
          type="number"
          min={0}
          max={6}
          value={decimals}
          onChange={(e) => setDecimals(e.target.valueAsNumber)}
        />
      </label>
      <label>
        <input
          type="checkbox"
          checked={thousandsSeparator}
          onChange={(e) => setThousandsSeparator(e.target.checked)}
        />{' '}
        Thousands separator
      </label>
      <hr />
      <NumberDisplay
        value={value}
        decimals={decimals}
        thousandsSeparator={thousandsSeparator}
      />
    </>
  )
}
