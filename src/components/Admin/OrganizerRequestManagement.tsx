import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import toast, { Toaster } from 'react-hot-toast';
import { 
  CheckCircle, 
  XCircle,
  Clock, 
  Users, 
  Mail, 
  Building, 
  UserCheck, 
  Shield,
  Eye,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  ExternalLink,
  X,
  Briefcase,
  Globe
} from 'lucide-react';

interface OrganizerRequest {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  organizationName: string;
  organizationType: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  accountHolderName: string;
  panCard: string;
  gstCertificate?: string;
  bankStatement: string;
  organizationLicense?: string;
  previousExperience: string;
  expectedEventsPerYear: string;
  reasonForJoining: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

const OrganizerRequestManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<OrganizerRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<OrganizerRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = filter === 'all' 
        ? `${API_BASE}/organizer-requests`
        : `${API_BASE}/organizer-requests?status=${filter}`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error('Failed to load organizer requests');
    } finally {
      setLoading(false);
    }
  }, [API_BASE, filter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleApprove = async (id: string) => {
    if (!confirm('Are you sure you want to approve this organizer request? This will create a user account.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/organizer-requests/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to approve request');
      }

      const data = await response.json();
      toast.success(data.message || 'Organizer request approved successfully!');
      
      await fetchRequests();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error approving request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve request';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE}/organizer-requests/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject request');
      }

      const data = await response.json();
      console.log('Rejected:', data);
      toast.success('Organizer request rejected');
      
      await fetchRequests();
      setShowDetailModal(false);
    } catch (error) {
      console.error('Error rejecting request:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject request';
      toast.error(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  const viewDetails = (request: OrganizerRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const statistics = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-8 py-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Organizer Requests Management</h1>
              <p className="text-emerald-100 text-lg">Review and manage organizer applications</p>
            </div>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilter('all')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Requests</p>
                  <p className="text-2xl font-bold text-white">{statistics.total}</p>
                </div>
                <Users className="h-8 w-8 text-white/80" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilter('pending')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold text-white">{statistics.pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-300" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilter('approved')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Approved</p>
                  <p className="text-2xl font-bold text-white">{statistics.approved}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-300" />
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 cursor-pointer"
              whileHover={{ scale: 1.02 }}
              onClick={() => setFilter('rejected')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Rejected</p>
                  <p className="text-2xl font-bold text-white">{statistics.rejected}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-300" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <motion.div 
            className="bg-white rounded-2xl shadow-lg p-12 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Found</h3>
            <p className="text-gray-600">
              {filter === 'pending' ? 'No pending organizer requests at the moment' : 
               filter === 'approved' ? 'No approved requests yet' :
               filter === 'rejected' ? 'No rejected requests yet' :
               'No organizer requests have been submitted yet'}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {requests.map((request, index) => (
              <motion.div
                key={request._id}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                {/* Status Banner */}
                <div className={`h-2 ${
                  request.status === 'approved' ? 'bg-green-500' :
                  request.status === 'rejected' ? 'bg-red-500' :
                  'bg-yellow-500'
                }`} />

                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center flex-1">
                      <div className="h-12 w-12 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-xl flex items-center justify-center mr-3">
                        <Building className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{request.fullName}</h3>
                        <p className="text-sm text-gray-600 truncate">{request.position}</p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(request.status)}`}>
                      {getStatusIcon(request.status)}
                      {request.status}
                    </span>
                  </div>

                  {/* Organization Info */}
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <Building className="h-4 w-4 mr-2 text-emerald-600 flex-shrink-0" />
                      <span className="truncate">{request.organizationName}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Mail className="h-4 w-4 mr-2 text-blue-600 flex-shrink-0" />
                      <span className="truncate">{request.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <Phone className="h-4 w-4 mr-2 text-purple-600 flex-shrink-0" />
                      <span>{request.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-700">
                      <MapPin className="h-4 w-4 mr-2 text-red-600 flex-shrink-0" />
                      <span className="truncate">{request.city}, {request.state}</span>
                    </div>
                  </div>

                  {/* Meta Info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4 pt-4 border-t border-gray-100">
                    <span>Applied: {new Date(request.createdAt).toLocaleDateString()}</span>
                    <span className="capitalize">{request.organizationType.replace('_', ' ')}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => viewDetails(request)}
                      className="flex-1 bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-all duration-200 flex items-center justify-center gap-2 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </motion.button>
                    
                    {request.status === 'pending' && (
                      <motion.button
                        onClick={() => handleApprove(request._id)}
                        disabled={actionLoading}
                        className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-4 py-2.5 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        Approve
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedRequest && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDetailModal(false)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-6 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <Building className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedRequest.fullName}</h2>
                      <p className="text-emerald-100">{selectedRequest.organizationName}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-8 space-y-8">
                {/* Personal Information */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-emerald-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.fullName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Position</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.position}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Email</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 mr-2 text-blue-600" />
                        {selectedRequest.email}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Phone</p>
                      <p className="font-semibold text-gray-900 flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-purple-600" />
                        {selectedRequest.phone}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Organization Information */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Organization Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Organization Name</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.organizationName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Type</p>
                      <p className="font-semibold text-gray-900 capitalize">{selectedRequest.organizationType.replace('_', ' ')}</p>
                    </div>
                    {selectedRequest.website && (
                      <div className="md:col-span-2">
                        <p className="text-sm text-gray-600 mb-1">Website</p>
                        <a 
                          href={selectedRequest.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:text-blue-700 flex items-center"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          {selectedRequest.website}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                      </div>
                    )}
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Address</p>
                      <p className="font-semibold text-gray-900 flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-red-600 mt-1 flex-shrink-0" />
                        {selectedRequest.address}, {selectedRequest.city}, {selectedRequest.state} - {selectedRequest.pincode}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Banking Information */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-purple-600" />
                    Banking Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-xl p-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bank Name</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.bankName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account Holder Name</p>
                      <p className="font-semibold text-gray-900">{selectedRequest.accountHolderName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Account Number</p>
                      <p className="font-semibold text-gray-900 font-mono">****{selectedRequest.accountNumber.slice(-4)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">IFSC Code</p>
                      <p className="font-semibold text-gray-900 font-mono">{selectedRequest.ifscCode}</p>
                    </div>
                  </div>
                </section>

                {/* Documents */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-amber-600" />
                    Uploaded Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a
                      href={selectedRequest.panCard}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">PAN Card</p>
                          <p className="text-xs text-gray-600">Click to view</p>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                    </a>

                    <a
                      href={selectedRequest.bankStatement}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
                    >
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <FileText className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">Bank Statement</p>
                          <p className="text-xs text-gray-600">Click to view</p>
                        </div>
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-purple-600 transition-colors" />
                    </a>

                    {selectedRequest.gstCertificate && (
                      <a
                        href={selectedRequest.gstCertificate}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">GST Certificate</p>
                            <p className="text-xs text-gray-600">Click to view</p>
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                      </a>
                    )}

                    {selectedRequest.organizationLicense && (
                      <a
                        href={selectedRequest.organizationLicense}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200 flex items-center justify-between group"
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                            <FileText className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Organization License</p>
                            <p className="text-xs text-gray-600">Click to view</p>
                          </div>
                        </div>
                        <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                      </a>
                    )}
                  </div>
                </section>

                {/* Additional Information */}
                <section>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                    Additional Information
                  </h3>
                  <div className="space-y-4 bg-gray-50 rounded-xl p-6">
                    <div>
                      <p className="text-sm text-gray-600 mb-2 font-semibold">Previous Experience</p>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedRequest.previousExperience}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2 font-semibold">Expected Events Per Year</p>
                      <p className="text-gray-900">{selectedRequest.expectedEventsPerYear}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2 font-semibold">Reason for Joining</p>
                      <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">{selectedRequest.reasonForJoining}</p>
                    </div>
                  </div>
                </section>

                {/* Action Buttons */}
                {selectedRequest.status === 'pending' && (
                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <motion.button
                      onClick={() => handleReject(selectedRequest._id)}
                      disabled={actionLoading}
                      className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-4 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {actionLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5" />
                          Reject Application
                        </>
                      )}
                    </motion.button>
                    <motion.button
                      onClick={() => handleApprove(selectedRequest._id)}
                      disabled={actionLoading}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-4 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-200 flex items-center justify-center gap-2 font-semibold shadow-lg disabled:opacity-50"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {actionLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      ) : (
                        <>
                          <CheckCircle className="h-5 w-5" />
                          Approve & Create Account
                        </>
                      )}
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerRequestManagement;
