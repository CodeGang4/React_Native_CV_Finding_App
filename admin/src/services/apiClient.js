import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token (ready for future use)
apiClient.interceptors.request.use(
  (config) => {
    // Add Authorization header when available
    // const token = localStorage.getItem('authToken')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for handling pagination and common errors
apiClient.interceptors.response.use(
  (response) => {
    // Handle pagination for json-server
    if (response.config.params && (response.config.params._page || response.config.params._limit)) {
      // This is a paginated request - transform the response
      const totalCount = response.headers['x-total-count'] ? parseInt(response.headers['x-total-count'], 10) : 0
      const items = Array.isArray(response.data) ? response.data : []
      
      return {
        ...response,
        data: {
          items,
          total: totalCount,
          page: response.config.params._page || 1,
          limit: response.config.params._limit || 10
        }
      }
    }
    
    return response
  },
  (error) => {
    // Handle common errors here
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.warn('Unauthorized access - consider redirecting to login')
    }
    return Promise.reject(error)
  }
)

export default apiClient
