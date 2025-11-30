import type { User } from '@/types/users'
import { PLACEHOLDER_SRC } from '@/utils'

type UsersItemProfileViewProps = {
  profileSrc?: User['avatar']
}

export default function UsersItemProfileView({ profileSrc }: UsersItemProfileViewProps) {
  return (
    <div className="userItem__profile">
      <img src={profileSrc || PLACEHOLDER_SRC} alt="" />
    </div>
  )
}
