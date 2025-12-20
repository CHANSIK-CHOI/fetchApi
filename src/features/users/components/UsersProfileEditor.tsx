import { memo, useEffect, useState, type ChangeEvent } from 'react'
import { PLACEHOLDER_SRC } from '@/constants/users'
import type { User } from '@/types/users'
import { readFileAsDataURL } from '@/util/users'

type UsersProfileEditorProps = {
  id: User['id']
  avatar?: User['avatar']
  onChange: (url: string) => void
}

function UsersProfileEditor({ id, avatar, onChange }: UsersProfileEditorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [submitValue, setSubmitValue] = useState<string>(avatar || '')

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]

    if (!selected) return

    const objectUrl = URL.createObjectURL(selected)
    setPreview(objectUrl)

    const base64 = await readFileAsDataURL(selected)
    onChange(base64)
    setSubmitValue(base64)
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onChange('')
    setSubmitValue('')
  }

  const displaySrc = preview || (submitValue !== '' ? submitValue : PLACEHOLDER_SRC)
  const hasContent = Boolean(submitValue)

  return (
    <>
      <div className="userItem__profile">
        <img src={displaySrc} alt="" />
      </div>
      <div className="userItem__profileBtns">
        <label htmlFor={`avatar_${id}`} className="button line userItem__profileBtn">
          {hasContent ? '프로필 변경' : '프로필 추가'}
        </label>

        {hasContent && (
          <button type="button" className="line userItem__profileBtn" onClick={handleRemoveImage}>
            삭제
          </button>
        )}
      </div>
      <input id={`avatar_${id}`} type="file" accept="image/*" hidden onChange={handleChangeImage} />
      <input type="text" name={`avatar_${id}`} hidden readOnly value={submitValue} />
    </>
  )
}

export default memo(UsersProfileEditor)
