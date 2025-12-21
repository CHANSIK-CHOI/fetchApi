import { UsersItem, useUsersState } from '@/features/users'
import type { PayloadModifiedUser, User } from '@/types/users'

type UsersListProps = {
  data: User[]
  onModify: (id: User['id'], payload: PayloadModifiedUser) => Promise<void>
}
export default function UsersList({ data, onModify }: UsersListProps) {
  const { userEditState } = useUsersState()
  return (
    <>
      {data.length > 0 ? (
        <ul className="users__list">
          {data.map((user) => (
            <UsersItem
              avatar={user.avatar}
              firstName={user.first_name}
              lastName={user.last_name}
              email={user.email}
              id={user.id}
              onModify={onModify}
              key={`${user.id}_${userEditState.isResetAllValue ? 'reset' : 'active'}`}
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
