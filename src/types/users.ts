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
export type PersonalUserValue = {
  [K in UserKeys as K extends 'id' ? K : `${K}_${number}`]: User[K]
} & { isModify: boolean }
export type BuiltAllUsersValue = Record<number, PersonalUserValue>

export type FilteredModifiedItemData = Record<string, unknown>
export type FilteredModifiedAllData = Record<User['id'], FilteredModifiedItemData>

export type PayloadModifiedUser = Partial<Omit<User, 'id'>>
export type ApiResultModifiedUser = PayloadModifiedUser & { updatedAt: string }
export type PayloadAllModifiedUsers = { id: number; payload: FilteredModifiedItemData }[]
export type ApiResultAllModifiedUsers = {
  id: number
  result: PayloadModifiedUser & { updatedAt: string }
}[]
