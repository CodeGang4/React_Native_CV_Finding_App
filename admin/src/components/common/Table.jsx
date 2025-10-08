import React from 'react'
import classNames from 'classnames'
import Skeleton from './Skeleton'

const Table = ({
  columns = [],
  data = [],
  rowKey = 'id',
  loading = false,
  pagination,
  onChange,
  className = ''
}) => {
  // Ensure data is always an array to prevent map errors
  const safeData = React.useMemo(() => {
    if (Array.isArray(data)) {
      return data
    }
    
    // If data is an object with items property (common API response format)
    if (data && typeof data === 'object' && Array.isArray(data.items)) {
      return data.items
    }
    
    // Fallback to empty array
    console.warn('Table: data prop is not an array, falling back to empty array:', data)
    return []
  }, [data])

  const handlePageChange = (page) => {
    if (onChange) {
      onChange({ page })
    }
  }

  if (loading) {
    return <Skeleton type="table" />
  }

  return (
    <div className={classNames('bg-white rounded-lg shadow overflow-hidden', className)}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {safeData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            ) : (
              safeData.map((row, rowIndex) => (
                <tr key={row[rowKey] || rowIndex} className="hover:bg-gray-50">
                  {columns.map((column, colIndex) => (
                    <td
                      key={column.key || colIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {column.render ? column.render(row[column.dataIndex], row) : row[column.dataIndex]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Simple pagination */}
      {pagination && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.current - 1)}
              disabled={pagination.current <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.current + 1)}
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing{' '}
                <span className="font-medium">
                  {(pagination.current - 1) * pagination.pageSize + 1}
                </span>{' '}
                to{' '}
                <span className="font-medium">
                  {Math.min(pagination.current * pagination.pageSize, pagination.total)}
                </span>{' '}
                of{' '}
                <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.current - 1)}
                  disabled={pagination.current <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  {pagination.current}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.current + 1)}
                  disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Table
