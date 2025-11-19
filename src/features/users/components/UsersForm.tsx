import React, { useEffect, useMemo, useState } from 'react'

export default function UsersForm() {
  const [file, setFile] = useState<File | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
  }

  const handleClickCencleImg = () => {
    if (!file) return
    setFile(null)
  }

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

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
                onClick={handleClickCencleImg}
              >
                삭제
              </button>
            </div>
          )}

          <input id="userFormImg" type="file" accept="image/*" hidden onChange={handleChange} />
        </div>

        <div className="userForm__editer">
          <input type="text" name={`first_name_userForm`} placeholder="first name" />
          <input type="text" name={`last_name_userForm`} placeholder="last name" />
          <input type="text" name={`email_userForm`} placeholder="email" />
        </div>
      </div>
    </div>
  )
}
