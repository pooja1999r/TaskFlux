import { BoardProvider } from './providers/BoardProvider.tsx'
import { Routes } from './routes.tsx'
import { OfflineBanner } from '../shared/components/OfflineBanner.tsx'
import './App.css'

export default function App() {
  return (
    <BoardProvider>
      <Routes />
      <OfflineBanner />
    </BoardProvider>
  )
}
