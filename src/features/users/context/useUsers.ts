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

export type UsersStateContextType = {
  isShowAllEditor: boolean
  showItemEditor: number[]
  isShowDeleteCheckbox: boolean
  isShowNewUserForm: boolean
  isCreatingUser: boolean
  builtUsersData: UsersFormValueMap
}

export type UsersActionsContextType = {
  onAllEditor: ({ isShowEditor, isPatch }: OnAllEditor) => void
  onItemEditor: ({ id, isShowEditor, isPatch }: OnItemEditor) => void
  onToggleDeleteCheckbox: (isChecked: boolean) => void
  onChangeCheckDeleteItems: ({ e, id }: OnChangeCheckDeleteItems) => void
  onClickDeleteItems: () => void
  onNewUserForm: ({ isShowEditor, isPost }: OnNewUserForm) => Promise<void>
  setNewUserData: Dispatch<SetStateAction<NewUserData>>
  onChangeUserData: (e: ChangeEvent<HTMLInputElement>, id: number) => void
}

export const UsersStateContext = createContext<UsersStateContextType | null>(null)
export const UsersActionsContext = createContext<UsersActionsContextType | null>(null)

export function useUsersState() {
  const ctx = useContext(UsersStateContext)
  if (!ctx) throw new Error('useUsersState must be used inside UsersProvider')
  return ctx
}

export function useUsersActions() {
  const ctx = useContext(UsersActionsContext)
  if (!ctx) throw new Error('useUsersActions must be used inside UsersProvider')
  return ctx
}
