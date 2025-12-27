import { type ReactNode, useMemo, useReducer } from 'react'
import { UsersActionsContext, UsersStateContext } from '@/features/users'

import {
  INIT_NEW_USER_STATE,
  INIT_USER_DELETE_STATE,
  INIT_USER_EDIT_STATE,
  newUserReducer,
  userDeleteReducer,
  userEditReducer,
} from '@/reducers/usersReducer'
import type {
  PayloadAllModifiedUsers,
  PayloadModifiedUser,
  PayloadNewUser,
  User,
} from '@/types/users'

type UsersProviderProps = {
  children: ReactNode
  users: User[]
  onCreate: (payload: PayloadNewUser) => Promise<void>
  onModify: (id: User['id'], payload: PayloadModifiedUser) => Promise<void>
  onAllModify: (data: PayloadAllModifiedUsers) => Promise<void>
  onDelete: (id: User['id']) => Promise<void>
  onDeleteSelected: (ids: number[]) => Promise<void>
}

export default function UsersProvider({
  children,
  users,
  onCreate,
  onModify,
  onAllModify,
  onDelete,
  onDeleteSelected,
}: UsersProviderProps) {
  const [newUserState, newUserDispatch] = useReducer(newUserReducer, INIT_NEW_USER_STATE)
  const [userEditState, userEditDispatch] = useReducer(userEditReducer, INIT_USER_EDIT_STATE)
  const [userDeleteState, userDeleteDispatch] = useReducer(
    userDeleteReducer,
    INIT_USER_DELETE_STATE,
  )

  const targetIds = useMemo(() => users.map((u) => u.id), [users])

  const stateValue = useMemo(
    () => ({
      users,
      targetIds,
      newUserState,
      userEditState,
      userDeleteState,
    }),
    [users, targetIds, newUserState, userEditState, userDeleteState],
  )

  const actionValue = useMemo(
    () => ({
      newUserDispatch,
      userEditDispatch,
      userDeleteDispatch,
      onCreate,
      onModify,
      onAllModify,
      onDelete,
      onDeleteSelected,
    }),
    [onCreate, onModify, onAllModify, onDelete, onDeleteSelected],
  )

  return (
    <UsersStateContext.Provider value={stateValue}>
      <UsersActionsContext.Provider value={actionValue}>
        <div className="users">{children}</div>
      </UsersActionsContext.Provider>
    </UsersStateContext.Provider>
  )
}
