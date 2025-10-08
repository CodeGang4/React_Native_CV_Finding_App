import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import Button from '../../components/common/Button'
import Tag from '../../components/common/Tag'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import Table from '../../components/common/Table'
import { getUserById } from '../../services/users'
import { getJobs } from '../../services/jobs'
import dayjs from 'dayjs'

function UserDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Fetch user data
  const { 
    data: user, 
    isLoading: userLoading, 
    error: userError 
  } = useQuery({
    queryKey: ['user', id],
    queryFn: () => getUserById(id),
    enabled: !!id,
    retry: false
  })

  // Fetch jobs if user is employer
  const { 
    data: jobsData, 
    isLoading: jobsLoading 
  } = useQuery({
    queryKey: ['jobs', 'by-owner', id],
    queryFn: () => getJobs({ ownerUserId: id, _limit: 100 }),
    enabled: !!id && user?.role === 'employer',
    staleTime: 30_000
  })

  const userJobs = jobsData?.items || []

  // Loading state
  if (userLoading) {
    return (
      <div className="p-6">
        <Skeleton rows={8} />
      </div>
    )
  }

  // Error or not found state
  if (userError || !user) {
    return (
      <div className="p-6">
        <EmptyState
          title="User not found"
          description="This user doesn't exist or has been deleted."
          action={true}
          actionText="Back to Users"
          onAction={() => navigate('/users')}
        />
      </div>
    )
  }

  // Job columns for employer
  const jobColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title) => <span className="font-medium text-gray-900">{title}</span>
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => <Tag variant="secondary">{type}</Tag>
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag variant={status === 'open' ? 'success' : 'warning'}>
          {status}
        </Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate(`/jobs/${record.id}`)}
        >
          View
        </Button>
      )
    }
  ]

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
            <p className="text-gray-600 mt-1">
              View complete user profile and information
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/users')}
            >
              Back to Users
            </Button>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - User Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-medium text-gray-900 mt-1">{user.name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900 mt-1">{user.email}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <div className="mt-1">
                  <Tag variant={
                    user.role === 'admin' ? 'primary' :
                    user.role === 'employer' ? 'secondary' : 'default'
                  }>
                    {user.role}
                  </Tag>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <div className="mt-1">
                  <Tag variant={user.status === 'active' ? 'success' : 'error'}>
                    {user.status}
                  </Tag>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-500">Registration Date</label>
                <p className="text-gray-900 mt-1">
                  {dayjs(user.createdAt).format('DD/MM/YYYY HH:mm')}
                </p>
              </div>

              {user.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 mt-1">{user.phone}</p>
                </div>
              )}

              {user.location && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900 mt-1">{user.location}</p>
                </div>
              )}
            </div>
          </div>

          {/* Role-specific content */}
          {user.role === 'employer' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Posted Jobs ({userJobs.length})
              </h2>
              
              {jobsLoading ? (
                <Skeleton rows={3} />
              ) : userJobs.length === 0 ? (
                <EmptyState
                  title="No jobs posted"
                  description="This employer hasn't posted any jobs yet."
                />
              ) : (
                <Table
                  data={userJobs}
                  columns={jobColumns}
                />
              )}
            </div>
          )}

          {user.role === 'candidate' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Applications
              </h2>
              <EmptyState
                title="No applications data"
                description="Application history is not available in the current mock data."
              />
            </div>
          )}
        </div>

        {/* Right Column - Stats & Actions */}
        <div className="space-y-6">
          {/* Account Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Account Status
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Status:</span>
                <Tag variant={user.status === 'active' ? 'success' : 'error'}>
                  {user.status}
                </Tag>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Account Type:</span>
                <Tag variant={
                  user.role === 'admin' ? 'primary' :
                  user.role === 'employer' ? 'secondary' : 'default'
                }>
                  {user.role}
                </Tag>
              </div>
              
              {user.status === 'active' && (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-green-800 text-sm">
                    Account is active and in good standing.
                  </p>
                </div>
              )}
              
              {user.status === 'banned' && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-red-800 text-sm">
                    Account has been banned from the platform.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => navigate('/users')}
                className="w-full"
              >
                Back to Users List
              </Button>
              
              {user.role === 'employer' && userJobs.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => navigate('/jobs')}
                  className="w-full"
                >
                  View All Jobs
                </Button>
              )}
            </div>
          </div>

          {/* Statistics (if employer) */}
          {user.role === 'employer' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Statistics
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Jobs:</span>
                  <span className="font-medium">{userJobs.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Jobs:</span>
                  <span className="font-medium">
                    {userJobs.filter(job => job.status === 'open').length}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDetailPage
