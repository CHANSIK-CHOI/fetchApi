import type { NewUserData, UsersFormValueMap } from '@/types/users'
import {
  createContext,
  useContext,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react'

export type OnShowAllEditor = {
  isShowEditor: boolean
  isPatch?: boolean
}
export type OnShowItemEditor = { id: number } & OnShowAllEditor
export type OnCheckedDeleteItems = { e: ChangeEvent<HTMLInputElement>; id: number }

export type OnPostUserData = { isShow: boolean; isPost?: boolean }

export type UsersContextType = {
  isShowAllEditor: boolean
  onShowAllEditor: ({ isShowEditor, isPatch }: OnShowAllEditor) => void
  showItemEditor: number[]
  onShowItemEditor: ({ id, isShowEditor, isPatch }: OnShowItemEditor) => void
  isShowDeleteCheckbox: boolean
  onShowDeleteCheckbox: (isActive: boolean) => void
  onCheckedDeleteItems: ({ e, id }: OnCheckedDeleteItems) => void
  onClickDelete: () => void
  isShowNewUserForm: boolean
  onIsShowNewUserForm: ({ isShow, isPost }: OnPostUserData) => void
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
