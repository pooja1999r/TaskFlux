import { createContext } from 'react'
import type { BoardState } from './boardTypes.ts'
import type { BoardAction } from './boardActions.ts'

export const BoardContext = createContext<{
  state: BoardState
  dispatch: React.Dispatch<BoardAction>
} | null>(null)
