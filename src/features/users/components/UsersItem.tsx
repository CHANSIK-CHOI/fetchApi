import {
  useUsersActions,
  useUsersState,
  UsersProfileView,
  UsersProfileEditor,
} from '@/features/users'
import { memo, useCallback } from 'react'
import type { EditableUserKey, PayloadModifiedUser, User } from '@/types/users'
import { useFormContext } from 'react-hook-form'
import { EDITABLE_USER_KEYS } from '@/constants/users'

type UsersItemProps = {
  avatar?: User['avatar']
  firstName: User['first_name']
  lastName: User['last_name']
  email: User['email']
  id: User['id']
  index: number
}

function UsersItem({ avatar, firstName, lastName, email, id, index }: UsersItemProps) {
  const { newUserState, userEditState, userDeleteState } = useUsersState()
  const { userEditDispatch, userDeleteDispatch, onModify, onDelete } = useUsersActions()

  const {
    register,
    getValues,
    setValue,
    trigger,
    formState: { errors, dirtyFields },
  } = useFormContext<{ users: User[] }>()

  const userError = errors.users?.[index]

  const isItemEditing = userEditState.displayedEditor.includes(id)
  const isAllEditing = userEditState.isShowAllEditor
  const isEditing = isAllEditing || isItemEditing

  const isShowEditorBtns =
    !isAllEditing && !userDeleteState.isShowDeleteCheckbox && !newUserState.isShowEditor
  const isChecked = userDeleteState.checkedIds.includes(id)

  const userNameEl = (
    <>
      <span className="userItem__name">
        {firstName} {lastName}
      </span>
      <span className="userItem__email">{email}</span>
    </>
  )

  const handleChangeImage = useCallback(
    (url: string) => {
      setValue(`users.${index}.avatar`, url, { shouldDirty: true })
    },
    [index, setValue],
  )

  const handleSubmitUserItem = async () => {
    const isValid = await trigger(`users.${index}`)

    if (!isValid) {
      alert('입력값을 확인해주세요.')
      return
    }

    const userDirtyFields = dirtyFields.users?.[index]
    if (!userDirtyFields || Object.keys(userDirtyFields).length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

    const currentUser = getValues(`users.${index}`)
    const payload: PayloadModifiedUser = {}
    const dirtyKeys = Object.keys(userDirtyFields)

    dirtyKeys.forEach((key) => {
      if (
        EDITABLE_USER_KEYS.some((editabledKey) => key === editabledKey) &&
        userDirtyFields[key as EditableUserKey]
      ) {
        const value = currentUser[key as EditableUserKey]
        payload[key as EditableUserKey] = typeof value === 'string' ? value.trim() : value
      }
    })

    if (Object.keys(payload).length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

    if (!confirm(`${firstName} ${lastName}님의 정보를 수정하시겠습니까?`)) return

    try {
      userEditDispatch({ type: 'SUBMIT_START', payload: { id } })
      await onModify(id, payload)
      userEditDispatch({ type: 'SUBMIT_SUCCESS', payload: { data: payload, id } })
      alert('수정을 완료하였습니다.')
    } catch (err) {
      console.error(err)
      userEditDispatch({
        type: 'SUBMIT_ERROR',
        payload: { msg: '수정에 실패했습니다.' },
      })
      alert('수정에 실패했습니다.')
    }
  }

  const handleClickCancel = () => {
    setValue(`users.${index}.first_name`, firstName)
    setValue(`users.${index}.last_name`, lastName)
    setValue(`users.${index}.email`, email)
    setValue(`users.${index}.avatar`, avatar as User['avatar'])
    userEditDispatch({ type: 'HIDE_EDITOR', payload: { id } })
  }

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
                avatar={getValues(`users.${index}.avatar`)}
                onChange={handleChangeImage}
              />
            ) : (
              <UsersProfileView avatar={avatar} />
            )}
          </div>

          <div className="userItem__texts">
            {isEditing ? (
              <div className="userItem__editer">
                <input type="hidden" {...register(`users.${index}.id`)} value={id} />
                <input type="hidden" {...register(`users.${index}.avatar`)} value={avatar} />

                <div className="input-group">
                  <input
                    type="text"
                    placeholder="first name"
                    {...register(`users.${index}.first_name`, {
                      required: '필수 입력값입니다.',
                      validate: (value) => !!value.trim() || '공백으로 입력할 수 없습니다.',
                    })}
                  />
                  {userError?.first_name && (
                    <span className="error-msg">{userError.first_name.message}</span>
                  )}
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder="last name"
                    {...register(`users.${index}.last_name`, {
                      required: '필수 입력값입니다.',
                      validate: (value) => !!value.trim() || '공백으로 입력할 수 없습니다.',
                    })}
                  />

                  {userError?.last_name && (
                    <span className="error-msg">{userError.last_name.message}</span>
                  )}
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    placeholder="email"
                    {...register(`users.${index}.email`, {
                      required: '필수 입력값입니다.',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: '유효한 이메일 형식이 아닙니다.',
                      },
                    })}
                  />

                  {userError?.email && <span className="error-msg">{userError.email.message}</span>}
                </div>
              </div>
            ) : userDeleteState.isShowDeleteCheckbox ? (
              <label htmlFor={`checkbox_${id}`} className="userItem__checkLabel">
                {userNameEl}
              </label>
            ) : (
              userNameEl
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
