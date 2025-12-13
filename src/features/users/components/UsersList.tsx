import { UsersItem } from '@/features/users'
import type { User } from '@/types/users'

type UsersListProps = {
  data: User[]
}
export default function UsersList({ data }: UsersListProps) {
  return (
    <>
      {data.length > 0 ? (
        <ul className="users__list">
          {data.map((user) => (
            <UsersItem
              key={user.id}
              profileSrc={user.avatar}
              firstName={user.first_name}
              lastName={user.last_name}
              email={user.email}
              id={user.id}
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
