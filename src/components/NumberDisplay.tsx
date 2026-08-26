type Props = {
  value: number
  decimals: number
  thousandsSeparator: boolean
}

export default function NumberDisplay({ value, decimals, thousandsSeparator }: Props) {
  return (
    <span>
      {value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
        useGrouping: thousandsSeparator,
      })}
    </span>
  )
}
