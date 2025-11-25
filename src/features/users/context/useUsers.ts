import type { NewUserData, UsersFormValueMap } from '@/types/users'
import {
  createContext,
  useContext,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react'

export type OnAllEditing = {
  isEditing: boolean
  isPatch?: boolean
}
export type OnItemEditing = { id: number } & OnAllEditing
export type OnChangeItem = { checked: boolean; id: number }

export type OnPostUserData = { isShow: boolean; isPost?: boolean }

export type UsersContextType = {
  isAllEditing: boolean
  onAllEditing: ({ isEditing, isPatch }: OnAllEditing) => void
  editingItemArray: number[]
  onItemEditing: ({ id, isEditing, isPatch }: OnItemEditing) => void
  isSelectedForDeletion: boolean
  onSelectedForDeletion: (isActive: boolean) => void
  onChangeItem: ({ checked, id }: OnChangeItem) => void
  onSelectedDelete: () => void
  isShowUserForm: boolean
  onPostUserData: ({ isShow, isPost }: OnPostUserData) => void
  setNewUserData: Dispatch<SetStateAction<NewUserData>>
  usersFormValue: UsersFormValueMap
  onChangeUserData: (e: ChangeEvent<HTMLInputElement>, id: number) => void
}

export const UsersContext = createContext<UsersContextType | null>(null)

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider')
  return ctx
}
