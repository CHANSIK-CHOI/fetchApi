import type {
  PayloadModifiedUser,
  PayloadAllModifiedUsers,
  PayloadNewUser,
  ApiResultModifiedUser,
  ApiResultAllModifiedUsers,
  ApiResultNewUser,
  User,
} from '@/types/users'

export const getAllUsersApi = async () => {
  const response = await fetch('https://reqres.in/api/users', {
    headers: {
      'x-api-key': 'reqres_34b210b936844955a8b80641c7073e29',
    },
  })

  if (!response.ok) throw Error('유저 데이터를 받아올 수 없습니다.')
  const result: { data: User[] } = await response.json()
  return result
}

export const createUserApi = async (payload: PayloadNewUser) => {
  const response = await fetch('https://reqres.in/api/users', {
    method: 'POST',
    headers: {
      'x-api-key': 'reqres_34b210b936844955a8b80641c7073e29',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw Error('유저 데이터를 추가할 수 없습니다.')
  const result: ApiResultNewUser = await response.json()
  return result
}

export const patchUserApi = async (id: User['id'], payload: PayloadModifiedUser) => {
  const response = await fetch(`https://reqres.in/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': 'reqres_34b210b936844955a8b80641c7073e29',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw Error('유저 데이터를 수정할 수 없습니다.')
  const result: ApiResultModifiedUser = await response.json()
  return result
}

export const patchAllUsersApi = async (data: PayloadAllModifiedUsers) => {
  const responses = await Promise.all(
    data.map(({ id, payload }) =>
      fetch(`https://reqres.in/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'x-api-key': 'reqres_34b210b936844955a8b80641c7073e29',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
    ),
  )
  const isError = responses.some((res) => !res.ok)
  if (isError) throw Error('유저 데이터를 수정할 수 없습니다.')

  const results: ApiResultAllModifiedUsers = await Promise.all(
    responses.map((res, idx) =>
      res.json().then((body) => ({ id: data[idx].id, result: { ...body } })),
    ),
  )
  return results
}

export const deleteUserApi = async (id: User['id']) => {
  const response = await fetch(`https://reqres.in/api/users/${id}`, {
    method: 'DELETE',
    headers: {
      'x-api-key': 'reqres_34b210b936844955a8b80641c7073e29',
    },
  })

  if (!response.ok) throw Error('유저 데이터를 삭제할 수 없습니다.')

  // reqres DELETE 응답은 204로 body가 없는 경우가 있어서 명시적으로 성공 여부만 반환
  return response.status === 204 ? true : await response.json().catch(() => true)
}

export const deleteSelectedUsersApi = async (ids: User['id'][]) => {
  // const response
}
