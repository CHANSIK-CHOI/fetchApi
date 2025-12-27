import React, { memo, useEffect, useState } from 'react'
import type { PayloadNewUser } from '@/types/users'
import { INIT_NEW_USER_VALUE, PLACEHOLDER_SRC } from '@/constants/users'
import { useUsersActions, useUsersState } from '@/features/users'
import { readFileAsDataURL } from '@/util/users'
import { useForm, useWatch, type FieldErrors } from 'react-hook-form'

function UsersNewForm() {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const { newUserState } = useUsersState()
  const { onCreate, newUserDispatch } = useUsersActions()

  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<PayloadNewUser>({
    mode: 'onSubmit',
    defaultValues: INIT_NEW_USER_VALUE,
  })

  const avatarValue = useWatch({
    control,
    name: 'avatar',
  })

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleChangeImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    if (!file) return

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    const base64 = await readFileAsDataURL(file)
    setValue('avatar', base64, { shouldValidate: true })

    e.target.value = ''
  }

  const handleRemoveImage = () => {
    if (previewUrl == '') return
    setPreviewUrl('')
    setValue('avatar', '')
  }

  const onSubmit = async (data: PayloadNewUser) => {
    if (newUserState.isCreating) return

    const confirmMsg = `${data.first_name} ${data.last_name}님의 데이터를 추가하시겠습니까?`
    if (!confirm(confirmMsg)) return

    newUserDispatch({ type: 'RESET' })

    try {
      newUserDispatch({ type: 'SUBMIT_START' })
      await onCreate(data)
      newUserDispatch({ type: 'SUBMIT_SUCCESS', payload: data })
      alert('추가를 완료하였습니다.')

      reset()
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

  const onError = (errors: FieldErrors<PayloadNewUser>) => {
    console.log('Validation Errors:', errors)
    alert('입력값을 확인해주세요.')
  }

  const displaySrc = previewUrl || (avatarValue ? String(avatarValue) : PLACEHOLDER_SRC)
  const isHasContent = Boolean(avatarValue)

  if (!newUserState.isShowEditor) return null

  return (
    <div className="users__newForm">
      <form id="usersNewForm" className="userForm" onSubmit={handleSubmit(onSubmit, onError)}>
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
            <div className="input-group">
              <input
                type="text"
                placeholder="first name"
                {...register('first_name', {
                  required: '필수 입력값입니다.',
                  validate: (value) => !!value.trim() || '공백으로 입력할 수 없습니다.',
                })}
              />
              {errors.first_name && <span className="error-msg">{errors.first_name.message}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="last name"
                {...register('last_name', {
                  required: '필수 입력값입니다.',
                  validate: (value) => !!value.trim() || '공백으로 입력할 수 없습니다.',
                })}
              />
              {errors.last_name && <span className="error-msg">{errors.last_name.message}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="email"
                {...register('email', {
                  required: '필수 입력값입니다.',
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                    message: '유효한 이메일 형식이 아닙니다.',
                  },
                })}
              />
              {errors.email && <span className="error-msg">{errors.email.message}</span>}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

export default memo(UsersNewForm)
