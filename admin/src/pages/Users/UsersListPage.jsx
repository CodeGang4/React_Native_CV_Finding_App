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
import { getUsers, patchUser } from '../../services/users'
import dayjs from 'dayjs'

function UsersListPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const queryClient = useQueryClient()
  
  // URL state
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1', 10))
  const [pageSize, setPageSize] = useState(parseInt(searchParams.get('pageSize') || '10', 10))
  const [role, setRole] = useState(searchParams.get('role') || '')
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

  // Update URL when filters change - only when on users page
  useEffect(() => {
    if (location.pathname === '/users') {
      const params = new URLSearchParams()
      
      if (page > 1) params.set('page', page.toString())
      if (pageSize !== 10) params.set('pageSize', pageSize.toString())
      if (role) params.set('role', role)
      if (status) params.set('status', status)
      if (debouncedSearch) params.set('q', debouncedSearch)
      
      setSearchParams(params, { replace: true })
    }
  }, [page, pageSize, role, status, debouncedSearch, location.pathname, setSearchParams])

  // Reset to page 1 when filters change
  useEffect(() => {
    const currentRole = searchParams.get('role') || ''
    const currentStatus = searchParams.get('status') || ''
    const currentQ = searchParams.get('q') || ''
    
    if (page > 1 && (role !== currentRole || status !== currentStatus || debouncedSearch !== currentQ)) {
      setPage(1)
    }
  }, [role, status, debouncedSearch])

  // Build query params for API
  const buildQueryParams = () => {
    const params = {
      _page: page,
      _limit: pageSize,
      _sort: 'createdAt',
      _order: 'desc'
    }
    
    if (role) {
      params.role = role
    }
    
    if (status) {
      params.status = status
    }
    
    if (debouncedSearch) {
      params.name_like = debouncedSearch
    }
    
    return params
  }

  // Fetch users
  const { 
    data: usersData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['users', 'list', { page, pageSize, role, status, q: debouncedSearch }],
    queryFn: () => getUsers(buildQueryParams()),
    staleTime: 30_000, // 30 seconds
    keepPreviousData: true,
    retry: 3
  })

  const users = usersData?.items || []
  const total = usersData?.total || 0

  // Ban/Unban mutation
  const banMutation = useMutation({
    mutationFn: ({ id, newStatus }) => patchUser(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries(['users'])
    }
  })

  // Role options
  const roleOptions = [
    { value: '', label: 'All Roles' },
    { value: 'candidate', label: 'Candidate' },
    { value: 'employer', label: 'Employer' },
    { value: 'admin', label: 'Admin' }
  ]

  // Status options
  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'banned', label: 'Banned' }
  ]

  // Page size options
  const pageSizeOptions = [
    { value: '10', label: '10' },
    { value: '20', label: '20' },
    { value: '50', label: '50' }
  ]

  // Handle ban/unban
  const handleToggleBan = (user) => {
    const newStatus = user.status === 'banned' ? 'active' : 'banned'
    banMutation.mutate({ id: user.id, newStatus })
  }

  // Table columns
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name) => <span className="font-medium text-gray-900">{name}</span>
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <span className="text-gray-600">{email}</span>
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag variant={
          role === 'admin' ? 'primary' :
          role === 'employer' ? 'secondary' : 'default'
        }>
          {role}
        </Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag variant={status === 'active' ? 'success' : 'error'}>
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
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate(`/users/${record.id}`)}
          >
            View
          </Button>
          <Button
            size="sm"
            variant={record.status === 'banned' ? 'success' : 'error'}
            onClick={() => handleToggleBan(record)}
            loading={banMutation.isLoading}
          >
            {record.status === 'banned' ? 'Unban' : 'Ban'}
          </Button>
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

  const handleRoleChange = (e) => {
    setRole(e.target.value)
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
    setRole('')
    setStatus('')
    setPage(1)
    setPageSize(10)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Users</h1>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="md:col-span-2">
            <SearchInput
              placeholder="Search users by name..."
              value={searchQuery}
              onChange={handleSearchChange}
              onClear={handleClearSearch}
            />
          </div>
          <div>
            <Select
              value={role}
              onChange={handleRoleChange}
              options={roleOptions}
              placeholder="Filter by role"
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
        {(searchQuery || role || status || page > 1 || pageSize !== 10) && (
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
          Showing {startItem}–{endItem} of {total} users
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
              title="Unable to load users"
              description="There was an error loading the users. Please try again."
              action={true}
              actionText="Retry"
              onAction={refetch}
            />
          </div>
        ) : users.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No users found"
              description="No users match your current filters."
            />
          </div>
        ) : (
          <>
            <Table
              data={users}
              columns={columns}
            />
            
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

export default UsersListPage
