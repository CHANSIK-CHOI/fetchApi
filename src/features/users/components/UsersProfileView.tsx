import type { User } from '@/types/users'
import { PLACEHOLDER_SRC } from '@/constants/users'

type UsersProfileViewProps = {
  avatar?: User['avatar']
}

export default function UsersProfileView({ avatar }: UsersProfileViewProps) {
  return (
    <div className="userItem__profile">
      <img src={avatar || PLACEHOLDER_SRC} alt="" />
    </div>
  )
}
