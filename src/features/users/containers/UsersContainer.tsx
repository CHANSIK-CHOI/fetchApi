import { useEffect } from 'react'
import { UsersProvider, Users } from '@/features/users'
import { useUsersQuery } from '@/hooks/useUsersQuery'

export default function UsersContainer() {
  const {
    users,
    getAllUsers,
    isLoading,
    error,
    createUser,
    modifyUser,
    modifyAllUsers,
    deleteUser,
    deleteSelectedUsers,
  } = useUsersQuery()

  useEffect(() => {
    void getAllUsers()
  }, [getAllUsers])

  return (
    <UsersProvider
      users={users}
      onCreate={createUser}
      onModify={modifyUser}
      onAllModify={modifyAllUsers}
      onDeleteUser={deleteUser}
      onDeleteSelectedUsers={deleteSelectedUsers}
    >
      <Users newUserForm={<Users.NewForm />}>
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
