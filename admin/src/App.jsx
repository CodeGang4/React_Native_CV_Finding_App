import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ConfigProvider } from 'antd'
import viVN from 'antd/locale/vi_VN'
import 'dayjs/locale/vi'

// Layout
import AdminLayout from './components/layout/AdminLayout'

// Pages
import DashboardPage from './pages/Dashboard/DashboardPage'
import UsersListPage from './pages/Users/UsersListPage'
import CompaniesListPage from './pages/Companies/CompaniesListPage'
import JobsListPage from './pages/Jobs/JobsListPage'
import PaymentsPage from './pages/Payments/PaymentsPage'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false
    }
  }
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={viVN}>
        <Router>
          <AdminLayout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersListPage />} />
              <Route path="/companies" element={<CompaniesListPage />} />
              <Route path="/jobs" element={<JobsListPage />} />
              <Route path="/payments" element={<PaymentsPage />} />
              
              {/* Catch all route */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AdminLayout>
        </Router>
      </ConfigProvider>
      
      {/* Dev tools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}

export default App