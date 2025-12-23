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
import type { PayloadModifiedUser, User } from '@/types/users'

type UsersProviderProps = {
  children: ReactNode
  users: User[]
  onModify: (id: User['id'], payload: PayloadModifiedUser) => Promise<void>
  onDelete: (id: User['id']) => Promise<void>
}

export default function UsersProvider({ children, users, onModify, onDelete }: UsersProviderProps) {
  const [newUserState, newUserDispatch] = useReducer(newUserReducer, INIT_NEW_USER_STATE) // 유저 추가하기 reducer
  const [userEditState, userEditDispatch] = useReducer(userEditReducer, INIT_USER_EDIT_STATE) // 유저 수정하기 reducer
  const [userDeleteState, userDeleteDispatch] = useReducer(
    userDeleteReducer,
    INIT_USER_DELETE_STATE,
  ) // 유저 삭제하기reducer

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
      onModify,
      onDelete,
    }),
    [onModify, onDelete],
  )

  return (
    <UsersStateContext.Provider value={stateValue}>
      <UsersActionsContext.Provider value={actionValue}>
        <div className="users">{children}</div>
      </UsersActionsContext.Provider>
    </UsersStateContext.Provider>
  )
}
