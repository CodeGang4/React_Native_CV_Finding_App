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
    status: '' // pending/accepted/rejected
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
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries(['companies'])
      queryClient.invalidateQueries(['company-stats'])
      
      if (variables.isApproved) {
        message.success('✅ Đã chấp nhận đơn đăng ký công ty!')
      } else {
        message.warning('❌ Đã từ chối đơn đăng ký công ty!')
      }
      
      setReviewModal({ visible: false, company: null, action: null })
      setAdminNote('')
    },
    onError: (error) => {
      message.error(`❌ Lỗi: ${error.message}`)
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
      status: value || '', 
      page: 1 
    }))
  }

  const handlePageChange = (page, pageSize) => {
    setFilters(prev => ({ ...prev, page, limit: pageSize }))
  }

  const getStatusTag = (status) => {
    switch(status) {
      case 'accepted':
        return <Tag color="green" icon={<CheckCircleOutlined />}>Đã duyệt</Tag>
      case 'rejected':
        return <Tag color="red" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>
      case 'pending':
      default:
        return <Tag color="orange" icon={<ClockCircleOutlined />}>Chờ duyệt</Tag>
    }
  }

  const columns = [
    {
      title: <div style={{ whiteSpace: 'nowrap' }}>Logo</div>,
      dataIndex: 'company_logo',
      key: 'company_logo',
      width: 80,
      align: 'center',
      render: (logo, record) => (
        <Avatar 
          src={logo} 
          icon={<BuildOutlined />}
          size="large"
          style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
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
      render: (_, record) => getStatusTag(record.status)
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
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status === 'pending' && (
            <>
              <Tooltip title="Chấp nhận đơn đăng ký">
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  size="small"
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  loading={reviewMutation.isLoading}
                  onClick={() => handleReview(record, 'approve')}
                >
                  Chấp nhận
                </Button>
              </Tooltip>
              
              <Tooltip title="Từ chối đơn đăng ký">
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  size="small"
                  loading={reviewMutation.isLoading}
                  onClick={() => handleReview(record, 'reject')}
                >
                  Từ chối
                </Button>
              </Tooltip>
            </>
          )}
          
          {record.status === 'accepted' && (
            <Tag color="green" icon={<CheckCircleOutlined />}>Đã chấp nhận</Tag>
          )}
          
          {record.status === 'rejected' && (
            <Tag color="red" icon={<CloseCircleOutlined />}>Đã từ chối</Tag>
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
        🏢 Duyệt công ty đăng ký
        {pendingCount > 0 && (
          <Badge count={pendingCount} style={{ marginLeft: 8 }} />
        )}
      </Title>
      
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Tổng công ty"
              value={companyStats?.total || 0}
              prefix={<BuildOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã chấp nhận"
              value={companyStats?.accepted || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Chờ duyệt"
              value={companyStats?.pending || 0}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Đã từ chối"
              value={companyStats?.rejected || 0}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
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
            placeholder="Lọc theo trạng thái"
            style={{ width: 180 }}
            allowClear
            onChange={handleStatusFilter}
            value={filters.status || undefined}
          >
            <Option value="pending">Chờ duyệt</Option>
            <Option value="accepted">Đã chấp nhận</Option>
            <Option value="rejected">Đã từ chối</Option>
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
            {reviewModal.action === 'approve' ? '✅ Chấp nhận công ty' : '❌ Từ chối công ty'}
          </Space>
        }
        open={reviewModal.visible}
        onOk={confirmReview}
        onCancel={() => {
          setReviewModal({ visible: false, company: null, action: null })
          setAdminNote('')
        }}
        confirmLoading={reviewMutation.isLoading}
        okText={reviewModal.action === 'approve' ? 'Chấp nhận' : 'Từ chối'}
        cancelText="Hủy"
        okButtonProps={{
          danger: reviewModal.action === 'reject'
        }}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <strong>🏢 Công ty:</strong> {reviewModal.company?.company_name}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>� Người liên hệ:</strong> {reviewModal.company?.contact_person}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>🌐 Website:</strong> {reviewModal.company?.company_website || 'Chưa cập nhật'}
        </div>
        <div style={{ marginBottom: 16 }}>
          <strong>🏭 Ngành nghề:</strong> {reviewModal.company?.industry || 'Chưa cập nhật'}
        </div>
        
        <div style={{ 
          padding: '12px', 
          backgroundColor: reviewModal.action === 'approve' ? '#f6ffed' : '#fff2f0',
          border: `1px solid ${reviewModal.action === 'approve' ? '#b7eb8f' : '#ffccc7'}`,
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          <strong>
            {reviewModal.action === 'approve' 
              ? '⚠️ Xác nhận chấp nhận đơn đăng ký?' 
              : '⚠️ Xác nhận từ chối đơn đăng ký?'}
          </strong>
          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            {reviewModal.action === 'approve' 
              ? 'Công ty sẽ được phép đăng tin tuyển dụng sau khi chấp nhận.'
              : 'Công ty sẽ không được phép sử dụng hệ thống.'}
          </div>
        </div>
        
        <div style={{ marginBottom: 8 }}>
          <strong>📝 Ghi chú (tùy chọn):</strong>
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