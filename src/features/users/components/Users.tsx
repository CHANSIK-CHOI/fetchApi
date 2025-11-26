import React from 'react'
import { UsersItem, UsersNewForm, useUsers } from '@/features/users'

type UsersProps = {
  children: React.ReactNode
  newUserForm: React.ReactNode
}
export default function Users({ children, newUserForm }: UsersProps) {
  const {
    isShowAllEditor,
    onAllEditor,
    isShowDeleteCheckbox,
    toggleDeleteCheckbox,
    onClickDeleteItems,
    isShowNewUserForm,
    onNewUserForm,
  } = useUsers()

  const resultCount = React.Children.count(children).toString().padStart(2, '0')
  const isShowNewUserFormEl = !isShowAllEditor && !isShowDeleteCheckbox
  const isShowDeleteCheckboxEl = !isShowNewUserForm && !isShowAllEditor
  const isShowAllEditorEl = !isShowNewUserForm && !isShowDeleteCheckbox

  return (
    <div className="users">
      <div className="users__head">
        <span className="users__result">검색 결과 : {resultCount}건</span>

        <div className="users__actions">
          {isShowNewUserFormEl && (
            <>
              {!isShowNewUserForm ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => onNewUserForm({ isShow: true })}
                >
                  추가하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => onNewUserForm({ isShow: false })}
                  >
                    추가취소
                  </button>
                  <button
                    type="button"
                    onClick={() => onNewUserForm({ isShow: false, isPost: true })}
                  >
                    추가완료
                  </button>
                </>
              )}
            </>
          )}

          {isShowDeleteCheckboxEl && (
            <>
              {!isShowDeleteCheckbox ? (
                <button type="button" className="line" onClick={() => toggleDeleteCheckbox(true)}>
                  선택하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => toggleDeleteCheckbox(false)}
                  >
                    선택취소
                  </button>
                  <button type="button" onClick={onClickDeleteItems}>
                    삭제하기
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
                  >
                    수정완료
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
