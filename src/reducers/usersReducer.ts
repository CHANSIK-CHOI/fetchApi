import { INIT_NEW_USER_VALUE } from '@/constants/users'
import type { PayloadNewUser, User } from '@/types/users'

export type NewUserState = {
  isShowEditor: boolean
  isCreating: boolean
  error: string | null
  data: PayloadNewUser
}

export type NewUserAction =
  | { type: 'SHOW_EDITOR' }
  | { type: 'HIDE_EDITOR' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: PayloadNewUser }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' }

export const INIT_NEW_USER_STATE: NewUserState = {
  isShowEditor: false,
  isCreating: false,
  error: null,
  data: INIT_NEW_USER_VALUE,
}

export function newUserReducer(state: NewUserState, action: NewUserAction) {
  switch (action.type) {
    case 'SHOW_EDITOR':
      return {
        ...state,
        isShowEditor: true,
      }
    case 'HIDE_EDITOR':
      return {
        ...state,
        isShowEditor: false,
      }
    case 'SUBMIT_START':
      return { ...state, isCreating: true }
    case 'SUBMIT_SUCCESS':
      return { ...state, isCreating: false, isShowEditor: false, data: action.payload }
    case 'SUBMIT_ERROR':
      return { ...state, isCreating: false, error: action.payload }
    case 'RESET':
      return INIT_NEW_USER_STATE
    default:
      return state
  }
}

export type UserEditState = {
  isShowAllEditor: boolean
  displayedEditor: User['id'][]
  editing: User['id'] | 'all' | null
  error: string | null
  data:
    | Partial<Omit<User, 'id'>>
    | {
        id: number
        payload: Partial<Omit<User, 'id'>>
      }[]
}

export type UserEditAction =
  | { type: 'SHOW_EDITOR'; payload: { id: User['id'] } }
  | { type: 'HIDE_EDITOR'; payload: { id: User['id'] } }
  | { type: 'OPEN_ALL_EDITOR' }
  | { type: 'CLOSE_ALL_EDITOR' }
  | { type: 'SUBMIT_START'; payload: { id: User['id'] } }
  | { type: 'SUBMIT_SUCCESS'; payload: { data: Partial<Omit<User, 'id'>>; id: User['id'] } }
  | { type: 'SUBMIT_MODIFIED_USERS_START' }
  | {
      type: 'SUBMIT_MODIFIED_USERS_SUCCESS'
      payload: {
        data: {
          id: number
          payload: Partial<Omit<User, 'id'>>
        }[]
      }
    }
  | { type: 'SUBMIT_ERROR'; payload: { msg: string } }
  | { type: 'RESET' }

export const INIT_USER_EDIT_STATE: UserEditState = {
  isShowAllEditor: false,
  displayedEditor: [],
  editing: null,
  error: null,
  data: {},
}

export function userEditReducer(state: UserEditState, action: UserEditAction) {
  const { displayedEditor } = state

  switch (action.type) {
    case 'SHOW_EDITOR': {
      const { id } = action.payload
      return {
        ...state,
        displayedEditor: displayedEditor.includes(id) ? displayedEditor : [...displayedEditor, id],
      }
    }
    case 'HIDE_EDITOR': {
      const { id } = action.payload
      return {
        ...state,
        displayedEditor: displayedEditor.filter((displayedId) => displayedId !== id),
      }
    }
    case 'OPEN_ALL_EDITOR': {
      return {
        ...state,
        displayedEditor: [],
        isShowAllEditor: true,
      }
    }
    case 'CLOSE_ALL_EDITOR': {
      return {
        ...state,
        isShowAllEditor: false,
      }
    }
    case 'SUBMIT_START': {
      const { id } = action.payload
      return { ...state, editing: id }
    }
    case 'SUBMIT_SUCCESS': {
      const { id, data } = action.payload
      return {
        ...state,
        editing: null,
        displayedEditor: displayedEditor.filter((displayedId) => displayedId !== id),
        data,
      }
    }
    case 'SUBMIT_MODIFIED_USERS_START':
      return { ...state, editing: 'all' as const }
    case 'SUBMIT_MODIFIED_USERS_SUCCESS': {
      const { data } = action.payload
      return { ...state, editing: null, isShowAllEditor: false, data }
    }
    case 'SUBMIT_ERROR': {
      const { msg } = action.payload
      return { ...state, editing: null, error: msg }
    }
    case 'RESET':
      return INIT_USER_EDIT_STATE
    default:
      return state
  }
}
