import React, { useEffect, useMemo, useState } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants } from '../../contexts/ParticipantContext';

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

type BackendTicket = { name?: string; price?: number; _id?: string };
type BackendEvent = {
  _id?: string;
  id?: string;
  title?: string;
  name?: string;
  description?: string;
  image?: string;
  date?: string;
  venue?: string;
  time?: string;
  ticket?: BackendTicket[];
  volunteerCount?: number;
  volunteersApplied?: number;
  isTshirtAvailable?: boolean;
  participantCount?: number;
  status : string
};

function ParticipantPortal() {
  // Use contexts for better data integration

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
  const [publicEvents, setPublicEvents] = useState<EventItem[]>([]);
  const { registerParticipant } = useParticipants();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [ticketName, setTicketName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isVolunteer, setIsVolunteer] = useState(false);
  const [tshirtSize, setTshirtSize] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/events`);
        if (!res.ok) throw new Error('Failed to load events');
        const data = await res.json();
        console.log('Fetched events:', data);
        if (!Array.isArray(data)) throw new Error('Unexpected events payload');
        const mapped: EventItem[] = (data as BackendEvent[]).map((e) => ({
          id: (e._id || e.id || '') as string,
          name: (e.title || e.name || '') as string,
          description: e.description,
          image: e.image,
          date: e.date,
          venue: e.venue,
          time: e.time,
          ticket: Array.isArray(e.ticket) ? e.ticket.map((t) => ({ name: t.name || '', price: Number(t.price) || 0, _id: t._id })) : [],
          volunteerCount: e.volunteerCount,
          volunteersApplied: e.volunteersApplied,
          isTshirtAvailable: e.isTshirtAvailable,
          participantCount: e.participantCount,
          status : e.status
        }));
        setPublicEvents(mapped);
      } catch {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [API_BASE]);

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setTicketName('');
    setQuantity(1);
    setIsVolunteer(false);
    setTshirtSize('');
    setSubmitMsg('');
    setSubmitStatus('idle');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent) return;
    
    setSubmitMsg('');
    setSubmitStatus('loading');

    try {
      // Use the centralized registerParticipant method from context
      const result = await registerParticipant({
        eventId: selectedEvent.id,
        name,
        email,
        phone,
        ticketName,
        quantity,
        isVolunteer,
        tshirtSize: isVolunteer ? tshirtSize : undefined,
      });
      
 
      
      console.log('Registration result:', result);
      
      if (result.success) {
        setSubmitStatus('success');
        setSubmitMsg(result.message || 'Your registration was successful! Check your email for details.');
        setTimeout(() => {
          resetForm();
          setSelectedEvent(null);
        }, 3000);
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      console.error('Error registering:', err);
      setSubmitStatus('error');
      setSubmitMsg((err instanceof Error) ? err.message : 'Registration failed. Please try again later.');
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading events...</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Discover Events</span>
            </h1>
            <p className="mt-2 text-gray-600">Find and register for amazing events happening around you</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Events Grid */}
        <div className="space-y-6">
          {publicEvents.map((event) => (
            <div key={event.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="flex flex-col lg:flex-row">
                {/* Event Image */}
                <div className="lg:w-80 h-48 lg:h-auto bg-gray-100 flex-shrink-0">
                  {event.image ? (
                    <img 
                      src={event.image}
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
                      <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M9 11v6a1 1 0 001 1h4a1 1 0 001-1v-6M9 11V9a2 2 0 012-2h2a2 2 0 012 2v2M9 11H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between h-full">
                    <div className="flex-1">
                      {/* Event Title */}
                      <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.name}
                      </h2>

                      {/* Event Description */}
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.description || 'Join us for an amazing event experience!'}
                      </p>

                      {/* Event Meta Info */}
                      <div className="space-y-2 mb-4">
                        {event.date && (
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M9 11v6a1 1 0 001 1h4a1 1 0 001-1v-6M9 11V9a2 2 0 012-2h2a2 2 0 012 2v2M9 11H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
                            </svg>
                            <span className="font-medium">
                              {new Date(event.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            {event.time && <span className="ml-2">• {event.time}</span>}
                          </div>
                        )}
                        
                        {event.venue && (
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{event.venue}</span>
                          </div>
                        )}
                      </div>

                      {/* Ticket Price */}
                      {event.ticket && event.ticket.length > 0 && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Starting from </span>
                          <span className="text-lg font-semibold text-gray-900">
                            ₹{Math.min(...event.ticket.map(t => t.price))}
                          </span>
                        </div>
                      )}

                      {/* Participants Count */}
                      <div className="flex items-center text-sm text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                        </svg>
                        <span>{event.participantCount || 0} people registered</span>
                      </div>
                    </div>

                    {/* Register Button */}
                    <div className="mt-4 lg:mt-0 lg:ml-6 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => { 
                          setSelectedEvent(event); 
                          setTicketName(event.ticket?.[0]?.name || '');
                        }}
                        className="w-full lg:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                      >
                        Register Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {publicEvents.length === 0 && (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-6 0h6M9 11v6a1 1 0 001 1h4a1 1 0 001-1v-6M9 11V9a2 2 0 012-2h2a2 2 0 012 2v2M9 11H7a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-2" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
            <p className="text-gray-500">Check back later for upcoming events</p>
          </div>
        )}

        {/* Registration Modal */}
        {selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Event Registration</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedEvent.name}</p>
                  </div>
                  <button 
                    type="button"
                    className="text-gray-400 hover:text-gray-600 p-1"
                    onClick={() => { setSelectedEvent(null); resetForm(); }}
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="max-h-[calc(90vh-200px)] overflow-y-auto">
                <form onSubmit={handleSubmit} className="px-6 py-6">
                  <div className="space-y-4">
                    {/* Personal Information */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    {/* Ticket Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="ticket" className="block text-sm font-medium text-gray-700 mb-1">
                          Ticket Type *
                        </label>
                        <select
                          id="ticket"
                          name="ticket"
                          value={ticketName}
                          onChange={(e) => setTicketName(e.target.value)}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        >
                          <option value="">Select ticket</option>
                          {selectedEvent.ticket?.map((ticket) => (
                            <option key={ticket._id || ticket.name} value={ticket.name}>
                              {ticket.name} - ₹{ticket.price}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                          Quantity *
                        </label>
                        <input
                          type="number"
                          id="quantity"
                          name="quantity"
                          min="1"
                          value={quantity}
                          onChange={(e) => setQuantity(parseInt(e.target.value))}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Volunteer Section */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                      <div className="flex items-start">
                        <input
                          id="volunteer"
                          name="volunteer"
                          type="checkbox"
                          checked={isVolunteer}
                          onChange={(e) => setIsVolunteer(e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded mt-0.5"
                        />
                        <div className="ml-3">
                          <label htmlFor="volunteer" className="block text-sm font-medium text-gray-900">
                            Volunteer for this event
                          </label>
                          <p className="text-xs text-gray-600 mt-1">
                            Help make this event amazing and get exclusive volunteer perks!
                          </p>
                        </div>
                      </div>

                      {isVolunteer && selectedEvent.isTshirtAvailable && (
                        <div className="mt-3">
                          <label htmlFor="tshirt" className="block text-sm font-medium text-gray-700 mb-1">
                            T-shirt Size *
                          </label>
                          <select
                            id="tshirt"
                            name="tshirt"
                            value={tshirtSize}
                            onChange={(e) => setTshirtSize(e.target.value)}
                            required={isVolunteer}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                          >
                            <option value="">Select size</option>
                            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                              <option key={size} value={size}>{size}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Message */}
                  {submitMsg && (
                    <div className={`mt-4 p-3 rounded-md ${
                      submitStatus === 'success' 
                        ? 'bg-green-50 border border-green-200 text-green-700' 
                        : 'bg-red-50 border border-red-200 text-red-700'
                    }`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          {submitStatus === 'success' ? (
                            <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </div>
                        <p className="ml-3 text-sm">{submitMsg}</p>
                      </div>
                    </div>
                  )}
                </form>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setSelectedEvent(null); resetForm(); }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitStatus === 'loading' || submitStatus === 'success'}
                  className={`px-6 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 ${
                    (submitStatus === 'loading' || submitStatus === 'success') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Registered!
                    </>
                  ) : (
                    'Register Now'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ParticipantPortal;