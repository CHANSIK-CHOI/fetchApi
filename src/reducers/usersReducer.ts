import { INIT_NEW_USER_VALUE } from '@/constants/users'
import type { PayloadNewUser, User } from '@/types/users'

// POST
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

// PATCH
export type UserEditState = {
  isShowAllEditor: boolean
  isResetAllValue: boolean
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
  | { type: 'RESET_START_ALL_VALUE' }
  | { type: 'RESET_COMPLETE_ALL_VALUE' }
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
  isResetAllValue: false,
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
    case 'RESET_START_ALL_VALUE': {
      return {
        ...state,
        isResetAllValue: true,
        isShowAllEditor: false,
        displayedEditor: [],
      }
    }
    case 'RESET_COMPLETE_ALL_VALUE': {
      return {
        ...state,
        isResetAllValue: false,
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

// DELETE
export type UserDeleteState = {
  isShowDeleteCheckbox: boolean
  checkedIds: User['id'][]
  deleteing: User['id'] | 'all' | null
  error: string | null
}
export type UserDeleteAction =
  | { type: 'SHOW_CHECKBOX' }
  | { type: 'HIDE_CHECKBOX' }
  | { type: 'ALL_CHECKED'; payload: { ids: User['id'][] } }
  | { type: 'RESET_CHECKED' }
  | { type: 'TOGGLE_ITEM'; payload: { id: User['id'] } }
  | { type: 'SUBMIT_START'; payload: { id: User['id'] } }
  | { type: 'SUBMIT_CHECKED_ITEMS_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: { msg: string } }
  | { type: 'RESET' }

export const INIT_USER_DELETE_STATE: UserDeleteState = {
  isShowDeleteCheckbox: false,
  checkedIds: [],
  deleteing: null,
  error: null,
}

export function userDeleteReducer(state: UserDeleteState, action: UserDeleteAction) {
  const { checkedIds } = state
  switch (action.type) {
    case 'SHOW_CHECKBOX': {
      return {
        ...state,
        isShowDeleteCheckbox: true,
      }
    }
    case 'HIDE_CHECKBOX': {
      return {
        ...state,
        isShowDeleteCheckbox: false,
        checkedIds: [],
      }
    }
    case 'ALL_CHECKED': {
      const { ids } = action.payload
      return {
        ...state,
        checkedIds: ids,
      }
    }
    case 'TOGGLE_ITEM': {
      const { id } = action.payload
      const isChecked = checkedIds.includes(id)
      const newCheckedIds = isChecked
        ? checkedIds.filter((itemId) => itemId !== id)
        : [...checkedIds, id]

      return {
        ...state,
        checkedIds: newCheckedIds,
      }
    }
    case 'RESET_CHECKED': {
      return {
        ...state,
        checkedIds: [],
      }
    }
    case 'SUBMIT_START': {
      const { id } = action.payload
      return { ...state, deleteing: id }
    }
    case 'SUBMIT_CHECKED_ITEMS_START': {
      return { ...state, deleteing: 'all' as const }
    }
    case 'SUBMIT_SUCCESS': {
      return { ...state, deleteing: null, checkedIds: [], isShowDeleteCheckbox: false }
    }
    case 'SUBMIT_ERROR': {
      const { msg } = action.payload
      return { ...state, deleteing: null, error: msg }
    }
    case 'RESET':
      return INIT_USER_DELETE_STATE
    default:
      return state
  }
}
