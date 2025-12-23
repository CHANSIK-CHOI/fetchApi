import React, { memo, useEffect, type FormEvent } from 'react'
import { useUsersActions, useUsersState } from '@/features/users'
import type {
  EditableUserKey,
  PayloadAllModifiedUsers,
  UserIdAndEditableUserFormObject,
} from '@/types/users'
import { filterModifiedData, hasEmptyRequiredField } from '@/util/users'

type UsersProps = {
  children: React.ReactNode
}
function Users({ children }: UsersProps) {
  const { users, userEditState } = useUsersState()
  const { onAllModify, userEditDispatch } = useUsersActions()

  // [수정하기] : 모든 유저 form value 정렬
  const parseFormDataToUsers = (formData: FormData) => {
    const currentDataMap: UserIdAndEditableUserFormObject = {}

    for (const [key, value] of formData.entries()) {
      const match = key.match(/^(.+)_(\d+)$/)
      if (!match) continue

      const [_, field, idStr] = match
      void _
      const id = Number(idStr)

      if (!currentDataMap[id]) {
        currentDataMap[id] = {
          first_name: '',
          last_name: '',
          email: '',
          avatar: '',
        }
      }

      currentDataMap[id][field as EditableUserKey] = value.toString()
    }
    return currentDataMap
  }

  // [수정하기] : 다수 유저 수정
  const handleSubmitAllUsers = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(e.currentTarget)
    const currentUsersObj = parseFormDataToUsers(formData)

    const data = users.reduce((acc, originalUser) => {
      const id = originalUser.id
      const currentUserData = currentUsersObj[id]

      if (!currentUserData) return acc

      const filteredIdAndData = filterModifiedData({
        data: currentUserData,
        originalData: originalUser,
        id: id,
      })

      if (Object.keys(filteredIdAndData).length > 0) {
        acc.push({
          id: id,
          payload: filteredIdAndData[id],
        })
      }

      return acc
    }, [] as PayloadAllModifiedUsers)

    if (data.length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

    const hasEmpty = data.some(({ id, payload }) => {
      void id
      return hasEmptyRequiredField(payload)
    })

    if (hasEmpty) {
      alert('이메일, 이름, 성은 빈값으로 수정할 수 없습니다.')
      return
    }

    const targetIds = data.map((u) => u.id)
    const originTargetUsers = users.filter((user) => targetIds.includes(user.id))
    const originTargetUsersnames = originTargetUsers.map((u) => `${u.first_name} ${u.last_name}`)

    const confirmMsg = `${originTargetUsersnames} 유저들을 수정하시겠습니까?`
    if (!confirm(confirmMsg)) return

    try {
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_START' })
      await onAllModify(data)
      userEditDispatch({ type: 'SUBMIT_MODIFIED_USERS_SUCCESS', payload: { data } })
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

  // [수정하기] : 전체 유저 form value 수정하기
  useEffect(() => {
    if (userEditState.isResetAllValue) {
      userEditDispatch({ type: 'RESET_COMPLETE_ALL_VALUE' })
    }
  }, [userEditState.isResetAllValue, userEditDispatch])

  return (
    <form id="users" onSubmit={handleSubmitAllUsers} className="users__body">
      {children}
    </form>
  )
}

export default memo(Users)
