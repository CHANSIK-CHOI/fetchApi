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
export type RequiredEditableUserKey = Exclude<EditableUserKey, 'avatar'>

// object
export type InitUserFormObject = Pick<User, RequiredEditableUserKey> & { avatar?: User['avatar'] }
export type EditableUserFormObject = Partial<Omit<User, 'id'>>
export type UserIdAndEditableUserFormObject = Record<User['id'], EditableUserFormObject>

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

/*
export type User = {
  avatar: string
  email: string
  first_name: string
  id: number
  last_name: string
}

type UserKeys = keyof User
export type EditableUserKey = Exclude<UserKeys, 'id'>
export type EditableUserFormObject = Partial<Omit<User, 'id'>>

export type RequiredEditableUserKey = Exclude<EditableUserKey, 'avatar'>

export type PayloadNewUser = Pick<User, RequiredEditableUserKey> & { avatar?: User['avatar'] }
export type ApiResultNewUser = User & { createdAt: string }

export type PersonalEditableUserValue = { [K in EditableUserKey as `${K}_${number}`]: User[K] }
export type PersonalEditableUserKey = keyof PersonalEditableUserValue
export type PersonalUserValue = PersonalEditableUserValue & { isModify: boolean; id: User['id'] }
export type BuiltAllUsersValue = Record<User['id'], PersonalUserValue>

export type UserIdAndEditableUserFormObject = Record<User['id'], EditableUserFormObject>

export type PayloadModifiedUser = EditableUserFormObject
export type ApiResultModifiedUser = PayloadModifiedUser & { updatedAt: string }
export type PayloadAllModifiedUsers = { id: User['id']; payload: EditableUserFormObject }[]
export type ApiResultAllModifiedUsers = {
  id: User['id']
  result: ApiResultModifiedUser
}[]

*/
