import React, { useState } from 'react'
import { Layout, Menu, Typography, Space } from 'antd'
import { 
  MdDashboard, 
  MdPeople, 
  MdWork, 
  MdBusiness,
  MdAttachMoney,
  MdMenu,
  MdMenuOpen 
} from 'react-icons/md'
import { useNavigate, useLocation } from 'react-router-dom'

const { Header, Sider, Content } = Layout
const { Title } = Typography

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    {
      key: '/dashboard',
      icon: <MdDashboard style={{ fontSize: '18px' }} />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/users',
      icon: <MdPeople style={{ fontSize: '18px' }} />,
      label: 'Quản Lý Users',
      onClick: () => navigate('/users')
    },
    {
      key: '/companies',
      icon: <MdBusiness style={{ fontSize: '18px' }} />,
      label: 'Danh Sách Companies',
      onClick: () => navigate('/companies')
    },
    {
      key: '/jobs',
      icon: <MdWork style={{ fontSize: '18px' }} />,
      label: 'Danh Sách Jobs',
      onClick: () => navigate('/jobs')
    },
    {
      key: '/payments',
      icon: <MdAttachMoney style={{ fontSize: '18px' }} />,
      label: 'Thống Kê Doanh Thu',
      onClick: () => navigate('/payments')
    }
  ]

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed} 
        theme="dark"
        width={250}
        style={{
          position: 'fixed',
          height: '100vh',
          left: 0,
          top: 0,
          zIndex: 100
        }}
      >
        <div style={{ 
          height: 64, 
          padding: '16px', 
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
          borderBottom: '1px solid #333'
        }}>
          <Title level={4} style={{ 
            color: 'white', 
            margin: 0,
            fontSize: collapsed ? '16px' : '18px'
          }}>
            {collapsed ? 'JP' : 'Job Portal Admin'}
          </Title>
        </div>
        
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          style={{ 
            marginTop: 8,
            fontSize: '14px'
          }}
        />
        
        {/* Footer info */}
        <div style={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          right: 16,
          color: '#999',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          {!collapsed && (
            <div>
              <div>Admin Portal v2.0</div>
            </div>
          )}
        </div>
      </Sider>
      
      <Layout style={{ marginLeft: collapsed ? 80 : 250 }}>
        <Header style={{ 
          padding: '0 16px', 
          background: '#fff', 
          display: 'flex', 
          alignItems: 'center',
          borderBottom: '1px solid #f0f0f0',
          boxShadow: '0 1px 4px rgba(0,21,41,.08)'
        }}>
          <div 
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '18px',
              cursor: 'pointer',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              height: '64px',
              transition: 'all 0.2s'
            }}
          >
            {collapsed ? <MdMenuOpen style={{ fontSize: '20px' }} /> : <MdMenu style={{ fontSize: '20px' }} />}
          </div>
          
          <div style={{ flex: 1, textAlign: 'center' }}>
            <Space>
              <span style={{ fontSize: '16px', color: '#666' }}>
                {location.pathname === '/dashboard' && 'Thống kê tổng quan'}
                {location.pathname === '/users' && 'Quản lý người dùng'}
                {location.pathname === '/companies' && 'Duyệt công ty đăng ký'}
                {location.pathname === '/jobs' && 'Danh sách việc làm'}
              </span>
            </Space>
          </div>
          
          <div style={{ color: '#666', fontSize: '14px' }}>
            Welcome Admin!
          </div>
        </Header>
        
        <Content style={{ 
          margin: '24px 16px',
          padding: 0,
          minHeight: 280,
          background: '#f0f2f5'
        }}>
          <div style={{ 
            background: 'white', 
            padding: '24px', 
            borderRadius: '8px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
          }}>
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminLayout