import { useCallback } from 'react'
import type { BoardAction } from '../state/boardActions.ts'
import type { BoardSnapshot } from '../state/boardTypes.ts'

export function useUndoRedo(
  history: BoardSnapshot[],
  future: BoardSnapshot[],
  dispatch: React.Dispatch<BoardAction>,
) {
  const canUndo = history.length > 0
  const canRedo = future.length > 0

  const handleUndo = useCallback(() => {
    dispatch({ type: 'UNDO' })
  }, [dispatch])

  const handleRedo = useCallback(() => {
    dispatch({ type: 'REDO' })
  }, [dispatch])

  return { canUndo, canRedo, handleUndo, handleRedo }
}

