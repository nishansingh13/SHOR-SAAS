import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuth } from '../../contexts/AuthContext';
import useAdmin from '../../contexts/useAdmin';
import { useEmail } from '../../contexts/EmailContext';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Calendar, 
  Mail, 
  Building, 
  UserCheck, 
  CalendarCheck,
  Shield
} from 'lucide-react';

type RequestFromAdmin = {
  _id?: string;
  id?: string;
  email: string;
  name: string;
  GSTIN?: string;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
};

type EventRecord = { _id?: string; id?: string; title?: string; name?: string; organiser?: string; organiserId?: string };

const AdminApproval: React.FC = () => {
  const { user } = useAuth();
  const { approveOrganizer, approveEvent, fetchPendingOrganizers, fetchPendingEvents } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [organizers, setOrganizers] = useState<RequestFromAdmin[]>([]);
  const [events, setEvents] = useState<unknown[]>([]);
  const [error, setError] = useState<string | null>(null);
  const {sendEventApprovedNotificationMail} = useEmail();

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // Calculate statistics
  const totalPendingApprovals = organizers.length + events.length;
  const pendingOrganizers = organizers.length;
  const pendingEvents = events.length;

  useEffect(() => {
  const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [orgData, evtData] = await Promise.all([
          fetchPendingOrganizers(),
          fetchPendingEvents(),
        ]);
    setOrganizers(orgData || []);
    setEvents((evtData as unknown[] | undefined) || []);
      } catch (err: unknown) {
        console.error('Failed to load approvals', err);
        const message = err instanceof Error ? err.message : String(err);
        setError(message || 'Failed to load approvals');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fetchPendingOrganizers, fetchPendingEvents]);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                  <h3 className="font-bold text-gray-900">{org.name}</h3>
                                  <div className="flex items-center text-sm text-gray-600">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {org.email}
                                  </div>
                                </div>
                              </div>
                              
                              {org.GSTIN && (
                                <div className="mb-3">
                                  <span className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full">
                                    GSTIN: {org.GSTIN}
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
      </div>
    </div>
  );
};

export default AdminApproval;
