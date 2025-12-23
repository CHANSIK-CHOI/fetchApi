import { UsersItem, useUsersState } from '@/features/users'

export default function UsersList() {
  const { users, userEditState } = useUsersState()
  return (
    <>
      {users.length > 0 ? (
        <ul className="users__list">
          {users.map((u) => (
            <UsersItem
              key={`${u.id}_${userEditState.isResetAllValue ? 'reset' : 'active'}`}
              avatar={u.avatar}
              firstName={u.first_name}
              lastName={u.last_name}
              email={u.email}
              id={u.id}
            />
          ))}
        </ul>
      ) : (
        <div className="nodata">
          <span className="nodata__text">검색된 유저가 없습니다.</span>
        </div>
      )}
    </>
  )
}
