import { supabase } from '../lib/supabase'

// Lấy danh sách employers chờ duyệt và đã duyệt
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
      verified,
      created_at,
      updated_at,
      users(email, username)
    `)
    .order('created_at', { ascending: false })

  // Filter theo trạng thái duyệt
  if (filters.is_verified !== undefined) {
    query = query.eq('verified', filters.is_verified)
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

// Lấy employers chờ duyệt
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
      created_at,
      users(email, username)
    `)
    .eq('verified', false)
    .order('created_at', { ascending: false })

  return { data, error }
}

// Duyệt employer (approve/reject) 
export const reviewCompany = async (companyId, isApproved, adminNote = '') => {
  const { data, error } = await supabase
    .from('employers')
    .update({
      verified: isApproved,
      updated_at: new Date().toISOString()
    })
    .eq('id', companyId)
    .select()

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

// Lấy thống kê employers
export const getCompanyStats = async () => {
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