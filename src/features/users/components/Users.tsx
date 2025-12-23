import React, { useEffect, type FormEvent } from 'react'
import { useUsersActions, useUsersState } from '@/features/users'
import type {
  EditableUserKey,
  PayloadAllModifiedUsers,
  User,
  UserIdAndEditableUserFormObject,
} from '@/types/users'
import { filterModifiedData, hasEmptyRequiredField } from '@/util/users'

type UsersProps = {
  children: React.ReactNode
  newUserForm: React.ReactNode
  users: User[]
  onAllModify: (data: PayloadAllModifiedUsers) => Promise<void>
  onDeleteSelected: (ids: number[]) => Promise<void>
}
export default function Users({
  children,
  newUserForm,
  users,
  onAllModify,
  onDeleteSelected,
}: UsersProps) {
  const { newUserState, userEditState, userDeleteState } = useUsersState()
  const { newUserDispatch, userEditDispatch, userDeleteDispatch } = useUsersActions()

  const isNoUserData = users.length === 0
  const isShowNewUserFormEl =
    !userEditState.isShowAllEditor && !userDeleteState.isShowDeleteCheckbox
  const isShowDeleteCheckboxEl =
    !isNoUserData && !newUserState.isShowEditor && !userEditState.isShowAllEditor
  const isShowAllEditorEl =
    !isNoUserData && !newUserState.isShowEditor && !userDeleteState.isShowDeleteCheckbox
  const resultCount = users.length.toString().padStart(2, '0')
  const isAllChecked = users.length > 0 && userDeleteState.checkedIds.length === users.length

  const parseFormDataToUsers = (formData: FormData) => {
    const currentDataMap: UserIdAndEditableUserFormObject = {}

    for (const [key, value] of formData.entries()) {
      const match = key.match(/^(.+)_(\d+)$/)
      if (!match) continue

      const [_, field, idStr] = match
      void _
      const id = Number(idStr)

      if (!currentDataMap[id]) {
        currentDataMap[id] = {
          first_name: '',
          last_name: '',
          email: '',
          avatar: '',
        }
      }

      currentDataMap[id][field as EditableUserKey] = value.toString()
    }
    return currentDataMap
  }

  // [수정하기] : 다수 유저 수정
  const handleSubmitAllUsers = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const currentUsersObj = parseFormDataToUsers(formData)

    const data = users.reduce((acc, originalUser) => {
      const id = originalUser.id
      const currentUserData = currentUsersObj[id]

      if (!currentUserData) return acc

      const filteredIdAndData = filterModifiedData({
        data: currentUserData,
        originalData: originalUser,
        id: id,
      })

      if (Object.keys(filteredIdAndData).length > 0) {
        acc.push({
          id: id,
          payload: filteredIdAndData[id],
        })
      }

      return acc
    }, [] as PayloadAllModifiedUsers)

    if (data.length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

    const hasEmpty = data.some(({ id, payload }) => {
      void id
      return hasEmptyRequiredField(payload)
    })

    if (hasEmpty) {
      alert('이메일, 이름, 성은 빈값으로 수정할 수 없습니다.')
      return
    }

    const targetIds = data.map((u) => u.id)
    const originTargetUsers = users.filter((user) => targetIds.includes(user.id))
    const originTargetUsersnames = originTargetUsers.map((u) => `${u.first_name} ${u.last_name}`)

    const confirmMsg = `${originTargetUsersnames} 유저들을 수정하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_START' })
      await onAllModify(data)
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_SUCCESS', payload: { data } })
      alert('수정을 완료하였습니다.')
    } catch (err) {
      console.error(err)
      userEditDispatch({
        type: 'SUBMIT_ERROR',
        payload: { msg: '수정에 실패했습니다. 다시 시도해주세요.' },
      })
      alert('수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // [수정하기] : 전체 유저 form value 수정하기
  useEffect(() => {
    if (userEditState.isResetAllValue) {
      userEditDispatch({ type: 'RESET_COMPLETE_ALL_VALUE' })
    }
  }, [userEditState.isResetAllValue, userEditDispatch])

  // [삭제하기] : 다수 유저 삭제
  const handleClickCheckedItemDeleting = async () => {
    userDeleteDispatch({ type: 'SUBMIT_CHECKED_ITEMS_START' })

    if (userDeleteState.checkedIds.length === 0) {
      alert('선택한 데이터가 없습니다.')
      return
    }

    if (userDeleteState.deleteing) return

    const targetUsers = users.filter(({ id }) => userDeleteState.checkedIds.includes(id))
    const targetUsersnames = targetUsers.map((u) => `${u.first_name} ${u.last_name}`).join(', ')

    const confirmMsg = `${targetUsersnames} 유저들을 삭제하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userDeleteDispatch({ type: 'SUBMIT_CHECKED_ITEMS_START' })
      await onDeleteSelected(userDeleteState.checkedIds)
      userDeleteDispatch({ type: 'SUBMIT_SUCCESS' })
      alert('삭제를 완료하였습니다.')
    } catch (err) {
      console.error(err)
      userDeleteDispatch({
        type: 'SUBMIT_ERROR',
        payload: { msg: '삭제에 실패했습니다. 다시 시도해주세요.' },
      })
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // [삭제하기] : users 업데이트 시 targetIds 업데이트
  useEffect(() => {
    if (users.length > 0) {
      const ids = users.map((u) => u.id)
      userDeleteDispatch({ type: 'SYNC_TARGET_USERS', payload: { ids } })
    }
  }, [users, userDeleteDispatch])

  return (
    <div className="users">
      <div className="users__head">
        <span className="users__result">검색 결과 : {resultCount}건</span>

        <div className="users__actions">
          {isShowNewUserFormEl && (
            <>
              {!newUserState.isShowEditor ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => newUserDispatch({ type: 'SHOW_EDITOR' })}
                >
                  추가하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => newUserDispatch({ type: 'HIDE_EDITOR' })}
                  >
                    추가취소
                  </button>
                  <button type="submit" form="usersNewForm" disabled={newUserState.isCreating}>
                    {newUserState.isCreating ? '추가중...' : '추가완료'}
                  </button>
                </>
              )}
            </>
          )}

          {isShowDeleteCheckboxEl && (
            <>
              {!userDeleteState.isShowDeleteCheckbox ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => userDeleteDispatch({ type: 'SHOW_CHECKBOX' })}
                >
                  삭제할 유저 선택하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => userDeleteDispatch({ type: 'HIDE_CHECKBOX' })}
                  >
                    선택취소
                  </button>
                  {isAllChecked ? (
                    <button
                      type="button"
                      className="line"
                      onClick={() => userDeleteDispatch({ type: 'RESET_CHECKED' })}
                    >
                      전체취소
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => userDeleteDispatch({ type: 'ALL_CHECKED' })}
                    >
                      전체선택
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleClickCheckedItemDeleting}
                    disabled={userDeleteState.deleteing == 'all'}
                  >
                    {userDeleteState.deleteing == 'all' ? '삭제중...' : '삭제하기'}
                  </button>
                </>
              )}
            </>
          )}

          {isShowAllEditorEl && (
            <>
              {!userEditState.isShowAllEditor ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => userEditDispatch({ type: 'OPEN_ALL_EDITOR' })}
                >
                  전체수정
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => userEditDispatch({ type: 'RESET_START_ALL_VALUE' })}
                  >
                    수정취소
                  </button>
                  <button type="submit" form="users" disabled={userEditState.editing === 'all'}>
                    {userEditState.editing === 'all' ? '수정중...' : '수정완료'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {newUserState.isShowEditor && <div className="users__form">{newUserForm}</div>}
      <form id="users" onSubmit={handleSubmitAllUsers} className="users__body">
        {children}
      </form>
    </div>
  )
}
