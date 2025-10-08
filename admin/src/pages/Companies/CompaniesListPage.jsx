import React, { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useLocation } from 'react-router-dom'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Tag from '../../components/common/Tag'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import { getCompanies } from '../../services/companies'
import dayjs from 'dayjs'

// Simple hook for URL query params
const useQueryParams = () => {
  const navigate = useNavigate()
  const location = useLocation()
  
  const setMultipleQueryParams = (updates) => {
    // Only update if we're still on the same page to avoid race conditions
    const currentParams = new URLSearchParams(location.search)
    let hasChanges = false
    
    Object.entries(updates).forEach(([key, value]) => {
      const currentValue = currentParams.get(key)
      const newValue = (value === undefined || value === null || value === '') ? null : String(value)
      
      if (newValue === null && currentValue !== null) {
        currentParams.delete(key)
        hasChanges = true
      } else if (newValue !== null && currentValue !== newValue) {
        currentParams.set(key, newValue)
        hasChanges = true
      }
    })
    
    // Only navigate if there are actual changes and we're on the same page
    if (hasChanges) {
      const newSearch = currentParams.toString()
      navigate({ 
        pathname: location.pathname,
        search: newSearch 
      }, { replace: true })
    }
  }
  
  const getQueryParam = (key, defaultValue = '') => {
    return new URLSearchParams(location.search).get(key) || defaultValue
  }
  
  return { getQueryParam, setMultipleQueryParams }
}

function CompaniesListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { getQueryParam, setMultipleQueryParams } = useQueryParams()
  
  // URL state
  const [page, setPage] = useState(parseInt(getQueryParam('page', '1'), 10))
  const [pageSize, setPageSize] = useState(parseInt(getQueryParam('pageSize', '10'), 10))
  const [status, setStatus] = useState(getQueryParam('status', ''))
  const [searchQuery, setSearchQuery] = useState(getQueryParam('q', ''))
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Clean up when leaving the page
  useEffect(() => {
    return () => {
      // Component unmounting - prevent any pending URL updates
    }
  }, [])

  // Update URL when filters change - only when on companies page
  useEffect(() => {
    if (location.pathname === '/companies') {
      setMultipleQueryParams({
        page: page > 1 ? page : undefined,
        pageSize: pageSize !== 10 ? pageSize : undefined,
        status: status,
        q: debouncedSearch
      })
    }
  }, [page, pageSize, status, debouncedSearch, location.pathname, setMultipleQueryParams])

  // Reset to page 1 when filters change (but don't update URL here to avoid race condition)
  useEffect(() => {
    if (page > 1 && (status !== getQueryParam('status', '') || debouncedSearch !== getQueryParam('q', ''))) {
      setPage(1)
    }
  }, [status, debouncedSearch])

  // Build query params for API
  const buildQueryParams = () => {
    const params = {
      _page: page,
      _limit: pageSize,
      _sort: 'createdAt',
      _order: 'desc'
    }
    
    if (status) {
      params.status = status
    }
    
    if (debouncedSearch) {
      params.name_like = debouncedSearch
    }
    
    return params
  }

  // Fetch companies
  const { 
    data: companiesData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['companies', 'list', { page, pageSize, status, q: debouncedSearch }],
    queryFn: () => getCompanies(buildQueryParams()),
    staleTime: 30_000, // 30 seconds
    keepPreviousData: true,
    retry: 3
  })

  const companies = companiesData?.items || []
  const total = companiesData?.total || 0

  // Status options
  const statusOptions = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ]

  // Page size options
  const pageSizeOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' }
  ]

  // Table columns
  const columns = [
    {
      title: 'Company Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium text-gray-900">{name}</span>
    },
    {
      title: 'Owner',
      dataIndex: 'ownerUserId',
      key: 'ownerUserId',
      render: (ownerId) => <span className="text-gray-600">User #{ownerId}</span>
    },
    {
      title: 'Created Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag status={status}>{status}</Tag>
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/companies/${record.id}`)}
          >
            View
          </Button>
          {record.status === 'pending' && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => {
                const currentPath = location.pathname + location.search
                const backParam = currentPath ? `?back=${encodeURIComponent(currentPath)}` : ''
                navigate(`/companies/${record.id}/review${backParam}`)
              }}
            >
              Review
            </Button>
          )}
        </div>
      )
    }
  ]

  // Pagination info
  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, total)
  const totalPages = Math.ceil(total / pageSize)

  // Handle pagination
  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1)
    }
  }

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1)
    }
  }

  // Handle filter changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleStatusChange = (e) => {
    const newStatus = e.target.value
    setStatus(newStatus)
    setPage(1) // Reset to page 1, URL will be updated by useEffect
  }

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value, 10)
    setPageSize(newPageSize)
    setPage(1) // Reset to first page, URL will be updated by useEffect
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setPage(1) // Reset to page 1, URL will be updated by useEffect
  }

  const handleClearAllFilters = () => {
    setSearchQuery('')
    setStatus('')
    setPage(1)
    setPageSize(10)
    // URL will be updated by useEffect automatically
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <SearchInput
              placeholder="Search companies..."
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
            />
          </div>
          <div>
            <Select
              value={status}
              onChange={handleStatusChange}
              options={statusOptions}
              placeholder="Filter by status"
            />
          </div>
          <div>
            <Select
              value={pageSize.toString()}
              onChange={handlePageSizeChange}
              options={pageSizeOptions}
              placeholder="Page size"
            />
          </div>
        </div>
        
        {/* Clear All Filters Button */}
        {(searchQuery || status || page > 1 || pageSize !== 10) && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllFilters}
            >
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <Skeleton type="table" rows={pageSize} />
        ) : error ? (
          <div className="p-6">
            <EmptyState
              title="Unable to load companies"
              description="There was an error loading the companies. Please try again."
              action={true}
              actionText="Retry"
              onAction={refetch}
              icon={
                <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6m-5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6" />
                </svg>
              }
            />
          </div>
        ) : companies.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No companies found"
              description={
                status || debouncedSearch
                  ? "No companies match your current filters. Try adjusting your search criteria."
                  : "There are no companies registered yet."
              }
              icon={
                <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6m-5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6" />
                </svg>
              }
            />
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={companies}
              rowKey="id"
              pagination={false}
            />
            
            {/* Pagination Footer */}
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startItem} to {endItem} of {total} companies
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handlePrevPage}
                    disabled={page <= 1}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-600">
                    Page {page} of {totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleNextPage}
                    disabled={page >= totalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Debug Info */}
      {error && (
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Development Debug Info</h3>
          <p className="text-yellow-700 text-sm">
            Make sure the mock server is running: <code className="bg-yellow-100 px-1 rounded">npm run mock</code>
          </p>
          <p className="text-yellow-700 text-sm mt-1">Error: {error.message}</p>
        </div>
      )}
    </div>
  )
}

export default CompaniesListPage
