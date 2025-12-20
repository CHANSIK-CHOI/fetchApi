import React, { type FormEvent } from 'react'
import { useUsersActions, useUsersState } from '@/features/users'
import type { PayloadAllModifiedUsers, User } from '@/types/users'

type UsersProps = {
  children: React.ReactNode
  newUserForm: React.ReactNode
  count: number
  onAllModify: (data: PayloadAllModifiedUsers) => Promise<void>
}
export default function Users({ children, newUserForm, count, onAllModify }: UsersProps) {
  const { isShowDeleteCheckbox, isCheckedDeleting, isAllChecked, newUserState, userEditState } =
    useUsersState()
  const {
    handleToggleDeleteCheckbox,
    onClickDeleteSelectedItems,
    handleAllCheck,
    resetChecked,
    newUserDispatch,
    userEditDispatch,
  } = useUsersActions()

  const isNoUserData = count === 0
  const isShowNewUserFormEl = !userEditState.isShowAllEditor && !isShowDeleteCheckbox
  const isShowDeleteCheckboxEl =
    !isNoUserData && !newUserState.isShowEditor && !userEditState.isShowAllEditor
  const isShowAllEditorEl = !isNoUserData && !newUserState.isShowEditor && !isShowDeleteCheckbox

  const resultCount = count.toString().padStart(2, '0')

  const handleSubmitAllUsers = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const payloadMap = new Map<User['id'], any>()

    for (const [key, value] of formData.entries()) {
      const match = key.match(/^(.+)_(\d+)$/)
      if (!match) continue

      const [_, field, idStr] = match
      void _
      const id = Number(idStr)

      if (value instanceof File && value.size === 0) continue

      // 3. Map에 데이터 적재
      if (!payloadMap.has(id)) {
        payloadMap.set(id, {})
      }
      // value는 File | string 입니다.
      // API가 JSON을 보낸다면 File 객체는 {}로 변환되어 날아가니 주의하세요.
      // 텍스트 위주라면 value.toString() 처리가 안전할 수 있습니다.
      payloadMap.get(id)[field] = value
    }

    const finalData = Array.from(payloadMap.entries()).map(([id, payload]) => ({
      id,
      payload,
    }))

    console.log(finalData)
  }

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
              {!isShowDeleteCheckbox ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => handleToggleDeleteCheckbox(true)}
                >
                  삭제할 유저 선택하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => handleToggleDeleteCheckbox(false)}
                  >
                    선택취소
                  </button>
                  {isAllChecked ? (
                    <button type="button" className="line" onClick={resetChecked}>
                      전체취소
                    </button>
                  ) : (
                    <button type="button" onClick={handleAllCheck}>
                      전체선택
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={onClickDeleteSelectedItems}
                    disabled={isCheckedDeleting}
                  >
                    {isCheckedDeleting ? '삭제중...' : '삭제하기'}
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
                  onClick={() => userEditDispatch({ type: 'TOGGLE_ALL_EDITOR', payload: true })}
                >
                  전체수정
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => userEditDispatch({ type: 'TOGGLE_ALL_EDITOR', payload: false })}
                  >
                    수정취소
                  </button>
                  <button
                    type="submit"
                    form="users"
                    disabled={userEditState.editing === 'all'}
                    // onClick={() => userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_START' })}
                  >
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
