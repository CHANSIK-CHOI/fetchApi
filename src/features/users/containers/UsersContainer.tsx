import React, { useEffect } from 'react'
import { UsersProvider, Users } from '@/features/users'
import { useUsersQuery } from '@/hooks/useUsersQuery'
import loadingGif from '@/assets/loading.gif'
import errorImg from '@/assets/error.jpeg'

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

  const resultCount = users.length.toString().padStart(2, '0')

  return (
    <UsersProvider
      users={users}
      onCreate={createUser}
      onModify={modifyUser}
      onAllModify={modifyAllUsers}
      onDeleteUser={deleteUser}
      onDeleteSelectedUsers={deleteSelectedUsers}
    >
      <Users newUserForm={<Users.NewForm />} count={resultCount}>
        {isLoading && <img src={loadingGif} className="loading" alt="loading" />}
        {error.length > 0 && (
          <>
            <div className="error">
              <img src={errorImg} alt="error" className="error__img" />
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
