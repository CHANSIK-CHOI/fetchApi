import React, { memo, useEffect } from 'react'
import { useUsersActions, useUsersState } from '@/features/users'
import { useForm, FormProvider, type FieldErrors } from 'react-hook-form'
import { getModifiedUsersPayload } from '@/util/users'
import type { UsersFormValues } from '@/types/users'

type UsersProps = {
  children: React.ReactNode
}
function Users({ children }: UsersProps) {
  const { users, userEditState } = useUsersState()
  const { onAllModify, userEditDispatch } = useUsersActions()

  const methods = useForm<UsersFormValues>({
    mode: 'onSubmit',
    defaultValues: { users: [] },
  })

  const {
    handleSubmit,
    reset,
    formState: { dirtyFields },
  } = methods

  useEffect(() => {
    if (users.length > 0) reset({ users })
  }, [users, reset])

  useEffect(() => {
    if (userEditState.isResetAllValue) {
      reset({ users })
      userEditDispatch({ type: 'RESET_COMPLETE_ALL_VALUE' })
    }
  }, [userEditState.isResetAllValue, users, reset, userEditDispatch])

  const onSubmit = async (data: UsersFormValues) => {
    const modifiedData = getModifiedUsersPayload(dirtyFields, data.users)

    if (modifiedData.length === 0) {
      alert('수정된 내용이 없습니다.')
      return
    }

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

  const onError = (errors: FieldErrors<UsersFormValues>) => {
    console.log('Validation Errors:', errors)
    alert('입력값을 확인해주세요.')
  }

  return (
    <FormProvider {...methods}>
      <form id="users" onSubmit={handleSubmit(onSubmit, onError)} className="users__body">
        {children}
      </form>
    </FormProvider>
  )
}

export default memo(Users)
