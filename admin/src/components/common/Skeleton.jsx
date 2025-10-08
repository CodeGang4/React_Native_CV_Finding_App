import React from 'react'
import classNames from 'classnames'

const Skeleton = ({ 
  type = 'card', 
  rows = 5,
  className = '' 
}) => {
  const baseClasses = 'animate-pulse'

  if (type === 'table') {
    return (
      <div className={classNames('bg-white rounded-lg shadow overflow-hidden', className)}>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                {[...Array(4)].map((_, index) => (
                  <th key={index} className="px-6 py-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[...Array(rows)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {[...Array(4)].map((_, colIndex) => (
                    <td key={colIndex} className="px-6 py-4">
                      <div className={classNames(baseClasses)}>
                        <div className="h-4 bg-gray-200 rounded"></div>
                      </div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (type === 'card') {
    return (
      <div className={classNames('bg-white rounded-lg shadow p-6', className)}>
        <div className={classNames(baseClasses, 'space-y-4')}>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            <div className="h-4 bg-gray-200 rounded w-4/6"></div>
          </div>
          <div className="flex space-x-4">
            <div className="h-8 bg-gray-200 rounded w-20"></div>
            <div className="h-8 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
      </div>
    )
  }

  // Default line skeleton
  return (
    <div className={classNames(baseClasses, className)}>
      <div className="space-y-2">
        {[...Array(rows)].map((_, index) => (
          <div key={index} className="h-4 bg-gray-200 rounded"></div>
        ))}
      </div>
    </div>
  )
}

export default Skeleton
