import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useEvents } from '../../contexts/EventContext';
import { useAuth } from '../../contexts/AuthContext';
import type { Event as AppEvent } from '../../contexts/EventContext';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Calendar, 
  Users, 
  Award,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Activity
} from 'lucide-react';
import { useParticipants } from '../../contexts/ParticipantContext';

const EventManagement: React.FC = () => {
  const { events, createEvent, updateEvent, deleteEvent, refreshEvents, getRawEventById } = useEvents();
  const { user } = useAuth();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const FALLBACK_IMAGE = import.meta.env.VITE_FALLBACK_EVENT_IMAGE || '';
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<AppEvent | null>(null);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const {participants} = useParticipants();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image: '',
    date: '',
    venue: '',
    time: '',
    ticket: [{ name: '', price: 0 } as { name: string; price: number }],
    volunteerCount: 0,
    isTshirtAvailable: true,
  });

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // Calculate statistics
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const completedEvents = events.filter(e => e.status === 'completed').length;
  const totalParticipants = participants.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError('');

    if (uploading) {
      setError('Please wait for the image upload to finish');
      return;
    }

    if (!formData.image && !FALLBACK_IMAGE) {
      setError('Please upload an image for the event');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description,
  image: formData.image || FALLBACK_IMAGE,
      date: formData.date,
      venue: formData.venue,
      time: formData.time,
      ticket: formData.ticket,
      volunteerCount: formData.volunteerCount,
      isTshirtAvailable: formData.isTshirtAvailable,
      organiserId: user?.id 
    };

    if (editingEvent) {
      const mapped = {
        name: formData.title,
        description: formData.description,
        date: formData.date,
        status: 'draft' as const,
        organizer: user?.name || '',
      };
      try {
        await updateEvent(editingEvent.id, mapped, payload);
      } catch {
        setError('Failed to update event');
      }
      setEditingEvent(null);
    } else {
      try {
        const token = localStorage.getItem('token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(`${API_BASE}/events`, {
          method: 'POST',
          headers,
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create event');
        await refreshEvents();
      } catch (err) {
        console.error(err);
        setError('Failed to create event');
        // Fallback to local add so UI isn’t blocked
        const mapped = {
          name: formData.title,
          description: formData.description,
          date: formData.date,
          status: 'draft' as const,
          organizer: user?.name || '',
        };
        createEvent(mapped);
      }
    }

    setFormData({
      title: '',
      description: '',
      image: '',
      date: '',
      venue: '',
      time: '',
      ticket: [{ name: '', price: 0 }],
      volunteerCount: 0,
      isTshirtAvailable: true,
    });
    setShowCreateModal(false);
  };

  const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const CLOUDINARY_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  const handleFileChange = async (file?: File | null) => {
    if (!file) return;
    if (!CLOUDINARY_CLOUD || !CLOUDINARY_PRESET) {
      setError('Cloudinary not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET.');
      return;
    }

    try {
      setError('');
      setUploading(true);

      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', CLOUDINARY_PRESET);

      // Use fetch; Cloudinary supports unsigned uploads with upload_preset
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD}/image/upload`;
      const res = await fetch(url, {
        method: 'POST',
        body: fd,
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload failed: ${res.status} ${txt}`);
      }

      const json = await res.json();
      // Cloudinary returns secure_url (prefer) and url
      const imageUrl = json.secure_url || json.url || '';
      console.log(imageUrl);
      if (!imageUrl) throw new Error('No URL returned from Cloudinary');

  setFormData((prev) => ({ ...prev, image: imageUrl }));
    } catch (err: unknown) {
      console.error('Cloudinary upload error', err);
      const message = typeof err === 'string' ? err : (err instanceof Error ? err.message : 'Upload failed');
      setError(message);
    } finally {
      setUploading(false);
    }
  };


  const handleEdit = (event: AppEvent) => {
    setEditingEvent(event);
    const raw = getRawEventById(event.id);

    const dateVal = raw?.date ?? event.date;
    let dateForInput = '';
    if (dateVal) {
      const iso = new Date(typeof dateVal === 'string' || dateVal instanceof Date ? dateVal : String(dateVal)).toISOString();
      dateForInput = iso.slice(0, 10);
    }

    setFormData({
      title: (raw?.title ?? event.name) || '',
      description: (raw?.description ?? event.description) || '',
      image: raw?.image ?? '',
      date: dateForInput,
      venue: raw?.venue ?? '',
      time: raw?.time ?? '',
      ticket: raw?.ticket && raw.ticket.length > 0
        ? raw.ticket.map(t => ({ name: t.name || '', price: Number(t.price) || 0 }))
        : [{ name: '', price: 0 }],
      volunteerCount: typeof raw?.volunteerCount === 'number' ? raw.volunteerCount : 0,
      isTshirtAvailable: typeof raw?.isTshirtAvailable === 'boolean' ? raw.isTshirtAvailable : true,
    });
    setShowCreateModal(true);
  };

  const handleCancel = () => {
    setShowCreateModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      image: '',
      date: '',
      venue: '',
      time: '',
      ticket: [{ name: '', price: 0 }],
      volunteerCount: 0,
      isTshirtAvailable: true,
    });
  };

  const getStatusIcon = (status: string) => {
      console.log(status);
    switch (status) {
    
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'completed':
        return <Award className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const addTicket = () => {
    setFormData((prev) => ({ ...prev, ticket: [...prev.ticket, { name: '', price: 0 }] }));
  };

  const removeTicket = (index: number) => {
    setFormData((prev) => ({ ...prev, ticket: prev.ticket.filter((_, i) => i !== index) }));
  };

  const updateTicket = (index: number, field: 'name' | 'price', value: string) => {
    setFormData((prev) => ({
      ...prev,
      ticket: prev.ticket.map((t, i) =>
        i === index ? { ...t, [field]: field === 'price' ? Number(value) : value.toUpperCase() } : t
      ),
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      {/* SETU Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-700 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Event Management</h1>
                  <p className="text-emerald-100 text-sm">SETU Certificate Platform</p>
                </div>
              </motion.div>
              <motion.p 
                className="text-blue-100 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Create, manage, and track your educational programs and certification events
              </motion.p>
            </div>
            
            <motion.button
              onClick={() => setShowCreateModal(true)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center font-medium shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Plus className="h-5 w-5 mr-2" />
              Create Event
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          data-aos="fade-up"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalEvents}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Total Events</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">All Programs</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{activeEvents}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Active Events</p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Currently Running</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{completedEvents}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Completed Events</p>
            <p className="text-xs text-purple-600 mt-2 font-medium">Successfully Finished</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalParticipants}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Total Participants</p>
            <p className="text-xs text-amber-600 mt-2 font-medium">Across All Events</p>
          </motion.div>
        </motion.div>

        {/* Events Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          data-aos="fade-up"
          data-aos-delay="200"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          {events.length > 0 ? events.map((event, index) => (
            <motion.div 
              key={event.id} 
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + (index * 0.1), duration: 0.6 }}
              whileHover={{ y: -8, scale: 1.02 }}
            >
              {/* Event Status Banner */}
              <div className={`h-2 ${
                event.status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-green-600' : ''
              }${event.status === 'draft' ? 'bg-gradient-to-r from-amber-500 to-yellow-600' : ''}${
                event.status === 'completed' ? 'bg-gradient-to-r from-blue-500 to-purple-600' : ''
              }`} />
              
              <div className="p-6">
                {/* Header with Status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    {getStatusIcon(event.status)}
                    <span className={`
                      ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''}
                      ${event.status === 'draft' ? 'bg-amber-100 text-amber-800' : ''}
                      ${event.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <motion.button
                      onClick={() => handleEdit(event)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit3 className="h-4 w-4" />
                    </motion.button>
                    <motion.button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Event Content */}
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-700 transition-colors">
                    {event.name}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                    {event.description}
                  </p>
                </div>

                {/* Event Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-emerald-600" />
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-3 text-blue-600" />
                    <span className="font-medium">{event.participantCount || 0} participants enrolled</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Award className="h-4 w-4 mr-3 text-purple-600" />
                    <span className="font-medium">{event.certificatesGenerated || 0} certificates issued</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">
                      by <span className="font-medium text-gray-700">{event.organizer}</span>
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="h-3 w-3 mr-1" />
                      {new Date(event.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <motion.div 
              className="col-span-full"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="h-20 w-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Events Yet</h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first educational program or certification event
                </p>
                <motion.button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 flex items-center mx-auto font-medium shadow-lg"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Event
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && handleCancel()}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      {editingEvent ? <Edit3 className="h-5 w-5 text-white" /> : <Plus className="h-5 w-5 text-white" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        {editingEvent ? 'Edit Event' : 'Create New Event'}
                      </h2>
                      <p className="text-emerald-100 text-sm">SETU Certificate Platform</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={handleCancel}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </div>
              </div>

              <div className="p-8">
                {error && (
                  <motion.div 
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    role="alert"
                  >
                    <AlertCircle className="h-5 w-5 mr-3 text-red-500" />
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Event Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      placeholder="Enter event title"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Description
                    </label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none"
                      placeholder="Describe your event and learning objectives"
                    />
                  </div>

                  {/* Event Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Event Image
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Calendar className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="mb-2 text-sm text-gray-500">
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 5MB)</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                            className="hidden"
                            aria-label="Upload event image"
                          />
                        </label>
                      </div>

                      {uploading && (
                        <motion.div 
                          className="flex items-center justify-center p-4 bg-emerald-50 rounded-xl"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-emerald-600 mr-3"></div>
                          <span className="text-emerald-700 font-medium">Uploading image...</span>
                        </motion.div>
                      )}

                      {(formData.image || FALLBACK_IMAGE) && (
                        <motion.div 
                          className="relative"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p className="text-xs font-medium text-gray-700 mb-2">Preview</p>
                          <img 
                            src={formData.image || FALLBACK_IMAGE} 
                            alt="event preview" 
                            className="h-32 w-full object-cover rounded-xl border border-gray-200 shadow-sm" 
                          />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Date, Time, Venue */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Time
                      </label>
                      <input
                        type="time"
                        required
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Venue
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.venue}
                        onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="Enter venue"
                      />
                    </div>
                  </div>

                  {/* Tickets Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-800">
                        Event Tickets
                      </label>
                      <motion.button
                        type="button"
                        onClick={addTicket}
                        className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add Ticket Type
                      </motion.button>
                    </div>

                    <div className="space-y-4">
                      {formData.ticket.map((ticket, index) => (
                        <motion.div 
                          key={index} 
                          className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="grid grid-cols-12 gap-3 items-end">
                            <div className="col-span-7">
                              <label className="block text-xs font-medium text-gray-700 mb-2">Ticket Name</label>
                              <input
                                type="text"
                                required
                                value={ticket.name}
                                onChange={(e) => updateTicket(index, 'name', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                placeholder="GENERAL / VIP / STUDENT"
                              />
                            </div>
                            <div className="col-span-4">
                              <label className="block text-xs font-medium text-gray-700 mb-2">Price (₹)</label>
                              <input
                                type="number"
                                min={0}
                                step="0.01"
                                required
                                value={ticket.price}
                                onChange={(e) => updateTicket(index, 'price', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                                placeholder="0.00"
                              />
                            </div>
                            <div className="col-span-1 flex justify-center">
                              {formData.ticket.length > 1 && (
                                <motion.button
                                  type="button"
                                  onClick={() => removeTicket(index)}
                                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  aria-label="Remove ticket"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Additional Settings */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Volunteer Count
                      </label>
                      <input
                        type="number"
                        min={0}
                        required
                        value={formData.volunteerCount}
                        onChange={(e) => setFormData({ ...formData, volunteerCount: Number(e.target.value) })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                        placeholder="0"
                      />
                    </div>
                    <div className="flex items-center pt-8">
                      <div className="flex items-center">
                        <input
                          id="tshirt"
                          type="checkbox"
                          checked={formData.isTshirtAvailable}
                          onChange={(e) => setFormData({ ...formData, isTshirtAvailable: e.target.checked })}
                          className="h-5 w-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <label htmlFor="tshirt" className="ml-3 text-sm font-medium text-gray-700">
                          Event T-Shirt Available
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <motion.button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-medium"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="submit"
                      disabled={uploading}
                      className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-700 text-white rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {uploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          {editingEvent ? <Edit3 className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                          {editingEvent ? 'Update Event' : 'Create Event'}
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EventManagement;