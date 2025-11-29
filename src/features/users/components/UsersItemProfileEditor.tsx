import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useUsersActions } from '@/features/users'
import { PLACEHOLDER_SRC } from '@/utils'

type UsersItemProfileEditorProps = {
  id: number
  profileSrc?: string
}

export default function UsersItemProfileEditor({ id, profileSrc }: UsersItemProfileEditorProps) {
  const { onChangeUserAvatar } = useUsersActions()
  const [file, setFile] = useState<File | null>(null)
  const [isProfileCleared, setIsProfileCleared] = useState(false)

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    if (selected) {
      setIsProfileCleared(false)
    }
  }

  const handleRemoveImage = () => {
    setFile(null)
    if (!isProfileCleared) setIsProfileCleared(true)
    onChangeUserAvatar(id, '')
  }

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!previewUrl) return
    onChangeUserAvatar(id, previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [id, onChangeUserAvatar, previewUrl])

  const hasPreview = Boolean(previewUrl)
  const hasProfileSrc = Boolean(profileSrc) && !isProfileCleared
  const displaySrc = previewUrl || (hasProfileSrc ? profileSrc : null) || PLACEHOLDER_SRC
  const labelText = hasPreview || hasProfileSrc ? '프로필 변경' : '프로필 추가'

  return (
    <>
      <div className="userItem__profile">
        <img src={displaySrc} alt="" />
      </div>
      <div className="userItem__profileBtns">
        {hasPreview && file?.name && <span className="userItem__profileName">{file.name}</span>}

        <label htmlFor={`userItem_${id}`} className="button line userItem__profileBtn">
          {labelText}
        </label>
        {(hasPreview || hasProfileSrc) && (
          <button type="button" className="line userItem__profileBtn" onClick={handleRemoveImage}>
            삭제
          </button>
        )}
      </div>
      <input
        id={`userItem_${id}`}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChangeImage}
      />
    </>
  )
}
