import { useContext } from 'react'
import { BoardContext } from '../../features/board/state/BoardContext.tsx'
import { Board } from '../../features/board/components/Board.tsx'

export function DashboardPage() {
  const ctx = useContext(BoardContext)
  if (ctx === null) return null
  return <Board />
}
