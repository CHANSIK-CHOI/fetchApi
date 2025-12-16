import { INIT_NEW_USER_VALUE } from '@/constants/users'
import type { PayloadNewUser } from '@/types/users'

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
