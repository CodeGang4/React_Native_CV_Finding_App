import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import 'antd/dist/reset.css'
import './index.css'

// Import database test cho development
if (import.meta.env.DEV) {
  import('./utils/databaseTest.js').then(({ testDatabaseConnection }) => {
    // Chạy test sau 2 giây để đảm bảo app đã load
    setTimeout(() => {
      console.log('🚀 Running database schema validation...')
      testDatabaseConnection()
    }, 2000)
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)