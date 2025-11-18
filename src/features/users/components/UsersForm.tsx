import React from 'react'
// import { useUsers } from '@/features/users'

export default function UsersForm() {
  return (
    <div className="userForm">
      <div className="userForm__box">
        <div className="userForm__profileWrap">
          <div className="userForm__profile">
            <img src="https://placehold.co/100x100?text=Hello+World" alt="" />
          </div>
          <button type="button" className="line userForm__profileBtn">
            프로필 추가
          </button>
        </div>

        <div className="userForm__editer">
          <input type="text" name={`first_name_userForm`} placeholder="first name" />
          <input type="text" name={`last_name_userForm`} placeholder="last name" />
          <input type="text" name={`email_userForm`} placeholder="email" />
        </div>
      </div>
    </div>
  )
}
