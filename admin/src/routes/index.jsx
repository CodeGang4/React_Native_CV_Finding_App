import React from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import UsersListPage from '../pages/Users/UsersListPage'
import UserDetailPage from '../pages/Users/UserDetailPage'
import CompaniesListPage from '../pages/Companies/CompaniesListPage'
import CompanyDetailPage from '../pages/Companies/CompanyDetailPage'
import CompanyReviewPage from '../pages/Companies/CompanyReviewPage'
import JobsListPage from '../pages/Jobs/JobsListPage'
import JobDetailPage from '../pages/Jobs/JobDetailPage'
import LoginPage from '../pages/Auth/LoginPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: <DashboardPage />
      },
      {
        path: 'users',
        element: <UsersListPage />
      },
      {
        path: 'users/:id',
        element: <UserDetailPage />
      },
      {
        path: 'companies',
        element: <CompaniesListPage />
      },
      {
        path: 'companies/:id',
        element: <CompanyDetailPage />
      },
      {
        path: 'companies/:id/review',
        element: <CompanyReviewPage />,
        errorElement: (
          <div className="p-6 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Company Review Not Found</h2>
            <p className="text-gray-600 mb-4">The company you're trying to review may not exist.</p>
            <a href="/companies" className="text-blue-600 hover:text-blue-800">
              ← Back to Companies List
            </a>
          </div>
        )
      },
      {
        path: 'jobs',
        element: <JobsListPage />
      },
      {
        path: 'jobs/:id',
        element: <JobDetailPage />
      }
    ]
  }
])

export default router
