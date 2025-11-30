export type User = {
  avatar: string
  email: string
  first_name: string
  id: number
  last_name: string
}

export type PayloadNewUser = Omit<User, 'id' | 'avatar'> & { avatar?: string }
export type ApiResultNewUser = User & { createdAt: string }

type UserKeys = keyof User
export type EditableUserKey = Exclude<UserKeys, 'id'>
export type EditableUserFormObject = Partial<Record<EditableUserKey, User[EditableUserKey]>>

export type PersonalUserValue = {
  [K in EditableUserKey as `${K}_${number}`]: User[K]
} & { isModify: boolean; id: number }
export type BuiltAllUsersValue = Record<number, PersonalUserValue>

export type FilteredModifiedAllData = Record<User['id'], EditableUserFormObject>

export type PayloadModifiedUser = EditableUserFormObject
export type ApiResultModifiedUser = PayloadModifiedUser & { updatedAt: string }
export type PayloadAllModifiedUsers = { id: number; payload: EditableUserFormObject }[]
export type ApiResultAllModifiedUsers = {
  id: number
  result: PayloadModifiedUser & { updatedAt: string }
}[]
