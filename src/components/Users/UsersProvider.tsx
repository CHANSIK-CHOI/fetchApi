import { type ReactNode, useCallback, useState } from 'react'

import { UsersContext } from './useUsers'
import type { User } from '@/types/users'

type UsersProviderProps = {
  children: ReactNode
}

export default function UsersProvider({ children }: UsersProviderProps) {
  const [isAllEditingState, setIsAllEditingState] = useState(false)
  const [isItemEditingState, setIsItemEditingState] = useState<number[]>([])

  const setIsAllEditing = useCallback((isEditing: boolean) => {
    setIsAllEditingState(isEditing)
    if (isEditing) {
      setIsItemEditingState([])
    }
  }, [])

  const setIsItemEditing = useCallback(
    ({ id, isEditing, data }: { id: number; isEditing: boolean; data?: Partial<User> }) => {
      if (isEditing) {
        setIsItemEditingState((prev) => (prev.includes(id) ? prev : [...prev, id]))
      } else {
        // data : 데이터 수정 완료한 후 아래 로직 실행
        setIsItemEditingState((prev) => prev.filter((value) => value !== id))
      }
    },
    [],
  )

  return (
    <UsersContext.Provider
      value={{ isAllEditingState, setIsAllEditing, isItemEditingState, setIsItemEditing }}
    >
      {children}
    </UsersContext.Provider>
  )
}
