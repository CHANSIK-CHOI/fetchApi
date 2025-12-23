import { useEffect } from 'react'
import { UsersProvider, Users, UsersList, UsersNewForm } from '@/features/users'
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

  return (
    <UsersProvider>
      <Users
        newUserForm={<UsersNewForm onCreate={createUser} />}
        users={users}
        onAllModify={modifyAllUsers}
        onDeleteSelected={deleteSelectedUsers}
      >
        {isLoading && <img src={loadingGif} className="loading" alt="loading" />}

        {!isLoading && error.length > 0 && (
          <div className="error">
            <img src={errorImg} alt="error" className="error__img" />
            <span className="error__text">{error}</span>
          </div>
        )}

        <UsersList data={users} onModify={modifyUser} onDelete={deleteUser} />
      </Users>
    </UsersProvider>
  )
}
