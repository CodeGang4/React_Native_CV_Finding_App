import apiClient from './apiClient'

export const getCompanies = async (params = {}) => {
  const response = await apiClient.get('/companies', { params })
  // json-server returns total count in X-Total-Count header
  const total = parseInt(response.headers['x-total-count'] || response.headers['X-Total-Count'] || '0', 10)
  return {
    items: response.data,
    total
  }
}

export const getCompanyById = async (id) => {
  const response = await apiClient.get(`/companies/${id}`)
  return response.data
}

export const patchCompany = async (id, body) => {
  const response = await apiClient.patch(`/companies/${id}`, body)
  return response.data
}

// Get pending companies for dashboard
export const getPendingCompanies = async (limit = 5) => {
  const response = await apiClient.get('/companies', { 
    params: { 
      status: 'pending',
      _limit: limit,
      _sort: 'createdAt',
      _order: 'desc'
    } 
  })
  return response.data
}

// Additional company-related functions that might be useful
export const createCompany = async (companyData) => {
  const response = await apiClient.post('/companies', companyData)
  return response.data
}

export const deleteCompany = async (id) => {
  const response = await apiClient.delete(`/companies/${id}`)
  return response.data
}

export const approveCompany = async (id) => {
  return patchCompany(id, { status: 'approved' })
}

export const rejectCompany = async (id) => {
  return patchCompany(id, { status: 'rejected' })
}
