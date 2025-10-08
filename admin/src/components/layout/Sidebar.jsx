import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import classNames from 'classnames'

const menuItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊' },
  { path: '/users', label: 'Users', icon: '👥' },
  { path: '/companies', label: 'Companies', icon: '🏢' },
  { path: '/jobs', label: 'Jobs', icon: '💼' },
]

function Sidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleNavigation = (path) => {
    // Immediate navigation without query params
    if (location.pathname !== path) {
      navigate(path)
    }
  }

  return (
    <div className="w-64 bg-gray-800 text-white h-screen fixed left-0 top-0">
      <div className="p-4">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="mt-8">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => handleNavigation(item.path)}
            className={classNames(
              'flex items-center px-4 py-3 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors w-full text-left',
              {
                'bg-gray-700 text-white': location.pathname === item.path
              }
            )}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  )
}

export default Sidebar
