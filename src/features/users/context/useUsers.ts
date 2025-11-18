import type { User } from '@/types/users'
import { createContext, useContext } from 'react'

export type OnItemEditing = {
  id: number
  isEditing: boolean
  data?: Partial<User>
}
export type OnChangeItem = { checked: boolean; id: number }

export type OnPostUserData = { isShow: boolean; isPost?: boolean }

export type UsersContextType = {
  isAllEditing: boolean
  onAllEditing: (isEditing: boolean) => void
  editingItemArray: number[]
  onItemEditing: ({ id, isEditing, data }: OnItemEditing) => void
  isSelectedForDeletion: boolean
  onSelectedForDeletion: (isActive: boolean) => void
  onChangeItem: ({ checked, id }: OnChangeItem) => void
  onSelectedDelete: () => void
  isShowUserForm: boolean
  onPostUserData: ({ isShow, isPost }: OnPostUserData) => void
}

export const UsersContext = createContext<UsersContextType | null>(null)

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider')
  return ctx
}
