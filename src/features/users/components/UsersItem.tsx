import {
  useUsersActions,
  useUsersState,
  UsersItemProfileView,
  UsersItemProfileEditor,
} from '@/features/users'
import type { ChangeEvent } from 'react'

import type { PersonalEditableUserKey, User } from '@/types/users'

type UsersItem = {
  profileSrc?: User['avatar']
  firstName: User['first_name']
  lastName: User['last_name']
  email: User['email']
  id: User['id']
}

export default function UsersItem({ profileSrc, firstName, lastName, email, id }: UsersItem) {
  const {
    isShowAllEditor,
    displayItemEditor,
    isShowDeleteCheckbox,
    isShowNewUserForm,
    builtAllUsersValue,
    isPatching,
  } = useUsersState()
  const { onItemEditor, onChangeCheckDeleteItems, onChangeUserData } = useUsersActions()

  const isItemEditing = displayItemEditor.includes(id)
  const isEditing = isShowAllEditor || isItemEditing

  const userInputValues = builtAllUsersValue[id]
  const firstNameValue = userInputValues ? userInputValues[`first_name_${id}`] : ''
  const lastNameValue = userInputValues ? userInputValues[`last_name_${id}`] : ''
  const emailValue = userInputValues ? userInputValues[`email_${id}`] : ''
  const avatarSrc = (userInputValues ? userInputValues[`avatar_${id}`] : '') as string

  const isShowEditorBtns = !isShowAllEditor && !isShowDeleteCheckbox && !isShowNewUserForm
  const handleChangeUserData = (
    e: ChangeEvent<HTMLInputElement & { name: PersonalEditableUserKey }>,
  ) => onChangeUserData(e, id)

  return (
    <li className="userItem">
      <div className="userItem__box">
        {isShowDeleteCheckbox && (
          <div className="userItem__checkbox">
            <input
              type="checkbox"
              name="usersItem"
              id={`checkbox_${id}`}
              onChange={(e) => onChangeCheckDeleteItems({ e, id })}
            />
          </div>
        )}
        <div className="userItem__info">
          <div className="userItem__profileWrap">
            {isEditing ? (
              <UsersItem.ProfileEditor key={`editing-${id}`} id={id} profileSrc={avatarSrc} />
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
                  onChange={handleChangeUserData}
                />
                <input
                  type="text"
                  name={`last_name_${id}`}
                  placeholder="last name"
                  value={lastNameValue}
                  onChange={handleChangeUserData}
                />
                <input
                  type="text"
                  name={`email_${id}`}
                  placeholder="email"
                  value={emailValue}
                  onChange={handleChangeUserData}
                />
              </div>
            )}
          </div>
        </div>

        {isShowEditorBtns && (
          <div className="userItem__actions">
            {!isItemEditing ? (
              <button
                type="button"
                className="line"
                onClick={() => onItemEditor({ id, isShowEditor: true })}
              >
                수정하기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="line"
                  onClick={() => onItemEditor({ id, isShowEditor: false })}
                >
                  수정취소
                </button>
                <button
                  type="button"
                  onClick={() => onItemEditor({ id, isShowEditor: false, isPatch: true })}
                  disabled={isPatching == 'all' || isPatching == id}
                >
                  {isPatching == 'all' || isPatching == id ? '수정중...' : '수정완료'}
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
