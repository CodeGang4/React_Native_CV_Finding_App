import { supabase } from '../lib/supabase'

// Lấy thống kê tổng quan về payments
export const getPaymentStats = async () => {
  try {
    const [
      { count: totalPayments },
      { count: successfulPayments },
      { count: pendingPayments },
      { count: failedPayments },
      totalRevenueResult
    ] = await Promise.all([
      // Tổng số giao dịch
      supabase.from('payments').select('*', { count: 'exact', head: true }),
      
      // Giao dịch thành công
      supabase.from('payments').select('*', { count: 'exact', head: true })
        .eq('status', 'succeeded'),
      
      // Giao dịch đang chờ
      supabase.from('payments').select('*', { count: 'exact', head: true })
        .eq('status', 'pending'),
      
      // Giao dịch thất bại
      supabase.from('payments').select('*', { count: 'exact', head: true })
        .eq('status', 'failed'),
      
      // Tổng doanh thu (chỉ giao dịch thành công)
      supabase.from('payments')
        .select('amount_cents')
        .eq('status', 'succeeded')
    ])

    // Tính tổng doanh thu
    const totalRevenue = totalRevenueResult.data?.reduce((sum, payment) => 
      sum + (payment.amount_cents || 0), 0) || 0

    return {
      totalPayments: totalPayments || 0,
      successfulPayments: successfulPayments || 0,
      pendingPayments: pendingPayments || 0,
      failedPayments: failedPayments || 0,
      totalRevenue: totalRevenue, // cents
      totalRevenueVND: totalRevenue / 100 // convert to VND
    }
  } catch (error) {
    return {
      totalPayments: 0,
      successfulPayments: 0,
      pendingPayments: 0,
      failedPayments: 0,
      totalRevenue: 0,
      totalRevenueVND: 0
    }
  }
}

// Lấy danh sách payments với thông tin users
export const getPayments = async (filters = {}) => {
  let query = supabase
    .from('payments')
    .select(`
      *,
      users:user_id(
        id,
        email,
        username,
        role
      )
    `, { count: 'exact' })
    .order('created_at', { ascending: false })

  // Filter theo status
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  // Filter theo provider
  if (filters.provider) {
    query = query.eq('provider', filters.provider)
  }

  // Search theo email user - tìm users trước rồi filter payments
  if (filters.search) {
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .or(`email.ilike.%${filters.search}%,username.ilike.%${filters.search}%`)
    
    const userIds = users?.map(u => u.id) || []
    
    // Nếu không tìm thấy user nào, return empty
    if (userIds.length === 0) {
      return { data: [], count: 0, error: null }
    }
    
    // Filter payments theo user IDs
    query = query.in('user_id', userIds)
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

// Lấy doanh thu theo thời gian (cho biểu đồ)
export const getRevenueAnalytics = async (period = '30d') => {
  const days = period === '7d' ? 7 : period === '30d' ? 30 : 90
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data, error } = await supabase
    .from('payments')
    .select('created_at, amount_cents')
    .eq('status', 'succeeded')
    .gte('created_at', startDate.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    return { revenue: [], labels: [] }
  }

  // Group by date
  const revenueByDate = {}
  
  data?.forEach(payment => {
    const date = new Date(payment.created_at).toLocaleDateString('vi-VN')
    if (!revenueByDate[date]) {
      revenueByDate[date] = 0
    }
    revenueByDate[date] += payment.amount_cents || 0
  })

  const labels = Object.keys(revenueByDate)
  const revenue = Object.values(revenueByDate).map(cents => cents / 100) // Convert to VND

  return { labels, revenue }
}

// Lấy thống kê theo provider
export const getRevenueByProvider = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('provider, amount_cents')
    .eq('status', 'succeeded')

  if (error || !data) {
    return { providers: [], amounts: [] }
  }

  const revenueByProvider = {}
  
  data.forEach(payment => {
    const provider = payment.provider || 'Unknown'
    if (!revenueByProvider[provider]) {
      revenueByProvider[provider] = 0
    }
    revenueByProvider[provider] += payment.amount_cents || 0
  })

  const providers = Object.keys(revenueByProvider)
  const amounts = Object.values(revenueByProvider).map(cents => cents / 100)

  return { providers, amounts }
}