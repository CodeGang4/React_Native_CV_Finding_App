import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getCompanyById } from '../../services/companies'
import Button from '../../components/common/Button'
import Tag from '../../components/common/Tag'
import Skeleton from '../../components/common/Skeleton'

function CompanyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  // Fetch company data
  const { 
    data: company, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompanyById(id),
    enabled: !!id
  })

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton rows={8} />
      </div>
    )
  }

  if (error || !company) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600">Company not found or error loading data.</p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/companies')}
            className="mt-4"
          >
            Back to Companies
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Company Details</h1>
            <p className="text-gray-600 mt-1">
              View complete company information and profile
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate('/companies')}
            >
              Back to List
            </Button>
            {company.status === 'pending' && (
              <Button
                variant="primary"
                onClick={() => navigate(`/companies/${id}/review`)}
              >
                Review Company
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Company Profile Card */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-6">
          <div className="flex items-start space-x-6">
            <img 
              src={company.logo || '/api/placeholder/120/120'} 
              alt={company.name}
              className="w-24 h-24 rounded-lg object-cover border border-gray-200"
            />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{company.name}</h2>
                  <p className="text-lg text-gray-600 mt-1">{company.industry}</p>
                  <div className="flex items-center space-x-4 mt-3">
                    <Tag 
                      variant={
                        company.status === 'approved' ? 'success' :
                        company.status === 'rejected' ? 'error' : 'warning'
                      }
                    >
                      {company.status}
                    </Tag>
                    {company.size && (
                      <span className="text-sm text-gray-500">
                        {company.size} employees
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Company */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              About the Company
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                {company.description || 'No company description available.'}
              </p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-gray-900 mt-1">{company.email}</p>
              </div>
              {company.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone Number</label>
                  <p className="text-gray-900 mt-1">{company.phone}</p>
                </div>
              )}
              {company.website && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Website</label>
                  <p className="text-gray-900 mt-1">
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-gray-500">Location</label>
                <p className="text-gray-900 mt-1">{company.location}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          {(company.founded || company.headquarters || company.specialties) && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Additional Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {company.founded && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Founded</label>
                    <p className="text-gray-900 mt-1">{company.founded}</p>
                  </div>
                )}
                {company.headquarters && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Headquarters</label>
                    <p className="text-gray-900 mt-1">{company.headquarters}</p>
                  </div>
                )}
                {company.specialties && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Specialties</label>
                    <p className="text-gray-900 mt-1">{company.specialties}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Registration Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Registration Info
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Owner User ID</label>
                <p className="text-gray-900 mt-1">#{company.ownerUserId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Registration Date</label>
                <p className="text-gray-900 mt-1">
                  {new Date(company.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              {company.updatedAt && company.updatedAt !== company.createdAt && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-gray-900 mt-1">
                    {new Date(company.updatedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Status Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Status Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Current Status</label>
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
              
              {company.status === 'rejected' && company.rejectReason && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                  <p className="text-gray-900 mt-1 text-sm bg-red-50 p-3 rounded-md border border-red-200">
                    {company.rejectReason}
                  </p>
                </div>
              )}
              
              {company.status === 'pending' && (
                <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    This company is awaiting administrative review and approval.
                  </p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => navigate(`/companies/${id}/review`)}
                    className="mt-3 w-full"
                  >
                    Review Now
                  </Button>
                </div>
              )}
              
              {company.status === 'approved' && (
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <p className="text-green-800 text-sm">
                    This company has been approved and can post jobs.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => navigate('/companies')}
                className="w-full"
              >
                Back to Companies List
              </Button>
              {company.status === 'pending' && (
                <Button
                  variant="primary"
                  onClick={() => navigate(`/companies/${id}/review`)}
                  className="w-full"
                >
                  Review Company
                </Button>
              )}
              {company.website && (
                <Button
                  variant="outline"
                  onClick={() => window.open(company.website, '_blank')}
                  className="w-full"
                >
                  Visit Website
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CompanyDetailPage
