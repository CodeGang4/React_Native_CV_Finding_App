import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function Breadcrumbs({ items }) {
  const location = useLocation()
  
  // If items prop is provided, use it; otherwise fall back to auto-generated breadcrumbs
  if (items) {
    return (
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={index} className="flex items-center">
              {index > 0 && <span className="text-gray-400 mx-2">/</span>}
              {item.to ? (
                <Link to={item.to} className="text-gray-500 hover:text-gray-700">
                  {item.label}
                </Link>
              ) : (
                <span className="text-gray-700 font-medium">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>
    )
  }

  // Auto-generated breadcrumbs (fallback)
  const pathSegments = location.pathname.split('/').filter(Boolean)
  
  const getBreadcrumbName = (segment) => {
    const nameMap = {
      'dashboard': 'Dashboard',
      'users': 'Users',
      'companies': 'Companies',
      'jobs': 'Jobs',
      'login': 'Login'
    }
    return nameMap[segment] || segment
  }

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="text-gray-500 hover:text-gray-700">Home</Link>
        </li>
        {pathSegments.map((segment, index) => (
          <li key={index} className="flex items-center">
            <span className="text-gray-400 mx-2">/</span>
            <span className="text-gray-700 font-medium">{getBreadcrumbName(segment)}</span>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
