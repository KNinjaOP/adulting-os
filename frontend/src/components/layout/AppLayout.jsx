import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'
import { useState } from 'react'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-base)', transition: 'background 0.3s ease' }}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col flex-1 overflow-hidden" style={{ marginLeft: sidebarOpen ? '260px' : '0', transition: 'margin-left 0.3s ease' }}>
        <Header onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="flex-1 overflow-y-auto" style={{ padding: '2rem 2.5rem' }}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
