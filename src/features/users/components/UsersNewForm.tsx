import React, { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { PayloadNewUser, RequiredEditableUserKey, User } from '@/types/users'
import { INIT_NEW_USER_VALUE, PLACEHOLDER_SRC } from '@/constants/users'
import { useUsersActions, useUsersState } from '@/features/users'
import { hasEmptyRequiredField, readFileAsDataURL } from '@/util/users'

export default function UsersNewForm() {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [submitValue, setSubmitValue] = useState<User['avatar']>('')
  const [newUserValue, setNewUserValue] = useState<PayloadNewUser>(INIT_NEW_USER_VALUE)
  const { newUserState } = useUsersState()
  const { onCreate, newUserDispatch } = useUsersActions()

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    if (!selected) return

    const objectUrl = URL.createObjectURL(selected)
    setPreviewUrl(objectUrl)

    const base64 = await readFileAsDataURL(selected)
    setSubmitValue(base64)

    setNewUserValue((prev) => ({ ...prev, avatar: base64 }))
  }

  const handleRemoveImage = () => {
    if (previewUrl == '') return
    setPreviewUrl('')
    setSubmitValue('')
    setNewUserValue((prev) => ({ ...prev, avatar: undefined }))
  }

  const handleChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: newDataName, value } = e.target
    const key = newDataName.replace(/_userForm$/, '') as RequiredEditableUserKey
    setNewUserValue((prev) => ({ ...prev, [key]: value }))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (newUserState.isCreating) return

    const hasEmpty = hasEmptyRequiredField(newUserValue)
    if (hasEmpty) {
      alert('이메일, 이름, 성을 모두 입력해주세요.')
      return
    }

    const confirmMsg = `${newUserValue.first_name} ${newUserValue.last_name}님의 데이터를 추가하시겠습니까?`
    if (!confirm(confirmMsg)) return

    newUserDispatch({ type: 'RESET' })

    try {
      newUserDispatch({ type: 'SUBMIT_START' })
      await onCreate(newUserValue)
      newUserDispatch({ type: 'SUBMIT_SUCCESS', payload: newUserValue })
      alert('추가를 완료하였습니다.')

      setNewUserValue(INIT_NEW_USER_VALUE)
      setPreviewUrl('')
    } catch (err) {
      console.error(err)
      newUserDispatch({
        type: 'SUBMIT_ERROR',
        payload: '유저 생성에 실패했습니다. 다시 시도해주세요.',
      })
      alert('유저 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  const displaySrc = submitValue !== '' ? submitValue : PLACEHOLDER_SRC
  const isHasContent = Boolean(submitValue)

  if (!newUserState.isShowEditor) return null

  return (
    <div className="users__newForm">
      <form id="usersNewForm" className="userForm" onSubmit={handleSubmit}>
        <div className="userForm__box">
          <div className="userForm__profileWrap">
            <div className="userForm__profile">
              <img src={displaySrc} alt="" />
            </div>
            <div className="userForm__profileBtns">
              <label htmlFor="userFormImg" className="button line userForm__profileBtn">
                {isHasContent ? '프로필 변경' : '프로필 추가'}
              </label>

              {isHasContent && (
                <button
                  type="button"
                  className="line userForm__profileBtn"
                  onClick={handleRemoveImage}
                >
                  삭제
                </button>
              )}
            </div>

            <input
              id="userFormImg"
              type="file"
              accept="image/*"
              hidden
              onChange={handleChangeImage}
            />
          </div>

          <div className="userForm__editer">
            <input
              type="text"
              name={`first_name_userForm`}
              placeholder="first name"
              value={newUserValue.first_name ?? ''}
              onChange={handleChangeInput}
            />
            <input
              type="text"
              name={`last_name_userForm`}
              placeholder="last name"
              value={newUserValue.last_name ?? ''}
              onChange={handleChangeInput}
            />
            <input
              type="text"
              name={`email_userForm`}
              placeholder="email"
              value={newUserValue.email ?? ''}
              onChange={handleChangeInput}
            />
          </div>
        </div>
      </form>
    </div>
  )
}
