import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '../../contexts/AuthContext';
import useAdmin from '../../contexts/useAdmin';
import { useEmail } from '../../contexts/EmailContext';
import { RequestFromAdmin } from '../../contexts/AdminContext';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar, 
  Mail, 
  Building, 
  UserCheck, 
  CalendarCheck,
  Shield,
  X,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Briefcase,
  Eye
} from 'lucide-react';

type EventRecord = { _id?: string; id?: string; title?: string; name?: string; organiser?: string; organiserId?: string };

const AdminApproval: React.FC = () => {
  const { user } = useAuth();
  const { approveOrganizer, approveEvent, fetchPendingOrganizers, fetchPendingEvents, fetchApprovedOrganizers } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState<RequestFromAdmin[]>([]);
  const [approvedOrganizers, setApprovedOrganizers] = useState<RequestFromAdmin[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrganizer, setSelectedOrganizer] = useState<RequestFromAdmin | null>(null);
  const {sendEventApprovedNotificationMail} = useEmail();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  const totalPendingApprovals = organizers.length + events.length;
  const pendingOrganizers = organizers.length;
  const pendingEvents = events.length;
  const totalApproved = approvedOrganizers.length;

  useEffect(() => {
  const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orgData, evtData, approvedOrgData] = await Promise.all([
          fetchPendingOrganizers(),
          fetchPendingEvents(),
          fetchApprovedOrganizers(),
        ]);
    setOrganizers(orgData || []);
    setEvents((evtData as unknown[] | undefined) || []);
    setApprovedOrganizers(approvedOrgData || []);
      } catch (err: unknown) {
        console.error('Failed to load approvals', err);
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to load approvals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchPendingOrganizers, fetchPendingEvents, fetchApprovedOrganizers]);

  const handleApproveEvent = async (id: string) => {
     console.log(id)
    await approveEvent(id)
      .then(() => {
        setEvents(prev => prev.filter(e => (e as EventRecord)._id !== id));
      })
      .then(async ()=>{
        const emailData = {
          subject: 'Your event has been approved',
          content: 'You can now create certificates for this event.'
        };
        await sendEventApprovedNotificationMail(user?.email ?? '', emailData.subject, emailData.content);
      })
      .catch(err => {
        console.error('Failed to approve event', err);
        alert('Failed to approve event');
      });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* SETU Header */}
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
              <h1 className="text-3xl font-bold">Admin Approvals</h1>
              <p className="text-emerald-100 text-lg">Manage organizer registrations and event approvals - SETU Platform</p>
            </div>
          </div>

          {/* Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              data-aos="fade-up"
              data-aos-delay="100"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Total Pending</p>
                  <p className="text-2xl font-bold text-white">{totalPendingApprovals}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              data-aos="fade-up"
              data-aos-delay="200"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Pending Organizers</p>
                  <p className="text-2xl font-bold text-white">{pendingOrganizers}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              data-aos="fade-up"
              data-aos-delay="300"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Pending Events</p>
                  <p className="text-2xl font-bold text-white">{pendingEvents}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
              data-aos="fade-up"
              data-aos-delay="400"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-emerald-100 text-sm font-medium">Approved Organizers</p>
                  <p className="text-2xl font-bold text-white">{totalApproved}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {loading ? (
          <motion.div 
            className="flex items-center justify-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              <span className="text-gray-600 font-medium">Loading approvals...</span>
            </div>
          </motion.div>
        ) : error ? (
          <motion.div 
            className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="text-red-600 text-lg font-semibold">{error}</div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pending Organizers */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              data-aos="fade-right"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                    <UserCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Pending Organizers</h2>
                    <p className="text-blue-100 text-sm">{organizers.length} awaiting approval</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {organizers.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserCheck className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No pending organizers</p>
                    <p className="text-gray-400 text-sm">All organizer requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {organizers.map((org, index) => {
                      const id = org._id || org.id || '';
                      return (
                        <motion.div
                          key={id}
                          className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                                  <Building className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900">{org.fullName || org.name}</h3>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {org.email}
                                  </div>
                                </div>
                              </div>
                              
                              {(org.gstCertificate || org.GSTIN) && (
                                <div className="mb-3">
                                  <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full">
                                    GST Registered
                                  </span>
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-3 py-1 rounded-full flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {org.status || 'pending'}
                                </span>
                                {org.createdAt && (
                                  <span className="text-xs text-gray-500 ml-3">
                                    {new Date(org.createdAt).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <motion.button 
                              onClick={async () => {
                                try {
                                  await approveOrganizer(id);
                                  setOrganizers(prev => prev.filter(o => (o._id || o.id) !== id));
                                } catch (e) {
                                  console.error(e);
                                  alert('Failed to approve organizer');
                                }
                              }}
                              className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Pending Events */}
            <motion.div 
              className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
              data-aos="fade-left"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-gradient-to-r from-emerald-600 to-purple-600 px-8 py-6">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                    <CalendarCheck className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Pending Events</h2>
                    <p className="text-emerald-100 text-sm">{events.length} awaiting approval</p>
                  </div>
                </div>
              </div>

              <div className="p-8">
                {events.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CalendarCheck className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-medium">No pending events</p>
                    <p className="text-gray-400 text-sm">All event requests have been processed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((ev, index) => {
                      const e = ev as unknown as EventRecord;
                      const id = e._id || e.id || '';
                      return (
                        <motion.div
                          key={id}
                          className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center mb-2">
                                <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                                  <Calendar className="h-4 w-4 text-purple-600" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-gray-900">{e.title || e.name}</h3>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Users className="h-3 w-3 mr-1" />
                                    Created by: {e.organiser || e.organiserId}
                                  </div>
                                </div>
                              </div>
                              
                              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-3 py-1 rounded-full flex items-center w-fit">
                                <Clock className="h-3 w-3 mr-1" />
                                Awaiting Approval
                              </span>
                            </div>
                            
                            <motion.button 
                              onClick={async () => {
                                await handleApproveEvent(id); 
                              }}
                              className="bg-gradient-to-r from-emerald-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-purple-800 transition-all duration-300 flex items-center space-x-2 font-medium shadow-lg"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Approve</span>
                            </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {/* Approved Organizers Section */}
        {!loading && !error && approvedOrganizers.length > 0 && (
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mt-8"
            data-aos="fade-up"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-8 py-6">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Approved Organizers</h2>
                  <p className="text-emerald-100 text-sm">{approvedOrganizers.length} organizers approved and active</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedOrganizers.map((org, index) => {
                  const id = org._id || org.id || '';
                  return (
                    <motion.div
                      key={id}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full flex items-center">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          ACTIVE
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-lg mb-2">{org.fullName || org.name}</h3>
                      
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="h-4 w-4 mr-2 text-emerald-600" />
                          <span className="truncate">{org.email}</span>
                        </div>
                        
                        {org.organizationName && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Building className="h-4 w-4 mr-2 text-emerald-600" />
                            <span className="truncate">{org.organizationName}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        {org.approvedAt && (
                          <div className="text-xs text-gray-500 flex items-center">
                            <Calendar className="h-3 w-3 mr-1" />
                            {new Date(org.approvedAt).toLocaleDateString()}
                          </div>
                        )}
                        
                        <motion.button
                          onClick={() => setSelectedOrganizer(org)}
                          className="text-emerald-600 hover:text-emerald-700 text-xs font-semibold flex items-center"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View Details
                        </motion.button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* View Organizer Details Modal */}
      <AnimatePresence>
        {selectedOrganizer && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedOrganizer(null)}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-6 sticky top-0 z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <UserCheck className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selectedOrganizer.fullName || selectedOrganizer.name}</h2>
                      <p className="text-emerald-100 text-sm">Organizer Details</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setSelectedOrganizer(null)}
                    className="h-10 w-10 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5 text-white" />
                  </motion.button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-8 space-y-6">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <UserCheck className="h-5 w-5 mr-2 text-emerald-600" />
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Mail className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-600">Email</span>
                      </div>
                      <p className="text-gray-900 font-medium">{selectedOrganizer.email}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Phone className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-600">Phone</span>
                      </div>
                      <p className="text-gray-900 font-medium">{selectedOrganizer.phone}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <Briefcase className="h-4 w-4 mr-2 text-emerald-600" />
                        <span className="text-sm font-semibold text-gray-600">Position</span>
                      </div>
                      <p className="text-gray-900 font-medium">{selectedOrganizer.position}</p>
                    </div>
                  </div>
                </div>

                {/* Organization Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Organization Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Organization Name</span>
                      <p className="text-gray-900 font-medium mt-1">{selectedOrganizer.organizationName}</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Organization Type</span>
                      <p className="text-gray-900 font-medium mt-1 capitalize">{selectedOrganizer.organizationType?.replace('_', ' ')}</p>
                    </div>
                    {selectedOrganizer.website && (
                      <div className="bg-blue-50 rounded-xl p-4 md:col-span-2">
                        <span className="text-sm font-semibold text-gray-600">Website</span>
                        <a href={selectedOrganizer.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 font-medium mt-1 block">
                          {selectedOrganizer.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-purple-600" />
                    Address
                  </h3>
                  <div className="bg-purple-50 rounded-xl p-4">
                    <p className="text-gray-900 font-medium">{selectedOrganizer.address}</p>
                    <p className="text-gray-700 mt-2">
                      {selectedOrganizer.city}, {selectedOrganizer.state} - {selectedOrganizer.pincode}
                    </p>
                  </div>
                </div>

                {/* Bank Details */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-green-600" />
                    Bank Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Bank Name</span>
                      <p className="text-gray-900 font-medium mt-1">{selectedOrganizer.bankName}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Account Holder</span>
                      <p className="text-gray-900 font-medium mt-1">{selectedOrganizer.accountHolderName}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Account Number</span>
                      <p className="text-gray-900 font-medium mt-1 font-mono">{selectedOrganizer.accountNumber}</p>
                    </div>
                    <div className="bg-green-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">IFSC Code</span>
                      <p className="text-gray-900 font-medium mt-1 font-mono">{selectedOrganizer.ifscCode}</p>
                    </div>
                  </div>
                </div>

                {/* Documents */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-orange-600" />
                    Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <a href={selectedOrganizer.panCard} target="_blank" rel="noopener noreferrer" 
                       className="bg-orange-50 rounded-xl p-4 hover:bg-orange-100 transition-colors">
                      <span className="text-sm font-semibold text-gray-600">PAN Card</span>
                      <p className="text-orange-600 font-medium mt-1 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View Document
                      </p>
                    </a>
                    <a href={selectedOrganizer.bankStatement} target="_blank" rel="noopener noreferrer"
                       className="bg-orange-50 rounded-xl p-4 hover:bg-orange-100 transition-colors">
                      <span className="text-sm font-semibold text-gray-600">Bank Statement</span>
                      <p className="text-orange-600 font-medium mt-1 flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        View Document
                      </p>
                    </a>
                    {selectedOrganizer.gstCertificate && (
                      <a href={selectedOrganizer.gstCertificate} target="_blank" rel="noopener noreferrer"
                         className="bg-orange-50 rounded-xl p-4 hover:bg-orange-100 transition-colors">
                        <span className="text-sm font-semibold text-gray-600">GST Certificate</span>
                        <p className="text-orange-600 font-medium mt-1 flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          View Document
                        </p>
                      </a>
                    )}
                    {selectedOrganizer.organizationLicense && (
                      <a href={selectedOrganizer.organizationLicense} target="_blank" rel="noopener noreferrer"
                         className="bg-orange-50 rounded-xl p-4 hover:bg-orange-100 transition-colors">
                        <span className="text-sm font-semibold text-gray-600">Organization License</span>
                        <p className="text-orange-600 font-medium mt-1 flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          View Document
                        </p>
                      </a>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Briefcase className="h-5 w-5 mr-2 text-indigo-600" />
                    Additional Information
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Previous Experience</span>
                      <p className="text-gray-900 mt-2">{selectedOrganizer.previousExperience}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Expected Events Per Year</span>
                      <p className="text-gray-900 mt-2">{selectedOrganizer.expectedEventsPerYear}</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4">
                      <span className="text-sm font-semibold text-gray-600">Reason For Joining</span>
                      <p className="text-gray-900 mt-2">{selectedOrganizer.reasonForJoining}</p>
                    </div>
                  </div>
                </div>

                {/* Status Information */}
                {selectedOrganizer.approvedAt && (
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                          <span className="font-bold text-gray-900">Approved</span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Approval Date: {new Date(selectedOrganizer.approvedAt).toLocaleString()}
                        </p>
                      </div>
                      <span className="bg-green-100 text-green-800 text-sm font-bold px-4 py-2 rounded-full flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        ACTIVE
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-8 py-4 flex justify-end sticky bottom-0">
                <motion.button
                  onClick={() => setSelectedOrganizer(null)}
                  className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 font-semibold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApproval;
