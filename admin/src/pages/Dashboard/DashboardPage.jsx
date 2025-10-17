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
  Badge
} from 'antd'
import { 
  UserOutlined, 
  FileTextOutlined, 
  BuildOutlined,
  TrophyOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getAnalyticsData } from '../../services/dashboardService'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const { Title: AntTitle } = Typography
const { Option } = Select

const DashboardPage = () => {
  const [chartPeriod, setChartPeriod] = useState('30d')

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30000 // Refresh mỗi 30 giây
  })

  // Fetch analytics data
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: ['analytics', chartPeriod],
    queryFn: () => getAnalyticsData(chartPeriod),
    refetchInterval: 60000 // Refresh mỗi phút
  })

  if (statsLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Đang tải thống kê...</div>
      </div>
    )
  }

  if (statsError) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={statsError.message}
        type="error"
        showIcon
      />
    )
  }

  // Chart configuration
  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top'
      },
      title: {
        display: true,
        text: `Hoạt động ${chartPeriod === '7d' ? '7 ngày' : chartPeriod === '30d' ? '30 ngày' : '90 ngày'} qua`
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  }

  const chartData = {
    labels: analytics?.jobs?.map(item => item.displayDate) || [],
    datasets: [
      {
        label: 'Jobs mới',
        data: analytics?.jobs?.map(item => item.count) || [],
        borderColor: 'rgb(24, 144, 255)',
        backgroundColor: 'rgba(24, 144, 255, 0.1)',
        tension: 0.1
      },
      {
        label: 'Users mới',
        data: analytics?.users?.map(item => item.count) || [],
        borderColor: 'rgb(82, 196, 26)',
        backgroundColor: 'rgba(82, 196, 26, 0.1)',
        tension: 0.1
      },
      {
        label: 'Ứng tuyển',
        data: analytics?.applications?.map(item => item.count) || [],
        borderColor: 'rgb(250, 173, 20)',
        backgroundColor: 'rgba(250, 173, 20, 0.1)',
        tension: 0.1
      }
    ]
  }

  // Recent activity table columns
  const jobColumns = [
    {
      title: 'Tiêu đề Job',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true
    },
    {
      title: 'Công ty',
      dataIndex: ['employers', 'company_name'],
      key: 'company'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

  const applicationColumns = [
    {
      title: 'Ứng viên',
      dataIndex: ['users', 'full_name'],
      key: 'candidate',
      render: (name, record) => name || record.users?.email
    },
    {
      title: 'Job',
      dataIndex: ['jobs', 'title'],
      key: 'job'
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

  const companyColumns = [
    {
      title: 'Tên công ty',
      dataIndex: 'company_name',
      key: 'name'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'verified',
      key: 'status',
      render: (verified) => (
        <Tag color={verified ? 'green' : 'orange'}>
          {verified ? 'Đã duyệt' : 'Chờ duyệt'}
        </Tag>
      )
    },
    {
      title: 'Ngày đăng ký',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    }
  ]

  return (
    <div>
      <AntTitle level={2}>
        Thống kê tổng quan
      </AntTitle>
      
      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Users"
              value={stats?.users?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              +{stats?.users?.newThisMonth || 0} tháng này
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Jobs"
              value={stats?.jobs?.total || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              {stats?.jobs?.accepted || 0} đang tuyển
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Companies"
              value={stats?.companies?.total || 0}
              prefix={<BuildOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              <Space size={4} split="|">
                <span style={{ color: '#52c41a' }}>{stats?.companies?.accepted || 0} đã duyệt</span>
                <span style={{ color: '#faad14' }}>{stats?.companies?.pending || 0} chờ duyệt</span>
                {(stats?.companies?.rejected || 0) > 0 && (
                  <span style={{ color: '#ff4d4f' }}>{stats?.companies?.rejected || 0} từ chối</span>
                )}
              </Space>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Lượt ứng tuyển"
              value={stats?.applications?.total || 0}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
            <div style={{ marginTop: 8, fontSize: '12px', color: '#666' }}>
              {stats?.applications?.pending || 0} chờ xử lý
            </div>
          </Card>
        </Col>
      </Row>

      {/* Detailed Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card title="Phân loại Users" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>👔 Nhà tuyển dụng:</span>
                <strong>{stats?.users?.employers || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>🎯 Ứng viên:</span>
                <strong>{stats?.users?.candidates || 0}</strong>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="Trạng thái Jobs" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><CheckCircleOutlined style={{ color: '#52c41a' }} /> Đang tuyển:</span>
                <strong>{stats?.jobs?.accepted || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><ClockCircleOutlined style={{ color: '#faad14' }} /> Hết hạn:</span>
                <strong>{stats?.jobs?.expired || 0}</strong>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="Ứng tuyển" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><ClockCircleOutlined style={{ color: '#faad14' }} /> Chờ xử lý:</span>
                <strong>{stats?.applications?.pending || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><CheckCircleOutlined style={{ color: '#52c41a' }} /> Đã duyệt:</span>
                <strong>{stats?.applications?.accepted || 0}</strong>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Analytics Chart */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title="📈 Biểu đồ hoạt động" 
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
            {analytics && (
              <Line options={chartOptions} data={chartData} height={80} />
            )}
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card title="🆕 Jobs mới nhất" size="small">
            <Table
              columns={jobColumns}
              dataSource={stats?.recentActivity?.recentJobs || []}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 300 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card title="📝 Ứng tuyển gần đây" size="small">
            <Table
              columns={applicationColumns}
              dataSource={stats?.recentActivity?.recentApplications || []}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 300 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                🏢 Companies mới
                {stats?.companies?.pending > 0 && (
                  <Badge count={stats.companies.pending} />
                )}
              </Space>
            } 
            size="small"
          >
            <Table
              columns={companyColumns}
              dataSource={stats?.recentActivity?.recentCompanies || []}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 300 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage