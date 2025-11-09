import React, { useEffect } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants } from '../../contexts/ParticipantContext';
import { useTemplates } from '../../contexts/TemplateContext';
import { Calendar, Users, Award, TrendingUp, BookTemplate as FileTemplate, CheckCircle, Clock, Plus, ArrowRight, BarChart3, Activity, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Dashboard: React.FC = () => {
  const { events } = useEvents();
  const { participants, loadAllParticipants } = useParticipants();
  const { templates } = useTemplates();
  
  useEffect(() => {
    AOS.init({
      duration: 600,
      easing: 'ease-out-cubic',
      once: true
    });

    loadAllParticipants().then(() => {
      console.log("Dashboard: All participants loaded");
    });
  }, [loadAllParticipants]);

  const totalEvents = events.length;
  const activeEvents = events.filter(e => e.status === 'active').length;
  const totalParticipants = participants.length;
  const certificatesGenerated = participants.filter(p => p.certificateGenerated).length;
  const totalTemplates = templates.length;

  const stats = [
    {
      name: 'Total Events',
      value: totalEvents,
      icon: Calendar,
      color: 'emerald',
      bgColor: 'bg-emerald-100',
      textColor: 'text-emerald-600',
      change: '+12%',
      changeType: 'increase',
      description: 'Active learning programs'
    },
    {
      name: 'Active Participants',
      value: totalParticipants,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      change: '+18%',
      changeType: 'increase',
      description: 'Enrolled learners'
    },
    {
      name: 'Certificates Generated',
      value: certificatesGenerated,
      icon: Award,
      color: 'amber',
      bgColor: 'bg-amber-100',
      textColor: 'text-amber-600',
      change: '+23%',
      changeType: 'increase',
      description: 'Professional credentials'
    },
    {
      name: 'Success Rate',
      value: totalParticipants > 0 ? Math.round((certificatesGenerated / totalParticipants) * 100) : 0,
      icon: Target,
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600',
      change: '+8%',
      changeType: 'increase',
      description: 'Completion percentage',
      suffix: '%'
    }
  ];

  const recentEvents = events.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <motion.div 
          className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-blue-700 to-purple-800 rounded-2xl p-8 text-white shadow-2xl"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          data-aos="fade-down"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl transform -translate-x-40 translate-y-40"></div>
          </div>
          
          <div className="relative z-10">
            <motion.div 
              className="flex items-center mb-6"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <div className="h-16 w-16 rounded-2xl bg-white/20 text-white flex items-center justify-center font-bold text-2xl mr-4 backdrop-blur-sm">
                S
              </div>
              <div>
                <h1 className="text-3xl font-bold">SETU Dashboard</h1>
                <p className="text-emerald-100 font-medium">Professional Learning Management</p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-3">Welcome Back! 👋</h2>
              <p className="text-xl text-emerald-100 max-w-2xl leading-relaxed">
                Manage your educational programs, generate professional certificates, and empower learners worldwide through your comprehensive platform.
              </p>
            </motion.div>

            {/* Quick Stats in Header */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{totalEvents}</div>
                <div className="text-sm text-emerald-100">Events</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{totalParticipants}</div>
                <div className="text-sm text-emerald-100">Participants</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{certificatesGenerated}</div>
                <div className="text-sm text-emerald-100">Certificates</div>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{totalTemplates}</div>
                <div className="text-sm text-emerald-100">Templates</div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Main Stats Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div 
                key={stat.name} 
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 group"
                data-aos="fade-up"
                data-aos-delay={index * 100}
                whileHover={{ scale: 1.02, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`h-12 w-12 rounded-xl ${stat.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`h-6 w-6 ${stat.textColor}`} />
                  </div>
                  <div className="flex items-center text-emerald-600">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span className="text-sm font-semibold">{stat.change}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-3xl font-bold text-gray-900">{stat.value}</span>
                    {stat.suffix && <span className="text-2xl font-bold text-gray-900">{stat.suffix}</span>}
                  </div>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Events - Takes 2 columns */}
          <motion.div 
            className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            data-aos="fade-right"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center">
                  <Activity className="h-6 w-6 mr-3" />
                  Recent Events
                </h2>
                <motion.button 
                  className="flex items-center text-emerald-100 hover:text-white text-sm font-medium"
                  whileHover={{ scale: 1.05 }}
                >
                  View All <ArrowRight className="h-4 w-4 ml-1" />
                </motion.button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {recentEvents.length > 0 ? recentEvents.map((event, index) => (
                  <motion.div 
                    key={event.id} 
                    className="flex items-center justify-between p-5 bg-gradient-to-r from-gray-50 to-emerald-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + (index * 0.1), duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">{event.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{event.date}</p>
                      <div className="flex items-center mt-3 space-x-6">
                        <div className="flex items-center text-blue-600">
                          <Users className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">{event.participantCount} participants</span>
                        </div>
                        <div className="flex items-center text-emerald-600">
                          <Award className="h-4 w-4 mr-1" />
                          <span className="text-sm font-medium">{event.certificatesGenerated} certificates</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`
                        inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold
                        ${event.status === 'active' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${event.status === 'draft' ? 'bg-amber-100 text-amber-800' : ''}
                        ${event.status === 'completed' ? 'bg-blue-100 text-blue-800' : ''}
                      `}>
                        {event.status === 'active' && <CheckCircle className="h-4 w-4 mr-1" />}
                        {event.status === 'draft' && <Clock className="h-4 w-4 mr-1" />}
                        {event.status === 'completed' && <Award className="h-4 w-4 mr-1" />}
                        {event.status}
                      </span>
                    </div>
                  </motion.div>
                )) : (
                  <motion.div 
                    className="text-center py-12"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8, duration: 0.5 }}
                  >
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Events Yet</h3>
                    <p className="text-gray-600">Create your first event to get started</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Quick Actions Sidebar */}
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            data-aos="fade-left"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-700 px-6 py-4">
              <h2 className="text-xl font-bold text-white flex items-center">
                <BarChart3 className="h-6 w-6 mr-3" />
                Quick Actions
              </h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                {[
                  {
                    title: 'Create New Event',
                    description: 'Set up a new learning program',
                    icon: Plus,
                    color: 'emerald',
                    bgColor: 'bg-emerald-50',
                    textColor: 'text-emerald-600',
                    hoverColor: 'hover:bg-emerald-100'
                  },
                  {
                    title: 'Design Template',
                    description: 'Create certificate templates',
                    icon: FileTemplate,
                    color: 'blue',
                    bgColor: 'bg-blue-50',
                    textColor: 'text-blue-600',
                    hoverColor: 'hover:bg-blue-100'
                  },
                  {
                    title: 'Import Participants',
                    description: 'Upload participant data',
                    icon: Users,
                    color: 'purple',
                    bgColor: 'bg-purple-50',
                    textColor: 'text-purple-600',
                    hoverColor: 'hover:bg-purple-100'
                  },
                  {
                    title: 'Generate Certificates',
                    description: 'Bulk certificate creation',
                    icon: Award,
                    color: 'amber',
                    bgColor: 'bg-amber-50',
                    textColor: 'text-amber-600',
                    hoverColor: 'hover:bg-amber-100'
                  }
                ].map((action, index) => (
                  <motion.button 
                    key={action.title}
                    className={`w-full flex items-center p-4 ${action.bgColor} ${action.hoverColor} rounded-xl transition-all duration-300 text-left group`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.0 + (index * 0.1), duration: 0.5 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <action.icon className={`h-8 w-8 ${action.textColor} mr-4 group-hover:scale-110 transition-transform duration-300`} />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-gray-700">{action.title}</h3>
                      <p className="text-sm text-gray-600">{action.description}</p>
                    </div>
                    <ArrowRight className={`h-5 w-5 ${action.textColor} opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300`} />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Performance Overview */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          data-aos="fade-up"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-purple-600 to-emerald-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center">
              <BarChart3 className="h-6 w-6 mr-3" />
              Performance Overview
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div 
                className="text-center p-6 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl border border-emerald-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileTemplate className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{totalTemplates}</h3>
                <p className="text-sm font-medium text-gray-600 mt-1">Certificate Templates</p>
                <p className="text-xs text-gray-500 mt-2">Ready for use</p>
              </motion.div>

              <motion.div 
                className="text-center p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-16 w-16 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{activeEvents}</h3>
                <p className="text-sm font-medium text-gray-600 mt-1">Active Events</p>
                <p className="text-xs text-gray-500 mt-2">Currently running</p>
              </motion.div>

              <motion.div 
                className="text-center p-6 bg-gradient-to-br from-purple-50 to-emerald-50 rounded-xl border border-purple-200"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {totalParticipants > 0 ? Math.round((certificatesGenerated / totalParticipants) * 100) : 0}%
                </h3>
                <p className="text-sm font-medium text-gray-600 mt-1">Success Rate</p>
                <p className="text-xs text-gray-500 mt-2">Certificate completion</p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;