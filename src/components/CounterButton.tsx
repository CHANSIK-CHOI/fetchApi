import type { CounterFormatter } from '@/types/counter'

type CounterButtonProps = {
  value: number
  onIncrement: () => void
  onReset: () => void
  formatValue?: CounterFormatter
}

const defaultFormatter: CounterFormatter = (value) => `현재 카운트: ${value}`

export function CounterButton({
  value,
  onIncrement,
  onReset,
  formatValue = defaultFormatter,
}: CounterButtonProps) {
  return (
    <div className="card">
      <button onClick={onIncrement}>{formatValue(value)}</button>
      <button onClick={onReset} style={{ marginLeft: '0.75rem' }}>
        Reset
      </button>
    </div>
  )
}
