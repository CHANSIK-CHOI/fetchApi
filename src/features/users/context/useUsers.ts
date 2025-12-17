import type {
  NewUserAction,
  NewUserState,
  UserEditAction,
  UserEditState,
} from '@/reducers/usersReducer'
import type {
  // PayloadNewUser,
  BuiltAllUsersValue,
  User,
  PersonalEditableUserKey,
} from '@/types/users'
import {
  createContext,
  useContext,
  type ActionDispatch,
  type ChangeEvent,
  // type Dispatch,
  // type SetStateAction,
} from 'react'

export type OnAllEditor = {
  isShowEditor: boolean
  isPatch?: boolean
}
export type OnItemEditor = { id: User['id'] } & OnAllEditor
export type OnChangeCheckDeleteItems = { e: ChangeEvent<HTMLInputElement>; id: User['id'] }

// export type OnNewUserForm = { isShowEditor: boolean; isPost?: boolean }

export type IsPatching = User['id'] | 'all' | null
export type IsDeleting = User['id'] | null

export type OnChangeUserData = (
  e: ChangeEvent<HTMLInputElement & { name: PersonalEditableUserKey }>,
  id: User['id'],
) => void
export type OnChangeUserAvatar = (id: User['id'], avatarSrc: User['avatar'] | null) => void

export type UsersStateContextType = {
  isShowDeleteCheckbox: boolean
  builtAllUsersValue: BuiltAllUsersValue
  isDeleting: IsDeleting
  isCheckedDeleting: boolean
  checkedDeleteItems: User['id'][]
  isAllChecked: boolean
  newUserState: NewUserState
  userEditState: UserEditState
}

export type UsersActionsContextType = {
  handleToggleDeleteCheckbox: (isChecked: boolean) => void
  onChangeCheckDeleteItems: ({ e, id }: OnChangeCheckDeleteItems) => void
  onClickDeleteSelectedItems: () => void
  onChangeUserData: OnChangeUserData
  onChangeUserAvatar: OnChangeUserAvatar
  onClickDeleteItem: (id: User['id']) => Promise<void>
  handleAllCheck: () => void
  resetChecked: () => void
  newUserDispatch: ActionDispatch<[action: NewUserAction]>
  userEditDispatch: ActionDispatch<[action: UserEditAction]>
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
