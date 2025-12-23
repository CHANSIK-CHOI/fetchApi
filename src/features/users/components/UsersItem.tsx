import {
  useUsersActions,
  useUsersState,
  UsersProfileView,
  UsersProfileEditor,
} from '@/features/users'
import { memo, useCallback, useMemo, useState, type ChangeEvent } from 'react'
import type { EditableUserFormObject, User } from '@/types/users'
import { filterModifiedData, hasEmptyRequiredField } from '@/util/users'

type UsersItemProps = {
  avatar?: User['avatar']
  firstName: User['first_name']
  lastName: User['last_name']
  email: User['email']
  id: User['id']
}

function UsersItem({ avatar, firstName, lastName, email, id }: UsersItemProps) {
  const originalData = useMemo(
    () => ({
      avatar,
      email,
      first_name: firstName,
      last_name: lastName,
    }),
    [avatar, email, firstName, lastName],
  )
  const [formData, setFormData] = useState<EditableUserFormObject>(originalData)
  const { newUserState, userEditState, userDeleteState } = useUsersState()
  const { userEditDispatch, userDeleteDispatch, onModify, onDelete } = useUsersActions()

  const isItemEditing = userEditState.displayedEditor.includes(id)
  const isEditing = userEditState.isShowAllEditor || isItemEditing

  const isShowEditorBtns =
    !userEditState.isShowAllEditor &&
    !userDeleteState.isShowDeleteCheckbox &&
    !newUserState.isShowEditor

  const userNameEl = (
    <>
      <span className="userItem__name">
        {firstName} {lastName}
      </span>
      <span className="userItem__email">{email}</span>
    </>
  )

  const handleChangeUserData = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name.replace(/_\d+$/, '')

    setFormData((prev) => {
      return {
        ...prev,
        [fieldName]: value,
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

  // [수정하기] : 개별 유저 수정하기
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

  // [수정하기] : 수정취소
  const handleClickCancel = () => {
    setFormData(originalData)
    userEditDispatch({ type: 'HIDE_EDITOR', payload: { id } })
  }

  // [삭제하기] : 개별 유저 삭제
  const handleDeleteItem = async () => {
    if (userDeleteState.deleteing !== null) return

    const confirmMsg = `${firstName} ${lastName}님의 데이터를 삭제하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userDeleteDispatch({ type: 'SUBMIT_START', payload: { id } })
      await onDelete(id)
      userDeleteDispatch({ type: 'SUBMIT_SUCCESS' })
      alert('삭제를 완료하였습니다.')
    } catch (err) {
      console.error(err)
      userDeleteDispatch({
        type: 'SUBMIT_ERROR',
        payload: { msg: '삭제에 실패했습니다. 다시 시도해주세요.' },
      })
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // [삭제하기] : checkbox
  const isChecked = userDeleteState.checkedIds.includes(id)
  const handleChangeCheckItem = () => {
    userDeleteDispatch({ type: 'TOGGLE_ITEM', payload: { id } })
  }

  return (
    <li className="userItem">
      <div className="userItem__box">
        {userDeleteState.isShowDeleteCheckbox && (
          <div className="userItem__checkbox">
            <input
              type="checkbox"
              name={`checkbox_${id}`}
              id={`checkbox_${id}`}
              checked={isChecked}
              onChange={handleChangeCheckItem}
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
              userDeleteState.isShowDeleteCheckbox ? (
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
                />
                <input
                  type="text"
                  name={`last_name_${id}`}
                  placeholder="last name"
                  value={formData ? formData.last_name : ''}
                  onChange={handleChangeUserData}
                />
                <input
                  type="text"
                  name={`email_${id}`}
                  placeholder="email"
                  value={formData ? formData.email : ''}
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
                onClick={handleDeleteItem}
                disabled={userDeleteState.deleteing == id}
              >
                {userDeleteState.deleteing == id ? '삭제중...' : '삭제하기'}
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

export default memo(UsersItem)
