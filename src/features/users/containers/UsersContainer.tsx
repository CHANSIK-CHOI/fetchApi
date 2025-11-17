import { UsersProvider, Users } from '@/features/users'
import type { User } from '@/types/users'

const fallbackUsers: User[] = [
  {
    avatar: '',
    email: 'chanchan@gmail.com',
    first_name: 'ChanChan',
    id: 1,
    last_name: 'Choi',
  },
  {
    avatar: '',
    email: 'chanchan@gmail.com',
    first_name: 'ChanChan',
    id: 2,
    last_name: 'Choi',
  },
]

export default function UsersContainer() {
  return (
    <UsersProvider>
      <Users>
        {fallbackUsers.map((user) => (
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
