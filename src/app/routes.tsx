import { DashboardPage } from '../pages/Dashboard/DashboardPage.tsx'
import { DashboardLayout } from '../pages/Dashboard/DashboardLayout.tsx'

export function Routes() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  )
}
