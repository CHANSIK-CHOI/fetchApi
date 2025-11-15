import { useState } from 'react'

export const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue)
  const increment = () => setCount((previous) => previous + 1)
  const reset = () => setCount(initialValue)

  return { count, increment, reset }
}
