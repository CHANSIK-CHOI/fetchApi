import React, { useEffect, useMemo, useState } from 'react'
import { useUsersActions } from '@/features/users'

export default function UsersNewForm() {
  const [file, setFile] = useState<File | null>(null)
  const { setNewUserValue } = useUsersActions()

  const handleChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const handleRemoveImage = () => {
    if (!file) return
    setFile(null)
    setNewUserValue((prev) => ({ ...prev, avatar: undefined }))
  }

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, name: newDataName } = e.target

    const name = newDataName.replace(/_userForm$/, '')

    setNewUserValue((prev) => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    if (!previewUrl) return
    setNewUserValue((prev) => ({ ...prev, avatar: previewUrl }))

    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl, setNewUserValue])

  return (
    <div className="userForm">
      <div className="userForm__box">
        <div className="userForm__profileWrap">
          <div className="userForm__profile">
            <img src={previewUrl || 'https://placehold.co/100x100?text=Hello+World'} alt="" />
          </div>
          {!file ? (
            <label htmlFor="userFormImg" className="button line userForm__profileBtn">
              프로필 추가
            </label>
          ) : (
            <div className="userForm__profileBtns">
              <span className="userForm__profileName">{file.name}</span>

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
            onChange={handleChangeInput}
          />
          <input
            type="text"
            name={`last_name_userForm`}
            placeholder="last name"
            onChange={handleChangeInput}
          />
          <input
            type="text"
            name={`email_userForm`}
            placeholder="email"
            onChange={handleChangeInput}
          />
        </div>
      </div>
    </div>
  )
}
