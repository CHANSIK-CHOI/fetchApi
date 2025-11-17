import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { UsersContext, type OnItemEditing, type OnChangeItem } from '@/features/users'

type UsersProviderProps = {
  children: ReactNode
}

export default function UsersProvider({ children }: UsersProviderProps) {
  const [isAllEditing, setIsAllEditing] = useState<boolean>(false)
  const [editingItemArray, setEditingItemArray] = useState<number[]>([])
  const [isSelectedForDeletion, setIsSelectedForDeletion] = useState<boolean>(false)
  const [checkedItemArray, setCheckedItemArray] = useState<number[]>([])

  const onAllEditing = useCallback((isEditing: boolean) => {
    setIsAllEditing(isEditing)

    if (isEditing) setEditingItemArray([])
  }, [])

  const onItemEditing = useCallback(({ id, isEditing, data }: OnItemEditing) => {
    void data
    if (isEditing) {
      setEditingItemArray((prev) => (prev.includes(id) ? prev : [...prev, id]))
    } else {
      // data : 데이터 수정 완료한 후 아래 로직 실행
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
    if (!isActive) setCheckedItemArray([])
  }, [])

  const onSelectedDelete = useCallback(() => {
    if (checkedItemArray.length === 0) {
      alert('선택한 데이터가 없습니다.')
    } else {
      console.log(checkedItemArray)
    }
  }, [checkedItemArray])

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
    ],
  )

  return <UsersContext.Provider value={providerValue}>{children}</UsersContext.Provider>
}
