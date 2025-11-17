import { getUsersApi } from '@/api/users.api'
import { type User } from '@/types/users'
import { useCallback, useState } from 'react'

export function useUsersQuery() {
  const [users, setUsers] = useState<User[]>([])

  const getUsers = useCallback(async () => {
    try {
      const { data } = await getUsersApi()
      console.log(data)
      setUsers(data)
    } catch (err) {
      console.error(err)
    }
  }, [])

  return { users, getUsers }
}
