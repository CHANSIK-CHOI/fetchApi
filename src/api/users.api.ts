import type { User } from '@/types/users'

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

export const createUsersApi = async (payload: User) => {
  const response = await fetch('https://reqres.in/api/users', {
    method: 'POST',
    headers: {
      'x-api-key': 'reqres-free-v1',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) throw Error('유저 데이터를 추가할 수 없습니다.')

  const json = await response.json()
  console.log({ response, json })

  return json
}
