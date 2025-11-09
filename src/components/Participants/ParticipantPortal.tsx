import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Star, Award, Calendar, Filter, Search, X, CheckCircle, CreditCard, IndianRupee, Eye, ArrowLeft, Home } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useParticipants } from '../../contexts/ParticipantContext';
import { useEvents } from '../../contexts/EventContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import EventDetailPage from '../Events/EventDetailPage';

interface EventItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  date?: string;
  venue?: string;
  time?: string;
  ticket?: Array<{ name: string; price: number; _id?: string }>;
  volunteerCount?: number;
  volunteersApplied?: number;
  isTshirtAvailable?: boolean;
  participantCount?: number;
  status?: string;
}

interface FilterState {
  searchTerm: string;
  eventType: string;
  isFree: boolean;
  hasVolunteerPositions: boolean;
}

const ParticipantPortal: React.FC = () => {
  const navigate = useNavigate();
  const { registerParticipant , paymentSuccessEmail } = useParticipants();
  const { publicEvents } = useEvents();
  console.log('Public events in ParticipantPortal:', publicEvents);
  const { initiatePayment, loading: paymentLoading, error: paymentError, setError: setPaymentError } = useRazorpay();
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showEventDetail, setShowEventDetail] = useState(false);
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketName, setTicketName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tshirtSize, setTshirtSize] = useState('');
  
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    eventType: '',
    isFree: false,
    hasVolunteerPositions: false
  });

  const applyFilters = useCallback(() => {
    let filtered = publicEvents.filter((event) => 
      event.status === 'active' &&
      event.name.toLowerCase().includes(filters.searchTerm.toLowerCase())
    );

    if (filters.isFree) {
      filtered = filtered.filter((event) => 
        event.ticket && event.ticket.some((t) => t.price === 0)
      );
    }

    if (filters.hasVolunteerPositions) {
      filtered = filtered.filter((event) => 
        event.volunteerCount && event.volunteerCount > 0
      );
    }

    setFilteredEvents(filtered as EventItem[]);
  }, [publicEvents, filters]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const handleRegisterClick = (event: EventItem, asVolunteer: boolean = false) => {
    setSelectedEvent(event);
    setIsVolunteer(asVolunteer);
    setShowModal(true);
    setPaymentError(null);
  };

  const handleViewDetails = (event: EventItem) => {
    setDetailEvent(event);
    setShowEventDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowEventDetail(false);
    setDetailEvent(null);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setTicketName('');
    setQuantity(1);
    setTshirtSize('');
    setShowModal(false);
    setSelectedEvent(null);
    setIsVolunteer(false);
    setPaymentError(null);
    setLoading(false);
  };

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return false;
    }
    if (!isVolunteer && (!ticketName || !selectedEvent?.ticket?.find(t => t.name === ticketName))) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedEvent) return;

    setLoading(true);
    const baseParticipantData = {
      eventId: selectedEvent.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ticketName: isVolunteer ? 'volunteer' : ticketName,
      quantity: isVolunteer ? 1 : quantity,
      isVolunteer,
      tshirtSize: tshirtSize || undefined,
    };

    try {
      toast.loading('Checking registration status...', { id: 'checking' });
      
      const checkResponse = await fetch(`${API_BASE}/participants/check-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: baseParticipantData.email,
          eventId: selectedEvent.id
        }),
      });

      const checkData = await checkResponse.json();
      toast.dismiss('checking');
      
      if (checkData.exists) {
        setLoading(false);
        toast.error('You are already registered for this event!');
        return;
      }

      if (!isVolunteer && selectedEvent.ticket) {
        const ticketPrice = selectedEvent.ticket.find(t => t.name === ticketName)?.price || 0;
        
        if (ticketPrice > 0) {
          toast.loading('Preparing payment...', { id: 'payment' });
          
          try {
            await initiatePayment({
              amount: ticketPrice * quantity,
              eventId: selectedEvent.id,
              participantData: baseParticipantData,
              onSuccess: () => {
                toast.dismiss('payment');
                resetForm();
                paymentSuccessEmail(selectedEvent.name,email);
                toast.success('🎉 Payment successful! You have been registered for the event and confirmation email has been sent.');
                
              },
              onFailure: (error) => {
                toast.dismiss('payment');
                console.error('Payment failed:', error);
                toast.error(`Payment failed: ${error.message}`);
                setPaymentError(error.message);
              }
            });
          } catch (error: unknown) {
            toast.dismiss('payment');
            const errorMessage = error instanceof Error ? error.message : 'Failed to initiate payment. Please try again.';
            console.error('Payment initiation failed:', error);
            toast.error(errorMessage);
            setPaymentError(errorMessage);
          }
          
          return;
        } else {
          await registerParticipant(baseParticipantData);
          resetForm();
          toast.success('🎉 Registration successful!');
        }
      } else {
        await registerParticipant(baseParticipantData);
        resetForm();
        toast.success('🎉 Volunteer registration successful!');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {showEventDetail && detailEvent ? (
        <EventDetailPage event={detailEvent} onBack={handleBackFromDetail} />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-blue-700 rounded-xl p-8 text-white shadow-2xl relative">
          {/* Back button */}
          <motion.button
            onClick={() => navigate('/')}
            className="absolute top-4 left-4 flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition-all duration-300"
            whileHover={{ scale: 1.05, x: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
          </motion.button>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-4"
          >
            <Award className="h-12 w-12 mr-3" />
            <h1 className="text-4xl font-bold">SETU Events Portal</h1>
          </motion.div>
          <p className="text-xl text-emerald-100">Discover and register for exciting events</p>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white p-6 rounded-xl shadow-lg mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.searchTerm}
              onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isFree}
                onChange={(e) => setFilters(prev => ({ ...prev, isFree: e.target.checked }))}
                className="mr-2 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">Free Events</span>
            </label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-gray-500" />
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.hasVolunteerPositions}
                onChange={(e) => setFilters(prev => ({ ...prev, hasVolunteerPositions: e.target.checked }))}
                className="mr-2 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-sm font-medium text-gray-700">Volunteer Opportunities</span>
            </label>
          </div>
        </div>
      </motion.div>

      {/* Events Grid */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
          >
            {/* Event Image */}
            <div className="relative h-48 bg-gradient-to-br from-emerald-400 to-blue-600">
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className="h-16 w-16 text-white opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all duration-300" />
            </div>

            {/* Event Content */}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {event.name}
              </h3>
              
              {event.description && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {event.description}
                </p>
              )}

              {/* Event Details */}
              <div className="space-y-2 mb-4">
                {event.date && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                    {event.date}
                  </div>
                )}
                
                {event.venue && (
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    {event.venue}
                  </div>
                )}
                
                {event.participantCount !== undefined && event.participantCount > 0 && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-emerald-600" />
                    {event.participantCount} registered
                  </div>
                )}
              </div>

              {/* Ticket Info */}
              {event.ticket && event.ticket.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Available Tickets:</div>
                  <div className="space-y-1">
                    {event.ticket.map((ticket, idx) => (
                      <div key={idx} className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">{ticket.name}</span>
                        <span className="font-semibold text-emerald-700">
                          {ticket.price === 0 ? 'Free' : `₹${ticket.price}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleViewDetails(event)}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRegisterClick(event, false)}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 shadow-lg"
                >
                  Register
                </motion.button>
                
                {event.volunteerCount !== undefined && event.volunteerCount > 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRegisterClick(event, true)}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 shadow-lg"
                  >
                    Volunteer
                  </motion.button>
                ) : null}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Registration Modal */}
      {showModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">
                    {isVolunteer ? 'Volunteer Registration' : 'Event Registration'}
                  </h2>
                  <p className="text-emerald-100 mt-1">{selectedEvent.name}</p>
                </div>
                <button
                  onClick={resetForm}
                  className="text-white hover:text-emerald-200 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Personal Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-emerald-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      placeholder="Enter your email"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  
                  {selectedEvent?.isTshirtAvailable && (
                    <div>
                      <label htmlFor="tshirtSize" className="block text-sm font-medium text-gray-700 mb-2">
                        T-shirt Size
                      </label>
                      <select
                        id="tshirtSize"
                        name="tshirtSize"
                        value={tshirtSize}
                        onChange={(e) => setTshirtSize(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select size (optional)</option>
                        <option value="XS">XS</option>
                        <option value="S">S</option>
                        <option value="M">M</option>
                        <option value="L">L</option>
                        <option value="XL">XL</option>
                        <option value="XXL">XXL</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Selection (for non-volunteers) */}
              {!isVolunteer && selectedEvent.ticket && selectedEvent.ticket.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 mr-2 text-emerald-600" />
                    Ticket Selection
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="ticketType" className="block text-sm font-medium text-gray-700 mb-2">
                        Ticket Type *
                      </label>
                      <select
                        id="ticketType"
                        name="ticketType"
                        value={ticketName}
                        onChange={(e) => setTicketName(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                      >
                        <option value="">Select ticket type</option>
                        {selectedEvent.ticket.map((ticket, idx) => (
                          <option key={idx} value={ticket.name}>
                            {ticket.name} - {ticket.price === 0 ? 'Free' : `₹${ticket.price}`}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <input
                        type="number"
                        id="quantity"
                        name="quantity"
                        min="1"
                        max="10"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value))}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
                        placeholder="Number of tickets"
                      />
                    </div>
                  </div>

                  {/* Payment Summary */}
                  {ticketName && selectedEvent.ticket && (
                    <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
                          <span className="font-bold text-gray-900">Payment Summary</span>
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="h-5 w-5 text-emerald-600 mr-1" />
                          <span className="text-2xl font-bold text-emerald-700">
                            {(selectedEvent.ticket.find(t => t.name === ticketName)?.price || 0) * quantity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{ticketName} × {quantity}</span>
                          <span className="font-medium">₹{(selectedEvent.ticket.find(t => t.name === ticketName)?.price || 0) * quantity}</span>
                        </div>
                        
                        {(selectedEvent.ticket.find(t => t.name === ticketName)?.price || 0) > 0 && !isVolunteer ? (
                          <div className="pt-2 border-t border-emerald-200">
                            <div className="flex items-center text-emerald-700 font-medium">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Secure payment via Razorpay
                            </div>
                          </div>
                        ) : (
                          <div className="pt-2 border-t border-emerald-200">
                            <div className="flex items-center text-emerald-700 font-medium">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              {isVolunteer ? 'Volunteer registration - No payment required' : 'Free registration'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error Display */}
              {paymentError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-700 text-sm">{paymentError}</p>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading || paymentLoading || !validateForm()}
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading || paymentLoading
                    ? 'Processing...'
                    : isVolunteer
                    ? 'Register as Volunteer'
                    : ticketName && selectedEvent.ticket?.find(t => t.name === ticketName)?.price === 0
                    ? 'Register for Free'
                    : 'Proceed to Payment'
                  }
                </motion.button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
          <p className="mt-2 text-gray-600">Loading events...</p>
        </div>
      )}

      {/* No Events State */}
      {!loading && filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Events Found</h3>
          <p className="text-gray-600">Try adjusting your filters or check back later for new events.</p>
        </div>
      )}
      
      {/* Toast Notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#fff',
            color: '#374151',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#059669',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#dc2626',
              secondary: '#fff',
            },
          },
        }}
      />
        </div>
      )}
    </>
  );
};

export default ParticipantPortal;
