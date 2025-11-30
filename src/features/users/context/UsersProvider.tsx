import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  UsersActionsContext,
  UsersStateContext,
  type OnItemEditor,
  type OnChangeCheckDeleteItems,
  type OnAllEditor,
  type OnNewUserForm,
  type IsPatching,
  type OnChangeUserAvatar,
  type OnChangeUserData,
} from '@/features/users'

import type {
  FilteredModifiedAllData,
  PayloadModifiedUser,
  PayloadNewUser,
  User,
  PersonalUserValue,
  BuiltAllUsersValue,
  PayloadAllModifiedUsers,
  EditableUserKey,
  EditableUserFormObject,
  PersonalEditableUserKey,
  PersonalEditableUserValue,
} from '@/types/users'
import { EDITABLE_USER_KEYS, INIT_NEW_USER_VALUE } from '@/utils'

type UsersProviderProps = {
  children: ReactNode
  onCreate: (payload: PayloadNewUser) => Promise<void>
  users: User[]
  onModify: (id: number, payload: PayloadModifiedUser) => Promise<void>
  onAllModify: (data: PayloadAllModifiedUsers) => Promise<void>
}

export default function UsersProvider({
  children,
  onCreate,
  users,
  onModify,
  onAllModify,
}: UsersProviderProps) {
  const [isShowDeleteCheckbox, setIsShowDeleteCheckbox] = useState<boolean>(false) // 선택 체크박스 show/hide 여부
  const [checkedDeleteItems, setCheckedDeleteItems] = useState<number[]>([]) // 체크박스가 선택 된 유저의 id 배열

  const [isShowNewUserForm, setIsShowNewUserForm] = useState<boolean>(false) // UsersNewForm 마운트 여부
  const [newUserValue, setNewUserValue] = useState<PayloadNewUser>(INIT_NEW_USER_VALUE) // UsersNewForm 컴포넌트 내부 input들의 value
  const newUserValueRef = useRef<PayloadNewUser>(newUserValue) // newUserValue ref
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false) // 새로운 유저 데이터 생성 중 여부
  const isCreatingUserRef = useRef<boolean>(isCreatingUser) // isCreatingUser ref

  const [isShowAllEditor, setIsShowAllEditor] = useState<boolean>(false) // 전체 유저의 수정 에디터 show/hide 여부
  const [displayItemEditor, setDisplayItemEditor] = useState<number[]>([]) // 개별 수정 시 에디터가 보여지고 있는 유저의 id 배열
  const displayItemEditorRef = useRef<number[]>([]) // displayItemEditor ref
  const [isPatching, setIsPatching] = useState<IsPatching>(null) // 유저 데이터의 수정 여부
  const isPatchingRef = useRef<IsPatching>(null) // isPatching ref

  // 각 유저의 데이터를 id값과 조합하여 가공한 데이터 : UsersItem 컴포넌트 내부 input 태그의 value값으로 연결
  const buildUsersData = useCallback((data: User[]) => {
    return data.reduce<BuiltAllUsersValue>(
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
        } as PersonalUserValue
        return acc
      },
      {}, // 초기값: acc의 시작 값
    )
  }, [])

  const initialBuiltAllUsersValue = useMemo(() => buildUsersData(users), [buildUsersData, users]) // users 업데이트 시 전체 유저의 데이터를 BuiltAllUsersValue 타입으로 캐싱
  const [builtAllUsersValue, setBuiltUsersData] =
    useState<BuiltAllUsersValue>(initialBuiltAllUsersValue) // 각 유저의 데이터를 id값과 조합하여 가공한 데이터 : UsersItem 컴포넌트 내부 input 태그의 value값으로 연결
  const builtAllUsersValueRef = useRef<BuiltAllUsersValue>(initialBuiltAllUsersValue) // builtAllUsersValue ref

  // [reset] 전체 유저의 input value를 reset
  const resetAllUsersData = useCallback(() => {
    setBuiltUsersData((prev) => {
      const hasModified = Object.values(prev).some(({ isModify }) => isModify)
      if (!hasModified) return prev

      return initialBuiltAllUsersValue
    })
  }, [initialBuiltAllUsersValue])

  // [reset] 특정 유저의 input value를 reset
  const resetTargetUserData = useCallback(
    (id: User['id']) => {
      setBuiltUsersData((prev) => {
        const target = prev[id]
        if (!target || !target.isModify) return prev

        return {
          ...prev,
          [id]: {
            ...initialBuiltAllUsersValue[id],
            isModify: false,
          } as PersonalUserValue,
        }
      })
    },
    [initialBuiltAllUsersValue],
  )

  // [수정하기] 수정된 데이터만 필터링 후 반환
  const filterModifiedData = useCallback(() => {
    const usersArray = Object.values(builtAllUsersValueRef.current)
    const modifiedData = usersArray.filter(({ isModify }) => isModify)
    const filteredModifiedData = modifiedData.reduce((acc, user) => {
      const original: Record<string, unknown> = initialBuiltAllUsersValue[user.id] ?? {}
      const changed = Object.entries(user).reduce((fieldAcc, [k, v]) => {
        if (k !== 'isModify' && original[k] !== v) {
          const baseKey = k.replace(/_\d+$/, '')
          if (EDITABLE_USER_KEYS.includes(baseKey as EditableUserKey)) {
            fieldAcc[baseKey as EditableUserKey] = v as string
          }
        }
        return fieldAcc
      }, {} as EditableUserFormObject)
      if (Object.keys(changed).length) acc[user.id] = changed
      return acc
    }, {} as FilteredModifiedAllData)

    return filteredModifiedData
  }, [initialBuiltAllUsersValue])

  // [수정하기 - 전체] 전체 수정 에디터 show/hide & patch
  const onAllEditor = useCallback(
    async ({ isShowEditor, isPatch = false }: OnAllEditor) => {
      // 수정완료(PATCH) : isPatch
      if (isPatch) {
        if (isPatchingRef.current !== null) return

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

      // 전체 Editor가 열릴 때 Item Editor reset
      if (isShowEditor) setDisplayItemEditor([])

      // Editor toggle(show/hide)
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

        console.log('all', payload)

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
        setDisplayItemEditor((prev) => {
          const isShowItemIds = prev.includes(id) ? prev : [...prev, id]
          return isShowItemIds
        })
      }
      // id Item 에디터 창 hide
      else {
        setDisplayItemEditor((prev) => {
          const isFilteredId = prev.filter((value) => value !== id)
          return isFilteredId
        })
      }
    },
    [filterModifiedData, resetTargetUserData, onModify],
  )

  // isPatchingRef update
  useEffect(() => {
    isPatchingRef.current = isPatching
  }, [isPatching])

  // [수정하기]  builtAllUsersValue update
  const updateBuiltUserData = useCallback(
    (
      id: User['id'],
      name: PersonalEditableUserKey,
      value: PersonalEditableUserValue[PersonalEditableUserKey],
    ) => {
      setBuiltUsersData((prev) => {
        const target = prev[id]
        if (!target) return prev

        const nextEntry = {
          ...target,
          [name]: value,
        } as PersonalUserValue

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
            } as PersonalUserValue,
          }
        }

        return {
          ...prev,
          [id]: {
            ...nextEntry,
            isModify: true,
          } as PersonalUserValue,
        }
      })
    },
    [users],
  )

  // [수정하기] input onChange Event : builtAllUsersValue update
  const onChangeUserData = useCallback<OnChangeUserData>(
    (e, id) => {
      const { name, value } = e.target
      updateBuiltUserData(id, name as PersonalEditableUserKey, value)
    },
    [updateBuiltUserData],
  )

  // [수정하기] 프로필 이미지 변경 이벤트 : builtAllUsersValue update
  const onChangeUserAvatar = useCallback<OnChangeUserAvatar>(
    (id, avatarSrc) => {
      updateBuiltUserData(id, `avatar_${id}`, avatarSrc ?? '')
    },
    [updateBuiltUserData],
  )

  // [수정하기] users 업데이트 시 builtAllUsersValue도 업데이트
  useEffect(() => {
    // item 에디터가 열려있을 땐 return
    if (displayItemEditorRef.current.length > 0) return
    setBuiltUsersData(initialBuiltAllUsersValue)
  }, [initialBuiltAllUsersValue])

  // [수정하기] builtAllUsersValue 업데이트 시 builtAllUsersValueRef도 업데이트
  useEffect(() => {
    builtAllUsersValueRef.current = builtAllUsersValue
  }, [builtAllUsersValue])

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

  // [삭제하기] 삭제하기 버튼 클릭 시 item 옆 checkbox show/hide toggle
  const onToggleDeleteCheckbox = useCallback(
    (isChecked: boolean) => {
      setIsShowDeleteCheckbox(isChecked)

      if (isChecked) {
        setDisplayItemEditor([])
        resetAllUsersData()
      } else {
        setCheckedDeleteItems([])
      }
    },
    [resetAllUsersData],
  )

  // displayItemEditorRef 업데이트
  useEffect(() => {
    displayItemEditorRef.current = displayItemEditor
  }, [displayItemEditor])

  // [추가하기] 신규 유저 추가 에디터 show/hide & post
  const onNewUserForm = useCallback(
    async ({ isShowEditor, isPost = false }: OnNewUserForm) => {
      // 추가완료(POST) : isPost
      if (isPost) {
        if (isCreatingUserRef.current) return

        const { email, first_name, last_name } = newUserValueRef.current
        if (!email || !first_name || !last_name) {
          alert('이메일, 이름, 성을 모두 입력해주세요.')
          return
        }

        try {
          setIsCreatingUser(true)
          await onCreate(newUserValueRef.current)
        } catch (error) {
          console.error(error)
          alert('유저 생성에 실패했습니다. 다시 시도해주세요.')
        } finally {
          setIsCreatingUser(false)
        }
      }

      if (isShowEditor) {
        setDisplayItemEditor([])
        resetAllUsersData()
      } else {
        setNewUserValue(INIT_NEW_USER_VALUE)
      }

      // toggle
      setIsShowNewUserForm(isShowEditor)
    },
    [onCreate, resetAllUsersData],
  )

  // [추가하기] newUserValue 업데이트 시 newUserValueRef도 업데이트
  useEffect(() => {
    newUserValueRef.current = newUserValue
  }, [newUserValue])

  // [추가하기] isCreatingUser 업데이트 시 isCreatingUserRef도 업데이트
  useEffect(() => {
    isCreatingUserRef.current = isCreatingUser
  }, [isCreatingUser])

  const stateValue = useMemo(
    () => ({
      isShowAllEditor,
      displayItemEditor,
      isShowDeleteCheckbox,
      isShowNewUserForm,
      isCreatingUser,
      builtAllUsersValue,
      isPatching,
    }),
    [
      isShowAllEditor,
      displayItemEditor,
      isShowDeleteCheckbox,
      isShowNewUserForm,
      isCreatingUser,
      builtAllUsersValue,
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
      setNewUserValue,
      onChangeUserData,
      onChangeUserAvatar,
    }),
    [
      onAllEditor,
      onItemEditor,
      onToggleDeleteCheckbox,
      onChangeCheckDeleteItems,
      onClickDeleteItems,
      onNewUserForm,
      setNewUserValue,
      onChangeUserData,
      onChangeUserAvatar,
    ],
  )

  return (
    <UsersStateContext.Provider value={stateValue}>
      <UsersActionsContext.Provider value={actionsValue}>{children}</UsersActionsContext.Provider>
    </UsersStateContext.Provider>
  )
}
