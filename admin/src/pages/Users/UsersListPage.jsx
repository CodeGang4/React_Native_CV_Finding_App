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
  Statistic,
  Row,
  Col
} from 'antd'
import { 
  SearchOutlined, 
  UserOutlined, 
  EyeOutlined,
  MailOutlined
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { getUsers, getUserStats } from '../../services/userService'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Option } = Select

const UsersListPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    role: ''
  })
  
  const navigate = useNavigate()

  // Fetch users data
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => getUsers(filters),
    keepPreviousData: true
  })

  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: getUserStats,
    refetchInterval: 60000
  })

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleRoleFilter = (value) => {
    setFilters(prev => ({ ...prev, role: value, page: 1 }))
  }

  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }))
  }

  const columns = [
    {
      title: 'Avatar',
      dataIndex: 'avatar_url',
      key: 'avatar',
      width: 60,
      render: (avatarUrl, record) => (
        <Avatar 
          src={avatarUrl} 
          icon={<UserOutlined />}
          size="default"
        >
          {record.full_name?.charAt(0)?.toUpperCase()}
        </Avatar>
      )
    },
    {
      title: 'Thông tin',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.username || 'Chưa cập nhật'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            <MailOutlined style={{ marginRight: 4 }} />
            {record.email}
          </div>
        </div>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role) => (
        <Tag color={role === 'employer' ? 'blue' : 'green'}>
          {role === 'employer' ? '👔 Nhà tuyển dụng' : '🎯 Ứng viên'}
        </Tag>
      )
    },

    {
      title: 'Ngày tham gia',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => (
        <Tooltip title={new Date(date).toLocaleString('vi-VN')}>
          {new Date(date).toLocaleDateString('vi-VN')}
        </Tooltip>
      )
    },
    {
      title: 'Hành động',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/users/${record.id}`)}
          />
        </Tooltip>
      )
    }
  ]

  return (
    <div>
      <Title level={2}>Quản Lý Users</Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng Users"
              value={userStats?.total || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Ứng viên"
              value={userStats?.candidates || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Nhà tuyển dụng"
              value={userStats?.employers || 0}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã xác thực"
              value={userStats?.verified || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Tìm theo tên, email..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
          
          <Select
            placeholder="Lọc theo role"
            style={{ width: 200 }}
            allowClear
            onChange={handleRoleFilter}
          >
            <Option value="candidate">🎯 Ứng viên</Option>
            <Option value="employer">👔 Nhà tuyển dụng</Option>
          </Select>
        </Space>
        
        <Table
          columns={columns}
          dataSource={usersData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: usersData?.count || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} users`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange
          }}
          scroll={{ x: 800 }}
        />
      </Card>
    </div>
  )
}

export default UsersListPage