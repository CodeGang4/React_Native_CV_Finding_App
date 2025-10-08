import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

function AppLayout() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 ml-64">
        <Topbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AppLayout
