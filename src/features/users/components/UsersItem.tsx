import type { ChangeEvent } from 'react'
import { useUsers } from '@/features/users'

type UsersItem = {
  profileSrc: string | undefined
  firstName: string
  lastName: string
  email: string
  id: number
}

export default function UsersItem({ profileSrc, firstName, lastName, email, id }: UsersItem) {
  const { isAllEditing, editingItemArray, onItemEditing, isSelectedForDeletion, onChangeItem } =
    useUsers()

  const isItemEditing = editingItemArray.includes(id)
  const isEditing = isAllEditing || isItemEditing

  const handleChangeCheckBox = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    onChangeItem({ checked, id })
  }
  return (
    <li className="userItem">
      <div className="userItem__box">
        {isSelectedForDeletion && (
          <div className="userItem__checkbox">
            <input
              type="checkbox"
              name="usersItem"
              id={`checkbox_${id}`}
              onChange={handleChangeCheckBox}
            />
          </div>
        )}
        <div className="userItem__info">
          <div className="userItem__profileWrap">
            <div className="userItem__profile">
              <img src={profileSrc || 'https://placehold.co/100x100?text=Hello+World'} alt="" />
            </div>
            {isEditing && (
              <button type="button" className="line userItem__profileBtn">
                프로필 변경
              </button>
            )}
          </div>

          <div className="userItem__texts">
            {!isEditing ? (
              <>
                <span className="userItem__name">
                  {firstName} {lastName}
                </span>
                <span className="userItem__email">{email}</span>
              </>
            ) : (
              <div className="userItem__editer">
                <input type="text" name={`first_name_${id}`} placeholder="first name" />
                <input type="text" name={`last_name_${id}`} placeholder="last name" />
                <input type="text" name={`email_${id}`} placeholder="email" />
              </div>
            )}
          </div>
        </div>

        {!isAllEditing && (
          <div className="userItem__actions">
            {!isItemEditing ? (
              <button
                type="button"
                className="line"
                onClick={() => onItemEditing({ id, isEditing: true })}
              >
                수정하기
              </button>
            ) : (
              <button type="button" onClick={() => onItemEditing({ id, isEditing: false })}>
                수정완료
              </button>
            )}

            <button type="button" className="line">
              삭제
            </button>
          </div>
        )}
      </div>
    </li>
  )
}
