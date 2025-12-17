import type {
  EditableUserFormObject,
  FilteredModifiedAllData,
  PayloadNewUser,
  User,
} from '@/types/users'
import { EDITABLE_USER_KEYS, REQUIRED_USER_KEYS } from '@/constants/users'

export const hasEmptyRequiredField = (data: EditableUserFormObject) => {
  const hasEmpty = REQUIRED_USER_KEYS.some((key) => {
    return data[key] !== undefined && data[key].trim() === ''
  })
  return hasEmpty
}

export const filterModifiedData = ({
  data,
  originalData,
  id,
}: {
  data: PayloadNewUser[]
  originalData: Omit<User, 'id' | 'avatar'> & { avatar?: User['avatar'] }
  id: User['id']
}) => {
  const filteredIdAndData = data.reduce((acc, value) => {
    const changed = EDITABLE_USER_KEYS.reduce<EditableUserFormObject>((fieldAcc, key) => {
      if (value[key] !== originalData[key]) {
        fieldAcc[key] = value[key]
      }
      return fieldAcc
    }, {})
    if (Object.keys(changed).length) acc[id] = changed
    return acc
  }, {} as FilteredModifiedAllData)

  return filteredIdAndData
}
