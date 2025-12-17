import { memo, useEffect, useState, type ChangeEvent } from 'react'
import { PLACEHOLDER_SRC } from '@/constants/users'
import type { User } from '@/types/users'

type UsersProfileEditorProps = {
  id: User['id']
  avatar?: User['avatar']
  onChange: (url: string) => void
}

function UsersProfileEditor({ id, avatar, onChange }: UsersProfileEditorProps) {
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleChangeImage = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]

    if (selected) {
      const objectUrl = URL.createObjectURL(selected)
      setPreview(objectUrl)
      onChange(objectUrl)
    }
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onChange('')
  }

  const displaySrc = preview || avatar || PLACEHOLDER_SRC
  const hasContent = Boolean(preview || avatar)

  return (
    <>
      <div className="userItem__profile">
        <img src={displaySrc} alt="" />
      </div>
      <div className="userItem__profileBtns">
        <label htmlFor={`userItem_${id}`} className="button line userItem__profileBtn">
          {hasContent ? '프로필 변경' : '프로필 추가'}
        </label>

        {hasContent && (
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

export default memo(UsersProfileEditor)
