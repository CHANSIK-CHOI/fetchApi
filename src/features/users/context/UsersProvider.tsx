import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { UsersContext, type OnItemEditing, type OnChangeItem } from '@/features/users'
import type { OnPostUserData } from './useUsers'
import type { User } from '@/types/users'

type UsersProviderProps = {
  children: ReactNode
}

export default function UsersProvider({ children }: UsersProviderProps) {
  const [isAllEditing, setIsAllEditing] = useState<boolean>(false)
  const [editingItemArray, setEditingItemArray] = useState<number[]>([])
  const [isSelectedForDeletion, setIsSelectedForDeletion] = useState<boolean>(false)
  const [checkedItemArray, setCheckedItemArray] = useState<number[]>([])
  const [isShowUserForm, setIsShowUserForm] = useState<boolean>(false)

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

  const onPostUserData = useCallback(({ isShow, isPost = false, data }: OnPostUserData) => {
    void data // 임시
    setIsShowUserForm(isShow)
    if (isShow) {
      setEditingItemArray([])
    }
    if (isPost) {
      // isPost : POST
    }
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
    ],
  )

  return <UsersContext.Provider value={providerValue}>{children}</UsersContext.Provider>
}
