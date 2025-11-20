import React from 'react'
import { PLACEHOLDER_SRC } from '@/utils'

type UsersItemProfileViewProps = {
  profileSrc?: string
}

export default function UsersItemProfileView({ profileSrc }: UsersItemProfileViewProps) {
  return (
    <div className="userItem__profile">
      <img src={profileSrc || PLACEHOLDER_SRC} alt="" />
    </div>
  )
}
