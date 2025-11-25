import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { UsersContext, type OnItemEditing, type OnChangeItem } from '@/features/users'
import type { OnPostUserData } from './useUsers'
import type { NewUserData, User, UsersFormValueItem, UsersFormValueMap } from '@/types/users'
import { INIT_NEW_USER_DATA } from '@/utils'

type UsersProviderProps = {
  children: ReactNode
  onCreate: (userData: NewUserData) => Promise<void>
  users: User[]
}

export default function UsersProvider({ children, onCreate, users }: UsersProviderProps) {
  const [isAllEditing, setIsAllEditing] = useState<boolean>(false)
  const [editingItemArray, setEditingItemArray] = useState<number[]>([])
  const [isSelectedForDeletion, setIsSelectedForDeletion] = useState<boolean>(false)
  const [checkedItemArray, setCheckedItemArray] = useState<number[]>([])
  const [isShowUserForm, setIsShowUserForm] = useState<boolean>(false)
  const [newUserData, setNewUserData] = useState<NewUserData>(INIT_NEW_USER_DATA)
  const newUserDataRef = useRef<NewUserData>(INIT_NEW_USER_DATA)

  const buildUsersFormValue = useCallback((data: User[]) => {
    return data.reduce<UsersFormValueMap>((acc, item) => {
      acc[item.id] = {
        [`first_name_${item.id}`]: item.first_name,
        [`last_name_${item.id}`]: item.last_name,
        [`email_${item.id}`]: item.email,
        [`avatar_${item.id}`]: item.avatar,
        id: item.id,
        isModify: false,
      } as UsersFormValueItem
      return acc
    }, {})
  }, [])

  const [usersFormValue, setUsersFormValue] = useState(buildUsersFormValue(users))

  useEffect(() => {
    setUsersFormValue(buildUsersFormValue(users))
  }, [buildUsersFormValue, users])

  useEffect(() => {
    newUserDataRef.current = newUserData
  }, [newUserData])

  const onAllEditing = useCallback((isEditing: boolean) => {
    setIsAllEditing(isEditing)

    if (isEditing) {
      setEditingItemArray([])
    }
  }, [])

  const onItemEditing = useCallback(({ id, isEditing, isPatch = false }: OnItemEditing) => {
    if (isEditing) {
      setEditingItemArray((prev) => (prev.includes(id) ? prev : [...prev, id]))
    } else {
      if (isPatch) {
        // isPatch : PATCH
      }
      setEditingItemArray((prev) => prev.filter((value) => value !== id))
    }
  }, [])

  const onChangeItem = useCallback(({ checked, id }: OnChangeItem) => {
    if (checked) {
      setCheckedItemArray((prev) => (prev.includes(id) ? prev : [...prev, id]))
    } else {
      setCheckedItemArray((prev) => prev.filter((value) => value !== id))
    }
  }, [])

  const onSelectedForDeletion = useCallback((isActive: boolean) => {
    setIsSelectedForDeletion(isActive)
    if (!isActive) {
      setCheckedItemArray([])
    } else {
      setEditingItemArray([])
    }
  }, [])

  const onSelectedDelete = useCallback(() => {
    if (checkedItemArray.length === 0) {
      alert('선택한 데이터가 없습니다.')
    } else {
      // checkedItemArray : 선택된 id Array
    }
  }, [checkedItemArray])

  const onPostUserData = useCallback(
    ({ isShow, isPost = false }: OnPostUserData) => {
      if (!isShow) {
        if (isPost) {
          const { email, first_name, last_name } = newUserDataRef.current

          if (!email || !first_name || !last_name) {
            alert('이메일, 이름, 성을 모두 입력해주세요.')
            return
          }

          onCreate(newUserDataRef.current)
        }
        setIsShowUserForm(false)
      } else {
        setEditingItemArray([])
        setNewUserData(INIT_NEW_USER_DATA)
        setIsShowUserForm(true)
      }
    },
    [onCreate],
  )

  const onChangeUserData = useCallback((e: ChangeEvent<HTMLInputElement>, id: number) => {
    const { name, value } = e.target

    setUsersFormValue((prev) => {
      const target = prev[id]
      if (!target) return prev

      return {
        ...prev,
        [id]: {
          ...target,
          [name]: value,
        } as UsersFormValueItem,
      }
    })
  }, [])

  const providerValue = useMemo(
    () => ({
      isAllEditing,
      onAllEditing,
      editingItemArray,
      onItemEditing,
      isSelectedForDeletion,
      onSelectedForDeletion,
      onChangeItem,
      onSelectedDelete,
      isShowUserForm,
      onPostUserData,
      setNewUserData,
      usersFormValue,
      onChangeUserData,
    }),
    [
      editingItemArray,
      isAllEditing,
      isSelectedForDeletion,
      onAllEditing,
      onChangeItem,
      onItemEditing,
      onSelectedDelete,
      onSelectedForDeletion,
      isShowUserForm,
      onPostUserData,
      setNewUserData,
      usersFormValue,
      onChangeUserData,
    ],
  )

  return <UsersContext.Provider value={providerValue}>{children}</UsersContext.Provider>
}
