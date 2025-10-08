import React from 'react'
import Button from './Button'

class JobErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('JobErrorBoundary caught an error:', error, errorInfo)
    
    // Log specific DOM manipulation errors
    if (error.message.includes('insertBefore') || error.message.includes('NotFoundError')) {
      console.error('DOM manipulation error detected in job component:', {
        error: error.message,
        stack: error.stack,
        errorInfo
      })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
    // Force a complete re-render by calling the parent's retry function if provided
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-2">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Job Component Error
              </h3>
              <p className="mt-2 text-sm text-red-700">
                There was an error displaying this job. This might be due to a temporary issue with the data update.
              </p>
              <div className="mt-4">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={this.handleRetry}
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    Refresh Page
                  </Button>
                </div>
              </div>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-xs text-red-600">
                    Error details (development only)
                  </summary>
                  <pre className="mt-1 text-xs bg-red-100 p-2 rounded overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default JobErrorBoundary