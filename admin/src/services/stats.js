import apiClient from './apiClient'

export const getStats = async () => {
  const response = await apiClient.get('/stats')
  return response.data
}

// Additional stats-related functions that might be useful
export const getMonthlyStats = async (year) => {
  const response = await apiClient.get(`/stats/monthly`, { params: { year } })
  return response.data
}

export const getApplicationStats = async () => {
  const response = await apiClient.get(`/stats/applications`)
  return response.data
}
