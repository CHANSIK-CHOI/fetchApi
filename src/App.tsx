import './App.css'
import { CounterButton } from '@/components/CounterButton'
import { useCounter } from '@/hooks/useCounter'
import type { CounterFormatter } from '@/types/counter'

function App() {
  const { count, increment, reset } = useCounter(0)

  const formatCount: CounterFormatter = (value) => `Count: ${value}`

  return (
    <main>
      <h1>React Starter</h1>
      <p>Vite + React + TypeScript 프로젝트가 준비되었습니다. 테스트</p>
      <CounterButton
        value={count}
        onIncrement={increment}
        onReset={reset}
        formatValue={formatCount}
      />
    </main>
  )
}

export default App
