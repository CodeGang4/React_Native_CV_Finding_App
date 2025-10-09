import { supabase } from '../lib/supabase'

// Lấy tất cả thống kê cho dashboard
export const getDashboardStats = async () => {
  try {
    // Parallel queries để tăng performance
    const [
      userStats,
      companyStats,
      jobStats,
      applicationStats,
      recentActivity
    ] = await Promise.all([
      getUserStats(),
      getCompanyStats(),
      getJobStats(),
      getApplicationStats(),
      getRecentActivity()
    ])

    return {
      users: userStats,
      companies: companyStats,
      jobs: jobStats,
      applications: applicationStats,
      recentActivity,
      error: null
    }
  } catch (error) {
    return { error }
  }
}

// Thống kê users
const getUserStats = async () => {
  const [
    { count: totalUsers },
    { count: candidates },
    { count: employers },
    { count: newUsersThisMonth }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'candidate'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employer'),
    supabase.from('users').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  return {
    total: totalUsers || 0,
    candidates: candidates || 0,
    employers: employers || 0,
    newThisMonth: newUsersThisMonth || 0
  }
}

// Thống kê employers
const getCompanyStats = async () => {
  const [
    { count: totalCompanies },
    { count: verifiedCompanies },
    { count: pendingCompanies }
  ] = await Promise.all([
    supabase.from('employers').select('*', { count: 'exact', head: true }),
    supabase.from('employers').select('*', { count: 'exact', head: true }).eq('verified', true),
    supabase.from('employers').select('*', { count: 'exact', head: true }).eq('verified', false)
  ])

  return {
    total: totalCompanies || 0,
    verified: verifiedCompanies || 0,
    pending: pendingCompanies || 0
  }
}

// Thống kê jobs
const getJobStats = async () => {
  const [
    { count: totalJobs },
    { count: acceptedJobs },
    { count: expiredJobs },
    { count: newJobsThisMonth }
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('isAccepted', true),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).lt('expired_date', new Date().toISOString()),
    supabase.from('jobs').select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())
  ])

  return {
    total: totalJobs || 0,
    accepted: acceptedJobs || 0,
    expired: expiredJobs || 0,
    newThisMonth: newJobsThisMonth || 0
  }
}

// Thống kê applications
const getApplicationStats = async () => {
  const [
    { count: totalApplications },
    { count: pendingApplications },
    { count: acceptedApplications },
    { count: rejectedApplications }
  ] = await Promise.all([
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('applications').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
  ])

  return {
    total: totalApplications || 0,
    pending: pendingApplications || 0,
    accepted: acceptedApplications || 0,
    rejected: rejectedApplications || 0
  }
}

// Hoạt động gần đây
const getRecentActivity = async () => {
  const [
    { data: recentJobs },
    { data: recentApplications },
    { data: recentCompanies }
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select(`
        id, 
        title, 
        created_at,
        employers(company_name)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    
    supabase
      .from('applications')
      .select(`
        id,
        created_at,
        jobs(title),
        users(username, email)
      `)
      .order('created_at', { ascending: false })
      .limit(5),
    
    supabase
      .from('employers')
      .select('id, company_name, created_at, verified')
      .order('created_at', { ascending: false })
      .limit(5)
  ])

  return {
    recentJobs: recentJobs || [],
    recentApplications: recentApplications || [],
    recentCompanies: recentCompanies || []
  }
}

// Lấy data cho biểu đồ (7, 30, 90 ngày)
export const getAnalyticsData = async (period = '30d') => {
  const daysAgo = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const startDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: jobsData },
    { data: usersData },
    { data: applicationsData }
  ] = await Promise.all([
    supabase
      .from('jobs')
      .select('created_at')
      .gte('created_at', startDate)
      .order('created_at'),
    
    supabase
      .from('users')
      .select('created_at')
      .gte('created_at', startDate)
      .order('created_at'),
    
    supabase
      .from('applications')
      .select('created_at')
      .gte('created_at', startDate)
      .order('created_at')
  ])

  // Xử lý data theo ngày
  const processDataByDay = (data, days) => {
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      const count = data.filter(item => 
        item.created_at.split('T')[0] === dateStr
      ).length
      result.push({ 
        date: dateStr, 
        count,
        displayDate: date.toLocaleDateString('vi-VN', { 
          month: 'short', 
          day: 'numeric' 
        })
      })
    }
    return result
  }

  return {
    jobs: processDataByDay(jobsData || [], daysAgo),
    users: processDataByDay(usersData || [], daysAgo),
    applications: processDataByDay(applicationsData || [], daysAgo)
  }
}