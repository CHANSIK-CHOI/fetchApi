import { type ChangeEvent, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react'
import {
  UsersContext,
  type OnItemEditor,
  type OnChangeCheckDeleteItems,
  type OnAllEditor,
  type OnNewUserForm,
} from '@/features/users'
import type { NewUserData, User, UsersFormValueItem, UsersFormValueMap } from '@/types/users'
import { INIT_NEW_USER_DATA } from '@/utils'

type UsersProviderProps = {
  children: ReactNode
  onCreate: (userData: NewUserData) => Promise<void>
  users: User[]
}

export default function UsersProvider({ children, onCreate, users }: UsersProviderProps) {
  const [isShowAllEditor, setIsShowAllEditor] = useState<boolean>(false) // 전체 수정 에디터 show
  const [showItemEditor, setShowItemEditor] = useState<number[]>([]) // item 수정 에디터 show
  const [isShowDeleteCheckbox, setIsShowDeleteCheckbox] = useState<boolean>(false) // 선택 체크박스 show
  const [checkedDeleteItems, setCheckedDeleteItems] = useState<number[]>([]) // 선택 된 items
  const [isShowNewUserForm, setIsShowNewUserForm] = useState<boolean>(false) // [UsersNewForm] show
  const [newUserData, setNewUserData] = useState<NewUserData>(INIT_NEW_USER_DATA) // [UsersNewForm] input value (state)
  const [isCreatingUser, setIsCreatingUser] = useState<boolean>(false)

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

  const [builtUsersData, setBuiltUsersData] = useState<UsersFormValueMap>(buildUsersData(users)) // [UsersItem] input value (state)

  // [reset] 전체 유저 데이터 reset
  const resetAllUsersData = useCallback(() => {
    setBuiltUsersData((prev) => {
      const hasModified = Object.values(prev).some(({ isModify }) => isModify)
      if (!hasModified) return prev

      return buildUsersData(users)
    })
  }, [buildUsersData, users])

  // [reset] 특정 유저 데이터 reset
  const resetTargetUserData = useCallback(
    (id: number) => {
      setBuiltUsersData((prev) => {
        const target = prev[id]
        if (!target || !target.isModify) return prev

        return {
          ...prev,
          [id]: {
            ...buildUsersData(users)[id],
            isModify: false,
          } as UsersFormValueItem,
        }
      })
    },
    [buildUsersData, users],
  )

  // [수정하기 - 전체] 전체 수정 에디터 show/hide & patch
  const onAllEditor = useCallback(
    ({ isShowEditor, isPatch = false }: OnAllEditor) => {
      if (isPatch) {
        // 수정완료(PATCH) : isPatch
        const usersArray = Object.values(builtUsersData)
        const modifiedData = usersArray.filter(({ isModify }) => isModify)

        if (modifiedData.length === 0) return
        console.log('수정된 데이터는', modifiedData)
      }

      // 수정취소
      if (!isShowEditor && !isPatch) resetAllUsersData()

      // 열릴 때 Item Editor reset
      if (isShowEditor) setShowItemEditor([])

      // toggle
      setIsShowAllEditor(isShowEditor)
    },
    [builtUsersData, resetAllUsersData],
  )

  // [수정하기 - 개별] item 수정 에디터 show/hide & patch
  const onItemEditor = useCallback(
    ({ id, isShowEditor, isPatch = false }: OnItemEditor) => {
      if (isPatch) {
        // 수정완료(PATCH) : isPatch
      }

      // 수정취소
      if (!isShowEditor && !isPatch) resetTargetUserData(id)

      if (isShowEditor) {
        // id Item 에디터 창 show
        setShowItemEditor((prev) => {
          const isShowItemIds = prev.includes(id) ? prev : [...prev, id]
          return isShowItemIds
        })
      } else {
        // id Item 에디터 창 hide
        setShowItemEditor((prev) => {
          const isFilteredId = prev.filter((value) => value !== id)
          return isFilteredId
        })
      }
    },
    [resetTargetUserData],
  )

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
    setBuiltUsersData(buildUsersData(users))
  }, [buildUsersData, users])

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

  // [추가하기] 신규 유저 추가 에디터 show/hide & post
  const onNewUserForm = useCallback(
    async ({ isShowEditor, isPost = false }: OnNewUserForm) => {
      if (isPost) {
        // 추가완료(POST) : isPost
        if (isCreatingUser) return

        const { email, first_name, last_name } = newUserData
        if (!email || !first_name || !last_name) {
          alert('이메일, 이름, 성을 모두 입력해주세요.')
          return
        }

        try {
          setIsCreatingUser(true)
          await onCreate(newUserData)
          setNewUserData(INIT_NEW_USER_DATA)
          setIsShowNewUserForm(false)
        } catch (error) {
          console.error(error)
          alert('유저 생성에 실패했습니다. 다시 시도해주세요.')
        } finally {
          setIsCreatingUser(false)
        }
        return
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
    [isCreatingUser, newUserData, onCreate, resetAllUsersData],
  )

  const handleSetIsShowDeleteCheckbox = useCallback(
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

  const providerValue = useMemo(
    () => ({
      isShowAllEditor,
      onAllEditor,
      showItemEditor,
      onItemEditor,
      isShowDeleteCheckbox,
      setIsShowDeleteCheckbox: handleSetIsShowDeleteCheckbox,
      onChangeCheckDeleteItems,
      onClickDeleteItems,
      isShowNewUserForm,
      onNewUserForm,
      isCreatingUser,
      setNewUserData,
      builtUsersData,
      onChangeUserData,
    }),
    [
      showItemEditor,
      isShowAllEditor,
      isShowDeleteCheckbox,
      onAllEditor,
      onChangeCheckDeleteItems,
      onItemEditor,
      onClickDeleteItems,
      handleSetIsShowDeleteCheckbox,
      isShowNewUserForm,
      onNewUserForm,
      isCreatingUser,
      setNewUserData,
      builtUsersData,
      onChangeUserData,
    ],
  )

  return <UsersContext.Provider value={providerValue}>{children}</UsersContext.Provider>
}
