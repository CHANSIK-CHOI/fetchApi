import React from 'react'

import UsersItem from './UsersItem'
import { useUsers } from '@/components/Users/useUsers'

type UsersProps = {
  children: React.ReactNode
}
export default function Users({ children }: UsersProps) {
  const { isAllEditingState, setIsAllEditing } = useUsers()
  const handleModifiycomplete = () => {
    setIsAllEditing(false)
  }

  return (
    <div className="users">
      <div className="users__head">
        <span className="users__result">검색 결과 : 00건</span>

        <div className="users__actions">
          {!isAllEditingState ? (
            <button type="button" className="line" onClick={() => setIsAllEditing(true)}>
              전체수정
            </button>
          ) : (
            <button type="button" onClick={handleModifiycomplete}>
              수정완료
            </button>
          )}

          <button type="button">선택삭제</button>
        </div>
      </div>
      <div className="users__body">
        <ul className="users__list">{children}</ul>
      </div>
    </div>
  )
}

Users.Item = UsersItem
