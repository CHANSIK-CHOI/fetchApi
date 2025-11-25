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
  UsersContext,
  type OnShowItemEditor,
  type OnCheckedDeleteItems,
  type OnShowAllEditor,
  type OnPostUserData,
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
  const newUserDataRef = useRef<NewUserData>(INIT_NEW_USER_DATA) // [UsersNewForm] input value (ref)

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

  const [builtUsersData, setBuiltUsersData] = useState(buildUsersData(users)) // [UsersItem] input value (state)

  // reset ui
  const resetItemEditor = () => {
    setShowItemEditor([])
  }

  // [A:전체수정] 전체 수정 에디터 show/hide & patch
  const onShowAllEditor = useCallback(
    ({ isShowEditor, isPatch = false }: OnShowAllEditor) => {
      setIsShowAllEditor(isShowEditor)

      if (isShowEditor) {
        // 전체 에디터 창 show
        resetItemEditor()
      } else {
        // 전체 에디터 창 hide
        if (isPatch) {
          // 수정완료(PATCH) : isPatch
        } else {
          // 수정 취소
          setBuiltUsersData(buildUsersData(users))
        }
      }
    },
    [buildUsersData, users],
  )

  // [I:수정하기] item 수정 에디터 show/hide & patch
  const onShowItemEditor = useCallback(
    ({ id, isShowEditor, isPatch = false }: OnShowItemEditor) => {
      if (isShowEditor) {
        // id Item 에디터 창 show
        setShowItemEditor((prev) => {
          const isShowItemIds = prev.includes(id) ? prev : [...prev, id]
          return isShowItemIds
        })
      } else {
        // Item  에디터 창 hide
        if (isPatch) {
          // 수정완료(PATCH) : isPatch
        } else {
          // 수정 취소
        }
        // id Item 에디터 창 hide
        setShowItemEditor((prev) => {
          const isFilteredId = prev.filter((value) => value !== id)
          return isFilteredId
        })
      }
    },
    [],
  )

  // [A:선택하기] 삭제 할 item을 선택하는 checkbox show
  const onShowDeleteCheckbox = useCallback((isActive: boolean) => {
    setIsShowDeleteCheckbox(isActive)
    if (!isActive) {
      setCheckedDeleteItems([])
    } else {
      resetItemEditor()
    }
  }, [])

  // [A:선택하기 > Checkbox] Checkbox Change Event
  const onCheckedDeleteItems = useCallback(({ e, id }: OnCheckedDeleteItems) => {
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

  // [A:선택하기 > 삭제하기] 선택된 item 데이터 삭제
  const onClickDelete = useCallback(() => {
    if (checkedDeleteItems.length === 0) {
      // 선택 된 데이터가 없을 때
      alert('선택한 데이터가 없습니다.')
    } else {
      // 삭제하기(DELETE)
    }
  }, [checkedDeleteItems])

  // [A:추가하기] 신규 유저 추가 에디터 show/hide & post
  const onIsShowNewUserForm = useCallback(
    ({ isShow, isPost = false }: OnPostUserData) => {
      if (isShow) {
        // 신규 유저 추가 에디터 창 show
        resetItemEditor()
        setIsShowNewUserForm(true)
      } else {
        // 신규 유저 추가 에디터 창 hide
        setIsShowNewUserForm(false)

        if (isPost) {
          // 추가완료(POST) : isPost
          const { email, first_name, last_name } = newUserDataRef.current
          if (!email || !first_name || !last_name) {
            alert('이메일, 이름, 성을 모두 입력해주세요.')
            return
          }
          onCreate(newUserDataRef.current)
        }
      }
      setNewUserData(INIT_NEW_USER_DATA)
    },
    [onCreate],
  )

  // [수정 에디터] builtUsersData update
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

  // users 업데이트 시 builtUsersData도 업데이트
  useEffect(() => {
    setBuiltUsersData(buildUsersData(users))
  }, [buildUsersData, users])

  // [UsersNewForm] change event > ref update
  useEffect(() => {
    newUserDataRef.current = newUserData
  }, [newUserData])

  const providerValue = useMemo(
    () => ({
      isShowAllEditor,
      onShowAllEditor,
      showItemEditor,
      onShowItemEditor,
      isShowDeleteCheckbox,
      onShowDeleteCheckbox,
      onCheckedDeleteItems,
      onClickDelete,
      isShowNewUserForm,
      onIsShowNewUserForm,
      setNewUserData,
      builtUsersData,
      onChangeUserData,
    }),
    [
      showItemEditor,
      isShowAllEditor,
      isShowDeleteCheckbox,
      onShowAllEditor,
      onCheckedDeleteItems,
      onShowItemEditor,
      onClickDelete,
      onShowDeleteCheckbox,
      isShowNewUserForm,
      onIsShowNewUserForm,
      setNewUserData,
      builtUsersData,
      onChangeUserData,
    ],
  )

  return <UsersContext.Provider value={providerValue}>{children}</UsersContext.Provider>
}
