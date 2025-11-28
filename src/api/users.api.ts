import type {
  ModifiedUserData,
  ModifiedUsersData,
  NewUserData,
  ResultModifiedUserData,
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
  try {
    const responses = await Promise.all(
      data.map(({ id, payload }) =>
        fetch(`https://reqres.in/api/users/${id}`, {
          headers: {
            'x-api-key': 'reqres-free-v1',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }),
      ),
    )

    const response = await Promise.all(responses.map((res) => res.json()))
    console.log(response)
    // if (!response.ok) throw Error('유저 데이터를 수정할 수 없습니다.')
  } catch (err) {
    console.error('에러 발생:', err)
  }
}
