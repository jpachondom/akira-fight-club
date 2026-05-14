import { Outlet } from 'react-router-dom'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminHeader } from '@/components/admin/AdminHeader'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'

export function AdminLayout() {
  const { sidebarOpen } = useUIStore()

  return (
    <div className="min-h-screen bg-akira-black flex">
      <AdminSidebar />
      <div className={cn('flex-1 flex flex-col min-w-0 transition-all duration-300', sidebarOpen ? 'lg:ml-64' : 'lg:ml-16')}>
        <AdminHeader />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
