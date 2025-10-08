import React from 'react'
import classNames from 'classnames'

const Tag = ({ 
  children, 
  status = 'active',
  size = 'md',
  className = '' 
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full'
  
  const statusClasses = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    active: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-800'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  }

  return (
    <span
      className={classNames(
        baseClasses,
        statusClasses[status],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  )
}

export default Tag
