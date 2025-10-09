import { supabase } from '../lib/supabase'

// Lấy danh sách jobs (chỉ đọc, không duyệt)
export const getJobs = async (filters = {}) => {
  try {
    let query = supabase
      .from('jobs')
      .select(`
        *,
        employers(
          company_name,
          company_logo,
          isverified
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters.is_expired !== undefined) {
      query = query.eq('is_expired', filters.is_expired)
    }
    
    if (filters.job_type) {
      query = query.eq('job_type', filters.job_type)
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,position.ilike.%${filters.search}%`)
    }

    // Pagination
    if (filters.page && filters.limit) {
      const from = (filters.page - 1) * filters.limit
      const to = from + filters.limit - 1
      query = query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching jobs:', error)
      throw error
    }

    console.log('Fetched jobs:', data)
    return { data, error: null, count }
  } catch (error) {
    console.error('Error in getJobs:', error)
    return { data: [], error, count: 0 }
  }
}

// Lấy job theo ID với chi tiết đầy đủ
export const getJobById = async (id) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      employers(
        company_name,
        company_logo,
        company_website,
        industry,
        company_size,
        verified
      ),
      applications(
        id,
        status,
        created_at,
        users(email, username)
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

// Lấy thống kê jobs
export const getJobStats = async () => {
  const [
    { count: totalJobs },
    { count: activeJobs },
    { count: expiredJobs },
    { count: totalApplications }
  ] = await Promise.all([
    supabase.from('jobs').select('*', { count: 'exact', head: true }),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_expired', false),
    supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('is_expired', true),
    supabase.from('applications').select('*', { count: 'exact', head: true })
  ])

  return {
    total: totalJobs || 0,
    active: activeJobs || 0,
    expired: expiredJobs || 0,
    totalApplications: totalApplications || 0
  }
}

// Lấy jobs theo employer
export const getJobsByCompany = async (employerId) => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      id,
      title,
      is_expired,
      created_at,
      applications(id)
    `)
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false })

  return { data, error }
}