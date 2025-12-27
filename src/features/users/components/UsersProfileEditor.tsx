import { useEffect, useState, type ChangeEvent } from 'react'
import { PLACEHOLDER_SRC } from '@/constants/users'
import type { User } from '@/types/users'
import { readFileAsDataURL } from '@/util/users'

type UsersProfileEditorProps = {
  id: User['id']
  avatar?: User['avatar']
  onChange: (url: string) => void
}

export default function UsersProfileEditor({ id, avatar, onChange }: UsersProfileEditorProps) {
  const [preview, setPreview] = useState<string | null>(null)
  const [submitValue, setSubmitValue] = useState<User['avatar']>(avatar || '')

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const handleChangeImage = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const base64 = await readFileAsDataURL(file)
    onChange(base64)
    setSubmitValue(base64)

    e.target.value = ''
  }

  const handleRemoveImage = () => {
    setPreview(null)
    onChange('')
    setSubmitValue('')
  }

  const displaySrc = preview || (submitValue !== '' ? submitValue : PLACEHOLDER_SRC)
  const isHasContent = Boolean(submitValue)

  return (
    <>
      <div className="userItem__profile">
        <img src={displaySrc} alt="" />
      </div>
      <div className="userItem__profileBtns">
        <label htmlFor={`avatar_${id}`} className="button line userItem__profileBtn">
          {isHasContent ? '프로필 변경' : '프로필 추가'}
        </label>

        {isHasContent && (
          <button type="button" className="line userItem__profileBtn" onClick={handleRemoveImage}>
            삭제
          </button>
        )}
      </div>
      <input id={`avatar_${id}`} type="file" accept="image/*" hidden onChange={handleChangeImage} />
    </>
  )
}
