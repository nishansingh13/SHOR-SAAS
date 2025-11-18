import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle, Clock, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';
import { useEvents } from '../../contexts/EventContext';

interface CheckInStats {
  totalTickets: number;
  checkedInTickets: number;
  validTickets: number;
  cancelledTickets: number;
  checkInRate: string;
  hourlyCheckIns: Record<string, number>;
}

const CheckInDashboard: React.FC = () => {
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState('');
  const [stats, setStats] = useState<CheckInStats | null>(null);
  const [loading, setLoading] = useState(false);
  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return { Authorization: `Bearer ${token}` };
  };

  useEffect(() => {
    if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  useEffect(() => {
    if (selectedEventId) {
      fetchStats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEventId]);

  const fetchStats = async () => {
    if (!selectedEventId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE}/tickets/event/${selectedEventId}/stats`,
        { headers: getAuthHeaders() }
      );
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Check-in Dashboard</h2>
            <p className="text-gray-600">Real-time event check-in monitoring</p>
          </div>
          <button
            onClick={fetchStats}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:bg-gray-300"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Event Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Event
          </label>
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.name} - {new Date(event.date).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Tickets</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.totalTickets}</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Users className="w-6 h-6 text-blue-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Checked In</p>
                  <p className="text-3xl font-bold text-green-900">{stats.checkedInTickets}</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Valid Tickets</p>
                  <p className="text-3xl font-bold text-yellow-900">{stats.validTickets}</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-700" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Check-in Rate</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.checkInRate}%</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-700" />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Event Details */}
        {selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-lg p-4 mb-6"
          >
            <h3 className="font-semibold text-gray-900 mb-2">Event Details</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-gray-600">Organizer:</span>
                <span className="ml-2 font-medium">{selectedEvent.organizer}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Hourly Check-ins Chart */}
        {stats && Object.keys(stats.hourlyCheckIns).length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-gray-50 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Check-ins (Last 24 Hours)</h3>
            </div>
            <div className="space-y-2">
              {Object.entries(stats.hourlyCheckIns)
                .sort(([a], [b]) => Number(a) - Number(b))
                .map(([hour, count]) => (
                  <div key={hour} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-16">
                      {String(hour).padStart(2, '0')}:00
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                      <div
                        className="bg-purple-600 h-full rounded-full flex items-center justify-end px-2"
                        style={{
                          width: `${Math.max((count / Math.max(...Object.values(stats.hourlyCheckIns))) * 100, 5)}%`,
                        }}
                      >
                        <span className="text-xs text-white font-medium">{count}</span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CheckInDashboard;
