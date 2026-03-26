import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function Layout() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="min-h-full p-6">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
