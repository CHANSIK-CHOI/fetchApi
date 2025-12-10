import { useCallback, useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  postUserApi,
  deleteSelectedUsersApi,
  deleteUserApi,
  getAllUsersApi,
  patchAllUsersApi,
  patchUserApi,
} from '@/api/users.api'
import {
  type PayloadModifiedUser,
  type PayloadAllModifiedUsers,
  type PayloadNewUser,
  type User,
} from '@/types/users'

const USERS_QUERY_KEY = ['users']

export function useUsersQuery() {
  const queryClient = useQueryClient()

  const usersQuery = useQuery<User[], Error>({
    queryKey: USERS_QUERY_KEY,
    queryFn: async () => {
      const { data } = await getAllUsersApi()
      return data
    },
  })

  const createUserMutation = useMutation({
    mutationFn: postUserApi,
    onMutate: async (payload) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<User[]>(USERS_QUERY_KEY) ?? []
      const tempId = Date.now()
      const optimisticUser: User = {
        id: tempId,
        avatar: payload.avatar ?? '',
        email: payload.email,
        first_name: payload.first_name,
        last_name: payload.last_name,
      }
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) => [optimisticUser, ...prev])
      return { previousUsers, tempId }
    },
    onError: (_err, _payload, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSuccess: (result, _payload, context) => {
      const { id, ...rest } = result
      const numericId = Number(id)
      const newUser: User = {
        id: Number.isNaN(numericId) ? Date.now() : numericId,
        avatar: rest.avatar ?? '',
        email: rest.email,
        first_name: rest.first_name,
        last_name: rest.last_name,
      }
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) => {
        if (!context?.tempId) return [newUser, ...prev]
        return prev.map((user) => (user.id === context.tempId ? newUser : user))
      })
    },
    // onSettled: () => {
    //   void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    // },
  })

  const createUser = useCallback(
    (payload: PayloadNewUser) => createUserMutation.mutateAsync(payload).then(() => {}),
    [createUserMutation],
  )

  const modifyUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: User['id']; payload: PayloadModifiedUser }) =>
      patchUserApi(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<User[]>(USERS_QUERY_KEY) ?? []
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.map((user) => (user.id === id ? { ...user, ...payload } : user)),
      )
      return { previousUsers }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSuccess: (result, { id }) => {
      const { updatedAt: _, ...rest } = result
      void _
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.map((user) => (user.id === id ? { ...user, ...rest } : user)),
      )
    },
    // onSettled: () => {
    //   void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    // },
  })

  const modifyUser = useCallback(
    (id: User['id'], payload: PayloadModifiedUser) =>
      modifyUserMutation.mutateAsync({ id, payload }).then(() => {}),
    [modifyUserMutation],
  )

  const modifyAllUsersMutation = useMutation({
    mutationFn: patchAllUsersApi,
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<User[]>(USERS_QUERY_KEY) ?? []
      const payloadMap = new Map(data.map(({ id, payload }) => [id, payload]))
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.map((user) => {
          const patch = payloadMap.get(user.id)
          return patch ? { ...user, ...patch } : user
        }),
      )
      return { previousUsers }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSuccess: (results) => {
      const resultMap = new Map(results.map(({ id, result }) => [id, result]))

      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.map((user) => {
          const patched = resultMap.get(user.id)
          if (!patched) return user

          const { updatedAt: _, ...rest } = patched
          void _
          return { ...user, ...rest }
        }),
      )
    },
    // onSettled: () => {
    //   void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    // },
  })

  const modifyAllUsers = useCallback(
    (data: PayloadAllModifiedUsers) => modifyAllUsersMutation.mutateAsync(data).then(() => {}),
    [modifyAllUsersMutation],
  )

  const deleteUserMutation = useMutation({
    mutationFn: (id: User['id']) => deleteUserApi(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<User[]>(USERS_QUERY_KEY) ?? []
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.filter((user) => user.id !== id),
      )
      return { previousUsers }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSuccess: (isSuccess, id) => {
      if (!isSuccess) return
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.filter((user) => user.id !== id),
      )
    },
    // onSettled: () => {
    //   void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    // },
  })

  const deleteUser = useCallback(
    (id: User['id']) => deleteUserMutation.mutateAsync(id).then(() => {}),
    [deleteUserMutation],
  )

  const deleteSelectedUsersMutation = useMutation({
    mutationFn: (ids: User['id'][]) => deleteSelectedUsersApi(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: USERS_QUERY_KEY })
      const previousUsers = queryClient.getQueryData<User[]>(USERS_QUERY_KEY) ?? []
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.filter((user) => !ids.includes(user.id)),
      )
      return { previousUsers }
    },
    onError: (_err, _variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData(USERS_QUERY_KEY, context.previousUsers)
      }
    },
    onSuccess: (isAllSuccess, ids) => {
      if (!isAllSuccess) return
      queryClient.setQueryData<User[]>(USERS_QUERY_KEY, (prev = []) =>
        prev.filter((user) => !ids.includes(user.id)),
      )
    },
    // onSettled: () => {
    //   void queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    // },
  })

  const deleteSelectedUsers = useCallback(
    (ids: User['id'][]) => deleteSelectedUsersMutation.mutateAsync(ids).then(() => {}),
    [deleteSelectedUsersMutation],
  )

  const error = useMemo(() => {
    const messages: Array<string | null> = [
      usersQuery.error?.message ?? null,
      createUserMutation.error?.message ?? null,
      modifyUserMutation.error?.message ?? null,
      modifyAllUsersMutation.error?.message ?? null,
      deleteUserMutation.error?.message ?? null,
      deleteSelectedUsersMutation.error?.message ?? null,
    ]
    return messages.find(Boolean) ?? ''
  }, [
    usersQuery.error,
    createUserMutation.error,
    modifyUserMutation.error,
    modifyAllUsersMutation.error,
    deleteUserMutation.error,
    deleteSelectedUsersMutation.error,
  ])

  const isLoading = usersQuery.isPending || usersQuery.isFetching

  return {
    users: usersQuery.data ?? [],
    isLoading,
    error,
    createUser,
    modifyUser,
    modifyAllUsers,
    deleteUser,
    deleteSelectedUsers,
  }
}
