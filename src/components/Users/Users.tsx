import React from 'react'

import UsersItem from './UsersItem'

type UserProps = {
  children: React.ReactNode
}

export default function Users({ children }: UserProps) {
  return (
    <div className="users">
      <ul className="users__list">{children}</ul>
    </div>
  )
}

Users.Item = UsersItem
