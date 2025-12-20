import {
  useUsersActions,
  useUsersState,
  UsersProfileView,
  UsersProfileEditor,
} from '@/features/users'
import { useCallback, useState, type ChangeEvent } from 'react'

import type { PayloadModifiedUser, PayloadNewUser, User } from '@/types/users'
import { filterModifiedData, hasEmptyRequiredField } from '@/util/users'

type UsersItem = {
  avatar?: User['avatar']
  firstName: User['first_name']
  lastName: User['last_name']
  email: User['email']
  id: User['id']
  onModify: (id: User['id'], payload: PayloadModifiedUser) => Promise<void>
}

export default function UsersItem({ avatar, firstName, lastName, email, id, onModify }: UsersItem) {
  const originalData = {
    avatar,
    email,
    first_name: firstName,
    last_name: lastName,
  }
  const [formData, setFormData] = useState<PayloadNewUser>(originalData)

  const { isShowDeleteCheckbox, isDeleting, checkedDeleteItems, newUserState, userEditState } =
    useUsersState()
  const { onChangeCheckDeleteItems, onClickDeleteItem, userEditDispatch } = useUsersActions()

  const isItemEditing = userEditState.displayedEditor.includes(id)
  const isEditing = userEditState.isShowAllEditor || isItemEditing

  const isShowEditorBtns =
    !userEditState.isShowAllEditor && !isShowDeleteCheckbox && !newUserState.isShowEditor

  const handleChangeUserData = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name.replace(/_\d+$/, '')

    setFormData((prev) => {
      return {
        ...prev,
        [fieldName]: value.trim(),
      }
    })
  }

  const handleChangeImage = useCallback((url: string) => {
    setFormData((prev) => {
      return {
        ...prev,
        avatar: url,
      }
    })
  }, [])

  const userNameEl = (
    <>
      <span className="userItem__name">
        {firstName} {lastName}
      </span>
      <span className="userItem__email">{email}</span>
    </>
  )

  const handleSubmitUserItem = async () => {
    if (userEditState.editing !== null) return

    const filteredIdAndData = filterModifiedData({ data: formData, originalData, id })
    const filteredData = filteredIdAndData[id]

    if (!filteredData) {
      alert('수정된 내역이 없습니다.')
      return
    }

    const hasEmpty = hasEmptyRequiredField(filteredData)
    if (hasEmpty) {
      alert('이메일, 이름, 성은 빈값으로 수정할 수 없습니다.')
      return
    }

    const confirmMsg = `${originalData.first_name} ${originalData.last_name}님의 데이터를 수정하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userEditDispatch({ type: 'SUBMIT_START', payload: { id } })
      await onModify(id, filteredData)
      userEditDispatch({ type: 'SUBMIT_SUCCESS', payload: { data: filteredData, id } })
      alert('수정을 완료하였습니다.')
    } catch (err) {
      console.error(err)
      userEditDispatch({
        type: 'SUBMIT_ERROR',
        payload: { msg: '수정에 실패했습니다. 다시 시도해주세요.' },
      })
      alert('수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const handleClickCancel = () => {
    setFormData(originalData)
    userEditDispatch({ type: 'HIDE_EDITOR', payload: { id } })
  }

  return (
    <li className="userItem">
      <div className="userItem__box">
        {isShowDeleteCheckbox && (
          <div className="userItem__checkbox">
            <input
              type="checkbox"
              name="usersItem"
              id={`checkbox_${id}`}
              checked={checkedDeleteItems.includes(id)}
              onChange={(e) => onChangeCheckDeleteItems({ e, id })}
            />
          </div>
        )}
        <div className="userItem__info">
          <div className="userItem__profileWrap">
            {isEditing ? (
              <UsersProfileEditor
                id={id}
                avatar={formData ? formData.avatar : ''}
                onChange={handleChangeImage}
              />
            ) : (
              <UsersProfileView avatar={avatar} />
            )}
          </div>

          <div className="userItem__texts">
            {!isEditing ? (
              isShowDeleteCheckbox ? (
                <label htmlFor={`checkbox_${id}`} className="userItem__checkLabel">
                  {userNameEl}
                </label>
              ) : (
                userNameEl
              )
            ) : (
              <div className="userItem__editer">
                <input
                  type="text"
                  name={`first_name_${id}`}
                  placeholder="first name"
                  value={formData ? formData.first_name : ''}
                  onChange={handleChangeUserData}
                  // onBlur={handleBlurUserInput}
                />
                <input
                  type="text"
                  name={`last_name_${id}`}
                  placeholder="last name"
                  value={formData ? formData.last_name : ''}
                  onChange={handleChangeUserData}
                  // onBlur={handleBlurUserInput}
                />
                <input
                  type="text"
                  name={`email_${id}`}
                  placeholder="email"
                  value={formData ? formData.email : ''}
                  onChange={handleChangeUserData}
                  // onBlur={handleBlurUserInput}
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
                onClick={() => userEditDispatch({ type: 'SHOW_EDITOR', payload: { id } })}
              >
                수정하기
              </button>
            ) : (
              <>
                <button type="button" className="line" onClick={handleClickCancel}>
                  수정취소
                </button>
                <button
                  type="button"
                  onClick={handleSubmitUserItem}
                  disabled={userEditState.editing == id}
                >
                  {userEditState.editing == id ? '수정중...' : '수정완료'}
                </button>
              </>
            )}

            {!isItemEditing && (
              <button
                type="button"
                className="line"
                onClick={() => onClickDeleteItem(id)}
                disabled={isDeleting == id}
              >
                {isDeleting == id ? '삭제중...' : '삭제하기'}
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}
