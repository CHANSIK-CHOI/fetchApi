import { useCallback, useState } from 'react'
import {
  createUserApi,
  deleteSelectedUsersApi,
  deleteUserApi,
  getAllUsersApi,
  patchAllUsersApi,
  patchUserApi,
} from '@/api/users.api'
import {
  type PayloadModifiedUser,
  type PayloadAllModifiedUsers,
  type PayloadNewUser,
  type User,
} from '@/types/users'

export function useUsersQuery() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const setErrorMessage = useCallback((err: unknown, fallback: string) => {
    console.error(err)
    setError(err instanceof Error ? err.message : fallback)
  }, [])

  const getAllUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data } = await getAllUsersApi()
      setUsers(data)
    } catch (err) {
      setErrorMessage(err, '유저 데이터를 받아올 수 없습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [setErrorMessage])

  const createUser = useCallback(async (payload: PayloadNewUser) => {
    setError('')
    try {
      const result = await createUserApi(payload)
      const { id, ...rest } = result
      const numericId = Number(id)
      const newUser: User = {
        id: Number.isNaN(numericId) ? Date.now() : numericId,
        avatar: rest.avatar ?? '',
        email: rest.email,
        first_name: rest.first_name,
        last_name: rest.last_name,
      }
      setUsers((prev) => [newUser, ...prev])
    } catch (err) {
      setErrorMessage(err, '유저 데이터를 추가할 수 없습니다.')
    }
  }, [setErrorMessage])

  const modifyUser = useCallback(async (id: number, payload: PayloadModifiedUser) => {
    setError('')
    try {
      const result = await patchUserApi(id, payload)
      if (!result) return

      const { updatedAt: _, ...rest } = result

      setUsers((prev) =>
        prev.map((user) =>
          user.id === id
            ? {
                ...user,
                ...rest,
              }
            : user,
        ),
      )
      void _
    } catch (err) {
      setErrorMessage(err, '유저 데이터를 수정할 수 없습니다.')
    }
  }, [setErrorMessage])

  const modifyAllUsers = useCallback(async (data: PayloadAllModifiedUsers) => {
    setError('')
    try {
      const results = await patchAllUsersApi(data)

      setUsers((prev) => {
        const resultMap = new Map(results.map(({ id, result }) => [id, result]))

        return prev.map((user) => {
          const patched = resultMap.get(user.id)
          if (!patched) return user

          const { updatedAt: _, ...rest } = patched
          void _
          return { ...user, ...rest }
        })
      })
    } catch (err) {
      setErrorMessage(err, '유저 데이터를 수정할 수 없습니다.')
    }
  }, [setErrorMessage])

  const deleteUser = useCallback(async (id: User['id']) => {
    setError('')
    try {
      const isSuccess = await deleteUserApi(id)
      if (isSuccess) setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (err) {
      setErrorMessage(err, '유저 데이터를 삭제할 수 없습니다.')
    }
  }, [setErrorMessage])

  const deleteSelectedUsers = useCallback(async (ids: User['id'][]) => {
    setError('')
    try {
      const isAllSuccess = await deleteSelectedUsersApi(ids)
      if (isAllSuccess) setUsers((prev) => prev.filter((user) => !ids.includes(user.id)))
    } catch (err) {
      setErrorMessage(err, '유저 데이터를 삭제할 수 없습니다.')
    }
  }, [setErrorMessage])

  return {
    users,
    getAllUsers,
    isLoading,
    error,
    createUser,
    modifyUser,
    modifyAllUsers,
    deleteUser,
    deleteSelectedUsers,
  }
}
