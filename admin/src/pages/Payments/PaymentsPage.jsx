import React, { useState } from 'react'
import { 
  Row, 
  Col, 
  Card, 
  Statistic, 
  Table, 
  Tag, 
  Typography, 
  Spin, 
  Alert,
  Select,
  Space,
  Input
} from 'antd'
import { 
  MdAttachMoney, 
  MdTrendingUp,
  MdPayment,
  MdCheckCircle,
  MdSchedule,
  MdError,
  MdSearch
} from 'react-icons/md'
import { useQuery } from '@tanstack/react-query'
import { 
  getPaymentStats, 
  getPayments, 
  getRevenueAnalytics, 
  getRevenueByProvider 
} from '../../services/paymentService'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
)

const { Title: AntTitle } = Typography
const { Option } = Select

const PaymentsPage = () => {
  const [chartPeriod, setChartPeriod] = useState('30d')
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    status: '',
    provider: '',
    search: ''
  })

  // Fetch payment stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['payment-stats'],
    queryFn: getPaymentStats,
    refetchInterval: 30000
  })

  // Fetch payments list
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payments', filters],
    queryFn: () => getPayments(filters),
    keepPreviousData: true
  })

  // Fetch revenue analytics
  const { data: revenueAnalytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ['revenue-analytics', chartPeriod],
    queryFn: () => getRevenueAnalytics(chartPeriod),
    refetchInterval: 60000
  })

  // Fetch revenue by provider
  const { data: providerData, error: providerError } = useQuery({
    queryKey: ['revenue-by-provider'],
    queryFn: getRevenueByProvider,
    refetchInterval: 60000
  })

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleStatusFilter = (value) => {
    setFilters(prev => ({ ...prev, status: value, page: 1 }))
  }

  const handleProviderFilter = (value) => {
    setFilters(prev => ({ ...prev, provider: value, page: 1 }))
  }

  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }))
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Chart configurations
  const revenueChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: `Doanh thu ${chartPeriod === '7d' ? '7 ngày' : chartPeriod === '30d' ? '30 ngày' : '90 ngày'} qua`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return formatCurrency(value)
          }
        }
      }
    }
  }

  const revenueChartData = {
    labels: revenueAnalytics?.labels || [],
    datasets: [
      {
        label: 'Doanh thu',
        data: revenueAnalytics?.revenue || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }



  // Provider doughnut chart
  const providerChartData = {
    labels: providerData?.providers || [],
    datasets: [{
      data: providerData?.amounts || [],
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)'
      ],
      borderColor: [
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#ef4444',
        '#8b5cf6'
      ],
      borderWidth: 2
    }]
  }

  const providerChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom'
      },
      title: {
        display: true,
        text: 'Doanh thu theo nhà cung cấp'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: ${formatCurrency(context.parsed)}`
          }
        }
      }
    }
  }

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      ellipsis: true,
      render: (id) => (
        <span style={{ fontSize: '12px', color: '#666' }}>
          {id?.substring(0, 8)}...
        </span>
      )
    },
    {
      title: 'Người dùng',
      key: 'user',
      render: (_, record) => {
        const user = record.users
        if (!user) return <span style={{ color: '#999' }}>Không có thông tin</span>
        
        return (
          <div>
            <div style={{ fontWeight: 'bold' }}>
              {user.username || user.email?.split('@')[0] || 'N/A'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              {user.email}
            </div>
            {user.role && (
              <Tag size="small" color={user.role === 'employer' ? 'blue' : 'green'}>
                {user.role === 'employer' ? 'Nhà tuyển dụng' : 'Ứng viên'}
              </Tag>
            )}
          </div>
        )
      }
    },
    {
      title: 'Số tiền',
      key: 'amount',
      render: (_, record) => (
        <div style={{ fontWeight: 'bold', color: '#22c55e' }}>
          {formatCurrency((record.amount_cents || 0) / 100)}
        </div>
      ),
      sorter: (a, b) => (a.amount_cents || 0) - (b.amount_cents || 0)
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'provider',
      key: 'provider',
      render: (provider) => {
        const colors = {
          stripe: 'purple',
          paypal: 'blue', 
          vnpay: 'red',
          momo: 'magenta'
        }
        return (
          <Tag color={colors[provider] || 'default'}>
            {provider || 'Unknown'}
          </Tag>
        )
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          succeeded: { color: 'green', icon: <MdCheckCircle />, text: 'Thành công' },
          pending: { color: 'orange', icon: <MdSchedule />, text: 'Đang xử lý' },
          failed: { color: 'red', icon: <MdError />, text: 'Thất bại' }
        }
        const config = statusConfig[status] || { color: 'default', text: status }
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        )
      }
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at)
    }
  ]

  if (statsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thống kê...</div>
      </div>
    )
  }

  return (
    <div>
      <AntTitle level={2} style={{ marginBottom: 24 }}>
        Thống kê Doanh thu & Payments
      </AntTitle>
      
      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng doanh thu"
              value={stats?.totalRevenueVND || 0}
              // prefix={<MdAttachMoney style={{ fontSize: '24px' }} />}
              valueStyle={{ color: '#22c55e' }}
              formatter={(value) => formatCurrency(value)}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng giao dịch"
              value={stats?.totalPayments || 0}
              prefix={<MdPayment style={{ fontSize: '24px' }} />}
              valueStyle={{ color: '#3b82f6' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thành công"
              value={stats?.successfulPayments || 0}
              prefix={<MdCheckCircle style={{ fontSize: '24px' }} />}
              valueStyle={{ color: '#10b981' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Thất bại"
              value={stats?.failedPayments || 0}
              prefix={<MdError style={{ fontSize: '24px' }} />}
              valueStyle={{ color: '#ef4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <MdTrendingUp style={{ fontSize: '20px' }} />
                Biểu đồ doanh thu
              </Space>
            }
            loading={analyticsLoading}
            extra={
              <Select
                value={chartPeriod}
                onChange={setChartPeriod}
                style={{ width: 120 }}
              >
                <Option value="7d">7 ngày</Option>
                <Option value="30d">30 ngày</Option>
                <Option value="90d">90 ngày</Option>
              </Select>
            }
          >
            {analyticsError ? (
              <Alert
                message="Lỗi tải biểu đồ"
                description={analyticsError.message}
                type="error"
                showIcon
              />
            ) : (
              <div style={{ height: '300px', position: 'relative' }}>
                {revenueAnalytics?.labels?.length > 0 ? (
                  <Line options={revenueChartOptions} data={revenueChartData} />
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999' 
                  }}>
                    Không có dữ liệu doanh thu
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="Doanh thu theo nhà cung cấp">
            {providerError ? (
              <Alert
                message="Lỗi tải dữ liệu"
                description={providerError.message}
                type="error"
                showIcon
              />
            ) : (
              <div style={{ height: '300px', position: 'relative' }}>
                {providerData?.providers?.length > 0 ? (
                  <Doughnut data={providerChartData} options={providerChartOptions} />
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: '#999' 
                  }}>
                    Không có dữ liệu nhà cung cấp
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Payments Table */}
      <Card title="Chi tiết giao dịch">
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={12} md={8}>
            <Input.Search
              placeholder="Tìm theo email hoặc username..."
              allowClear
              onSearch={handleSearch}
              enterButton={<MdSearch />}
            />
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              allowClear
              onChange={handleStatusFilter}
            >
              <Option value="succeeded">Thành công</Option>
              <Option value="pending">Đang xử lý</Option>
              <Option value="failed">Thất bại</Option>
            </Select>
          </Col>
          
          <Col xs={12} sm={6} md={4}>
            <Select
              placeholder="Nhà cung cấp"
              style={{ width: '100%' }}
              allowClear
              onChange={handleProviderFilter}
            >
              <Option value="stripe">Stripe</Option>
              <Option value="paypal">PayPal</Option>
              <Option value="vnpay">VNPay</Option>
              <Option value="momo">Momo</Option>
            </Select>
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={paymentsData?.data || []}
          rowKey="id"
          loading={paymentsLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: paymentsData?.count || 0,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} giao dịch`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  )
}

export default PaymentsPage