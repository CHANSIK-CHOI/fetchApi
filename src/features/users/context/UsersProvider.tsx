import {
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from 'react'

import {
  UsersActionsContext,
  UsersStateContext,
  type OnChangeCheckDeleteItems,
  type IsDeleting,
} from '@/features/users'

import type { User, BuiltAllUsersValue, EditableUserKey } from '@/types/users'

import {
  INIT_NEW_USER_STATE,
  INIT_USER_EDIT_STATE,
  newUserReducer,
  userEditReducer,
} from '@/reducers/usersReducer'

const toPersonalKey = <K extends EditableUserKey>(key: K, id: User['id']) =>
  `${key}_${id}` as `${K}_${number}`

type UsersProviderProps = {
  children: ReactNode
  users: User[]
  onDeleteUser: (id: User['id']) => Promise<void>
  onDeleteSelectedUsers: (ids: User['id'][]) => Promise<void>
}

export default function UsersProvider({
  children,
  users,
  onDeleteUser,
  onDeleteSelectedUsers,
}: UsersProviderProps) {
  const [isShowDeleteCheckbox, setIsShowDeleteCheckbox] = useState<boolean>(false) // UI - 선택 체크박스 show/hide 여부
  const [checkedDeleteItems, setCheckedDeleteItems] = useState<User['id'][]>([]) // UI - 체크박스가 선택 된 유저의 id 배열
  const checkedDeleteItemsRef = useRef<User['id'][]>([]) // checkedDeleteItems ref
  const [isAllChecked, setIsAllChecked] = useState<boolean>(false) // UI - 전체 체크 여부

  const [isDeleting, setIsDeleting] = useState<IsDeleting>(null) // UI - 유저 데이터의 삭제 여부
  const isDeletingRef = useRef<IsDeleting>(null) // isDeleting ref
  const [isCheckedDeleting, setisCheckedDeleting] = useState<boolean>(false) // UI - 선택된 유저 데이터의 삭제 여부
  const isCheckedDeletingRef = useRef<boolean>(false)

  const [newUserState, newUserDispatch] = useReducer(newUserReducer, INIT_NEW_USER_STATE) // 유저 추가하기 reducer
  const [userEditState, userEditDispatch] = useReducer(userEditReducer, INIT_USER_EDIT_STATE) // 유저 수정하기(개별) reducer

  // 각 유저의 데이터를 id값과 조합하여 가공한 데이터 : UsersItem 컴포넌트 내부 input 태그의 value값으로 연결
  const buildUsersData = useCallback((data: User[]) => {
    return data.reduce<BuiltAllUsersValue>(
      (acc, cur) => {
        const personalValue = {
          [toPersonalKey('first_name', cur.id)]: cur.first_name,
          [toPersonalKey('last_name', cur.id)]: cur.last_name,
          [toPersonalKey('email', cur.id)]: cur.email,
          [toPersonalKey('avatar', cur.id)]: cur.avatar ?? '',
        }

        acc[cur.id] = {
          ...personalValue,
          id: cur.id,
          isModify: false,
        }
        return acc
      },
      {}, // 초기값: acc의 시작 값
    )
  }, [])

  const initialBuiltAllUsersValue = useMemo(() => buildUsersData(users), [buildUsersData, users]) // users 업데이트 시 전체 유저의 데이터를 BuiltAllUsersValue 타입으로 캐싱
  const [builtAllUsersValue, setBuiltAllUsersValue] =
    useState<BuiltAllUsersValue>(initialBuiltAllUsersValue) // 각 유저의 데이터를 id값과 조합하여 가공한 데이터 : UsersItem 컴포넌트 내부 input 태그의 value값으로 연결

  // [reset] 전체 유저의 input value를 reset
  const resetAllUsersData = useCallback(() => {
    setBuiltAllUsersValue((prev) => {
      const hasModified = Object.values(prev).some(({ isModify }) => isModify)
      if (!hasModified) return prev

      return initialBuiltAllUsersValue
    })
  }, [initialBuiltAllUsersValue])

  // [reset] 전체 체크박스 선택 reset
  const resetChecked = useCallback(() => {
    setCheckedDeleteItems([])
  }, [])

  // 전체 체크박스 선택
  const handleAllCheck = useCallback(() => {
    const ids = Object.keys(initialBuiltAllUsersValue).map((k) => Number(k))
    setCheckedDeleteItems(ids)
  }, [initialBuiltAllUsersValue])

  // [삭제하기] Checkbox Change Event
  const onChangeCheckDeleteItems = useCallback(({ e, id }: OnChangeCheckDeleteItems) => {
    const { checked } = e.target
    if (checked) {
      setCheckedDeleteItems((prev) => {
        const isCheckedItemIds = prev.includes(id) ? prev : [...prev, id]
        return isCheckedItemIds
      })
    } else {
      setCheckedDeleteItems((prev) => {
        const isFilteredId = prev.filter((value) => value !== id)
        return isFilteredId
      })
    }
  }, [])

  // [삭제하기] 선택된 item 데이터 삭제
  const onClickDeleteSelectedItems = useCallback(async () => {
    if (checkedDeleteItemsRef.current.length === 0) {
      // 선택 된 데이터가 없을 때
      alert('선택한 데이터가 없습니다.')
    } else {
      if (isCheckedDeletingRef.current) return

      const names = checkedDeleteItemsRef.current
        .map((id) => initialBuiltAllUsersValue[id])
        .filter(Boolean)
        .map((u) => `${u[`first_name_${u.id}`]} ${u[`last_name_${u.id}`]}`)
        .join(', ')
      const confirmMsg = `${names} 유저들을 삭제하시겠습니까?`
      if (!confirm(confirmMsg)) return

      try {
        setisCheckedDeleting(true)
        await onDeleteSelectedUsers(checkedDeleteItemsRef.current)
        resetChecked()
        alert('삭제를 완료하였습니다.')
      } catch (err) {
        console.error(err)
        alert('삭제에 실패했습니다. 다시 시도해주세요.')
      } finally {
        setisCheckedDeleting(false)
        setIsShowDeleteCheckbox(false)
      }
    }
  }, [initialBuiltAllUsersValue, onDeleteSelectedUsers, resetChecked])

  // isCheckedDeletingRef 업데이트
  useEffect(() => {
    isCheckedDeletingRef.current = isCheckedDeleting
  }, [isCheckedDeleting])

  // checkedDeleteItemsRef, isAllChecked 업데이트
  useEffect(() => {
    checkedDeleteItemsRef.current = checkedDeleteItems
    setIsAllChecked(users.length === checkedDeleteItems.length)
  }, [checkedDeleteItems, users])

  // [삭제하기] 개별 유저 데이터 삭제
  const onClickDeleteItem = useCallback(
    async (id: User['id']) => {
      if (isDeletingRef.current !== null) return

      const target = initialBuiltAllUsersValue[id]
      const confirmMsg = `${target[`first_name_${id}`]} ${target[`last_name_${id}`]}님의 데이터를 삭제하시겠습니까?`

      if (!confirm(confirmMsg)) return

      try {
        setIsDeleting(id)
        await onDeleteUser(id)
        alert('삭제를 완료하였습니다.')
      } catch (err) {
        console.error(err)
        alert('삭제에 실패했습니다. 다시 시도해주세요.')
      } finally {
        setIsDeleting(null)
      }
    },
    [initialBuiltAllUsersValue, onDeleteUser],
  )

  // isDeletingRef 업데이트
  useEffect(() => {
    isDeletingRef.current = isDeleting
  }, [isDeleting])

  // [삭제하기] 삭제하기 버튼 클릭 시 item 옆 checkbox show/hide toggle
  const handleToggleDeleteCheckbox = useCallback(
    (isChecked: boolean) => {
      setIsShowDeleteCheckbox(isChecked)

      if (isChecked) {
        resetAllUsersData()
      } else {
        resetChecked()
      }
    },
    [resetAllUsersData, resetChecked],
  )

  // 임시 : 다른 로직도 useReducer로 변경 후 삭제 예정
  useEffect(() => {
    if (newUserState.isShowEditor) {
      resetAllUsersData()
    }
  }, [newUserState.isShowEditor, resetAllUsersData])

  const stateValue = useMemo(
    () => ({
      isShowDeleteCheckbox,
      builtAllUsersValue,
      isDeleting,
      isCheckedDeleting,
      checkedDeleteItems,
      isAllChecked,
      newUserState,
      userEditState,
    }),
    [
      isShowDeleteCheckbox,
      builtAllUsersValue,
      isDeleting,
      isCheckedDeleting,
      checkedDeleteItems,
      isAllChecked,
      newUserState,
      userEditState,
    ],
  )

  const actionsValue = useMemo(
    () => ({
      handleToggleDeleteCheckbox,
      onChangeCheckDeleteItems,
      onClickDeleteSelectedItems,
      onClickDeleteItem,
      handleAllCheck,
      resetChecked,
      newUserDispatch,
      userEditDispatch,
    }),
    [
      handleToggleDeleteCheckbox,
      onChangeCheckDeleteItems,
      onClickDeleteSelectedItems,
      onClickDeleteItem,
      handleAllCheck,
      resetChecked,
      newUserDispatch,
      userEditDispatch,
    ],
  )

  return (
    <UsersStateContext.Provider value={stateValue}>
      <UsersActionsContext.Provider value={actionsValue}>{children}</UsersActionsContext.Provider>
    </UsersStateContext.Provider>
  )
}
