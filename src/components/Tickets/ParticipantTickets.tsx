import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, QrCode, Ticket as TicketIcon, Calendar, MapPin, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { downloadTicketPDF } from '../../utils/ticketPdfGenerator';

interface Ticket {
  _id: string;
  ticketNumber: string;
  qrCode: string;
  status: string;
  ticketType: string;
  price: number;
  event: {
    _id: string;
    title: string;
    date: string;
    time: string;
    venue: string;
    eventType: string;
    onlineMeetingLink?: string;
    onlinePlatform?: string;
  };
  participant: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const ParticipantTickets: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      // In a real app, this would fetch tickets for the logged-in participant
      // For now, we'll show all tickets (this would need authentication)
      const participantId = localStorage.getItem('participantId');
      if (!participantId) {
        setTickets([]);
        return;
      }

      const response = await axios.get(`${API_BASE}/tickets/participant/${participantId}`);
      setTickets(response.data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTicket = async (ticket: Ticket) => {
    setDownloading(ticket._id);
    try {
      await downloadTicketPDF({
        ticketNumber: ticket.ticketNumber,
        participantName: ticket.participant.name,
        participantEmail: ticket.participant.email,
        eventTitle: ticket.event.title,
        eventDate: ticket.event.date,
        eventTime: ticket.event.time,
        eventVenue: ticket.event.venue,
        eventType: ticket.event.eventType,
        ticketType: ticket.ticketType,
        price: ticket.price,
        eventId: ticket.event._id,
        participantId: ticket.participant._id,
        onlineMeetingLink: ticket.event.onlineMeetingLink,
        onlinePlatform: ticket.event.onlinePlatform,
      });
      toast.success('Ticket downloaded successfully');
    } catch (error) {
      console.error('Error downloading ticket:', error);
      toast.error('Failed to download ticket');
    } finally {
      setDownloading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'bg-green-100 text-green-800';
      case 'used':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Tickets</h1>
        <p className="text-gray-600 mt-2">View and download your event tickets</p>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <TicketIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600">You haven't registered for any events yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((ticket) => (
            <motion.div
              key={ticket._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              {/* Ticket Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium opacity-90">TICKET</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{ticket.event.title}</h3>
                <p className="text-sm opacity-90 font-mono">{ticket.ticketNumber}</p>
              </div>

              {/* Ticket Body */}
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date
                    </div>
                    <p className="font-semibold text-gray-900">
                      {new Date(ticket.event.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center text-gray-600 text-sm mb-1">
                      <Clock className="w-4 h-4 mr-2" />
                      Time
                    </div>
                    <p className="font-semibold text-gray-900">{ticket.event.time}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-gray-600 text-sm mb-1">
                    <MapPin className="w-4 h-4 mr-2" />
                    {ticket.event.eventType === 'online' ? 'Platform' : 'Venue'}
                  </div>
                  <p className="font-semibold text-gray-900">
                    {ticket.event.eventType === 'online' && ticket.event.onlinePlatform
                      ? ticket.event.onlinePlatform
                      : ticket.event.venue}
                  </p>
                  {ticket.event.eventType === 'online' && ticket.event.onlineMeetingLink && (
                    <a
                      href={ticket.event.onlineMeetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Join Meeting →
                    </a>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div>
                    <p className="text-sm text-gray-600">Ticket Type</p>
                    <p className="font-semibold text-gray-900">{ticket.ticketType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Price</p>
                    <p className="font-semibold text-gray-900">₹{ticket.price}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => handleDownloadTicket(ticket)}
                    disabled={downloading === ticket._id}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:bg-gray-300"
                  >
                    {downloading === ticket._id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Downloading...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </button>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    <QrCode className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantTickets;
