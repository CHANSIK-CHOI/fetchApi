import { UsersProvider, Users } from '@/features/users'
import { useUsersQuery } from '@/hooks/useUsersQuery'
import loadingGif from '@/assets/loading.gif'
import errorImg from '@/assets/error.jpeg'

export default function UsersContainer() {
  const {
    users,
    isLoading,
    error,
    createUser,
    modifyUser,
    modifyAllUsers,
    deleteUser,
    deleteSelectedUsers,
  } = useUsersQuery()

  return (
    <UsersProvider
      users={users}
      onCreate={createUser}
      onModify={modifyUser}
      onAllModify={modifyAllUsers}
      onDeleteUser={deleteUser}
      onDeleteSelectedUsers={deleteSelectedUsers}
    >
      <Users newUserForm={<Users.NewForm />} count={users.length}>
        {isLoading && <img src={loadingGif} className="loading" alt="loading" />}

        {!isLoading && error.length > 0 && (
          <div className="error">
            <img src={errorImg} alt="error" className="error__img" />
            <span className="error__text">{error}</span>
          </div>
        )}

        {users.length > 0 ? (
          users.map((user) => (
            <Users.Item
              key={user.id}
              profileSrc={user.avatar}
              firstName={user.first_name}
              lastName={user.last_name}
              email={user.email}
              id={user.id}
            />
          ))
        ) : (
          <div className="nodata">
            <span className="nodata__text">검색된 유저가 없습니다.</span>
          </div>
        )}
      </Users>
    </UsersProvider>
  )
}
