import type { EditableUserFormObject } from '@/types/users'
import { REQUIRED_USER_KEYS } from '@/constants/users'

export const hasEmptyRequiredField = (data: EditableUserFormObject) => {
  const hasEmpty = REQUIRED_USER_KEYS.some((key) => {
    return data[key] !== undefined && data[key].trim() === ''
  })
  return hasEmpty
}
