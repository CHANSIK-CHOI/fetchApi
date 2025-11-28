import type {
  ModifiedUserData,
  ModifiedUsersData,
  NewUserData,
  ResultModifiedUserData,
  ResultModifiedUsersData,
  ResultNewUserData,
  User,
} from '@/types/users'

export const getUsersApi = async () => {
  const response = await fetch('https://reqres.in/api/users', {
    headers: {
      'x-api-key': 'reqres-free-v1',
    },
  })

  if (!response.ok) throw Error('유저 데이터를 받아올 수 없습니다.')
  const json: { data: User[] } = await response.json()
  return json
}

export const createUsersApi = async (payload: NewUserData) => {
  const response = await fetch('https://reqres.in/api/users', {
    method: 'POST',
    headers: {
      'x-api-key': 'reqres-free-v1',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw Error('유저 데이터를 추가할 수 없습니다.')

  const result: ResultNewUserData = await response.json()
  return result
}

export const patchUserApi = async (id: number, payload: ModifiedUserData) => {
  const response = await fetch(`https://reqres.in/api/users/${id}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': 'reqres-free-v1',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw Error('유저 데이터를 수정할 수 없습니다.')
  const result: ResultModifiedUserData = await response.json()
  console.log('api', result)
  return result
}

export const patchAllUsersApi = async (data: ModifiedUsersData) => {
  const responses = await Promise.all(
    data.map(({ id, payload }) =>
      fetch(`https://reqres.in/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'x-api-key': 'reqres-free-v1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }),
    ),
  )
  const isError = responses.some((res) => !res.ok)
  if (isError) throw Error('유저 데이터를 수정할 수 없습니다.')

  const results: ResultModifiedUsersData = await Promise.all(
    responses.map((res, idx) =>
      res.json().then((body) => ({ id: data[idx].id, result: { ...body } })),
    ),
  )
  return results
}
