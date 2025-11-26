import type { NewUserData, UsersFormValueMap } from '@/types/users'
import {
  createContext,
  useContext,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react'

export type OnAllEditor = {
  isShowEditor: boolean
  isPatch?: boolean
}
export type OnItemEditor = { id: number } & OnAllEditor
export type OnChangeCheckDeleteItems = { e: ChangeEvent<HTMLInputElement>; id: number }

export type OnNewUserForm = { isShowEditor: boolean; isPost?: boolean }

export type UsersContextType = {
  isShowAllEditor: boolean
  onAllEditor: ({ isShowEditor, isPatch }: OnAllEditor) => void
  showItemEditor: number[]
  onItemEditor: ({ id, isShowEditor, isPatch }: OnItemEditor) => void
  isShowDeleteCheckbox: boolean
  setIsShowDeleteCheckbox: (value: boolean) => void
  onChangeCheckDeleteItems: ({ e, id }: OnChangeCheckDeleteItems) => void
  onClickDeleteItems: () => void
  isShowNewUserForm: boolean
  onNewUserForm: ({ isShowEditor, isPost }: OnNewUserForm) => Promise<void>
  isCreatingUser: boolean
  setNewUserData: Dispatch<SetStateAction<NewUserData>>
  builtUsersData: UsersFormValueMap
  onChangeUserData: (e: ChangeEvent<HTMLInputElement>, id: number) => void
}

export const UsersContext = createContext<UsersContextType | null>(null)

export function useUsers() {
  const ctx = useContext(UsersContext)
  if (!ctx) throw new Error('useUsers must be used inside UsersProvider')
  return ctx
}
