import { UsersProvider, Users } from '@/features/users'
import { useUsersQuery } from '@/hooks/useUsersQuery'
import { useEffect } from 'react'

export default function UsersContainer() {
  const { users, getUsers } = useUsersQuery()

  useEffect(() => {
    void getUsers()
  }, [])

  return (
    <UsersProvider>
      <Users>
        {users.map((user) => (
          <Users.Item
            key={user.id}
            profileSrc={user.avatar}
            firstName={user.first_name}
            lastName={user.last_name}
            email={user.email}
            id={user.id}
          />
        ))}
      </Users>
    </UsersProvider>
  )
}
