import React, { type FormEvent } from 'react'
import { useUsersActions, useUsersState } from '@/features/users'
import type {
  BuiltAllUsersValue,
  PayloadAllModifiedUsers,
  PayloadNewUser,
  User,
} from '@/types/users'
import { filterModifiedData, hasEmptyRequiredField } from '@/util/users'

type UsersProps = {
  children: React.ReactNode
  newUserForm: React.ReactNode
  users: User[]
  onAllModify: (data: PayloadAllModifiedUsers) => Promise<void>
}
export default function Users({ children, newUserForm, users, onAllModify }: UsersProps) {
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

  const isNoUserData = users.length === 0
  const isShowNewUserFormEl = !userEditState.isShowAllEditor && !isShowDeleteCheckbox
  const isShowDeleteCheckboxEl =
    !isNoUserData && !newUserState.isShowEditor && !userEditState.isShowAllEditor
  const isShowAllEditorEl = !isNoUserData && !newUserState.isShowEditor && !isShowDeleteCheckbox

  const resultCount = users.length.toString().padStart(2, '0')

  const parseFormDataToUsers = (formData: FormData) => {
    const currentDataMap: Record<User['id'], PayloadNewUser> = {}

    for (const [key, value] of formData.entries()) {
      // 정규식: "field_id" 패턴 분리
      const match = key.match(/^(.+)_(\d+)$/)
      if (!match) continue

      const [_, field, idStr] = match
      void _
      const id = Number(idStr)

      if (!currentDataMap[id]) {
        // PayloadNewUser 타입에 맞게 초기화 (일단 빈 문자열로)
        currentDataMap[id] = {
          first_name: '',
          last_name: '',
          email: '',
          avatar: '',
        }
      }

      currentDataMap[id][field as keyof PayloadNewUser] = value.toString()
    }
    return currentDataMap
  }

  const handleSubmitAllUsers = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)

    // A. FormData를 객체 형태로 변환 (Adapter Pattern)
    const currentUsersObj = parseFormDataToUsers(formData)

    // B. 원본과 비교하여 변경된 데이터 추출 (님께서 만든 filterModifiedData 활용)
    const finalPayloads = users.reduce(
      (acc, originalUser) => {
        const id = originalUser.id
        const currentUserData = currentUsersObj[id]

        // 화면에 없는 유저(혹은 데이터 파싱 실패)면 스킵
        if (!currentUserData) return acc

        // 🔥 [핵심] 기존 유틸 함수 재사용!
        // filterModifiedData는 { [id]: changedObject } 형태를 반환함
        const filteredResult = filterModifiedData({
          data: currentUserData,
          originalData: originalUser,
          id: id,
        })

        // 변경된 내역이 있다면 ({ 1: { ... } } 형태라면)
        if (Object.keys(filteredResult).length > 0) {
          // API 스펙({ id, payload })에 맞춰서 변환
          acc.push({
            id: id,
            payload: filteredResult[id], // 변경된 필드만 들어있음
          })
        }

        return acc
      },
      [] as { id: number; payload: BuiltAllUsersValue }[],
    ) // 결과 타입 정의

    // C. 변경 사항이 없으면 종료
    if (finalPayloads.length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }
    const hasEmpty = Object.values(finalPayloads).some(({ id, payload }) => {
      void id
      return hasEmptyRequiredField(payload)
    })

    if (hasEmpty) {
      alert('이메일, 이름, 성은 빈값으로 수정할 수 없습니다.')
      return
    }

    const targetIds = finalPayloads.map((u) => u.id)
    const targetedUsers = users.filter((user) => targetIds.includes(user.id))
    const names = targetedUsers.map((u) => `${u.first_name} ${u.last_name}`)

    const confirmMsg = `${names} 유저들을 수정하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_START' })
      await onAllModify(finalPayloads)
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_SUCCESS', payload: { data: finalPayloads } })
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
                  onClick={() => userEditDispatch({ type: 'OPEN_ALL_EDITOR' })}
                >
                  전체수정
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => userEditDispatch({ type: 'CLOSE_ALL_EDITOR' })}
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
