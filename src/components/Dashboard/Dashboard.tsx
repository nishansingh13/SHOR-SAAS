import React, { useEffect } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants } from '../../contexts/ParticipantContext';
import { useTemplates } from '../../contexts/TemplateContext';
import { Calendar, Users, Award, Mail, TrendingUp, BookTemplate as FileTemplate, CheckCircle, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { events } = useEvents();
  const { participants, loadAllParticipants } = useParticipants();
  const { templates } = useTemplates();
  
  // Load all participants directly when dashboard is mounted
  useEffect(() => {
    // This will ensure we have the most up-to-date data
    loadAllParticipants().then(() => {
      console.log("Dashboard: All participants loaded");
    });
  }, [loadAllParticipants]);

  // Calculate stats
  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const totalParticipants = participants.length;
  const certificatesGenerated = participants.filter(p => p.certificateGenerated).length;
  const emailsSent = participants.filter(p => p.emailSent).length;
  const totalTemplates = templates.length;

  const stats = [
    {
      name: 'Total Events',
      value: totalEvents,
      icon: Calendar,
      color: 'blue',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Active Participants',
      value: totalParticipants,
      icon: Users,
      color: 'purple',
      change: '+18%',
      changeType: 'increase'
    },
    {
      name: 'Certificates Generated',
      value: certificatesGenerated,
      icon: Award,
      color: 'emerald',
      change: '+23%',
      changeType: 'increase'
    },
    {
      name: 'Emails Sent',
      value: emailsSent,
      icon: Mail,
      color: 'orange',
      change: '+8%',
      changeType: 'increase'
    }
  ];

  const recentEvents = events.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome to Certificate Generator</h1>
        <p className="opacity-90">Manage your events, create beautiful certificates, and distribute them seamlessly.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.name} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`
                  h-12 w-12 rounded-lg flex items-center justify-center
                  ${stat.color === 'blue' ? 'bg-blue-100' : ''}
                  ${stat.color === 'purple' ? 'bg-purple-100' : ''}
                  ${stat.color === 'emerald' ? 'bg-emerald-100' : ''}
                  ${stat.color === 'orange' ? 'bg-orange-100' : ''}
                `}>
                  <Icon className={`
                    h-6 w-6
                    ${stat.color === 'blue' ? 'text-blue-600' : ''}
                    ${stat.color === 'purple' ? 'text-purple-600' : ''}
                    ${stat.color === 'emerald' ? 'text-emerald-600' : ''}
                    ${stat.color === 'orange' ? 'text-orange-600' : ''}
                  `} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-500 ml-1">vs last month</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Events */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Recent Events</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{event.name}</h3>
                    <p className="text-sm text-gray-500">{event.date}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className="text-xs text-gray-600">
                        {event.participantCount} participants
                      </span>
                      <span className="text-xs text-gray-600">
                        {event.certificatesGenerated} certificates
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${event.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      ${event.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${event.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                    `}>
                      {event.status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {event.status === 'draft' && <Clock className="h-3 w-3 mr-1" />}
                      {event.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 gap-4">
              <button className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200 text-left">
                <Calendar className="h-8 w-8 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Create New Event</h3>
                  <p className="text-sm text-gray-600">Set up a new event or program</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200 text-left">
                <FileTemplate className="h-8 w-8 text-purple-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Design Template</h3>
                  <p className="text-sm text-gray-600">Create a new certificate template</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors duration-200 text-left">
                <Users className="h-8 w-8 text-emerald-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Import Participants</h3>
                  <p className="text-sm text-gray-600">Upload participant data from CSV/Excel</p>
                </div>
              </button>
              
              <button className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors duration-200 text-left">
                <Award className="h-8 w-8 text-orange-600 mr-3" />
                <div>
                  <h3 className="font-medium text-gray-900">Generate Certificates</h3>
                  <p className="text-sm text-gray-600">Bulk generate and send certificates</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <FileTemplate className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{totalTemplates}</h3>
          <p className="text-sm text-gray-600">Certificate Templates</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">{activeEvents}</h3>
          <p className="text-sm text-gray-600">Active Events</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {totalParticipants > 0 ? Math.round((certificatesGenerated / totalParticipants) * 100) : 0}%
          </h3>
          <p className="text-sm text-gray-600">Completion Rate</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;