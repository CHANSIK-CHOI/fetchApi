import { UsersProvider, Users } from '@/features/users'
import { useUsersQuery } from '@/hooks/useUsersQuery'
import { useEffect } from 'react'

export default function UsersContainer() {
  const { users, getUsers, isLoading, error, createUsers } = useUsersQuery()

  useEffect(() => {
    void getUsers()
  }, [])

  return (
    <UsersProvider onCreate={createUsers}>
      <Users userForm={<Users.Form />}>
        {isLoading && <img src="src/assets/loading.gif" className="loading" />}
        {error.length > 0 && (
          <>
            <div className="error">
              <img src="src/assets/error.jpeg" alt="" className="error__img" />
              <span className="error__text">{error}</span>
            </div>
          </>
        )}
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
