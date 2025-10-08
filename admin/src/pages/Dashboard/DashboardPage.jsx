import React from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/common/Button'
import Table from '../../components/common/Table'
import Tag from '../../components/common/Tag'
import Chart from '../../components/common/Chart'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'
import Breadcrumbs from '../../components/layout/Breadcrumbs'
import { getStats } from '../../services/stats'
import { getPendingCompanies } from '../../services/companies'
import dayjs from 'dayjs'

function DashboardPage() {
  const navigate = useNavigate()

  // Fetch stats with optimized settings
  const { 
    data: stats, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    staleTime: 60_000, // 1 minute
    refetchOnWindowFocus: false,
    retry: 3
  })

  // Fetch pending companies with optimized settings
  const { 
    data: pendingCompanies, 
    isLoading: companiesLoading, 
    error: companiesError,
    refetch: refetchCompanies 
  } = useQuery({
    queryKey: ['companies', 'pending'],
    queryFn: () => getPendingCompanies(5),
    staleTime: 30_000, // 30 seconds
    refetchOnWindowFocus: false,
    retry: 3
  })

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Home', to: '/' },
    { label: 'Dashboard' }
  ]

  // Table columns for pending companies
  const pendingCompaniesColumns = [
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
      render: (ownerId) => `User #${ownerId}`
    },
    { 
      title: 'Created Date', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => dayjs(date).format('MMM DD, YYYY')
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
          <Button 
            size="sm" 
            variant="primary"
            onClick={() => navigate(`/companies/${record.id}/review`)}
          >
            Review
          </Button>
        </div>
      )
    }
  ]

  // Handle retry for both queries
  const handleRetry = () => {
    refetchStats()
    refetchCompanies()
  }

  // KPI Card Component
  const KPICard = ({ title, value, variant = 'primary', loading, error }) => {
    if (loading) {
      return (
        <div className="kpi-card">
          <Skeleton rows={2} />
        </div>
      )
    }

    if (error) {
      return (
        <div className="kpi-card">
          <div className="kpi-label">{title}</div>
          <div className="text-2xl font-bold text-red-500">Error</div>
        </div>
      )
    }

    return (
      <div className={`kpi-card kpi-${variant}`}>
        <div className="kpi-label">{title}</div>
        <div className="kpi-value">{value?.toLocaleString() || 0}</div>
      </div>
    )
  }

  // Error state for entire dashboard
  if (statsError && companiesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Breadcrumbs items={breadcrumbItems} />
            <h1 className="text-3xl font-bold text-gray-900 mt-2">Dashboard</h1>
          </div>
        </div>

        <EmptyState
          title="Unable to load dashboard"
          description="There was an error loading the dashboard data. Please check your connection and try again."
          action={true}
          actionText="Retry"
          onAction={handleRetry}
          icon={
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <Breadcrumbs items={breadcrumbItems} />
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Dashboard</h1>
        </div>
      </div>

      {/* KPI Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <KPICard
          title="Total Users"
          value={stats?.totalUsers}
          variant="primary"
          loading={statsLoading}
          error={statsError}
        />
        <KPICard
          title="Total Jobs"
          value={stats?.totalJobs}
          variant="success"
          loading={statsLoading}
          error={statsError}
        />
        <KPICard
          title="Total Applications"
          value={stats?.totalApplications}
          variant="purple"
          loading={statsLoading}
          error={statsError}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Applicants Bar Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Applicants</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Skeleton rows={8} />
            </div>
          ) : statsError ? (
            <div className="flex items-center justify-center h-64">
              <EmptyState
                title="Chart Error"
                description="Unable to load chart data"
                action={true}
                actionText="Retry"
                onAction={refetchStats}
                icon={
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                }
              />
            </div>
          ) : (
            <Chart 
              type="bar" 
              data={stats?.monthlyApplicants || []} 
              height={300}
              colors={['#3B82F6', '#10B981', '#F59E0B']}
            />
          )}
        </div>

        {/* Application Status Pie Chart */}
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
          {statsLoading ? (
            <div className="flex items-center justify-center h-64">
              <Skeleton rows={8} />
            </div>
          ) : statsError ? (
            <div className="flex items-center justify-center h-64">
              <EmptyState
                title="Chart Error"
                description="Unable to load chart data"
                action={true}
                actionText="Retry"
                onAction={refetchStats}
                icon={
                  <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                  </svg>
                }
              />
            </div>
          ) : (
            <Chart 
              type="pie" 
              data={stats?.applicantsStatus || []} 
              height={300}
              colors={['#F59E0B', '#10B981', '#EF4444']}
            />
          )}
        </div>
      </div>

      {/* Recent Reviews Section */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Reviews</h2>
          <span className="text-sm text-gray-500">Pending Companies</span>
        </div>

        {companiesLoading ? (
          <Skeleton type="table" rows={5} />
        ) : companiesError ? (
          <EmptyState
            title="Unable to load pending companies"
            description="There was an error loading the pending companies. Please try again."
            action={true}
            actionText="Retry"
            onAction={refetchCompanies}
            icon={
              <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6m-5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6" />
              </svg>
            }
          />
        ) : !pendingCompanies || pendingCompanies.length === 0 ? (
          <EmptyState
            title="Không có công ty pending"
            description="There are currently no companies waiting for review."
            icon={
              <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
          />
        ) : (
          <Table
            columns={pendingCompaniesColumns}
            data={pendingCompanies}
            rowKey="id"
            pagination={false}
          />
        )}
      </div>

      {/* Debug Info for Development */}
      {(statsError || companiesError) && (
        <div className="card p-4 bg-yellow-50 border-yellow-200">
          <h3 className="text-sm font-semibold text-yellow-800 mb-2">Development Debug Info</h3>
          <p className="text-yellow-700 text-sm">
            Make sure the mock server is running: <code className="bg-yellow-100 px-1 rounded">npm run mock</code>
          </p>
          {statsError && (
            <p className="text-yellow-700 text-sm mt-1">Stats Error: {statsError.message}</p>
          )}
          {companiesError && (
            <p className="text-yellow-700 text-sm mt-1">Companies Error: {companiesError.message}</p>
          )}
        </div>
      )}
    </div>
  )
}

export default DashboardPage
