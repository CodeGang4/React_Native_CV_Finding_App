import React from 'react'
import Button from './Button'

const EmptyState = ({
  icon,
  title = 'No data found',
  description = 'There is no data to display at the moment.',
  action,
  actionText = 'Add New',
  onAction,
  className = ''
}) => {
  const defaultIcon = (
    <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="flex justify-center mb-4">
        {icon || defaultIcon}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        {description}
      </p>
      {action && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  )
}

export default EmptyState
