import { INIT_NEW_USER_VALUE } from '@/constants/users'
import type { EditableUserFormObject, PayloadNewUser, User } from '@/types/users'

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
  mode: 'default' | 'individualEdit' | 'allEdit'
  displayedEditor: User['id'][]
  editing: User['id'] | 'all' | null
  error: string | null
  changes: Record<number, Partial<EditableUserFormObject>>
}

export type UserEditAction =
  | { type: 'SHOW_EDITOR'; payload: User['id'] }
  | { type: 'HIDE_EDITOR'; payload: User['id'] }
  | { type: 'TOGGLE_ALL_EDITOR'; payload: boolean }
  | { type: 'UPDATE_CHANGE'; payload: { id: number; name: string; value: string } }
  | { type: 'SUBMIT_START'; payload: User['id'] }
  | { type: 'SUBMIT_MODIFIED_USERS_START' }
  | { type: 'SUBMIT_SUCCESS'; payload: { data: Partial<Omit<User, 'id'>>; id: User['id'] } }
  | {
      type: 'SUBMIT_MODIFIED_USERS_SUCCESS'
      payload: {
        id: number
        payload: Partial<Omit<User, 'id'>>
      }[]
    }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' }

export const INIT_USER_EDIT_STATE: UserEditState = {
  mode: 'default',
  displayedEditor: [],
  editing: null,
  error: null,
  changes: {},
}

export function userEditReducer(state: UserEditState, action: UserEditAction) {
  const { displayedEditor, changes } = state

  switch (action.type) {
    case 'SHOW_EDITOR': {
      const { payload } = action
      return {
        ...state,
        displayedEditor: displayedEditor.includes(payload)
          ? displayedEditor
          : [...displayedEditor, payload],
      }
    }
    case 'HIDE_EDITOR': {
      const { payload } = action
      return {
        ...state,
        displayedEditor: displayedEditor.filter((displayedId) => displayedId !== payload),
      }
    }
    case 'TOGGLE_ALL_EDITOR': {
      const { payload } = action
      return {
        ...state,
        displayedEditor: [],
        mode: payload ? 'allEdit' : 'default',
      }
    }
    case 'SUBMIT_START': {
      const { payload } = action
      return { ...state, editing: payload }
    }
    case 'UPDATE_CHANGE': {
      const { id, name, value } = action.payload
      console.log(changes)
      return {
        ...state,
        changes: {
          ...state.changes,
          [id]: {
            ...state.changes[id],
            [name]: value,
          },
        },
      }
    }

    case 'SUBMIT_MODIFIED_USERS_START':
      return { ...state, editing: 'all' as const }
    case 'SUBMIT_SUCCESS':
      return {
        ...state,
        editing: null,
        displayedEditor: displayedEditor.filter((displayedId) => displayedId !== action.payload.id),
        data: action.payload.data,
      }
    case 'SUBMIT_MODIFIED_USERS_SUCCESS':
      return { ...state, editing: null, data: action.payload }
    case 'SUBMIT_ERROR':
      return { ...state, editing: null, error: action.payload }
    case 'RESET':
      return INIT_USER_EDIT_STATE
    default:
      return state
  }
}
