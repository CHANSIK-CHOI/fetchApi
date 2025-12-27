import { UsersItem } from '@/features/users'
import type { User } from '@/types/users'
import { memo } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'

function UsersList() {
  // ✨ Brain(Users.tsx)에서 내려준 control 가져오기
  const { control } = useFormContext<{ users: User[] }>()

  // ✨ RHF 배열 관리 훅 연결
  // 이제 'fields'가 우리의 유일한 데이터 소스입니다.
  const { fields } = useFieldArray({
    control, // 1. "나는 이 폼(Brain)의 통제를 받는다" (연결고리)
    name: 'users', // 2. "나는 폼 데이터 중 'users'라는 배열을 관리한다" (타겟)
    keyName: 'keyId', // 3. "리액트 렌더링용 고유키 이름을 'keyId'로 하겠다" (설정)
  })

  return (
    <>
      {fields.length > 0 ? (
        <ul className="users__list">
          {fields.map((field, index) => {
            // field는 폼 데이터의 스냅샷 + keyId를 포함함
            const user = field as User & { keyId: string }

            return (
              <UsersItem
                key={user.keyId} // 반드시 keyId 사용!
                index={index} // RHF 인덱스
                id={user.id} // 비즈니스 로직용 ID
                // 초기값 렌더링을 위해 prop 전달 (뷰 모드용)
                // RHF store에 있는 값이므로 수정 중에도 유지됨
                avatar={user.avatar}
                firstName={user.first_name}
                lastName={user.last_name}
                email={user.email}
              />
            )
          })}
        </ul>
      ) : (
        <div className="nodata">
          <span className="nodata__text">검색된 유저가 없습니다.</span>
        </div>
      )}
    </>
  )
}

export default memo(UsersList)
