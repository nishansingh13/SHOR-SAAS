import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Clock, MapPin, User, Ticket as TicketIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Ticket {
  _id: string;
  ticketNumber: string;
  status: string;
  participant: {
    name: string;
    email: string;
    phone?: string;
  };
  event: {
    title: string;
    date: string;
    venue: string;
    time: string;
    eventType: string;
  };
  checkInTime?: string;
}

const TicketValidator: React.FC = () => {
  const [qrCode, setQrCode] = useState('');
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<'success' | 'error' | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  const validateTicket = async () => {
    if (!qrCode.trim()) {
      toast.error('Please enter a QR code');
      return;
    }

    setValidating(true);
    setValidationResult(null);
    setTicket(null);

    try {
      // Get current location if available
      let latitude, longitude;
      if (navigator.geolocation) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
          });
          latitude = position.coords.latitude;
          longitude = position.coords.longitude;
        } catch (error) {
          console.log('Location not available');
        }
      }

      const response = await axios.post(
        `${API_BASE}/tickets/validate`,
        { qrCode, latitude, longitude },
        { headers: getAuthHeaders() }
      );

      setTicket(response.data.ticket);
      setValidationResult('success');
      toast.success('Ticket validated successfully!');
    } catch (error: unknown) {
      console.error('Error validating ticket:', error);
      const errorMessage = (error as { response?: { data?: { error?: string } } }).response?.data?.error || 'Failed to validate ticket';
      toast.error(errorMessage);
      
      if ((error as { response?: { data?: { ticket?: Ticket } } }).response?.data?.ticket) {
        setTicket((error as { response: { data: { ticket: Ticket } } }).response.data.ticket);
      }
      setValidationResult('error');
    } finally {
      setValidating(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateTicket();
    }
  };

  const resetForm = () => {
    setQrCode('');
    setTicket(null);
    setValidationResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-100 rounded-lg">
            <QrCode className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Ticket Validator</h2>
            <p className="text-gray-600">Scan or enter QR code to validate tickets</p>
          </div>
        </div>

        {/* QR Code Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            QR Code Data
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Enter or scan QR code data"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              disabled={validating}
            />
            <button
              onClick={validateTicket}
              disabled={validating || !qrCode.trim()}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                validating || !qrCode.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              {validating ? 'Validating...' : 'Validate'}
            </button>
          </div>
        </div>

        {/* Validation Result */}
        {validationResult && ticket && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-lg border-2 ${
              validationResult === 'success'
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
            }`}
          >
            <div className="flex items-center gap-3 mb-4">
              {validationResult === 'success' ? (
                <>
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div>
                    <h3 className="text-xl font-bold text-green-900">Valid Ticket</h3>
                    <p className="text-green-700">Check-in successful</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <h3 className="text-xl font-bold text-red-900">Invalid Ticket</h3>
                    <p className="text-red-700">Ticket is {ticket.status}</p>
                  </div>
                </>
              )}
            </div>

            {/* Ticket Details */}
            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TicketIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Ticket Information</span>
                </div>
                <p className="font-mono text-lg font-bold text-gray-900 mb-1">
                  {ticket.ticketNumber}
                </p>
                <p className="text-sm text-gray-600">Status: {ticket.status}</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">Participant</span>
                </div>
                <p className="font-semibold text-gray-900">{ticket.participant.name}</p>
                <p className="text-sm text-gray-600">{ticket.participant.email}</p>
                {ticket.participant.phone && (
                  <p className="text-sm text-gray-600">{ticket.participant.phone}</p>
                )}
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <TicketIcon className="w-4 h-4" />
                  <span className="text-sm font-medium">Event</span>
                </div>
                <p className="font-semibold text-gray-900">{ticket.event.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(ticket.event.date).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">{ticket.event.time}</p>
              </div>

              <div className="bg-white rounded-lg p-4">
                <div className="flex items-center gap-2 text-gray-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm font-medium">Venue</span>
                </div>
                <p className="font-semibold text-gray-900">{ticket.event.venue}</p>
                <p className="text-sm text-gray-600 capitalize">{ticket.event.eventType} Event</p>
              </div>

              {ticket.checkInTime && (
                <div className="bg-white rounded-lg p-4 md:col-span-2">
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-medium">Check-in Time</span>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {new Date(ticket.checkInTime).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={resetForm}
              className="mt-4 w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Validate Another Ticket
            </button>
          </motion.div>
        )}

        {/* Instructions */}
        {!validationResult && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Scan the QR code from the participant's ticket using a QR scanner</li>
              <li>• Or manually enter the QR code data in the field above</li>
              <li>• Click "Validate" or press Enter to check the ticket</li>
              <li>• Green confirmation means the ticket is valid and check-in is successful</li>
              <li>• Red alert means the ticket has issues (already used, cancelled, or expired)</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketValidator;
