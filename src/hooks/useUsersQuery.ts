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

  const getAllUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data } = await getAllUsersApi()
      setUsers(data)
    } catch (err) {
      console.error(err)
      if (err instanceof Error) setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createUser = useCallback(async (payload: PayloadNewUser) => {
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
      console.error(err)
      if (err instanceof Error) setError(err.message)
    }
  }, [])

  const modifyUser = useCallback(async (id: number, payload: PayloadModifiedUser) => {
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
      console.error(err)
      if (err instanceof Error) setError(err.message)
    }
  }, [])

  const modifyAllUsers = useCallback(async (data: PayloadAllModifiedUsers) => {
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
      console.error(err)
      if (err instanceof Error) setError(err.message)
    }
  }, [])

  const deleteUser = useCallback(async (id: User['id']) => {
    try {
      const isSuccess = await deleteUserApi(id)
      if (isSuccess) setUsers((prev) => prev.filter((user) => user.id !== id))
    } catch (err) {
      console.error(err)
      if (err instanceof Error) setError(err.message)
    }
  }, [])

  const deleteSelectedUsers = useCallback(async (ids: User['id'][]) => {
    try {
      const isAllSuccess = await deleteSelectedUsersApi(ids)
      if (isAllSuccess) setUsers((prev) => prev.filter((user) => !ids.includes(user.id)))
    } catch (err) {
      console.error(err)
      if (err instanceof Error) setError(err.message)
    }
  }, [])

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
