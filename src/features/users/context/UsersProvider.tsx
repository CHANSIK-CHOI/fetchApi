import { type ReactNode, useReducer } from 'react'
import { UsersActionsContext, UsersStateContext } from '@/features/users'

import {
  INIT_NEW_USER_STATE,
  INIT_USER_DELETE_STATE,
  INIT_USER_EDIT_STATE,
  newUserReducer,
  userDeleteReducer,
  userEditReducer,
} from '@/reducers/usersReducer'
import type { User } from '@/types/users'

type UsersProviderProps = {
  children: ReactNode
  users: User[]
}

export default function UsersProvider({ children, users }: UsersProviderProps) {
  const [newUserState, newUserDispatch] = useReducer(newUserReducer, INIT_NEW_USER_STATE) // 유저 추가하기 reducer
  const [userEditState, userEditDispatch] = useReducer(userEditReducer, INIT_USER_EDIT_STATE) // 유저 수정하기 reducer
  const [userDeleteState, userDeleteDispatch] = useReducer(
    userDeleteReducer,
    INIT_USER_DELETE_STATE,
  ) // 유저 삭제하기reducer

  return (
    <UsersStateContext.Provider value={{ users, newUserState, userEditState, userDeleteState }}>
      <UsersActionsContext.Provider
        value={{ newUserDispatch, userEditDispatch, userDeleteDispatch }}
      >
        <div className="users">{children}</div>
      </UsersActionsContext.Provider>
    </UsersStateContext.Provider>
  )
}
