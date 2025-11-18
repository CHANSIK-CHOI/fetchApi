import React from 'react'
import { UsersItem, UsersForm, useUsers } from '@/features/users'

type UsersProps = {
  children: React.ReactNode
  userForm: React.ReactNode
}
export default function Users({ children, userForm }: UsersProps) {
  const {
    isAllEditing,
    onAllEditing,
    isSelectedForDeletion,
    onSelectedForDeletion,
    onSelectedDelete,
    isShowUserForm,
    onPostUserData,
  } = useUsers()

  const resultCount = React.Children.count(children).toString().padStart(2, '0')
  const isActiveUserForm = !isAllEditing && !isSelectedForDeletion
  const isActiveSelectedForDeletion = !isShowUserForm && !isAllEditing
  const isActiveAllEditing = !isShowUserForm && !isSelectedForDeletion

  return (
    <div className="users">
      <div className="users__head">
        <span className="users__result">검색 결과 : {resultCount}건</span>

        <div className="users__actions">
          {isActiveUserForm && (
            <>
              {!isShowUserForm ? (
                <button
                  type="button"
                  className="line"
                  onClick={() => onPostUserData({ isShow: true })}
                >
                  추가하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => onPostUserData({ isShow: false })}
                  >
                    추가취소
                  </button>
                  <button
                    type="button"
                    onClick={() => onPostUserData({ isShow: false, isPost: true })}
                  >
                    추가완료
                  </button>
                </>
              )}
            </>
          )}

          {isActiveSelectedForDeletion && (
            <>
              {!isSelectedForDeletion ? (
                <button type="button" className="line" onClick={() => onSelectedForDeletion(true)}>
                  선택하기
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="line"
                    onClick={() => onSelectedForDeletion(false)}
                  >
                    선택취소
                  </button>
                  <button type="button" onClick={onSelectedDelete}>
                    삭제하기
                  </button>
                </>
              )}
            </>
          )}

          {isActiveAllEditing && (
            <>
              {!isAllEditing ? (
                <button type="button" className="line" onClick={() => onAllEditing(true)}>
                  전체수정
                </button>
              ) : (
                <>
                  <button type="button" className="line" onClick={() => onAllEditing(false)}>
                    수정취소
                  </button>
                  <button type="button" onClick={() => onAllEditing(false)}>
                    수정완료
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      {isShowUserForm && <div className="users__form">{userForm}</div>}

      <div className="users__body">
        <ul className="users__list">{children}</ul>
      </div>
    </div>
  )
}

Users.Item = UsersItem
Users.Form = UsersForm
