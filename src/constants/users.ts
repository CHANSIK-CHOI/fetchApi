import type { EditableUserKey, PayloadNewUser, RequiredEditableUserKey } from '@/types/users'

export const PLACEHOLDER_SRC = 'https://placehold.co/100x100?text=Hello+World'

export const INIT_NEW_USER_VALUE: PayloadNewUser = {
  email: '',
  first_name: '',
  last_name: '',
  avatar: undefined,
}

export const EDITABLE_USER_KEYS: EditableUserKey[] = ['email', 'first_name', 'last_name', 'avatar']

export const REQUIRED_USER_KEYS: RequiredEditableUserKey[] = ['email', 'first_name', 'last_name']
