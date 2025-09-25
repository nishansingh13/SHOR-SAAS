import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Star, 
  Award, 
  CheckCircle, 
  CreditCard, 
  IndianRupee,
  UserCheck,
  Share2,
  X
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useParticipants } from '../../contexts/ParticipantContext';
import { useRazorpay } from '../../hooks/useRazorpay';
import LocationMap from './LocationMap';

interface EventDetailProps {
  event: {
    id: string;
    name: string;
    description?: string;
    image?: string;
    date?: string;
    venue?: string;
    venueDetails?: {
      name: string;
      address: string;
      city: string;
      coordinates: { lat: number; lng: number };
    };
    time?: string;
    ticket?: Array<{ name: string; price: number; _id?: string }>;
    volunteerCount?: number;
    volunteersApplied?: number;
    isTshirtAvailable?: boolean;
    participantCount?: number;
    status?: string;
  };
  onBack: () => void;
}

const EventDetailPage: React.FC<EventDetailProps> = ({ event, onBack }) => {
  const { registerParticipant, paymentSuccessEmail } = useParticipants();
  const { initiatePayment, loading: paymentLoading, error: paymentError, setError: setPaymentError } = useRazorpay();
  
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://shor-saas.onrender.com/api';
  
  const [showModal, setShowModal] = useState(false);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Registration form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketName, setTicketName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [tshirtSize, setTshirtSize] = useState('');

  const handleRegisterClick = (asVolunteer: boolean = false) => {
    setIsVolunteer(asVolunteer);
    setShowModal(true);
    setPaymentError(null);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setTicketName('');
    setQuantity(1);
    setTshirtSize('');
    setShowModal(false);
    setIsVolunteer(false);
    setPaymentError(null);
    setLoading(false);
  };

  const validateForm = () => {
    if (!name.trim() || !email.trim() || !phone.trim()) {
      return false;
    }
    if (!isVolunteer && (!ticketName || !event?.ticket?.find(t => t.name === ticketName))) {
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !event) return;

    setLoading(true);
    const baseParticipantData = {
      eventId: event.id,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      ticketName: isVolunteer ? 'volunteer' : ticketName,
      quantity: isVolunteer ? 1 : quantity,
      isVolunteer,
      tshirtSize: tshirtSize || undefined,
    };

    try {
      // First, check if participant is already registered for this event
      toast.loading('Checking registration status...', { id: 'checking' });
      
      const checkResponse = await fetch(`${API_BASE}/participants/check-duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: baseParticipantData.email,
          eventId: event.id
        }),
      });

      const checkData = await checkResponse.json();
      toast.dismiss('checking');
      
      if (checkData.exists) {
        setLoading(false);
        toast.error('You are already registered for this event!');
        return;
      }

      if (!isVolunteer && event.ticket) {
        const ticketPrice = event.ticket.find(t => t.name === ticketName)?.price || 0;
        
        if (ticketPrice > 0) {
          // Handle paid registration with Razorpay
          toast.loading('Preparing payment...', { id: 'payment' });
          
          try {
            await initiatePayment({
              amount: ticketPrice * quantity,
              eventId: event.id,
              participantData: baseParticipantData,
              onSuccess: () => {
                toast.dismiss('payment');
                resetForm();
                paymentSuccessEmail(event.name, email);
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
          // Handle free registration
          await registerParticipant(baseParticipantData);
          resetForm();
          toast.success('🎉 Registration successful!');
        }
      } else {
        // Handle volunteer registration
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

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.name,
        text: event.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header with Back Button */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white p-6"
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-emerald-100 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Events
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
              <p className="text-emerald-100 text-lg">Detailed Event Information</p>
            </div>
            
            <button
              onClick={handleShare}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-lg transition-colors"
            >
              <Share2 className="h-6 w-6" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Event Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="relative h-96 bg-gradient-to-br from-emerald-400 to-blue-600 rounded-xl overflow-hidden shadow-2xl"
            >
              {event.image ? (
                <img 
                  src={event.image} 
                  alt={event.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Award className="h-24 w-24 text-white opacity-80" />
                </div>
              )}
              <div className="absolute inset-0 bg-black bg-opacity-20" />
              
              {/* Event Status Badge */}
              <div className="absolute top-4 left-4">
                <span className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Active Event
                </span>
              </div>
            </motion.div>

            {/* Event Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <Award className="h-6 w-6 mr-3 text-emerald-600" />
                About This Event
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed">
                {event.description || 'Join us for an exciting event that promises to be educational, engaging, and memorable. Don\'t miss out on this opportunity to learn, network, and grow!'}
              </p>
            </motion.div>

            {/* Event Statistics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Users className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">{event.participantCount || 0}</h3>
                <p className="text-gray-600">Registered Participants</p>
              </div>
              
              {event.volunteerCount && event.volunteerCount > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <UserCheck className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                  <h3 className="text-2xl font-bold text-gray-900">
                    {event.volunteersApplied || 0}/{event.volunteerCount}
                  </h3>
                  <p className="text-gray-600">Volunteers</p>
                </div>
              )}
              
              <div className="bg-white rounded-xl shadow-lg p-6 text-center">
                <Star className="h-12 w-12 text-yellow-500 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-gray-900">
                  {event.ticket?.length || 0}
                </h3>
                <p className="text-gray-600">Ticket Types</p>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Calendar className="h-6 w-6 mr-2 text-emerald-600" />
                Event Details
              </h3>
              
              <div className="space-y-4">
                {event.date && (
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-emerald-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Date</p>
                      <p className="font-semibold text-gray-900">{new Date(event.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                
                {event.time && (
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 text-emerald-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Time</p>
                      <p className="font-semibold text-gray-900">{event.time}</p>
                    </div>
                  </div>
                )}
                
                {event.venue && (
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-emerald-600 mr-3 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Venue</p>
                      <p className="font-semibold text-gray-900">{event.venue}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-start">
                  <Users className="h-5 w-5 text-emerald-600 mr-3 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Registered</p>
                    <p className="font-semibold text-gray-900">{event.participantCount || 0} participants</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Tickets Card */}
            {event.ticket && event.ticket.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <Star className="h-6 w-6 mr-2 text-emerald-600" />
                  Available Tickets
                </h3>
                
                <div className="space-y-3">
                  {event.ticket.map((ticket, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:border-emerald-300 transition-colors">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-900">{ticket.name}</h4>
                          <p className="text-sm text-gray-500">Per person</p>
                        </div>
                        <div className="text-right">
                          {ticket.price === 0 ? (
                            <span className="text-2xl font-bold text-emerald-600">Free</span>
                          ) : (
                            <div className="flex items-center">
                              <IndianRupee className="h-5 w-5 text-emerald-600" />
                              <span className="text-2xl font-bold text-emerald-600">{ticket.price}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Location Map */}
            {event.venue && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <LocationMap venue={event.venue} venueDetails={event.venueDetails} />
              </motion.div>
            )}

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleRegisterClick(false)}
                className="w-full bg-gradient-to-r from-emerald-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 shadow-lg flex items-center justify-center"
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                Register for Event
              </motion.button>
              
              {event.volunteerCount && event.volunteerCount > 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRegisterClick(true)}
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 shadow-lg flex items-center justify-center"
                >
                  <UserCheck className="h-6 w-6 mr-2" />
                  Volunteer ({event.volunteersApplied || 0}/{event.volunteerCount})
                </motion.button>
              )}
              
              <button
                onClick={handleShare}
                className="w-full border-2 border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all duration-300 flex items-center justify-center"
              >
                <Share2 className="h-5 w-5 mr-2" />
                Share Event
              </button>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Registration Modal */}
      {showModal && (
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
                  <p className="text-emerald-100 mt-1">{event.name}</p>
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
                  
                  {event?.isTshirtAvailable && (
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
              {!isVolunteer && event.ticket && event.ticket.length > 0 && (
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
                        {event.ticket.map((ticket, idx) => (
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
                  {ticketName && event.ticket && (
                    <div className="mt-6 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <CreditCard className="h-5 w-5 text-emerald-600 mr-2" />
                          <span className="font-bold text-gray-900">Payment Summary</span>
                        </div>
                        <div className="flex items-center">
                          <IndianRupee className="h-5 w-5 text-emerald-600 mr-1" />
                          <span className="text-2xl font-bold text-emerald-700">
                            {(event.ticket.find(t => t.name === ticketName)?.price || 0) * quantity}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">{ticketName} × {quantity}</span>
                          <span className="font-medium">₹{(event.ticket.find(t => t.name === ticketName)?.price || 0) * quantity}</span>
                        </div>
                        
                        {(event.ticket.find(t => t.name === ticketName)?.price || 0) > 0 && !isVolunteer ? (
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
                    : ticketName && event.ticket?.find(t => t.name === ticketName)?.price === 0
                    ? 'Register for Free'
                    : 'Proceed to Payment'
                  }
                </motion.button>
              </div>
            </form>
          </motion.div>
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
  );
};

export default EventDetailPage;
