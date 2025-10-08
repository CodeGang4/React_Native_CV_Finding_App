import React from 'react'
import Breadcrumbs from './Breadcrumbs'

function Topbar() {
  return (
    <div className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-6">
      <div className="flex items-center">
        <Breadcrumbs />
      </div>
      <div className="flex items-center space-x-4">
        <span className="text-gray-600">Welcome, Admin</span>
        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
          👤
        </div>
      </div>
    </div>
  )
}

export default Topbar
