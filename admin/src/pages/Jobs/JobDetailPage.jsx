import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '../../components/common/Button'
import Tag from '../../components/common/Tag'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import Table from '../../components/common/Table'
import JobErrorBoundary from '../../components/common/JobErrorBoundary'
import { getJobById, patchJob } from '../../services/jobs'
import dayjs from 'dayjs'

function JobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch job data
  const { 
    data: job, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
    retry: false
  })

  // Job status toggle mutation with optimistic updates
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => patchJob(id, { status: newStatus }),
    onMutate: async ({ id, newStatus }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(['job', id])
      
      // Snapshot the previous value
      const previousJob = queryClient.getQueryData(['job', id])
      
      // Optimistically update to the new value
      queryClient.setQueryData(['job', id], old => {
        if (!old) return old
        return { ...old, status: newStatus }
      })
      
      return { previousJob }
    },
    onError: (err, { id }, context) => {
      // If the mutation fails, use the context to roll back
      if (context?.previousJob) {
        queryClient.setQueryData(['job', id], context.previousJob)
      }
      console.error('Error updating job status:', err)
      alert('Failed to update job status. Please try again.')
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(['job', id])
      queryClient.invalidateQueries(['jobs'])
    }
  })

  // Handle job status toggle with debouncing
  const handleToggleStatus = React.useCallback(() => {
    if (toggleStatusMutation.isLoading || !job) return
    
    const newStatus = job.status === 'open' ? 'closed' : 'open'
    toggleStatusMutation.mutate({ id, newStatus })
  }, [toggleStatusMutation, job, id])

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton rows={8} />
      </div>
    )
  }

  // Error or not found state
  if (error || !job) {
    return (
      <div className="p-6">
        <EmptyState
          title="Job not found"
          description="This job doesn't exist or has been deleted."
          action={true}
          actionText="Back to Jobs"
          onAction={() => navigate('/jobs')}
        />
      </div>
    )
  }

  // Mock applicants data
  const mockApplicants = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      appliedAt: '2025-09-15T10:30:00Z',
      status: 'pending'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@email.com',
      appliedAt: '2025-09-14T14:20:00Z',
      status: 'reviewed'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      appliedAt: '2025-09-13T09:15:00Z',
      status: 'rejected'
    }
  ]

  // Applicant columns
  const applicantColumns = [
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
      title: 'Applied Date',
      dataIndex: 'appliedAt',
      key: 'appliedAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag variant={
          status === 'pending' ? 'warning' :
          status === 'reviewed' ? 'primary' :
          status === 'accepted' ? 'success' : 'error'
        }>
          {status}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="ghost">
            View CV
          </Button>
          <Button size="sm" variant="primary">
            Review
          </Button>
        </div>
      )
    }
  ]

  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Negotiable'
    if (typeof salary === 'string') return salary
    return `$${salary.toLocaleString()}`
  }

  return (
    <JobErrorBoundary>
      <div className="p-6">
        {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
            <p className="text-gray-600 mt-1">
              {job.company} • {job.location}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/jobs')}
            >
              Back to Jobs
            </Button>
            <Button
              variant="primary"
              onClick={() => alert('Job editing functionality is coming soon!')}
            >
              Edit Job
            </Button>
          </div>
        </div>
      </div>

      {/* Job Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Job Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Job Title</label>
                  <p className="text-lg font-medium text-gray-900 mt-1">{job.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="text-gray-900 mt-1">{job.company}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900 mt-1">{job.location}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Employment Type</label>
                  <div className="mt-1">
                    <Tag variant="secondary">{job.type}</Tag>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Salary</label>
                  <p className="text-gray-900 mt-1">{formatSalary(job.salary)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <Tag variant={
                      job.status === 'open' ? 'success' :
                      job.status === 'closed' ? 'error' : 'warning'
                    }>
                      {job.status}
                    </Tag>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Posted Date</label>
                  <p className="text-gray-900 mt-1">
                    {dayjs(job.createdAt).format('DD/MM/YYYY')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Application Deadline</label>
                  <p className="text-gray-900 mt-1">
                    {job.deadline ? dayjs(job.deadline).format('DD/MM/YYYY') : 'Not specified'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Description
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.description || 'No job description provided.'}
              </p>
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Requirements
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {job.requirements || 'No specific requirements listed.'}
              </p>
            </div>
          </div>

          {/* Applicants */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Applicants ({mockApplicants.length})
            </h2>
            
            {mockApplicants.length === 0 ? (
              <EmptyState
                title="No applicants yet"
                description="This job hasn't received any applications."
              />
            ) : (
              <Table
                data={mockApplicants}
                columns={applicantColumns}
              />
            )}
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Job Statistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Statistics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Views:</span>
                <span className="font-medium">245</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Applications:</span>
                <span className="font-medium">{mockApplicants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Review:</span>
                <span className="font-medium">
                  {mockApplicants.filter(app => app.status === 'pending').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Days Active:</span>
                <span className="font-medium">
                  {dayjs().diff(dayjs(job.createdAt), 'day')}
                </span>
              </div>
            </div>
          </div>

          {/* Job Status */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Job Status
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Current Status:</span>
                <Tag variant={
                  job.status === 'open' ? 'success' :
                  job.status === 'closed' ? 'error' : 'warning'
                }>
                  {job.status}
                </Tag>
              </div>
              
              {job.status === 'open' && (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-green-800 text-sm">
                    Job is active and accepting applications.
                  </p>
                </div>
              )}
              
              {job.status === 'closed' && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-red-800 text-sm">
                    Job is closed and no longer accepting applications.
                  </p>
                </div>
              )}
              
              {job.status === 'hidden' && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    Job is hidden from public view.
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
                onClick={() => navigate('/jobs')}
                className="w-full"
              >
                Back to Jobs List
              </Button>
              
              <Button
                variant="primary"
                className="w-full"
                onClick={() => alert('Job editing functionality is coming soon!')}
              >
                Edit Job Details
              </Button>

              {job.status === 'open' && (
                <Button
                  variant="warning"
                  className="w-full"
                  onClick={handleToggleStatus}
                  loading={toggleStatusMutation.isLoading}
                >
                  Close Job
                </Button>
              )}

              {job.status !== 'open' && (
                <Button
                  variant="success"
                  className="w-full"
                  onClick={handleToggleStatus}
                  loading={toggleStatusMutation.isLoading}
                >
                  Reopen Job
                </Button>
              )}
            </div>
          </div>

          {/* Company Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Company
            </h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Company Name</label>
                <p className="text-gray-900 mt-1">{job.company}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Job Owner ID</label>
                <p className="text-gray-900 mt-1">#{job.ownerUserId}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/companies/${job.companyId}`)}
                className="w-full"
              >
                View Company Profile
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </JobErrorBoundary>
  )
}

export default JobDetailPage
