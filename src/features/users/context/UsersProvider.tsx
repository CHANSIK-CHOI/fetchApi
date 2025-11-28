import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  UsersActionsContext,
  UsersStateContext,
  type OnItemEditor,
  type OnChangeCheckDeleteItems,
  type OnAllEditor,
  type OnNewUserForm,
  type IsPatching,
} from '@/features/users'

import type {
  FilteredModifiedData,
  FilteredModifiedItemData,
  ModifiedUserData,
  NewUserData,
  User,
  UsersFormValueItem,
  UsersFormValueMap,
  ModifiedUsersData,
} from '@/types/users'
import { INIT_NEW_USER_DATA } from '@/utils'

type UsersProviderProps = {
  children: ReactNode
  onCreate: (userData: NewUserData) => Promise<void>
  users: User[]
  onModify: (id: number, payload: ModifiedUserData) => Promise<void>
  onAllModify: (data: ModifiedUsersData) => Promise<void>
}

export default function UsersProvider({
  children,
  onCreate,
  users,
  onModify,
  onAllModify,
}: UsersProviderProps) {
  const [isShowDeleteCheckbox, setIsShowDeleteCheckbox] = useState<boolean>(false) // 선택 체크박스 show
  const [checkedDeleteItems, setCheckedDeleteItems] = useState<number[]>([]) // 선택 된 items

  const [isShowNewUserForm, setIsShowNewUserForm] = useState<boolean>(false) // [UsersNewForm] show
  const [newUserData, setNewUserData] = useState<NewUserData>(INIT_NEW_USER_DATA) // [UsersNewForm] input value (state)
  const newUserDataRef = useRef<NewUserData>(newUserData) // [UsersNewForm] input value (ref)
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false) // [UsersNewForm] creating (state)
  const isCreatingUserRef = useRef<boolean>(isCreatingUser) // [UsersNewForm] creating (ref)

  const [isShowAllEditor, setIsShowAllEditor] = useState<boolean>(false) // 전체 수정 에디터 show
  const [showItemEditor, setShowItemEditor] = useState<number[]>([]) // item 수정 에디터 show
  const showItemEditorRef = useRef<number[]>([])
  const [isPatching, setIsPatching] = useState<IsPatching>(null)
  const isPatchingRef = useRef<IsPatching>(null)

  // users 데이터의 id를 키값으로한 객체 형태로 변경
  const buildUsersData = useCallback((data: User[]) => {
    return data.reduce<UsersFormValueMap>(
      (acc, cur) => {
        /*
        reduce 매개변수 : acc, cur, index, array
        - acc: 누적값 (accumulator)
        - cur: 현재 요소
        - index: 현재 위치
        - array: 원본 배열 전체
      */
        acc[cur.id] = {
          [`first_name_${cur.id}`]: cur.first_name,
          [`last_name_${cur.id}`]: cur.last_name,
          [`email_${cur.id}`]: cur.email,
          [`avatar_${cur.id}`]: cur.avatar,
          id: cur.id,
          isModify: false,
        } as UsersFormValueItem
        return acc
      },
      {}, // 초기값: acc의 시작 값
    )
  }, [])

  const initialBuiltUsersData = useMemo(() => buildUsersData(users), [buildUsersData, users]) // users 데이터 캐싱
  const [builtUsersData, setBuiltUsersData] = useState<UsersFormValueMap>(initialBuiltUsersData) // [UsersItem] input value (state)
  const builtUsersDataRef = useRef<UsersFormValueMap>(initialBuiltUsersData) // [UsersItem] input value (ref)

  // [reset] 전체 유저 데이터 reset
  const resetAllUsersData = useCallback(() => {
    setBuiltUsersData((prev) => {
      const hasModified = Object.values(prev).some(({ isModify }) => isModify)
      if (!hasModified) return prev

      return initialBuiltUsersData
    })
  }, [initialBuiltUsersData])

  // [reset] 특정 유저 데이터 reset
  const resetTargetUserData = useCallback(
    (id: number) => {
      setBuiltUsersData((prev) => {
        const target = prev[id]
        if (!target || !target.isModify) return prev

        return {
          ...prev,
          [id]: {
            ...initialBuiltUsersData[id],
            isModify: false,
          } as UsersFormValueItem,
        }
      })
    },
    [initialBuiltUsersData],
  )

  const filterModifiedData = useCallback(() => {
    const usersArray = Object.values(builtUsersDataRef.current)
    const modifiedData = usersArray.filter(({ isModify }) => isModify)
    const filteredModifiedData = modifiedData.reduce((acc, user) => {
      const original: Record<string, unknown> = initialBuiltUsersData[user.id] ?? {}
      const changed = Object.entries(user).reduce((fieldAcc, [k, v]) => {
        if (k !== 'isModify' && original[k] !== v) {
          fieldAcc[k.replace(/_\d+$/, '')] = v
        }
        return fieldAcc
      }, {} as FilteredModifiedItemData)
      if (Object.keys(changed).length) acc[user.id] = changed
      return acc
    }, {} as FilteredModifiedData)

    return filteredModifiedData
  }, [initialBuiltUsersData])

  // [수정하기 - 전체] 전체 수정 에디터 show/hide & patch
  const onAllEditor = useCallback(
    async ({ isShowEditor, isPatch = false }: OnAllEditor) => {
      // 수정완료(PATCH) : isPatch
      if (isPatch) {
        const filteredModifiedData = filterModifiedData()
        const data = Object.entries(filteredModifiedData).map(([id, payload]) => {
          const numId = Number(id)
          return { id: numId, payload }
        })

        if (data.length === 0) {
          alert('수정된 내역이 없습니다.')
          return
        }

        try {
          setIsPatching('all')
          await onAllModify(data)
        } catch (err) {
          console.error(err)
        } finally {
          setIsPatching(null)
        }
      }

      // 수정취소
      if (!isShowEditor && !isPatch) resetAllUsersData()

      // 열릴 때 Item Editor reset
      if (isShowEditor) setShowItemEditor([])

      // toggle
      setIsShowAllEditor(isShowEditor)
    },
    [filterModifiedData, resetAllUsersData, onAllModify],
  )

  // [수정하기 - 개별] item 수정 에디터 show/hide & patch
  const onItemEditor = useCallback(
    async ({ id, isShowEditor, isPatch = false }: OnItemEditor) => {
      // 수정완료(PATCH) : isPatch
      if (isPatch) {
        if (isPatchingRef.current !== null) return

        const filteredModifiedData = filterModifiedData()
        const payload = filteredModifiedData[id]

        if (!payload) {
          alert('수정된 내역이 없습니다.')
          return
        }

        try {
          setIsPatching(id)
          await onModify(id, payload)
        } catch (err) {
          console.error(err)
        } finally {
          setIsPatching(null)
        }
      }

      // 수정취소
      if (!isShowEditor && !isPatch) resetTargetUserData(id)

      // id Item 에디터 창 show
      if (isShowEditor) {
        setShowItemEditor((prev) => {
          const isShowItemIds = prev.includes(id) ? prev : [...prev, id]
          return isShowItemIds
        })
      }
      // id Item 에디터 창 hide
      else {
        setShowItemEditor((prev) => {
          const isFilteredId = prev.filter((value) => value !== id)
          return isFilteredId
        })
      }
    },
    [filterModifiedData, resetTargetUserData, onModify],
  )

  useEffect(() => {
    isPatchingRef.current = isPatching
  }, [isPatching])

  // [수정하기] input onChange Event : builtUsersData update
  const onChangeUserData = useCallback(
    (e: ChangeEvent<HTMLInputElement>, id: number) => {
      const { name, value } = e.target

      setBuiltUsersData((prev) => {
        const target = prev[id]
        if (!target) return prev

        const nextEntry = {
          ...target,
          [name]: value,
        } as UsersFormValueItem

        const originalUser = users.find((user) => user.id === id)
        if (originalUser) {
          const isModify =
            nextEntry[`first_name_${id}`] !== originalUser.first_name ||
            nextEntry[`last_name_${id}`] !== originalUser.last_name ||
            nextEntry[`email_${id}`] !== originalUser.email ||
            nextEntry[`avatar_${id}`] !== originalUser.avatar

          return {
            ...prev,
            [id]: {
              ...nextEntry,
              isModify,
            } as UsersFormValueItem,
          }
        }

        return {
          ...prev,
          [id]: {
            ...nextEntry,
            isModify: true,
          } as UsersFormValueItem,
        }
      })
    },
    [users],
  )

  // [수정하기] users 업데이트 시 builtUsersData도 업데이트
  useEffect(() => {
    if (showItemEditorRef.current.length > 0) return
    setBuiltUsersData(initialBuiltUsersData)
  }, [initialBuiltUsersData])

  // [수정하기] builtUsersData 업데이트 시 builtUsersDataRef도 업데이트
  useEffect(() => {
    builtUsersDataRef.current = builtUsersData
  }, [builtUsersData])

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
  const onClickDeleteItems = useCallback(() => {
    if (checkedDeleteItems.length === 0) {
      // 선택 된 데이터가 없을 때
      alert('선택한 데이터가 없습니다.')
    } else {
      // 삭제하기(DELETE)
    }
  }, [checkedDeleteItems])

  // [삭제하기] 삭제 체크박스 toggle
  const onToggleDeleteCheckbox = useCallback(
    (isChecked: boolean) => {
      setIsShowDeleteCheckbox(isChecked)

      if (isChecked) {
        setShowItemEditor([])
        resetAllUsersData()
      } else {
        setCheckedDeleteItems([])
      }
    },
    [resetAllUsersData],
  )

  useEffect(() => {
    showItemEditorRef.current = showItemEditor
  }, [showItemEditor])

  // [추가하기] 신규 유저 추가 에디터 show/hide & post
  const onNewUserForm = useCallback(
    async ({ isShowEditor, isPost = false }: OnNewUserForm) => {
      // 추가완료(POST) : isPost
      if (isPost) {
        if (isCreatingUserRef.current) return

        const { email, first_name, last_name } = newUserDataRef.current
        if (!email || !first_name || !last_name) {
          alert('이메일, 이름, 성을 모두 입력해주세요.')
          return
        }

        try {
          setIsCreatingUser(true)
          await onCreate(newUserDataRef.current)
        } catch (error) {
          console.error(error)
          alert('유저 생성에 실패했습니다. 다시 시도해주세요.')
        } finally {
          setIsCreatingUser(false)
        }
      }

      if (isShowEditor) {
        setShowItemEditor([])
        resetAllUsersData()
      } else {
        setNewUserData(INIT_NEW_USER_DATA)
      }

      // toggle
      setIsShowNewUserForm(isShowEditor)
    },
    [onCreate, resetAllUsersData],
  )

  // [추가하기] newUserData 업데이트 시 newUserDataRef도 업데이트
  useEffect(() => {
    newUserDataRef.current = newUserData
  }, [newUserData])

  // [추가하기] isCreatingUser 업데이트 시 isCreatingUserRef도 업데이트
  useEffect(() => {
    isCreatingUserRef.current = isCreatingUser
  }, [isCreatingUser])

  const stateValue = useMemo(
    () => ({
      isShowAllEditor,
      showItemEditor,
      isShowDeleteCheckbox,
      isShowNewUserForm,
      isCreatingUser,
      builtUsersData,
      isPatching,
    }),
    [
      isShowAllEditor,
      showItemEditor,
      isShowDeleteCheckbox,
      isShowNewUserForm,
      isCreatingUser,
      builtUsersData,
      isPatching,
    ],
  )

  const actionsValue = useMemo(
    () => ({
      onAllEditor,
      onItemEditor,
      onToggleDeleteCheckbox,
      onChangeCheckDeleteItems,
      onClickDeleteItems,
      onNewUserForm,
      setNewUserData,
      onChangeUserData,
    }),
    [
      onAllEditor,
      onItemEditor,
      onToggleDeleteCheckbox,
      onChangeCheckDeleteItems,
      onClickDeleteItems,
      onNewUserForm,
      setNewUserData,
      onChangeUserData,
    ],
  )

  return (
    <UsersStateContext.Provider value={stateValue}>
      <UsersActionsContext.Provider value={actionsValue}>{children}</UsersActionsContext.Provider>
    </UsersStateContext.Provider>
  )
}
