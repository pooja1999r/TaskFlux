import type { BoardState } from './boardTypes.ts'
import type { BoardAction } from './boardActions.ts'
import { initialState } from './initialState.ts'

export function boardReducer(state: BoardState = initialState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'LOAD_TASKS':
    case 'SET_TASKS':
      return { ...state, tasks: action.payload }
    default:
      return state
  }
}
