import React from 'react'
import classNames from 'classnames'

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const inputClasses = classNames(
    'w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    {
      'border-gray-300': !error,
      'border-red-300 focus:ring-red-500 focus:border-red-500': error,
      'bg-gray-50 cursor-not-allowed': disabled
    },
    className
  )

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}

export default Input
