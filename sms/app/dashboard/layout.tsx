import { Header } from '../components/header'
import { Sidebar } from '../components/sidebar'
import { Toaster } from '@/components/ui/toaster'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-800">
          <div className="container mx-auto px-6 py-8">
            {children}
            <Toaster/>
          </div>
        </main>
      </div>
      <Toaster />
    </div>
  )
}

