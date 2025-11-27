import {
  useUsersActions,
  useUsersState,
  UsersItemProfileView,
  UsersItemProfileEditor,
} from '@/features/users'

type UsersItem = {
  profileSrc: string | undefined
  firstName: string
  lastName: string
  email: string
  id: number
}

export default function UsersItem({ profileSrc, firstName, lastName, email, id }: UsersItem) {
  const {
    isShowAllEditor,
    showItemEditor,
    isShowDeleteCheckbox,
    isShowNewUserForm,
    builtUsersData,
    isPatching,
  } = useUsersState()
  const { onItemEditor, onChangeCheckDeleteItems, onChangeUserData } = useUsersActions()

  const isItemEditing = showItemEditor.includes(id)
  const isEditing = isShowAllEditor || isItemEditing

  const userInputValues = builtUsersData[id]
  const firstNameValue = userInputValues ? userInputValues[`first_name_${id}`] : ''
  const lastNameValue = userInputValues ? userInputValues[`last_name_${id}`] : ''
  const emailValue = userInputValues ? userInputValues[`email_${id}`] : ''
  const avatarSrc = (userInputValues ? userInputValues[`avatar_${id}`] : '') as string

  const isShowEditorBtns = !isShowAllEditor && !isShowDeleteCheckbox && !isShowNewUserForm

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
                  onChange={(e) => onChangeUserData(e, id)}
                />
                <input
                  type="text"
                  name={`last_name_${id}`}
                  placeholder="last name"
                  value={lastNameValue}
                  onChange={(e) => onChangeUserData(e, id)}
                />
                <input
                  type="text"
                  name={`email_${id}`}
                  placeholder="email"
                  value={emailValue}
                  onChange={(e) => onChangeUserData(e, id)}
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
