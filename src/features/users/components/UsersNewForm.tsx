import React, { useEffect, useState } from 'react'
import type { PayloadNewUser } from '@/types/users'
import { INIT_NEW_USER_VALUE, PLACEHOLDER_SRC } from '@/constants/users'
import { useUsersActions, useUsersState } from '@/features/users'
import { readFileAsDataURL } from '@/util/users'
import { useForm, useWatch } from 'react-hook-form'

export default function UsersNewForm() {
  const [previewUrl, setPreviewUrl] = useState<string>('')
  const { newUserState } = useUsersState()
  const { onCreate, newUserDispatch } = useUsersActions()

  // ✨ 1. useForm 훅 초기화
  // mode: 'onSubmit' -> 제출할 때 검증 (성능 최적화)
  const {
    register,
    /*
    register(name, options) :
      - input을 RHF에 등록합니다. 
      - 두 번째 인자로 required, min, max, pattern(정규식) 등 기본 검증 규칙을 넣을 수 있습니다.
    */
    handleSubmit,
    /*
    handleSubmit(onValid, onInvalid) : 
      - 우리의 제출 함수(onValid)를 감싸줍니다.
    역할:
      - e.preventDefault()를 자동으로 해줍니다.
      - 모든 register된 필드의 유효성을 검사합니다.
      - 에러가 있으면 errors 객체를 업데이트하고 멈춥니다.
      - 에러가 없으면 데이터를 모아서 onValid 함수에게 넘겨줍니다.
    */
    setValue, // 수동으로 값을 설정할 때 사용 (파일 업로드 등)
    control,
    /*
    watch(name)
      - 주의: RHF는 기본적으로 리렌더링을 안 한다고 했죠?
      - 하지만 "비밀번호 입력값에 따라 비밀번호 확인창을 보여준다"거나 "이미지 미리보기"처럼 입력값을 실시간으로 화면에 보여줘야 할 때가 있습니다.
      - 그때 watch('password')를 쓰면, 해당 값이 변할 때만 컴포넌트를 리렌더링 시킵니다.
    */
    reset,
    formState: {
      errors,
      // isSubmitting,
      // isDirty
    },
    /*
    formState : 
      - 폼의 현재 상태를 담고 있는 객체입니다. (Proxy로 동작하여 읽는 속성만 리렌더링을 유발합니다.)
      1. errors: 각 필드의 에러 메시지.
      2. isSubmitting: 제출 중인지 여부 (중복 제출 방지 로딩 처리에 사용).
      3. isDirty: 사용자가 폼을 한 번이라도 건드렸는지 여부.
    */
  } = useForm<PayloadNewUser>({
    mode: 'onSubmit',
    /*
    mode (검증 타이밍)
      - onSubmit (기본값): 제출 버튼 누를 때만 검사합니다. (성능 최상 🚀)
      - onBlur: 입력하다가 포커스가 빠질 때 검사합니다. (사용자 경험 좋음 👍)
      - onChange: 글자 칠 때마다 검사합니다. (성능 안 좋음 👎, 꼭 필요할 때만)
    */
    defaultValues: INIT_NEW_USER_VALUE,
    /*
    defaultValues (초기값)
      - 폼의 초기 상태를 정의합니다.
      - TypeScript 사용 시 필수라고 보시면 됩니다. 이걸 정의해야 RHF가 타입을 정확히 추론합니다.
      - API에서 데이터를 받아와서 채울 때도 사용됩니다 (비동기 데이터의 경우 reset(data) 사용).
    */
  })

  // ✨ 2. 파일 미리보기 로직 (RHF와 연동)
  // const avatarFile = watch('avatar') // avatar 값이 바뀌면 감지
  // ✨ 여기가 변경된 핵심 포인트!
  // watch('avatar') 대신 useWatch 훅 사용
  // React Compiler가 "아, 이 변수는 control과 name에 의존하는구나"라고 명확히 알 수 있음
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
    // shouldValidate: true -> 값이 바뀌면 유효성 검사 즉시 실행
    setValue('avatar', base64, { shouldValidate: true })
  }

  const handleRemoveImage = () => {
    if (previewUrl == '') return
    setPreviewUrl('')
    setValue('avatar', '') // RHF 값 초기화
  }

  // ✨ 3. 제출 핸들러 (이미 검증이 끝난 데이터만 들어옴)
  const onValid = async (data: PayloadNewUser) => {
    if (newUserState.isCreating) return

    // 전체 form이 required로 되어있어 빈값인 경우 submit이 안됨
    // const hasEmpty = hasEmptyRequiredField(newUserValue)
    // if (hasEmpty) {
    //   alert('이메일, 이름, 성을 모두 입력해주세요.')
    //   return
    // }

    console.log(data)

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

  // watch('avatar')를 통해 현재 폼 상태의 이미지를 가져올 수도 있음
  // watch('avatar')를 avatarValue 변수로 대체
  const displaySrc = previewUrl || (avatarValue ? String(avatarValue) : PLACEHOLDER_SRC)
  const isHasContent = Boolean(avatarValue)

  if (!newUserState.isShowEditor) return null

  return (
    <div className="users__newForm">
      <form id="usersNewForm" className="userForm" onSubmit={handleSubmit(onValid)}>
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
                {...register('first_name', { required: '이름을 입력해주세요.' })}
              />
              {/* 에러 메시지 노출 */}
              {errors.first_name && <span className="error-msg">{errors.first_name.message}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="last name"
                {...register('last_name', { required: '성을 입력해주세요.' })}
              />
              {errors.last_name && <span className="error-msg">{errors.last_name.message}</span>}
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="email"
                {...register('email', {
                  required: '이메일을 입력해주세요.',
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
