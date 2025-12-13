import React from 'react'
import { useUsersActions, useUsersState } from '@/features/users'

type UsersProps = {
  children: React.ReactNode
  newUserForm: React.ReactNode
  count: number
}
export default function Users({ children, newUserForm, count }: UsersProps) {
  const {
    isShowAllEditor,
    isShowDeleteCheckbox,
    isPatching,
    isCheckedDeleting,
    isAllChecked,
    newUserState,
  } = useUsersState()
  const {
    onAllEditor,
    handleToggleDeleteCheckbox,
    onClickDeleteSelectedItems,
    handleAllCheck,
    resetChecked,
    newUserDispatch,
  } = useUsersActions()

  const isNoUserData = count === 0
  const isShowNewUserFormEl = !isShowAllEditor && !isShowDeleteCheckbox
  const isShowDeleteCheckboxEl = !isNoUserData && !newUserState.isShowEditor && !isShowAllEditor
  const isShowAllEditorEl = !isNoUserData && !newUserState.isShowEditor && !isShowDeleteCheckbox

  const resultCount = count.toString().padStart(2, '0')

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
              {!isShowAllEditor ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => onAllEditor({ isShowEditor: true })}
                >
                  전체수정
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => onAllEditor({ isShowEditor: false })}
                  >
                    수정취소
                  </button>
                  <button
                    type="button"
                    onClick={() => onAllEditor({ isShowEditor: false, isPatch: true })}
                    disabled={isPatching === 'all'}
                  >
                    {isPatching === 'all' ? '수정중...' : '수정완료'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {newUserState.isShowEditor && <div className="users__form">{newUserForm}</div>}
      <div className="users__body">{children}</div>
    </div>
  )
}
