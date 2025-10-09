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
  Modal,
  message,
  Avatar,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic
} from 'antd'
import { 
  SearchOutlined, 
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  BuildOutlined,
  ClockCircleOutlined
} from '@ant-design/icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanies, reviewCompany, getCompanyStats } from '../../services/companyService'
import { useNavigate } from 'react-router-dom'

const { Title } = Typography
const { Option } = Select
const { TextArea } = Input

const CompaniesListPage = () => {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    is_verified: undefined
  })
  
  const [reviewModal, setReviewModal] = useState({
    visible: false,
    company: null,
    action: null
  })
  
  const [adminNote, setAdminNote] = useState('')
  
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Fetch companies data
  const { data: companiesData, isLoading } = useQuery({
    queryKey: ['companies', filters],
    queryFn: () => getCompanies(filters),
    keepPreviousData: true
  })

  // Fetch company statistics
  const { data: companyStats } = useQuery({
    queryKey: ['company-stats'],
    queryFn: getCompanyStats,
    refetchInterval: 60000
  })

  // Review company mutation
  const reviewMutation = useMutation({
    mutationFn: ({ companyId, isApproved, note }) => reviewCompany(companyId, isApproved, note),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      queryClient.invalidateQueries(['company-stats'])
      message.success('Đã xử lý thành công')
      setReviewModal({ visible: false, company: null, action: null })
      setAdminNote('')
    },
    onError: (error) => {
      message.error(`Lỗi: ${error.message}`)
    }
  })

  const handleReview = (company, action) => {
    setReviewModal({
      visible: true,
      company,
      action
    })
  }

  const confirmReview = () => {
    reviewMutation.mutate({
      companyId: reviewModal.company.id,
      isApproved: reviewModal.action === 'approve',
      note: adminNote
    })
  }

  const handleSearch = (value) => {
    setFilters(prev => ({ ...prev, search: value, page: 1 }))
  }

  const handleStatusFilter = (value) => {
    setFilters(prev => ({ 
      ...prev, 
      is_verified: value === 'all' ? undefined : value === 'verified', 
      page: 1 
    }))
  }

  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }))
  }

  const getStatusTag = (isVerified) => {
    if (isVerified === true) {
      return <Tag color="green" icon={<CheckCircleOutlined />}>✅ Đã duyệt</Tag>
    } else {
      return <Tag color="orange" icon={<ClockCircleOutlined />}>⏳ Chờ duyệt</Tag>
    }
  }

  const columns = [
    {
      title: 'Logo',
      dataIndex: 'company_logo',
      key: 'company_logo',
      width: 60,
      render: (logo, record) => (
        <Avatar 
          src={logo} 
          icon={<BuildOutlined />}
          size="default"
        >
          {record.company_name?.charAt(0)?.toUpperCase()}
        </Avatar>
      )
    },
    {
      title: 'Thông tin công ty',
      key: 'info',
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
            {record.company_name}
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: 2 }}>
            � {record.contact_person}
          </div>
          {record.company_website && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              🌐 {record.company_website}
            </div>
          )}
          {record.company_address && (
            <div style={{ fontSize: '12px', color: '#666' }}>
              📍 {record.company_address}
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Ngành nghề',
      dataIndex: 'industry',
      key: 'industry',
      width: 120,
      render: (industry) => (
        <Tag color="blue">{industry || 'Chưa cập nhật'}</Tag>
      )
    },
    {
      title: 'Quy mô',
      dataIndex: 'company_size',
      key: 'company_size',
      width: 100,
      render: (size) => size || 'N/A'
    },
    {
      title: 'Trạng thái',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusTag(record.verified)
    },
    {
      title: 'Người đại diện',
      dataIndex: 'users',
      key: 'representative',
      width: 150,
      render: (users) => users?.[0]?.username || users?.[0]?.email || 'N/A'
    },
    {
      title: 'Ngày đăng ký',
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/companies/${record.id}`)}
            />
          </Tooltip>
          
          {record.verified === false && (
            <>
              <Tooltip title="Duyệt công ty">
                <Button
                  type="text"
                  icon={<CheckCircleOutlined />}
                  style={{ color: '#52c41a' }}
                  loading={reviewMutation.isLoading}
                  onClick={() => handleReview(record, 'approve')}
                />
              </Tooltip>
              
              <Tooltip title="Từ chối">
                <Button
                  type="text"
                  icon={<CloseCircleOutlined />}
                  danger
                  loading={reviewMutation.isLoading}
                  onClick={() => handleReview(record, 'reject')}
                />
              </Tooltip>
            </>
          )}
        </Space>
      )
    }
  ]

  // Count pending companies for badge
  const pendingCount = companyStats?.pending || 0

  return (
    <div>
      <Title level={2}>
        Danh Sách Companies 
        {pendingCount > 0 && (
          <Badge count={pendingCount} style={{ marginLeft: 8 }} />
        )}
      </Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng Companies"
              value={companyStats?.total || 0}
              prefix={<BuildOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Đã duyệt"
              value={companyStats?.verified || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={companyStats?.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card>
        <Space style={{ marginBottom: 16, flexWrap: 'wrap' }}>
          <Input.Search
            placeholder="Tìm công ty, email..."
            allowClear
            style={{ width: 300 }}
            onSearch={handleSearch}
            enterButton={<SearchOutlined />}
          />
          
          <Select
            placeholder="Trạng thái duyệt"
            style={{ width: 150 }}
            allowClear
            onChange={handleStatusFilter}
          >
            <Option value="all">Tất cả</Option>
            <Option value="pending">⏳ Chờ duyệt</Option>
            <Option value="verified">✅ Đã duyệt</Option>
            <Option value="rejected">❌ Từ chối</Option>
          </Select>
        </Space>
        
        <Table
          columns={columns}
          dataSource={companiesData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: filters.page,
            pageSize: filters.limit,
            total: companiesData?.count || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} companies`,
            onChange: handlePageChange,
            onShowSizeChange: handlePageChange
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Review Modal */}
      <Modal
        title={
          <Space>
            <ExclamationCircleOutlined style={{ color: '#faad14' }} />
            {reviewModal.action === 'approve' ? '✅ Duyệt Company' : '❌ Từ chối Company'}
          </Space>
        }
        open={reviewModal.visible}
        onOk={confirmReview}
        onCancel={() => {
          setReviewModal({ visible: false, company: null, action: null })
          setAdminNote('')
        }}
        confirmLoading={reviewMutation.isLoading}
        okText="Xác nhận"
        cancelText="Hủy"
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <strong>🏢 Công ty:</strong> {reviewModal.company?.name}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>📧 Email:</strong> {reviewModal.company?.email}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>🌐 Website:</strong> {reviewModal.company?.website || 'N/A'}
        </div>
        
        <div style={{ marginBottom: 8 }}>
          <strong>📝 Ghi chú admin:</strong>
        </div>
        <TextArea
          rows={4}
          value={adminNote}
          onChange={(e) => setAdminNote(e.target.value)}
          placeholder="Nhập ghi chú cho quyết định này (tùy chọn)..."
        />
      </Modal>
    </div>
  )
}

export default CompaniesListPage