export type NewUserState = {
  isShowEditor: boolean
  isCreating: boolean
}

export type NewUserAction =
  | { type: 'SHOW_EDITOR' }
  | { type: 'HIDE_EDITOR' }
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR' }
  | { type: 'RESET' }

export const INIT_NEW_USER_STATE: NewUserState = {
  isShowEditor: false,
  isCreating: false,
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
      return { ...state, isCreating: false, isShowEditor: false }
    case 'SUBMIT_ERROR':
      return { ...state, isCreating: false }
    case 'RESET':
      return INIT_NEW_USER_STATE
    default:
      return state
  }
}
