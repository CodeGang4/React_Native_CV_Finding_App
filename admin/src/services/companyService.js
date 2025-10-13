import { supabase } from '../lib/supabase'

// Lấy danh sách employers với status: pending/accepted/rejected
export const getCompanies = async (filters = {}) => {
  let query = supabase
    .from('employers')
    .select(`
      id,
      user_id,
      company_name,
      company_logo,
      company_website,
      company_address,
      company_size,
      industry,
      contact_person,
      description,
      status,
      isverified,
      created_at,
      updated_at,
      users(email, username)
    `)
    .order('created_at', { ascending: false })

  // Filter theo status (pending/accepted/rejected)
  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  
  if (filters.search) {
    query = query.or(`company_name.ilike.%${filters.search}%,contact_person.ilike.%${filters.search}%`)
  }

  if (filters.industry) {
    query = query.eq('industry', filters.industry)
  }

  // Pagination
  if (filters.page && filters.limit) {
    const from = (filters.page - 1) * filters.limit
    const to = from + filters.limit - 1
    query = query.range(from, to)
  }

  const { data, error, count } = await query

  return { data, error, count }
}

// Lấy employers chờ duyệt (status = pending)
export const getPendingCompanies = async () => {
  const { data, error } = await supabase
    .from('employers')
    .select(`
      id,
      company_name,
      contact_person,
      description,
      company_website,
      company_logo,
      industry,
      company_size,
      status,
      created_at,
      users(email, username)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  return { data, error }
}

// Duyệt employer (approve = 'accepted' / reject = 'rejected') 
export const reviewCompany = async (companyId, isApproved, adminNote = '') => {
  const newStatus = isApproved ? 'accepted' : 'rejected'
  
  const { data, error } = await supabase
    .from('employers')
    .update({
      status: newStatus,
      isverified: isApproved, // Update isverified khi accept
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId)
    .select()

  if (error) throw error
  return { data, error }
}

// Lấy chi tiết employer
export const getCompanyById = async (id) => {
  const { data, error } = await supabase
    .from('employers')
    .select(`
      *,
      users(email, username),
      jobs(
        id,
        title,
        created_at,
        applications(id)
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}

// Lấy thống kê employers theo status (pending/accepted/rejected)
export const getCompanyStats = async () => {
  const [
    { count: totalCompanies },
    { count: acceptedCompanies },
    { count: pendingCompanies },
    { count: rejectedCompanies }
  ] = await Promise.all([
    supabase.from('employers').select('*', { count: 'exact', head: true }),
    supabase.from('employers').select('*', { count: 'exact', head: true }).eq('status', 'accepted'),
    supabase.from('employers').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('employers').select('*', { count: 'exact', head: true }).eq('status', 'rejected')
  ])

  return {
    total: totalCompanies || 0,
    accepted: acceptedCompanies || 0,
    pending: pendingCompanies || 0,
    rejected: rejectedCompanies || 0
  }
}