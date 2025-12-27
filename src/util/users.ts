import type {
  User,
  PayloadAllModifiedUsers,
  PayloadModifiedUser,
  EditableUserKey,
  UsersFormValues,
} from '@/types/users'
import { EDITABLE_USER_KEYS } from '@/constants/users'
import type { FormState } from 'react-hook-form'

export const readFileAsDataURL = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.readAsDataURL(file)
  })
}

export const getModifiedUsersPayload = (
  dirtyFields: FormState<UsersFormValues>['dirtyFields'],
  currentUsers: User[],
) => {
  const modifiedData: PayloadAllModifiedUsers = []

  if (!dirtyFields.users || !Array.isArray(dirtyFields.users)) {
    return modifiedData
  }

  dirtyFields.users.forEach((userDirtyFields, index) => {
    if (!userDirtyFields) return

    const currentUser = currentUsers[index]
    const payload: PayloadModifiedUser = {}
    const dirtyKeys = Object.keys(userDirtyFields)
    let hasChange = false

    dirtyKeys.forEach((key) => {
      if (EDITABLE_USER_KEYS.some((editabledKey) => key === editabledKey)) {
        const value = currentUser[key as EditableUserKey]
        payload[key as EditableUserKey] = typeof value === 'string' ? value.trim() : value
        hasChange = true
      }
    })

    if (hasChange) {
      modifiedData.push({
        id: currentUser.id,
        payload,
      })
    }
  })

  return modifiedData
}
