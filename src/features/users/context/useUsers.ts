import type {
  NewUserAction,
  NewUserState,
  UserDeleteAction,
  UserDeleteState,
  UserEditAction,
  UserEditState,
} from '@/reducers/usersReducer'
import type { User } from '@/types/users'
import { createContext, useContext, type ActionDispatch } from 'react'

export type UsersStateContextType = {
  users: User[]
  newUserState: NewUserState
  userEditState: UserEditState
  userDeleteState: UserDeleteState
}

export type UsersActionsContextType = {
  newUserDispatch: ActionDispatch<[action: NewUserAction]>
  userEditDispatch: ActionDispatch<[action: UserEditAction]>
  userDeleteDispatch: ActionDispatch<[action: UserDeleteAction]>
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
