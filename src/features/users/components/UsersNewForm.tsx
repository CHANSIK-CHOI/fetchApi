import React, { useCallback, useEffect, useState, type FormEvent } from 'react'
import type { PayloadNewUser, RequiredEditableUserKey } from '@/types/users'
import { INIT_NEW_USER_VALUE } from '@/constants/users'
import { useUsersActions, useUsersState } from '@/features/users'
import { hasEmptyRequiredField } from '@/util/users'

type UsersNewFormProps = {
  onCreate: (payload: PayloadNewUser) => Promise<void>
}
export default function UsersNewForm({ onCreate }: UsersNewFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const [newUserValue, setNewUserValue] = useState<PayloadNewUser>(INIT_NEW_USER_VALUE)
  const [fileName, setFileName] = useState<string | null>(null)
  const { newUserState } = useUsersState()
  const { newUserDispatch } = useUsersActions()

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    const { name } = file

    setPreviewUrl(objectUrl)
    setFileName(name)
    setNewUserValue((prev) => ({ ...prev, avatar: objectUrl }))
  }

  const handleRemoveImage = () => {
    if (previewUrl == '') return
    setPreviewUrl('')
    setFileName(null)
    setNewUserValue((prev) => ({ ...prev, avatar: undefined }))
  }

  const handleChangeInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name: newDataName, value } = e.target
    const key = newDataName.replace(/_userForm$/, '') as RequiredEditableUserKey
    const trimmed = value.trim()
    setNewUserValue((prev) => ({ ...prev, [key]: trimmed }))
  }, [])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

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

    try {
      newUserDispatch({ type: 'SUBMIT_START' })
      await onCreate(newUserValue)
      newUserDispatch({ type: 'SUBMIT_SUCCESS' })
      alert('추가를 완료하였습니다.')

      setNewUserValue(INIT_NEW_USER_VALUE)
      setPreviewUrl('')
      setFileName(null)
    } catch (err) {
      console.error(err)
      newUserDispatch({ type: 'SUBMIT_ERROR' })
      alert('유저 생성에 실패했습니다. 다시 시도해주세요.')
    }
  }

  return (
    <form id="usersNewForm" className="userForm" onSubmit={handleSubmit}>
      <div className="userForm__box">
        <div className="userForm__profileWrap">
          <div className="userForm__profile">
            <img src={previewUrl || 'https://placehold.co/100x100?text=Hello+World'} alt="" />
          </div>
          {!previewUrl ? (
            <label htmlFor="userFormImg" className="button line userForm__profileBtn">
              프로필 추가
            </label>
          ) : (
            <div className="userForm__profileBtns">
              <span className="userForm__profileName">{fileName}</span>

              <label htmlFor="userFormImg" className="button line userForm__profileBtn">
                프로필 변경
              </label>
              <button
                type="button"
                className="line userForm__profileBtn"
                onClick={handleRemoveImage}
              >
                삭제
              </button>
            </div>
          )}

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
  )
}
