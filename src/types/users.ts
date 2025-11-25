export type User = {
  avatar: string
  email: string
  first_name: string
  id: number
  last_name: string
}

export type NewUserData = Omit<User, 'id' | 'avatar'> & { avatar?: string }
export type ResultNewUserData = User & { createdAt: string }

type UserKeys = keyof User
export type UsersFormValueItem = {
  [K in UserKeys as K extends 'id' ? K : `${K}_${number}`]: User[K]
} & { isModify: boolean }
