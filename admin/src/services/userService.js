import { supabase } from '../lib/supabase'

// Lấy danh sách users (ứng viên + nhà tuyển dụng)
export const getUsers = async (filters = {}) => {
  // Request exact count from Supabase so callers (UI) can get total for pagination
  let query = supabase
    .from('users')
    .select(`
      id,
      email,
      avatar,
      role,
      created_at,
      updated_at,
      username
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters.role) {
    query = query.eq('role', filters.role)
  }
  
  if (filters.search) {
    query = query.or(`email.ilike.%${filters.search}%,username.ilike.%${filters.search}%`)
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

// Lấy thống kê users
export const getUserStats = async () => {
  const [
    { count: totalUsers },
    { count: candidates },
    { count: employers }
  ] = await Promise.all([
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'candidate'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'employer')
  ])

  return {
    total: totalUsers || 0,
    candidates: candidates || 0,
    employers: employers || 0
  }
}

// Lấy user theo ID với chi tiết
export const getUserById = async (id) => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      applications(
        id,
        status,
        created_at,
        jobs(title)
      )
    `)
    .eq('id', id)
    .single()

  return { data, error }
}