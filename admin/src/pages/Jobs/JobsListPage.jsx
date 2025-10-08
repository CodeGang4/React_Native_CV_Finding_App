import React, { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Tag from '../../components/common/Tag'
import SearchInput from '../../components/common/SearchInput'
import Select from '../../components/common/Select'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import JobErrorBoundary from '../../components/common/JobErrorBoundary'
import { getJobs, patchJob } from '../../services/jobs'
import dayjs from 'dayjs'

function JobsListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  
  // URL state
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '10', 10))
  const [type, setType] = useState(searchParams.get('type') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Update URL when filters change - only when on jobs page
  useEffect(() => {
    if (location.pathname === '/jobs') {
      const params = new URLSearchParams()
      
      if (page > 1) params.set('page', page.toString())
      if (pageSize !== 10) params.set('pageSize', pageSize.toString())
      if (type) params.set('type', type)
      if (status) params.set('status', status)
      if (debouncedSearch) params.set('q', debouncedSearch)
      
      setSearchParams(params, { replace: true })
    }
  }, [page, pageSize, type, status, debouncedSearch, location.pathname, setSearchParams])

  // Reset to page 1 when filters change
  useEffect(() => {
    const currentType = searchParams.get('type') || ''
    const currentStatus = searchParams.get('status') || ''
    const currentQ = searchParams.get('q') || ''
    
    if (page > 1 && (type !== currentType || status !== currentStatus || debouncedSearch !== currentQ)) {
      setPage(1)
    }
  }, [type, status, debouncedSearch])

  // Build query params for API
  const buildQueryParams = () => {
    const params = {
      _page: page,
      _limit: pageSize,
      _sort: 'createdAt',
      _order: 'desc'
    }
    
    if (type) {
      params.type = type
    }
    
    if (status) {
      params.status = status
    }
    
    if (debouncedSearch) {
      params.title_like = debouncedSearch
    }
    
    return params
  }

  // Fetch jobs
  const { 
    data: jobsData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['jobs', 'list', { page, pageSize, type, status, q: debouncedSearch }],
    queryFn: () => getJobs(buildQueryParams()),
    staleTime: 30_000, // 30 seconds
    keepPreviousData: true,
    retry: 3
  })

  const jobs = jobsData?.items || []
  const total = jobsData?.total || 0

  // Toggle status mutation with optimistic updates
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => patchJob(id, { status: newStatus }),
    onMutate: async ({ id, newStatus }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries(['jobs'])
      
      // Snapshot the previous value
      const previousJobs = queryClient.getQueryData(['jobs', 'list', { page, pageSize, type, status, q: debouncedSearch }])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['jobs', 'list', { page, pageSize, type, status, q: debouncedSearch }], old => {
        if (!old || !old.items) return old
        
        return {
          ...old,
          items: old.items.map(job => 
            job.id === id ? { ...job, status: newStatus } : job
          )
        }
      })
      
      // Return a context object with the snapshotted value
      return { previousJobs }
    },
    onError: (err, { id, newStatus }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs', 'list', { page, pageSize, type, status, q: debouncedSearch }], context.previousJobs)
      }
      console.error('Error updating job status:', err)
      alert('Failed to update job status. Please try again.')
    },
    onSettled: () => {
      // Always refetch after error or success to ensure we're in sync with the server
      queryClient.invalidateQueries(['jobs'])
    }
  })

  // Type options
  const typeOptions = [
    { value: '', label: 'All Types' },
    { value: 'fulltime', label: 'Full-time' },
    { value: 'parttime', label: 'Part-time' },
    { value: 'remote', label: 'Remote' },
    { value: 'contract', label: 'Contract' }
  ]

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'hidden', label: 'Hidden' }
  ]

  // Page size options
  const pageSizeOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' }
  ]

  // Handle toggle status with debouncing
  const handleToggleStatus = React.useCallback((job) => {
    // Prevent multiple rapid clicks on the same job
    if (toggleStatusMutation.isLoading) return
    
    const newStatus = job.status === 'open' ? 'hidden' : 'open'
    toggleStatusMutation.mutate({ id: job.id, newStatus })
  }, [toggleStatusMutation])

  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Not specified'
    if (typeof salary === 'string') return salary
    return `$${salary.toLocaleString()}`
  }

  // Table columns
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="font-medium text-gray-900">{title}</span>
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      render: (company) => <span className="text-gray-600">{company}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag variant="secondary">
          {type}
        </Tag>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location) => <span className="text-gray-600">{location}</span>
    },
    {
      title: 'Salary',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => <span className="text-gray-600">{formatSalary(salary)}</span>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag variant={
          status === 'open' ? 'success' :
          status === 'closed' ? 'error' : 'warning'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2" key={`actions-${record.id}`}>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/jobs/${record.id}`)}
          >
            View
          </Button>
          {record.status !== 'closed' && (
            <Button
              size="sm"
              variant={record.status === 'open' ? 'warning' : 'success'}
              onClick={() => handleToggleStatus(record)}
              loading={toggleStatusMutation.isLoading && toggleStatusMutation.variables?.id === record.id}
              disabled={toggleStatusMutation.isLoading}
            >
              {record.status === 'open' ? 'Hide' : 'Show'}
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

  // Handle filter changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
  }

  const handleTypeChange = (e) => {
    setType(e.target.value)
    setPage(1)
  }

  const handleStatusChange = (e) => {
    setStatus(e.target.value)
    setPage(1)
  }

  const handlePageSizeChange = (e) => {
    const newPageSize = parseInt(e.target.value, 10)
    setPageSize(newPageSize)
    setPage(1)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setPage(1)
  }

  const handleClearAllFilters = () => {
    setSearchQuery('')
    setType('')
    setStatus('')
    setPage(1)
    setPageSize(10)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <SearchInput
              placeholder="Search jobs by title..."
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
            />
          </div>
          <div>
            <Select
              value={type}
              onChange={handleTypeChange}
              options={typeOptions}
              placeholder="Filter by type"
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
        {(searchQuery || type || status || page > 1 || pageSize !== 10) && (
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

      {/* Results Info */}
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>
          Showing {startItem}–{endItem} of {total} jobs
        </span>
        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      {/* Table */}
      <div className="card">
        {isLoading ? (
          <Skeleton type="table" rows={pageSize} />
        ) : error ? (
          <div className="p-6">
            <EmptyState
              title="Unable to load jobs"
              description="There was an error loading the jobs. Please try again."
              action={true}
              actionText="Retry"
              onAction={refetch}
            />
          </div>
        ) : jobs.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No jobs found"
              description="No jobs match your current filters."
            />
          </div>
        ) : (
          <>
            <JobErrorBoundary>
              <Table
                data={jobs}
                columns={columns}
                rowKey="id"
                key={`jobs-table-${page}-${jobs.length}`}
              />
            </JobErrorBoundary>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                
                <div className="flex space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = i + 1
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setPage(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default JobsListPage
