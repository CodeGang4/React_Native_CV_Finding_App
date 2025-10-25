import React, { useState } from 'react'
import { 
  Table, 
  Button, 
  Tag, 
  Space, 
  Input, 
  Select, 
  Card, 
  Typography,
  Avatar,
  Tooltip,
  Row,
  Col,
  Statistic,
  Alert
} from 'antd'
import { 
  MdSearch, 
  MdVisibility,
  MdCheckCircle,
  MdSchedule,
  MdWarning,
  MdWork,
  MdAttachMoney
} from 'react-icons/md'
import { useQuery } from '@tanstack/react-query'
import { getJobs, getJobStats } from '../../services/jobService'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/vi'

dayjs.extend(relativeTime)
dayjs.locale('vi')

const { Title } = Typography
const { Option } = Select

const JobsListPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    status: '',
    job_type: ''
  })

  // Fetch jobs data
  const { data: jobsData, isLoading, error: jobsError } = useQuery({
    queryKey: ['jobs', filters],
    queryFn: () => getJobs(filters),
    keepPreviousData: true
  })

  // Fetch job statistics
  const { data: jobStats } = useQuery({
    queryKey: ['job-stats'],
    queryFn: getJobStats,
    refetchInterval: 60000
  })

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleStatusFilter = (value) => {
    setFilters(prev => ({ 
      ...prev, 
      is_expired: value === 'all' ? undefined : value === 'expired' ? true : value === 'active' ? false : undefined,
      page: 1 
    }))
  }

  const handleJobTypeFilter = (value) => {
    setFilters(prev => ({ ...prev, job_type: value, page: 1 }))
  }

  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }))
  }

  const getStatusTag = (isExpired) => {
    if (isExpired) {
      return <Tag color="red" icon={<MdWarning />}>Hết hạn</Tag>
    } else {
      return <Tag color="green" icon={<MdCheckCircle />}>Đang tuyển</Tag>
    }
  }

  const formatSalary = (salary) => {
    if (!salary) return 'Thỏa thuận'
    return salary
  }

  const columns = [
    {
      title: 'Logo',
      dataIndex: ['employers', 'company_logo'],
      key: 'logo',
      width: 60,
      render: (logo, record) => (
        <Avatar 
          src={logo} 
          icon={<MdWork />}
          size="default"
        >
          {record.employers?.company_name?.charAt(0)?.toUpperCase()}
        </Avatar>
      )
    },
    {
      title: 'Thông tin Job',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.title}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
            {record.employers?.company_name}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.location}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.position}
          </div>
        </div>
      )
    },
    {
      title: 'Loại hình',
      dataIndex: 'job_type',
      key: 'job_type',
      width: 120,
      render: (jobType) => {
        const typeMap = {
          'fulltime': { label: 'Full-time', color: 'green' },
          'parttime': { label: 'Part-time', color: 'orange' },
          'internship': { label: 'Internship', color: 'purple' }
        }
        const type = typeMap[jobType] || { label: jobType, color: 'default' }
        return <Tag color={type.color}>{type.label}</Tag>
      }
    },
    {
      title: 'Mức lương',
      key: 'salary',
      width: 150,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MdAttachMoney style={{ marginRight: 4, color: '#faad14' }} />
          <span style={{ fontSize: '12px' }}>
            {formatSalary(record.salary)}
          </span>
        </div>
      )
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusTag(record.is_expired)
    },
    {
      title: 'Ứng tuyển',
      key: 'applications',
      width: 100,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Tag color="purple">
            {record.total_applications || 0} lượt
          </Tag>
          <Tag color="blue">
            {record.unique_candidates || 0} người
          </Tag>
        </div>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString('vi-VN')}>
          {dayjs(date).fromNow()}
        </Tooltip>
      )
    }
  ]

  return (
    <div>
      <Title level={2}>Danh Sách Jobs</Title>
      
      {/* Error Alert */}
      {(jobsError || jobsData?.error) && (
        <Alert
          message="Lỗi tải dữ liệu Jobs"
          description={jobsError?.message || jobsData?.error?.message || 'Không thể tải danh sách jobs'}
          type="error"
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng Jobs"
              value={jobStats?.total || 0}
              prefix={<MdWork style={{ fontSize: '24px' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đang tuyển"
              value={jobStats?.active || 0}
              prefix={<MdCheckCircle style={{ fontSize: '24px' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Hết hạn"
              value={jobStats?.expired || 0}
              prefix={<MdWarning style={{ fontSize: '24px' }} />}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Lượt ứng tuyển"
              value={jobStats?.totalApplications || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Tìm job, công ty..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            enterButton={<MdSearch />}
          />
          
          <Select
            placeholder="Trạng thái"
            style={{ width: 150 }}
            allowClear
            onChange={handleStatusFilter}
          >
            <Option value="active">Đang tuyển</Option>
            <Option value="expired">Hết hạn</Option>
          </Select>
          
          <Select
            placeholder="Loại hình"
            style={{ width: 150 }}
            allowClear
            onChange={handleJobTypeFilter}
          >
            <Option value="fulltime">Full-time</Option>
            <Option value="parttime">Part-time</Option>
            <Option value="internship">Internship</Option>
          </Select>
        </Space>
        
        <Table
          columns={columns}
          dataSource={jobsData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: jobsData?.count || 0,
            showSizeChanger: true,
            showQuickJumper: false,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} jobs`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  )
}

export default JobsListPage