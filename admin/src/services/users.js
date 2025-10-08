import apiClient from './apiClient'

export const getUsers = async (params = {}) => {
  const response = await apiClient.get('/users', { params })
  return response.data
}

export const getUserById = async (id) => {
  const response = await apiClient.get(`/users/${id}`)
  return response.data
}

export const patchUser = async (id, body) => {
  const response = await apiClient.patch(`/users/${id}`, body)
  return response.data
}

// Additional user-related functions that might be useful
export const createUser = async (userData) => {
  const response = await apiClient.post('/users', userData)
  return response.data
}

export const deleteUser = async (id) => {
  const response = await apiClient.delete(`/users/${id}`)
  return response.data
}
