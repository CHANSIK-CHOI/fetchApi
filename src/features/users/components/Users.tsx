import React from 'react'
import { UsersItem, UsersNewForm, useUsersActions, useUsersState } from '@/features/users'

type UsersProps = {
  children: React.ReactNode
  newUserForm: React.ReactNode
  count: string
}
export default function Users({ children, newUserForm, count }: UsersProps) {
  const {
    isShowAllEditor,
    isShowDeleteCheckbox,
    isShowNewUserForm,
    isCreatingUser,
    isPatching,
    isCheckedDeleting,
    isAllCheckedDeleteItems,
  } = useUsersState()
  const {
    onAllEditor,
    onToggleDeleteCheckbox,
    onClickDeleteSelectedItems,
    onNewUserForm,
    onAllCheck,
    resetCheckedDeleteItems,
  } = useUsersActions()

  const isShowNewUserFormEl = !isShowAllEditor && !isShowDeleteCheckbox
  const isShowDeleteCheckboxEl = !isShowNewUserForm && !isShowAllEditor
  const isShowAllEditorEl = !isShowNewUserForm && !isShowDeleteCheckbox

  return (
    <div className="users">
      <div className="users__head">
        <span className="users__result">검색 결과 : {count}건</span>

        <div className="users__actions">
          {isShowNewUserFormEl && (
            <>
              {!isShowNewUserForm ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => onNewUserForm({ isShowEditor: true })}
                >
                  추가하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => onNewUserForm({ isShowEditor: false })}
                  >
                    추가취소
                  </button>
                  <button
                    type="button"
                    onClick={() => onNewUserForm({ isShowEditor: false, isPost: true })}
                    disabled={isCreatingUser}
                  >
                    {isCreatingUser ? '추가중...' : '추가완료'}
                  </button>
                </>
              )}
            </>
          )}

          {isShowDeleteCheckboxEl && (
            <>
              {!isShowDeleteCheckbox ? (
                <button type="button" className="line" onClick={() => onToggleDeleteCheckbox(true)}>
                  삭제할 유저 선택하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => onToggleDeleteCheckbox(false)}
                  >
                    선택취소
                  </button>
                  {isAllCheckedDeleteItems ? (
                    <button type="button" className="line" onClick={resetCheckedDeleteItems}>
                      전체취소
                    </button>
                  ) : (
                    <button type="button" onClick={onAllCheck}>
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
      {isShowNewUserForm && <div className="users__form">{newUserForm}</div>}

      <div className="users__body">
        <ul className="users__list">{children}</ul>
      </div>
    </div>
  )
}

Users.Item = UsersItem
Users.NewForm = UsersNewForm
