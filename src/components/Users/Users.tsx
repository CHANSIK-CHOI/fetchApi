import React from 'react'

import { UsersItem, useUsers } from '@/components/Users'

type UsersProps = {
  children: React.ReactNode
}
export default function Users({ children }: UsersProps) {
  const {
    isAllEditing,
    onAllEditing,
    isSelectedForDeletion,
    onSelectedForDeletion,
    onSelectedDelete,
  } = useUsers()

  const handleModifiycomplete = () => {
    onAllEditing(false)
  }

  return (
    <div className="users">
      <div className="users__head">
        <span className="users__result">검색 결과 : 00건</span>

        <div className="users__actions">
          {!isAllEditing ? (
            <button type="button" className="line" onClick={() => onAllEditing(true)}>
              전체수정
            </button>
          ) : (
            <button type="button" onClick={handleModifiycomplete}>
              수정완료
            </button>
          )}

          {!isSelectedForDeletion ? (
            <button type="button" className="line" onClick={() => onSelectedForDeletion(true)}>
              선택하기
            </button>
          ) : (
            <button type="button" onClick={() => onSelectedForDeletion(false)}>
              선택취소하기
            </button>
          )}

          {isSelectedForDeletion && (
            <button type="button" onClick={onSelectedDelete}>
              삭제하기
            </button>
          )}
        </div>
      </div>
      <div className="users__body">
        <ul className="users__list">{children}</ul>
      </div>
    </div>
  )
}

Users.Item = UsersItem
