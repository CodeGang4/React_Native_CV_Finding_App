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
  MdPeople, 
  MdWork, 
  MdBusiness,
  MdTrendingUp,
  MdSchedule,
  MdCheckCircle,
  MdWarning,
  MdVisibility
} from 'react-icons/md'
import { useQuery } from '@tanstack/react-query'
import { getDashboardStats, getAnalyticsData } from '../../services/dashboardService'
import { Line, Doughnut, Bar, Radar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
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
  RadialLinearScale,
  Filler,
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
    maintainAspectRatio: false,
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

  // 1. Area Chart - Xu hướng hoạt động
  const chartData = {
    labels: analytics?.jobs?.map(item => item.displayDate) || [],
    datasets: [
      {
        label: 'Jobs mới',
        data: analytics?.jobs?.map(item => item.count) || [],
        borderColor: 'rgb(24, 144, 255)',
        backgroundColor: 'rgba(24, 144, 255, 0.3)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Users mới',
        data: analytics?.users?.map(item => item.count) || [],
        borderColor: 'rgb(82, 196, 26)',
        backgroundColor: 'rgba(82, 196, 26, 0.3)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Ứng tuyển',
        data: analytics?.applications?.map(item => item.count) || [],
        borderColor: 'rgb(250, 173, 20)',
        backgroundColor: 'rgba(250, 173, 20, 0.3)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // 2. Doughnut Chart - Phân bố Users
  const userDoughnutData = {
    labels: ['Nhà tuyển dụng', 'Ứng viên'],
    datasets: [{
      data: [stats?.users?.employers || 0, stats?.users?.candidates || 0],
      backgroundColor: [
        'rgba(114, 46, 209, 0.8)',
        'rgba(24, 144, 255, 0.8)'
      ],
      borderColor: ['#722ed1', '#1890ff'],
      borderWidth: 2,
      hoverOffset: 10
    }]
  }

  const userDoughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Phân bố Users',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = ((context.parsed / total) * 100).toFixed(1)
            return `${context.label}: ${context.parsed} (${percentage}%)`
          }
        }
      }
    },
    cutout: '60%'
  }

  // 3. Radar Chart - Tổng quan hệ thống
  const radarData = {
    labels: ['Users', 'Jobs', 'Applications', 'Companies', 'Hoạt động'],
    datasets: [{
      label: 'Tổng quan hệ thống',
      data: [
        stats?.users?.total || 0,
        stats?.jobs?.total || 0,
        stats?.applications?.total || 0,
        stats?.companies?.total || 0,
        (stats?.users?.newThisMonth || 0) + (stats?.jobs?.total || 0)
      ],
      backgroundColor: 'rgba(24, 144, 255, 0.2)',
      borderColor: 'rgb(24, 144, 255)',
      borderWidth: 2,
      pointBackgroundColor: 'rgb(24, 144, 255)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgb(24, 144, 255)'
    }]
  }

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'Tổng quan Hệ thống',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      }
    },
    scales: {
      r: {
        beginAtZero: true,
        ticks: {
          stepSize: 10
        }
      }
    }
  }

  // 4. Stacked Bar Chart - So sánh trạng thái
  const stackedBarData = {
    labels: ['Jobs', 'Applications', 'Companies'],
    datasets: [
      {
        label: 'Đã duyệt / Đang tuyển',
        data: [
          stats?.jobs?.accepted || 0,
          stats?.applications?.accepted || 0,
          stats?.companies?.accepted || 0
        ],
        backgroundColor: 'rgba(82, 196, 26, 0.8)',
        borderColor: '#52c41a',
        borderWidth: 1
      },
      {
        label: 'Chờ xử lý',
        data: [
          0,
          stats?.applications?.pending || 0,
          stats?.companies?.pending || 0
        ],
        backgroundColor: 'rgba(250, 173, 20, 0.8)',
        borderColor: '#faad14',
        borderWidth: 1
      },
      {
        label: 'Hết hạn / Từ chối',
        data: [
          stats?.jobs?.expired || 0,
          stats?.applications?.rejected || 0,
          stats?.companies?.rejected || 0
        ],
        backgroundColor: 'rgba(255, 77, 79, 0.8)',
        borderColor: '#ff4d4f',
        borderWidth: 1
      }
    ]
  }

  const stackedBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 15,
          font: { size: 12 }
        }
      },
      title: {
        display: true,
        text: 'So sánh Trạng thái',
        font: { size: 16, weight: 'bold' },
        padding: { bottom: 20 }
      }
    },
    scales: {
      x: {
        stacked: true
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          stepSize: 5
        }
      }
    }
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

  // Columns cho bảng Top Jobs theo Views
  const topJobsColumns = [
    {
      title: '#',
      key: 'rank',
      width: 50,
      render: (_, __, index) => (
        <span style={{ 
          fontWeight: 'bold',
          color: index < 3 ? '#faad14' : '#666'
        }}>
          {index + 1}
        </span>
      )
    },
    {
      title: 'Tiêu đề Job',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (title, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{title}</div>
          <div style={{ fontSize: '12px', color: '#999' }}>
            {record.employers?.company_name}
          </div>
        </div>
      )
    },
    {
      title: 'Lượt xem',
      dataIndex: 'views',
      key: 'views',
      width: 100,
      align: 'center',
      render: (views) => (
        <Space>
          <MdVisibility style={{ color: '#1890ff' }} />
          <strong style={{ color: '#1890ff' }}>{views || 0}</strong>
        </Space>
      ),
      sorter: (a, b) => (a.views || 0) - (b.views || 0),
      defaultSortOrder: 'descend'
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      width: 150,
      ellipsis: true
    },
    {
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      width: 150,
      ellipsis: true
    }
  ]

  const applicationColumns = [
    {
      title: 'Ứng viên',
      key: 'candidate',
      render: (_, record) => {
        const candidate = record.candidate
        if (!candidate) return 'N/A'
        return candidate.full_name || candidate.email || 'N/A'
      }
    },
    {
      title: 'Job',
      key: 'job',
      ellipsis: true,
      render: (_, record) => {
        const job = record.job
        return job?.title || 'N/A'
      }
    },
    {
      title: 'Ngày ứng tuyển',
      dataIndex: 'applied_at',
      key: 'applied_at',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'
    }
  ]

  const companyColumns = [
    {
      title: 'Tên công ty',
      dataIndex: 'company_name',
      key: 'name',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          'accepted': { color: 'green', text: 'Đã duyệt' },
          'pending': { color: 'orange', text: 'Chờ duyệt' },
          'rejected': { color: 'red', text: 'Từ chối' }
        }
        const statusInfo = statusMap[status] || { color: 'default', text: status }
        return (
          <Tag color={statusInfo.color}>
            {statusInfo.text}
          </Tag>
        )
      }
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
        Thống Kê Tổng Quan
      </AntTitle>
      
      {/* Main Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Users"
              value={stats?.users?.total || 0}
              prefix={<MdPeople style={{ fontSize: '24px' }} />}
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
              prefix={<MdWork style={{ fontSize: '24px' }} />}
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
              prefix={<MdBusiness style={{ fontSize: '24px' }} />}
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
              prefix={<MdTrendingUp style={{ fontSize: '24px' }} />}
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
                <span><MdBusiness style={{ marginRight: 4 }} /> Nhà tuyển dụng:</span>
                <strong>{stats?.users?.employers || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><MdPeople style={{ marginRight: 4 }} /> Ứng viên:</span>
                <strong>{stats?.users?.candidates || 0}</strong>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="Trạng thái Jobs" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><MdCheckCircle style={{ color: '#52c41a', marginRight: 4 }} /> Đang tuyển:</span>
                <strong>{stats?.jobs?.accepted || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><MdSchedule style={{ color: '#faad14', marginRight: 4 }} /> Hết hạn:</span>
                <strong>{stats?.jobs?.expired || 0}</strong>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={8}>
          <Card title="Ứng tuyển" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><MdSchedule style={{ color: '#faad14', marginRight: 4 }} /> Chờ xử lý:</span>
                <strong>{stats?.applications?.pending || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span><MdCheckCircle style={{ color: '#52c41a', marginRight: 4 }} /> Đã duyệt:</span>
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
            title={
              <Space>
                <MdTrendingUp style={{ fontSize: '20px' }} />
                Biểu đồ hoạt động theo thời gian
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
            {analytics && (
              <div style={{ height: '300px', position: 'relative' }}>
                <Line options={chartOptions} data={chartData} />
              </div>
            )}
          </Card>
        </Col>
      </Row>

      {/* Additional Charts Row - 3 biểu đồ đẹp */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card bodyStyle={{ padding: '20px' }}>
            <div style={{ height: '320px', position: 'relative' }}>
              <Doughnut data={userDoughnutData} options={userDoughnutOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bodyStyle={{ padding: '20px' }}>
            <div style={{ height: '320px', position: 'relative' }}>
              <Radar data={radarData} options={radarOptions} />
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card bodyStyle={{ padding: '20px' }}>
            <div style={{ height: '320px', position: 'relative' }}>
              <Bar data={stackedBarData} options={stackedBarOptions} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Top Jobs by Views Section */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card 
            title={
              <Space>
                <MdVisibility style={{ fontSize: '20px', color: '#1890ff' }} />
                <span>Top 5 Jobs Nổi Bật</span>
              </Space>
            }
            extra={
              <Tag color="blue">
                Tổng: {stats?.recentActivity?.topJobsByViews?.length || 0} jobs
              </Tag>
            }
          >
            <Table
              columns={topJobsColumns}
              dataSource={stats?.recentActivity?.topJobsByViews || []}
              pagination={false}
              rowKey="id"
              size="middle"
              scroll={{ x: 800 }}
              locale={{ emptyText: 'Chưa có dữ liệu' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recent Activity Tables */}
      <Row gutter={[16, 16]}>
        <Col xs={24} xl={8}>
          <Card 
            title={
              <Space>
                <MdWork style={{ fontSize: '18px' }} />
                Jobs mới nhất
              </Space>
            }
            size="small"
            bodyStyle={{ padding: '12px' }}
          >
            <Table
              columns={jobColumns}
              dataSource={stats?.recentActivity?.recentJobs || []}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} xl={8}>
          <Card 
            title={
              <Space>
                <MdTrendingUp style={{ fontSize: '18px' }} />
                Ứng tuyển gần đây
              </Space>
            }
            size="small"
            bodyStyle={{ padding: '12px' }}
          >
            <Table
              columns={applicationColumns}
              dataSource={stats?.recentActivity?.recentApplications || []}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>
        
        <Col xs={24} xl={8}>
          <Card 
            title={
              <Space>
                <MdBusiness style={{ fontSize: '18px' }} />
                Companies mới
                {stats?.companies?.pending > 0 && (
                  <Badge count={stats.companies.pending} />
                )}
              </Space>
            } 
            size="small"
            bodyStyle={{ padding: '12px' }}
          >
            <Table
              columns={companyColumns}
              dataSource={stats?.recentActivity?.recentCompanies || []}
              pagination={false}
              rowKey="id"
              size="small"
              scroll={{ x: 400 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default DashboardPage