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

type UsersProviderProps = {
  children: ReactNode
}

export default function UsersProvider({ children }: UsersProviderProps) {
  const [newUserState, newUserDispatch] = useReducer(newUserReducer, INIT_NEW_USER_STATE) // 유저 추가하기 reducer
  const [userEditState, userEditDispatch] = useReducer(userEditReducer, INIT_USER_EDIT_STATE) // 유저 수정하기 reducer
  const [userDeleteState, userDeleteDispatch] = useReducer(
    userDeleteReducer,
    INIT_USER_DELETE_STATE,
  ) // 유저 삭제하기reducer

  // [삭제하기] 선택된 item 데이터 삭제
  // const onClickDeleteSelectedItems = useCallback(async () => {
  //   if (checkedDeleteItemsRef.current.length === 0) {
  //     // 선택 된 데이터가 없을 때
  //     alert('선택한 데이터가 없습니다.')
  //   } else {
  //     if (isCheckedDeletingRef.current) return

  //     const names = checkedDeleteItemsRef.current
  //       .map((id) => initialBuiltAllUsersValue[id])
  //       .filter(Boolean)
  //       .map((u) => `${u[`first_name_${u.id}`]} ${u[`last_name_${u.id}`]}`)
  //       .join(', ')
  //     const confirmMsg = `${names} 유저들을 삭제하시겠습니까?`
  //     if (!confirm(confirmMsg)) return

  //     try {
  //       setisCheckedDeleting(true)
  //       await onDeleteSelectedUsers(checkedDeleteItemsRef.current)
  //       resetChecked()
  //       alert('삭제를 완료하였습니다.')
  //     } catch (err) {
  //       console.error(err)
  //       alert('삭제에 실패했습니다. 다시 시도해주세요.')
  //     } finally {
  //       setisCheckedDeleting(false)
  //       setIsShowDeleteCheckbox(false)
  //     }
  //   }
  // }, [initialBuiltAllUsersValue, onDeleteSelectedUsers, resetChecked])

  return (
    <UsersStateContext.Provider value={{ newUserState, userEditState, userDeleteState }}>
      <UsersActionsContext.Provider
        value={{ newUserDispatch, userEditDispatch, userDeleteDispatch }}
      >
        {children}
      </UsersActionsContext.Provider>
    </UsersStateContext.Provider>
  )
}
