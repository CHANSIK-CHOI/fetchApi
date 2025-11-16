import type { User } from '@/types/users'
import { createContext, useContext } from 'react'

export type UsersContextType = {
  isAllEditingState: boolean
  setIsAllEditing: (isEditing: boolean) => void
  isItemEditingState: number[]
  setIsItemEditing: ({
    id,
    isEditing,
    data,
  }: {
    id: number
    isEditing: boolean
    data?: Partial<User>
  }) => void
}

export const UsersContext = createContext<UsersContextType | null>(null)

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider')
  return ctx
}
