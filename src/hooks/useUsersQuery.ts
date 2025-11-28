import { createUsersApi, getUsersApi, patchAllUsersApi, patchUserApi } from '@/api/users.api'
import {
  type ModifiedUserData,
  type ModifiedUsersData,
  type NewUserData,
  type User,
} from '@/types/users'
import { useCallback, useState } from 'react'

export function useUsersQuery() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  const getUsers = useCallback(async () => {
    setIsLoading(true)
    setError('')
    try {
      const { data } = await getUsersApi()
      setUsers(data)
    } catch (err) {
      console.error(err)
      if (err instanceof Error) setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createUsers = useCallback(async (userData: NewUserData) => {
    try {
      const result = await createUsersApi(userData)
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

  const modifyUser = useCallback(async (id: number, payload: ModifiedUserData) => {
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
    } catch (err) {
      console.error(err)
      if (err instanceof Error) setError(err.message)
    }
  }, [])

  const modifyAllUsers = useCallback(async (data: ModifiedUsersData) => {
    try {
      const results = await patchAllUsersApi(data)
      console.log(results)
    } catch (err) {
      console.error(err)
      if (err instanceof Error) setError(err.message)
    }
  }, [])

  return { users, getUsers, isLoading, error, createUsers, modifyUser, modifyAllUsers }
}
