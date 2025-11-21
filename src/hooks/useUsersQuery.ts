import { createUsersApi, getUsersApi } from '@/api/users.api'
import { type NewUserData, type User } from '@/types/users'
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

  return { users, getUsers, isLoading, error, createUsers }
}
