import apiClient from './apiClient'

export const getJobs = async (params = {}) => {
  const response = await apiClient.get('/jobs', { params })
  return response.data
}

export const getJobById = async (id) => {
  const response = await apiClient.get(`/jobs/${id}`)
  return response.data
}

export const patchJob = async (id, body) => {
  const response = await apiClient.patch(`/jobs/${id}`, body)
  return response.data
}

// Additional job-related functions that might be useful
export const createJob = async (jobData) => {
  const response = await apiClient.post('/jobs', jobData)
  return response.data
}

export const deleteJob = async (id) => {
  const response = await apiClient.delete(`/jobs/${id}`)
  return response.data
}

export const closeJob = async (id) => {
  return patchJob(id, { status: 'closed' })
}

export const openJob = async (id) => {
  return patchJob(id, { status: 'open' })
}

export const hideJob = async (id) => {
  return patchJob(id, { status: 'hidden' })
}
