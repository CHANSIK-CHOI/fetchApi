import type { User } from '@/types/users'
import { PLACEHOLDER_SRC } from '@/constants/users'

type UsersProfileViewProps = {
  profileSrc?: User['avatar']
}

export default function UsersProfileView({ profileSrc }: UsersProfileViewProps) {
  return (
    <div className="userItem__profile">
      <img src={profileSrc || PLACEHOLDER_SRC} alt="" />
    </div>
  )
}
