export type User = {
  avatar: string
  email: string
  first_name: string
  id: number
  last_name: string
}

export type NewUserData = Omit<User, 'id' | 'avatar'> & { avatar?: string }
export type ResultNewUserData = User & { createdAt: string }

export type UsersFormValueItem = Record<string, string | number>
