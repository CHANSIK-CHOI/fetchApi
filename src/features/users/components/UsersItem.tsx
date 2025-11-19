import { useEffect, useMemo, useState, type ChangeEvent } from 'react'
import { useUsers } from '@/features/users'

const PLACEHOLDER_SRC = 'https://placehold.co/100x100?text=Hello+World'

type UsersItem = {
  profileSrc: string | undefined
  firstName: string
  lastName: string
  email: string
  id: number
}

export default function UsersItem({ profileSrc, firstName, lastName, email, id }: UsersItem) {
  const {
    isAllEditing,
    editingItemArray,
    onItemEditing,
    isSelectedForDeletion,
    onChangeItem,
    isShowUserForm,
  } = useUsers()

  const isItemEditing = editingItemArray.includes(id)
  const isEditing = isAllEditing || isItemEditing

  const handleChangeCheckBox = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target
    onChangeItem({ checked, id })
  }

  return (
    <li className="userItem">
      <div className="userItem__box">
        {isSelectedForDeletion && (
          <div className="userItem__checkbox">
            <input
              type="checkbox"
              name="usersItem"
              id={`checkbox_${id}`}
              onChange={handleChangeCheckBox}
            />
          </div>
        )}
        <div className="userItem__info">
          <div className="userItem__profileWrap">
            {isEditing ? (
              <UserItemProfileEditor key={`editing-${id}`} id={id} profileSrc={profileSrc} />
            ) : (
              <UserItemProfileView profileSrc={profileSrc} />
            )}
          </div>

          <div className="userItem__texts">
            {!isEditing ? (
              <>
                <span className="userItem__name">
                  {firstName} {lastName}
                </span>
                <span className="userItem__email">{email}</span>
              </>
            ) : (
              <div className="userItem__editer">
                <input type="text" name={`first_name_${id}`} placeholder="first name" />
                <input type="text" name={`last_name_${id}`} placeholder="last name" />
                <input type="text" name={`email_${id}`} placeholder="email" />
              </div>
            )}
          </div>
        </div>

        {!isAllEditing && !isSelectedForDeletion && !isShowUserForm && (
          <div className="userItem__actions">
            {!isItemEditing ? (
              <button
                type="button"
                className="line"
                onClick={() => onItemEditing({ id, isEditing: true })}
              >
                수정하기
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="line"
                  onClick={() => onItemEditing({ id, isEditing: false })}
                >
                  수정취소
                </button>
                <button
                  type="button"
                  onClick={() => onItemEditing({ id, isEditing: false, isPatch: true })}
                >
                  수정완료
                </button>
              </>
            )}

            {!isItemEditing && (
              <button type="button" className="line">
                삭제
              </button>
            )}
          </div>
        )}
      </div>
    </li>
  )
}

type UserItemProfileViewProps = {
  profileSrc?: string
}

function UserItemProfileView({ profileSrc }: UserItemProfileViewProps) {
  return (
    <div className="userItem__profile">
      <img src={profileSrc || PLACEHOLDER_SRC} alt="" />
    </div>
  )
}

type UserItemProfileEditorProps = {
  id: number
  profileSrc?: string
}

function UserItemProfileEditor({ id, profileSrc }: UserItemProfileEditorProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isProfileCleared, setIsProfileCleared] = useState(false)

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    if (selected) {
      setIsProfileCleared(false)
    }
  }

  const handleRemoveImage = () => {
    if (file) {
      setFile(null)
      return
    }

    if (!isProfileCleared) {
      setIsProfileCleared(true)
    }
  }

  const previewUrl = useMemo(() => {
    if (!file) return null
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    if (!previewUrl) return
    return () => URL.revokeObjectURL(previewUrl)
  }, [previewUrl])

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
      <input id={`userItem_${id}`} type="file" accept="image/*" hidden onChange={handleChange} />
    </>
  )
}
