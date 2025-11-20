import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { UsersContext, type OnItemEditing, type OnChangeItem } from '@/features/users'
import type { OnPostUserData } from './useUsers'
import type { NewUserData } from '@/types/users'
import { INIT_NEW_USER_DATA } from '@/utils'

type UsersProviderProps = {
  children: ReactNode
  onCreate: (userData: NewUserData) => Promise<void>
}

export default function UsersProvider({ children, onCreate }: UsersProviderProps) {
  const [isAllEditing, setIsAllEditing] = useState<boolean>(false)
  const [editingItemArray, setEditingItemArray] = useState<number[]>([])
  const [isSelectedForDeletion, setIsSelectedForDeletion] = useState<boolean>(false)
  const [checkedItemArray, setCheckedItemArray] = useState<number[]>([])
  const [isShowUserForm, setIsShowUserForm] = useState<boolean>(false)
  const [newUserData, setNewUserData] = useState<NewUserData>(INIT_NEW_USER_DATA)

  const onAllEditing = useCallback((isEditing: boolean) => {
    setIsAllEditing(isEditing)

    if (isEditing) {
      setEditingItemArray([])
    }
  }, [])

  const onItemEditing = useCallback(({ id, isEditing, isPatch = false, data }: OnItemEditing) => {
    void data // 임시
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
      setIsShowUserForm(isShow)
      if (isShow) {
        setEditingItemArray([])
      }
      if (isPost) {
        // isPost : POST
        onCreate(newUserData)
      }
    },
    [newUserData, onCreate],
  )

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
    ],
  )

  return <UsersContext.Provider value={providerValue}>{children}</UsersContext.Provider>
}
