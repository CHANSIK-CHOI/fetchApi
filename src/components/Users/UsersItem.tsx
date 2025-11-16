import React from 'react'

type UsersItem = {
  profileSrc: string | undefined
  firstName: string
  lastName: string
  email: string
}

export default function UsersItem({ profileSrc, firstName, lastName, email }: UsersItem) {
  return (
    <li className="users__item">
      <div className="users__box">
        <div className="users__info">
          <div className="users__profile">
            <img src={profileSrc} alt="" />
          </div>

          <div className="users__texts">
            <span className="users__name">
              {firstName} {lastName}
            </span>
            <span className="users__email">{email}</span>
          </div>
        </div>

        <div className="users__actions">
          <button type="button">수정하기</button>
          <button type="button">수정완료</button>
          <button type="button">삭제</button>
        </div>
      </div>
    </li>
  )
}
