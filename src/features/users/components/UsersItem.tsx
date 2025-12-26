import {
  useUsersActions,
  useUsersState,
  UsersProfileView,
  UsersProfileEditor,
} from '@/features/users'
import { memo, useCallback, useMemo, useState, type ChangeEvent } from 'react'
import type {
  EditableUserFormObject,
  EditableUserKey,
  PayloadModifiedUser,
  User,
  UserKeys,
} from '@/types/users'
import { filterModifiedData, hasEmptyRequiredField } from '@/util/users'
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
  // const originalData = useMemo(
  //   () => ({
  //     avatar,
  //     email,
  //     first_name: firstName,
  //     last_name: lastName,
  //   }),
  //   [avatar, email, firstName, lastName],
  // )
  // const [formData, setFormData] = useState<EditableUserFormObject>(originalData)
  const { newUserState, userEditState, userDeleteState } = useUsersState()
  const { userEditDispatch, userDeleteDispatch, onModify, onDelete } = useUsersActions()

  // ✨ RHF 도구들 꺼내기
  const {
    register,
    getValues,
    setValue,
    trigger,
    formState: { errors, dirtyFields },
  } = useFormContext<{ users: User[] }>()

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

  // [프로필 이미지 변경 핸들러]
  const handleChangeImage = useCallback(
    (url: string) => {
      setValue(`users.${index}.avatar`, url, { shouldDirty: true })
    },
    [index, setValue],
  )

  // [수정하기] : 개별 유저 수정하기
  const handleSubmitUserItem = async () => {
    const isValid = await trigger(`users.${index}`)
    if (!isValid) {
      alert('입력값을 확인해주세요.')
      return
    }

    const userDirtyFields = dirtyFields.users?.[index]
    console.log({ userDirtyFields })
    if (!userDirtyFields || Object.keys(userDirtyFields).length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

    const currentUserData = getValues(`users.${index}`)
    const payload: PayloadModifiedUser = {}
    const dirtyKeys = Object.keys(userDirtyFields)

    dirtyKeys.forEach((key) => {
      if (
        EDITABLE_USER_KEYS.some((editabledKey) => key === editabledKey) &&
        userDirtyFields[key as EditableUserKey]
      ) {
        payload[key as EditableUserKey] = currentUserData[key as EditableUserKey]
      }
    })

    if (Object.keys(payload).length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

    if (
      currentUserData.first_name.trim() === '' ||
      currentUserData.last_name.trim() === '' ||
      currentUserData.email.trim() === ''
    ) {
      alert('빈 값은 저장할 수 없습니다.')
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

  // [수정하기] : 수정 취소
  const handleClickCancel = () => {
    setValue(`users.${index}.first_name`, firstName)
    setValue(`users.${index}.last_name`, lastName)
    setValue(`users.${index}.email`, email)
    setValue(`users.${index}.avatar`, avatar as User['avatar'])

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
                // avatar={formData ? formData.avatar : ''}
                // onChange={handleChangeImage}
                // RHF의 watch를 써서 실시간 미리보기를 할 수도 있지만,
                // 여기선 props(fields) 혹은 getValues로 처리
                avatar={getValues(`users.${index}.avatar`)}
                onChange={handleChangeImage}
              />
            ) : (
              <UsersProfileView avatar={avatar} />
            )}
          </div>

          <div className="userItem__texts">
            {/* ✨ 여기가 핵심: 수정 모드면 무조건 RHF Input 렌더링 */}
            {isEditing ? (
              <div className="userItem__editer">
                {/* 식별자 (Bulk Submit용) */}
                <input type="hidden" {...register(`users.${index}.id`)} value={id} />
                <input type="hidden" {...register(`users.${index}.avatar`)} value={avatar} />

                <input
                  type="text"
                  placeholder="first name"
                  {...register(`users.${index}.first_name`, { required: true })}
                />
                <input
                  type="text"
                  placeholder="last name"
                  {...register(`users.${index}.last_name`, { required: true })}
                />
                <input
                  type="text"
                  placeholder="email"
                  {...register(`users.${index}.email`, { required: true })}
                />
              </div>
            ) : // 뷰 모드
            userDeleteState.isShowDeleteCheckbox ? (
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
                  onClick={handleSubmitUserItem} // ✨ 개별 저장 핸들러 호출
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
