import { INIT_NEW_USER_VALUE } from '@/constants/users'
import type {
  EditableUserFormObject,
  FilteredModifiedAllData,
  PayloadNewUser,
  User,
} from '@/types/users'

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
  // changes: FilteredModifiedAllData
  data:
    | Partial<Omit<User, 'id'>>
    | {
        id: number
        payload: Partial<Omit<User, 'id'>>
      }[]
}

export type UserEditAction =
  | { type: 'SHOW_EDITOR'; payload: User['id'] }
  | { type: 'HIDE_EDITOR'; payload: User['id'] }
  | { type: 'TOGGLE_ALL_EDITOR'; payload: boolean }
  // | { type: 'UPDATE_CHANGE'; payload: { id: number; data: Partial<Omit<User, 'id'>> } }
  // | { type: 'REMOVE_CHANGE'; payload: { id: number } }
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
  isShowAllEditor: false,
  displayedEditor: [],
  editing: null,
  error: null,
  // changes: {},
  data: {},
}

export function userEditReducer(state: UserEditState, action: UserEditAction) {
  const { displayedEditor } = state

  switch (action.type) {
    case 'SHOW_EDITOR':
      return {
        ...state,
        displayedEditor: displayedEditor.includes(action.payload)
          ? displayedEditor
          : [...displayedEditor, action.payload],
      }
    case 'HIDE_EDITOR':
      return {
        ...state,
        displayedEditor: displayedEditor.filter((displayedId) => displayedId !== action.payload),
      }
    // case 'UPDATE_CHANGE': {
    //   const { id, data } = action.payload
    //   return {
    //     ...state,
    //     changes: {
    //       ...state.changes,
    //       [id]: data,
    //     },
    //   }
    // }
    // case 'REMOVE_CHANGE': {
    //   const { id } = action.payload
    //   const nextChanges = { ...state.changes }
    //   delete nextChanges[id]
    //   return {
    //     ...state,
    //     changes: nextChanges,
    //   }
    // }
    case 'TOGGLE_ALL_EDITOR':
      return {
        ...state,
        displayedEditor: [],
        isShowAllEditor: action.payload,
      }
    case 'SUBMIT_START':
      return { ...state, editing: action.payload }
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
