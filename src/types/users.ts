export type User = {
  avatar: string
  email: string
  first_name: string
  id: number
  last_name: string
}

type UserKeys = keyof User
// key
export type EditableUserKey = Exclude<UserKeys, 'id'>
type RequiredEditableUserKey = Exclude<EditableUserKey, 'avatar'>

// object
export type InitUserFormObject = Pick<User, RequiredEditableUserKey> & { avatar?: User['avatar'] }
type EditableUserFormObject = Partial<Omit<User, 'id'>>

// POST
export type PayloadNewUser = InitUserFormObject
export type ApiResultNewUser = User & { createdAt: string }

// PATCH
export type PayloadModifiedUser = EditableUserFormObject
export type ApiResultModifiedUser = PayloadModifiedUser & { updatedAt: string }
export type PayloadAllModifiedUsers = { id: User['id']; payload: EditableUserFormObject }[]
export type ApiResultAllModifiedUsers = {
  id: User['id']
  result: ApiResultModifiedUser
}[]

// react form hooks
export type UsersFormValues = {
  users: User[]
}
