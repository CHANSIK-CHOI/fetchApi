import { UsersItem } from '@/features/users'
import type { User } from '@/types/users'
import { memo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

function UsersList() {
  const { control } = useFormContext<{ users: User[] }>()
  const { fields } = useFieldArray({
    control,
    name: 'users',
    keyName: 'keyId',
  })

  return (
    <>
      {fields.length > 0 ? (
        <ul className="users__list">
          {fields.map((field, index) => {
            const user = field as User & { keyId: string }

            return (
              <UsersItem
                key={user.keyId}
                index={index}
                id={user.id}
                avatar={user.avatar}
                firstName={user.first_name}
                lastName={user.last_name}
                email={user.email}
              />
            )
          })}
        </ul>
      ) : (
        <div className="nodata">
          <span className="nodata__text">검색된 유저가 없습니다.</span>
        </div>
      )}
    </>
  )
}

export default memo(UsersList)
