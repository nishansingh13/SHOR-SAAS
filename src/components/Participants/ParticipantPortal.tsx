import React, { useEffect, useState } from 'react';
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
}

function ParticipantPortal() {
  // Use contexts for better data integration
  const { events, refreshEvents } = useEvents();
  const { registerParticipant } = useParticipants();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
//   console.log(selectedEvent);
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
        await refreshEvents();
      } catch {
        setError('Failed to load events');
      } finally {
        setLoading(false);
      }
    };
    loadEvents();
  }, [refreshEvents]);

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
      
      // Refresh events to update participant counts in UI
      await refreshEvents();
      
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
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="animate-pulse flex justify-center items-center h-40">
        <p className="text-gray-500">Loading events...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <p className="text-red-700">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Participate in Events
        </h1>
        <p className="mt-4 text-xl text-gray-500">
          Join our upcoming events and be part of something amazing
        </p>
      </div>

      {/* Events list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition transform hover:-translate-y-1 hover:shadow-lg">
            {event.image && (
              <div className="h-48 bg-gray-200 overflow-hidden">
                <img 
                  src={event.image}
                  alt={event.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900">{event.name}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">{event.description}</p>
              
              <div className="mt-4 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <time dateTime={event.date}>
                  {new Date(event.date || '').toLocaleDateString()}
                </time>
              </div>
              
              <div className="mt-1 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {event.venue}
              </div>
              
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {event.participantCount || 0} registered
                  </span>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => { 
                    setSelectedEvent(event); 
                    setTicketName(event.ticket?.[0]?.name || '');
                  }}
                >
                  Register
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {events.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No events available at the moment</p>
        </div>
      )}

      {/* Registration modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Register for {selectedEvent.name}</h2>
              <button 
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={() => { setSelectedEvent(null); resetForm(); }}
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="ticket" className="block text-sm font-medium text-gray-700">
                    Ticket Type
                  </label>
                  <select
                    id="ticket"
                    name="ticket"
                    value={ticketName}
                    onChange={(e) => setTicketName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="">Select a ticket</option>
                    {selectedEvent.ticket?.map((ticket) => (
                      <option key={ticket._id || ticket.name} value={ticket.name}>
                        {ticket.name} - ₹{ticket.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                    Quantity
                  </label>
                  <input
                    type="number"
                    id="quantity"
                    name="quantity"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value))}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="volunteer"
                    name="volunteer"
                    type="checkbox"
                    checked={isVolunteer}
                    onChange={(e) => setIsVolunteer(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="volunteer" className="ml-2 block text-sm text-gray-700">
                    I want to volunteer for this event
                  </label>
                </div>

                {isVolunteer && selectedEvent.isTshirtAvailable && (
                  <div>
                    <label htmlFor="tshirt" className="block text-sm font-medium text-gray-700">
                      T-shirt Size
                    </label>
                    <select
                      id="tshirt"
                      name="tshirt"
                      value={tshirtSize}
                      onChange={(e) => setTshirtSize(e.target.value)}
                      required={isVolunteer}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    >
                      <option value="">Select size</option>
                      {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {submitMsg && (
                <div className={`mt-4 p-3 rounded-md ${
                  submitStatus === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <p>{submitMsg}</p>
                </div>
              )}

              <div className="mt-6 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => { setSelectedEvent(null); resetForm(); }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitStatus === 'loading' || submitStatus === 'success'}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    (submitStatus === 'loading' || submitStatus === 'success') ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {submitStatus === 'loading' ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : submitStatus === 'success' ? (
                    <>
                      <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Registered!
                    </>
                  ) : "Submit Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParticipantPortal;