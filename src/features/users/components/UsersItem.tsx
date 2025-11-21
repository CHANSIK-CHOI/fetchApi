import { type ChangeEvent } from 'react'
import { useUsers } from '@/features/users'
import { UsersItemProfileView, UsersItemProfileEditor } from '@/features/users'

type UsersItem = {
  profileSrc: string | undefined
  firstName: string
  lastName: string
  email: string
  id: number
}

export default function UsersItem({ profileSrc, firstName, lastName, email, id }: UsersItem) {
  const {
    isAllEditing,
    editingItemArray,
    onItemEditing,
    isSelectedForDeletion,
    onChangeItem,
    isShowUserForm,
    usersFormValue,
  } = useUsers()

  const isItemEditing = editingItemArray.includes(id)
  const isEditing = isAllEditing || isItemEditing

  const handleChangeCheckBox = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    onChangeItem({ checked, id })
  }

  const userData = usersFormValue.find((item) => item.id === id)
  const firstNameValue = userData ? userData[`first_name_${id}`] : ''
  const lastNameValue = userData ? userData[`last_name_${id}`] : ''
  const emailValue = userData ? userData[`email_${id}`] : ''

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
            {isEditing ? (
              <UsersItem.ProfileEditor key={`editing-${id}`} id={id} profileSrc={profileSrc} />
            ) : (
              <UsersItem.ProfileView profileSrc={profileSrc} />
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
                <input
                  type="text"
                  name={`first_name_${id}`}
                  placeholder="first name"
                  value={firstNameValue}
                />
                <input
                  type="text"
                  name={`last_name_${id}`}
                  placeholder="last name"
                  value={lastNameValue}
                />
                <input type="text" name={`email_${id}`} placeholder="email" value={emailValue} />
              </div>
            )}
          </div>
        </div>

        {!isAllEditing && !isSelectedForDeletion && !isShowUserForm && (
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
              <>
                <button
                  type="button"
                  className="line"
                  onClick={() => onItemEditing({ id, isEditing: false })}
                >
                  수정취소
                </button>
                <button
                  type="button"
                  onClick={() => onItemEditing({ id, isEditing: false, isPatch: true })}
                >
                  수정완료
                </button>
              </>
            )}

            {!isItemEditing && (
              <button type="button" className="line">
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

UsersItem.ProfileView = UsersItemProfileView
UsersItem.ProfileEditor = UsersItemProfileEditor
