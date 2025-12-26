import React, { memo, useEffect } from 'react'
import { useUsersActions, useUsersState } from '@/features/users'
import { useForm, FormProvider } from 'react-hook-form'
import type {
  EditableUserKey,
  // EditableUserKey,
  PayloadAllModifiedUsers,
  PayloadModifiedUser,
  User,
  // UserIdAndEditableUserFormObject,
} from '@/types/users'
import { EDITABLE_USER_KEYS } from '@/constants/users'
// import { filterModifiedData, hasEmptyRequiredField } from '@/util/users'

type UsersFormValues = {
  users: User[]
}

type UsersProps = {
  children: React.ReactNode
}
function Users({ children }: UsersProps) {
  const { users, userEditState } = useUsersState()
  const { onAllModify, userEditDispatch } = useUsersActions()

  // ✨ 1. useForm 초기화
  // mode: 'onSubmit' -> 대량 데이터이므로 제출 시에만 검증 (성능 최적화)
  const methods = useForm<UsersFormValues>({
    mode: 'onSubmit',
    defaultValues: { users: [] }, // 초기값은 useEffect에서 주입
  })

  const {
    handleSubmit,
    reset,
    formState: { dirtyFields }, // ✨ 변경 감지 마법사
  } = methods

  // ✨ 2. 데이터 동기화 (Server State -> Form State)
  // users 데이터가 로드되거나 변경되면 폼을 초기화합니다.
  useEffect(() => {
    if (users.length > 0) {
      // reset을 호출하면 dirtyFields도 초기화되므로 '깨끗한 상태'가 됨
      reset({ users })
    }
  }, [users, reset])

  // [수정취소] 액션 대응
  useEffect(() => {
    if (userEditState.isResetAllValue) {
      reset({ users }) // 원래 서버 데이터로 되돌림
      userEditDispatch({ type: 'RESET_COMPLETE_ALL_VALUE' })
    }
  }, [userEditState.isResetAllValue, users, reset, userEditDispatch])

  // ✨ 3. RHF 방식의 제출 핸들러 (Diffing Logic)
  const onSubmit = async (data: UsersFormValues) => {
    // 변경된 필드(dirtyFields)가 없으면 배열이 아니거나 비어있음
    if (!dirtyFields.users || !Array.isArray(dirtyFields.users)) {
      alert('수정된 내용이 없습니다.')
      return
    }

    // 변경된 유저 데이터만 추출 (Payload 생성)
    const modifiedData: PayloadAllModifiedUsers = []

    dirtyFields.users.forEach((dirtyField, index) => {
      // 해당 인덱스의 유저가 변경되지 않았으면 skip
      if (!dirtyField) return

      const currentUser = data.users[index]
      const payload: PayloadModifiedUser = {}
      let hasChange = false

      // 변경된 필드만 payload에 담기
      // dirtyField 형태 예시: { first_name: true, email: true }
      Object.keys(dirtyField).forEach((key) => {
        // id나 avatar 등 수정 대상이 아닌 키는 제외 (필요 시 조정)
        if (EDITABLE_USER_KEYS.some((editabledKey) => key === editabledKey)) {
          payload[key as EditableUserKey] = currentUser[key as EditableUserKey]
          hasChange = true
        }
      })

      if (hasChange) {
        modifiedData.push({
          id: currentUser.id, // ID는 폼 데이터(hidden input) 혹은 원본 데이터에서 가져옴
          payload,
        })
      }
    })

    if (modifiedData.length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

    // 빈 값 체크 (RHF의 required 규칙이 이미 막아주지만, 안전장치로 확인 가능)
    // 여기서는 RHF handleSubmit을 통과했다면 빈 값은 없다고 가정합니다.
    const confirmMsg = `${modifiedData.length}명의 유저 정보를 수정하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_START' })
      await onAllModify(modifiedData)
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_SUCCESS', payload: { data: modifiedData } })
      alert('수정을 완료하였습니다.')
    } catch (err) {
      console.error(err)
      userEditDispatch({
        type: 'SUBMIT_ERROR',
        payload: { msg: '수정에 실패했습니다. 다시 시도해주세요.' },
      })
      alert('수정에 실패했습니다. 다시 시도해주세요.')
    }
  }

  // [수정하기] : 모든 유저 form value 정렬
  // const parseFormDataToUsers = (formData: FormData) => {
  //   const currentDataMap: UserIdAndEditableUserFormObject = {}

  //   for (const [key, value] of formData.entries()) {
  //     const match = key.match(/^(.+)_(\d+)$/)
  //     if (!match) continue

  //     const [_, field, idStr] = match
  //     void _
  //     const id = Number(idStr)

  //     if (!currentDataMap[id]) {
  //       currentDataMap[id] = {
  //         first_name: '',
  //         last_name: '',
  //         email: '',
  //         avatar: '',
  //       }
  //     }

  //     currentDataMap[id][field as EditableUserKey] = value.toString()
  //   }
  //   return currentDataMap
  // }

  // [수정하기] : 다수 유저 수정
  // const handleSubmitAllUsers = async (e: FormEvent<HTMLFormElement>) => {
  //   e.preventDefault()

  //   const formData = new FormData(e.currentTarget)
  //   const currentUsersObj = parseFormDataToUsers(formData)

  //   const data = users.reduce((acc, originalUser) => {
  //     const id = originalUser.id
  //     const currentUserData = currentUsersObj[id]

  //     if (!currentUserData) return acc

  //     const filteredIdAndData = filterModifiedData({
  //       data: currentUserData,
  //       originalData: originalUser,
  //       id: id,
  //     })

  //     if (Object.keys(filteredIdAndData).length > 0) {
  //       acc.push({
  //         id: id,
  //         payload: filteredIdAndData[id],
  //       })
  //     }

  //     return acc
  //   }, [] as PayloadAllModifiedUsers)

  //   if (data.length === 0) {
  //     alert('수정된 내용이 없습니다.')
  //     return
  //   }

  //   const hasEmpty = data.some(({ id, payload }) => {
  //     void id
  //     return hasEmptyRequiredField(payload)
  //   })

  //   if (hasEmpty) {
  //     alert('이메일, 이름, 성은 빈값으로 수정할 수 없습니다.')
  //     return
  //   }

  //   const targetIds = data.map((u) => u.id)
  //   const originTargetUsers = users.filter((user) => targetIds.includes(user.id))
  //   const originTargetUsersnames = originTargetUsers.map((u) => `${u.first_name} ${u.last_name}`)

  //   const confirmMsg = `${originTargetUsersnames} 유저들을 수정하시겠습니까?`
  //   if (!confirm(confirmMsg)) return

  //   try {
  //     userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_START' })
  //     await onAllModify(data)
  //     userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_SUCCESS', payload: { data } })
  //     alert('수정을 완료하였습니다.')
  //   } catch (err) {
  //     console.error(err)
  //     userEditDispatch({
  //       type: 'SUBMIT_ERROR',
  //       payload: { msg: '수정에 실패했습니다. 다시 시도해주세요.' },
  //     })
  //     alert('수정에 실패했습니다. 다시 시도해주세요.')
  //   }
  // }

  // [수정하기] : 전체 유저 form value 수정하기
  // useEffect(() => {
  //   if (userEditState.isResetAllValue) {
  //     userEditDispatch({ type: 'RESET_COMPLETE_ALL_VALUE' })
  //   }
  // }, [userEditState.isResetAllValue, userEditDispatch])

  return (
    // ✨ 모든 자식이 RHF에 접근할 수 있도록 Provider 제공
    <FormProvider {...methods}>
      <form id="users" onSubmit={handleSubmit(onSubmit)} className="users__body">
        {children}
      </form>
    </FormProvider>
  )
}

export default memo(Users)
