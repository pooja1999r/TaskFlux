import { useReducer, type ReactNode } from 'react'
import { BoardContext } from '../../features/board/state/BoardContext.tsx'
import { boardReducer } from '../../features/board/state/boardReducer.ts'
import { initialState } from '../../features/board/state/initialState.ts'

interface BoardProviderProps {
  children: ReactNode
}

export function BoardProvider({ children }: BoardProviderProps) {
  const [state, dispatch] = useReducer(boardReducer, initialState)
  return (
    <BoardContext.Provider value={{ state, dispatch }}>
      {children}
    </BoardContext.Provider>
  )
}
