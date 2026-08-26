type Props = {
  date: Date
  format: 'short' | 'long'
}

export default function DateDisplay({ date, format }: Props) {
  return (
    <time dateTime={date.toISOString()}>
      {date.toLocaleDateString(undefined, { dateStyle: format })}
    </time>
  )
}
