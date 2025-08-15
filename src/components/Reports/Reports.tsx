import React, { useState } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants } from '../../contexts/ParticipantContext';
import { useTemplates } from '../../contexts/TemplateContext';
import { 
  BarChart3, 
  TrendingUp, 
  Download, 
  Calendar,
  Users,
  Award,
  Mail,
  Filter
} from 'lucide-react';

const Reports: React.FC = () => {
  const { events } = useEvents();
  const { participants } = useParticipants();
  const { templates } = useTemplates();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedEvent, setSelectedEvent] = useState('all');

  // Calculate statistics
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const totalParticipants = participants.length;
  const certificatesGenerated = participants.filter(p => p.certificateGenerated).length;
  const emailsSent = participants.filter(p => p.emailSent).length;
  const successRate = totalParticipants > 0 ? Math.round((certificatesGenerated / totalParticipants) * 100) : 0;
  const emailDeliveryRate = certificatesGenerated > 0 ? Math.round((emailsSent / certificatesGenerated) * 100) : 0;

  // Event performance data
  const eventPerformance = events.map(event => {
    const eventParticipants = participants.filter(p => p.eventId === event.id);
    const eventCertificates = eventParticipants.filter(p => p.certificateGenerated).length;
    const eventEmails = eventParticipants.filter(p => p.emailSent).length;
    
    return {
      ...event,
      participantCount: eventParticipants.length,
      certificateCount: eventCertificates,
      emailCount: eventEmails,
      completionRate: eventParticipants.length > 0 ? Math.round((eventCertificates / eventParticipants.length) * 100) : 0,
      emailRate: eventCertificates > 0 ? Math.round((eventEmails / eventCertificates) * 100) : 0
    };
  });

  // Generate chart data (mock data for visualization)
  const chartData = [
    { month: 'Jan', certificates: 45, emails: 42 },
    { month: 'Feb', certificates: 78, emails: 75 },
    { month: 'Mar', certificates: 92, emails: 88 },
    { month: 'Apr', certificates: 67, emails: 64 },
    { month: 'May', certificates: 123, emails: 118 },
    { month: 'Jun', certificates: 156, emails: 151 }
  ];

  const downloadReport = (type: 'csv' | 'pdf') => {
    // In a real application, this would generate and download the actual report
    console.log(`Downloading ${type.toUpperCase()} report...`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600">Track performance and generate detailed reports</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => downloadReport('csv')}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors duration-200 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </button>
          <button
            onClick={() => downloadReport('pdf')}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
              <option value="365">Last year</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Filter
            </label>
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Events</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200">
              <Filter className="h-4 w-4 mr-2" />
              Advanced Filters
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+12% vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">{totalParticipants}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+18% vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Certificates Generated</p>
              <p className="text-2xl font-bold text-gray-900">{certificatesGenerated}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+23% vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Award className="h-6 w-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-2xl font-bold text-gray-900">{emailsSent}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+8% vs last month</span>
              </div>
            </div>
            <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Mail className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Certificate Success Rate</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${successRate * 3.14} ${314 - successRate * 3.14}`}
                  className="text-emerald-600"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-emerald-600">{successRate}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {certificatesGenerated} of {totalParticipants} participants
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Delivery Rate</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${emailDeliveryRate * 3.14} ${314 - emailDeliveryRate * 3.14}`}
                  className="text-blue-600"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-blue-600">{emailDeliveryRate}%</span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {emailsSent} of {certificatesGenerated} certificates sent
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Active Events</h3>
            <div className="relative w-32 h-32 mx-auto mb-4">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${(activeEvents / totalEvents) * 314} ${314 - (activeEvents / totalEvents) * 314}`}
                  className="text-purple-600"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-purple-600">
                  {totalEvents > 0 ? Math.round((activeEvents / totalEvents) * 100) : 0}%
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {activeEvents} of {totalEvents} events active
            </p>
          </div>
        </div>
      </div>

      {/* Event Performance Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Event Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Event Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Certificates
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Emails Sent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Completion Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {eventPerformance.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.name}</div>
                      <div className="text-sm text-gray-500">{event.date}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.participantCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.certificateCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{event.emailCount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${event.completionRate >= 90 ? 'bg-green-100 text-green-800' : ''}
                      ${event.completionRate >= 70 && event.completionRate < 90 ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${event.completionRate < 70 ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {event.completionRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${event.emailRate >= 90 ? 'bg-green-100 text-green-800' : ''}
                      ${event.emailRate >= 70 && event.emailRate < 90 ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${event.emailRate < 70 ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {event.emailRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Trends</h2>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">Chart visualization would be displayed here</p>
            <p className="text-sm text-gray-500">Integration with charting library like Chart.js or Recharts</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;