import { useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCompanyById, patchCompany } from '../../services/companies'
import Button from '../../components/common/Button'
import Tag from '../../components/common/Tag'
import Skeleton from '../../components/common/Skeleton'
import EmptyState from '../../components/common/EmptyState'

function CompanyReviewPage(vs) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  
  // Get back URL from query params
  const searchParams = new URLSearchParams(location.search)
  const backUrl = searchParams.get('back') || '/companies?status=pending'
  
  // Review state
  const [reviewNote, setReviewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch company data
  const { 
    data: company, 
    isLoading, 
    isError,
    error,
    refetch 
  } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id),
    retry: false,
    enabled: !!id
  })

  // Approve mutation
  const approveMutation = useMutation({
    mutationFn: () => patchCompany(id, { 
      status: 'approved',
      reviewNote: reviewNote.trim() || 'Approved without additional notes'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      queryClient.invalidateQueries(['company', id])
      navigate(backUrl)
    },
    onError: (error) => {
      console.error('Error approving company:', error)
    }
  })

  // Reject mutation
  const rejectMutation = useMutation({
    mutationFn: () => patchCompany(id, { 
      status: 'rejected',
      reviewNote: reviewNote.trim() || 'Rejected without additional notes'
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['companies'])
      queryClient.invalidateQueries(['company', id])
      navigate(backUrl)
    },
    onError: (error) => {
      console.error('Error rejecting company:', error)
    }
  })

  // Handle approve
  const handleApprove = () => {
    setIsSubmitting(true)
    approveMutation.mutate()
  }

  // Handle reject
  const handleReject = () => {
    if (!reviewNote.trim()) {
      alert('Vui lòng nhập lý do từ chối')
      return
    }
    setIsSubmitting(true)
    rejectMutation.mutate()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton rows={8} />
      </div>
    )
  }

  // Error or not found state
  if (isError || !company) {
    return (
      <div className="p-6">
        <EmptyState
          title="Không tìm thấy công ty"
          description="Công ty này không tồn tại hoặc đã bị xóa."
          action={true}
          actionText="Back to list"
          onAction={() => navigate('/companies')}
          icon={
            <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H7m5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6m-5 0v-6a1 1 0 011-1h2a1 1 0 011 1v6" />
            </svg>
          }
        />
        {error && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={refetch}
            >
              Retry
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Check if company is still pending
  const isPending = company.status === 'pending'

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Company</h1>
            <p className="text-gray-600 mt-1">
              Review và phê duyệt hoặc từ chối đăng ký công ty
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate(backUrl)}
            >
              Back to List
            </Button>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Company Info */}
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin cơ bản
            </h2>
            
            <div className="flex items-start space-x-4 mb-4">
              <img 
                src={company.logo || '/api/placeholder/80/80'} 
                alt={company.name}
                className="w-20 h-20 rounded-lg object-cover border border-gray-200"
              />
              <div>
                <h3 className="text-xl font-bold text-gray-900">{company.name}</h3>
                <p className="text-gray-600">{company.industry}</p>
                <div className="mt-2">
                  <Tag 
                    variant={
                      company.status === 'approved' ? 'success' :
                      company.status === 'rejected' ? 'error' : 'warning'
                    }
                  >
                    {company.status}
                  </Tag>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Owner User ID</label>
                <p className="text-gray-900">#{company.ownerUserId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{company.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ngày tạo</label>
                <p className="text-gray-900">
                  {new Date(company.createdAt).toLocaleDateString('vi-VN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900">{company.location}</p>
              </div>
              {company.size && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Company Size</label>
                  <p className="text-gray-900">{company.size}</p>
                </div>
              )}
            </div>
          </div>

          {/* Legal Files */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tài liệu pháp lý
            </h2>
            <div className="space-y-3">
              {company.legalFiles && company.legalFiles.length > 0 ? (
                company.legalFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    {file.url && file.url !== '#' ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(file.url, '_blank', 'noopener,noreferrer')}
                      >
                        View
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        disabled
                        title="File URL not available"
                      >
                        No file
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Chưa có tài liệu pháp lý được tải lên</p>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ghi chú từ công ty
            </h2>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap">
                {company.notes || company.description || 'Không có ghi chú.'}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Review Panel */}
        <div className="space-y-6">
          {/* Review Panel */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Review Panel
            </h2>
            
            {isPending ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ghi chú review (tùy chọn)
                  </label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={4}
                    placeholder="Nhập ghi chú về quyết định review..."
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Button
                    variant="error"
                    onClick={handleReject}
                    loading={rejectMutation.isLoading || isSubmitting}
                    disabled={approveMutation.isLoading}
                    className="flex-1"
                  >
                    Reject
                  </Button>
                  <Button
                    variant="success"
                    onClick={handleApprove}
                    loading={approveMutation.isLoading || isSubmitting}
                    disabled={rejectMutation.isLoading}
                    className="flex-1"
                  >
                    Approve
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600 text-sm mb-3">
                  Công ty này đã được review với trạng thái: 
                  <Tag 
                    variant={company.status === 'approved' ? 'success' : 'error'}
                    className="ml-2"
                  >
                    {company.status}
                  </Tag>
                </p>
                {company.reviewNote && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Review Note:</label>
                    <p className="text-gray-700 text-sm mt-1">{company.reviewNote}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Thông tin trạng thái
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Trạng thái hiện tại:</span>
                <Tag 
                  variant={
                    company.status === 'approved' ? 'success' :
                    company.status === 'rejected' ? 'error' : 'warning'
                  }
                >
                  {company.status}
                </Tag>
              </div>
              
              {company.status === 'pending' && (
                <div className="bg-yellow-50 p-3 rounded-md border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    Công ty này đang chờ được phê duyệt. Hãy review thông tin và đưa ra quyết định.
                  </p>
                </div>
              )}
              
              {company.status === 'approved' && (
                <div className="bg-green-50 p-3 rounded-md border border-green-200">
                  <p className="text-green-800 text-sm">
                    Công ty đã được phê duyệt và có thể đăng việc làm.
                  </p>
                </div>
              )}
              
              {company.status === 'rejected' && (
                <div className="bg-red-50 p-3 rounded-md border border-red-200">
                  <p className="text-red-800 text-sm">
                    Công ty đã bị từ chối đăng ký.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => navigate(backUrl)}
                className="w-full"
              >
                Back to Companies List
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/companies/${id}`)}
                className="w-full"
              >
                View Company Details
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyReviewPage
