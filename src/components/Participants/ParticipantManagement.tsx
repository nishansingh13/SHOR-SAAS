import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useParticipants } from '../../contexts/ParticipantContext';
import { useEvents } from '../../contexts/EventContext';
import { 
  Upload, 
  Download, 
  Search, 
  Filter,
  Mail,
  Award,
  CheckCircle,
  AlertCircle,
  X,
  Users,
  Calendar,
  Activity,
  Target,
  FileSpreadsheet,
  UserPlus,
  TrendingUp,
  Database
} from 'lucide-react';

const ParticipantManagement: React.FC = () => {
  const { participants, getParticipantsByEvent, importParticipants, loadAllParticipants } = useParticipants();
  const { events } = useEvents();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState<Record<string, string | number>[]>([]);
  const [csvContent, setCsvContent] = useState('');
  
  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);
  
  // Load all participants when component mounts
  useEffect(() => {
    loadAllParticipants();
  }, [loadAllParticipants]);

  const filteredParticipants = selectedEventId
    ? getParticipantsByEvent(selectedEventId).filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : participants.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

  // Calculate statistics
  const totalParticipants = filteredParticipants.length;
  const certificatesGenerated = filteredParticipants.filter(p => p.certificateGenerated).length;
  const emailsSent = filteredParticipants.filter(p => p.emailSent).length;
  const pendingCertificates = filteredParticipants.filter(p => !p.certificateGenerated).length;
  
  const handleCSVImport = () => {
    if (!csvContent.trim()) return;
    
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
      const row: Record<string, string | number> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      return row;
    });
    
    setImportData(data);
  };

  const handleImportConfirm = () => {
    if (selectedEventId && importData.length > 0) {
      importParticipants(selectedEventId, importData);
      setShowImportModal(false);
      setImportData([]);
      setCsvContent('');
    }
  };

  const sampleCSV = `name,email,company,position
John Doe,john@example.com,Tech Corp,Developer
Jane Smith,jane@example.com,Innovation Inc,Manager
Bob Johnson,bob@example.com,StartUp LLC,Designer`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-emerald-50">
      {/* SETU Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 via-blue-600 to-emerald-700 text-white"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <motion.div 
                className="flex items-center mb-4"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Participant Management</h1>
                  <p className="text-emerald-100 text-sm">SETU Certificate Platform</p>
                </div>
              </motion.div>
              <motion.p 
                className="text-blue-100 max-w-2xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Import, manage, and track participants across all your educational programs
              </motion.p>
            </div>
            
            <motion.button
              onClick={() => setShowImportModal(true)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-all duration-300 flex items-center font-medium shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Upload className="h-5 w-5 mr-2" />
              Import Participants
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Overview */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
          data-aos="fade-up"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Database className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{totalParticipants}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Total Participants</p>
            <p className="text-xs text-emerald-600 mt-2 font-medium">All Programs</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Award className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{certificatesGenerated}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Certificates Generated</p>
            <p className="text-xs text-blue-600 mt-2 font-medium">Successfully Issued</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-purple-600 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{emailsSent}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Emails Sent</p>
            <p className="text-xs text-purple-600 mt-2 font-medium">Communication Delivered</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 text-center"
            whileHover={{ scale: 1.02, y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="h-14 w-14 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target className="h-7 w-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{pendingCertificates}</h3>
            <p className="text-sm font-medium text-gray-600 mt-1">Pending Certificates</p>
            <p className="text-xs text-amber-600 mt-2 font-medium">Awaiting Generation</p>
          </motion.div>
        </motion.div>

        {/* Filters Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8"
          data-aos="fade-up"
          data-aos-delay="200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <div className="flex items-center mb-6">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
              <Filter className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Search & Filter</h2>
              <p className="text-gray-600 text-sm">Find specific participants and filter by events</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Select Event
              </label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">
                Search Participants
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
                />
              </div>
            </div>

            <div className="flex items-end">
              <motion.button 
                className="w-full flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Advanced Filters
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Participants Table */}
        <motion.div 
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
          data-aos="fade-up"
          data-aos-delay="400"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.8 }}
        >
          <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-10 w-10 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                  <Activity className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Participants {selectedEventId && `for ${events.find(e => e.id === selectedEventId)?.name}`}
                  </h2>
                  <p className="text-gray-300 text-sm">Manage and track participant progress</p>
                </div>
              </div>
              <div className="text-white/80 text-sm font-medium">
                {totalParticipants} Total
              </div>
            </div>
          </div>

          {filteredParticipants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Participant Details
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Event Information
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Certificate Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Email Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredParticipants.map((participant, index) => {
                    const event = events.find(e => e.id === participant.eventId);
                    return (
                      <motion.tr 
                        key={participant.id} 
                        className="hover:bg-gray-50 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1 + (index * 0.05), duration: 0.5 }}
                      >
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-br from-emerald-600 to-blue-700 rounded-xl flex items-center justify-center mr-4">
                              <UserPlus className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{participant.name}</div>
                              <div className="text-sm text-gray-600">{participant.email}</div>
                              {participant.additionalData.company && (
                                <div className="text-xs text-emerald-600 font-medium mt-1">
                                  {String(participant.additionalData.company)}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{event?.name}</div>
                              <div className="text-xs text-gray-500">{event?.date}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          {participant.certificateGenerated ? (
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                                <CheckCircle className="h-4 w-4 text-emerald-600" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-emerald-700">Generated</span>
                                {participant.certificateId && (
                                  <div className="text-xs text-gray-500">ID: #{participant.certificateId}</div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center mr-3">
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                              </div>
                              <span className="text-sm font-medium text-amber-700">Pending</span>
                            </div>
                          )}
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                            ${participant.emailSent === true ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}
                          `}>
                            {participant.emailSent === true ? 'Delivered' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            {!participant.certificateGenerated && (
                              <motion.button 
                                className="text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 px-3 py-1 rounded-lg transition-all duration-200 font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Generate
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <motion.div 
              className="p-12 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
            >
              <div className="h-20 w-20 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Participants Found</h3>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                {selectedEventId 
                  ? 'No participants found for the selected event. Import participants to get started.'
                  : 'No participants have been imported yet. Create an event and import participants to begin.'}
              </p>
              <motion.button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 flex items-center mx-auto font-medium shadow-lg"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <Upload className="h-5 w-5 mr-2" />
                Import Participants
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => e.target === e.currentTarget && setShowImportModal(false)}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ duration: 0.3 }}
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                      <FileSpreadsheet className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Import Participants</h2>
                      <p className="text-emerald-100 text-sm">SETU Certificate Platform</p>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => setShowImportModal(false)}
                    className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>
              </div>
              
              <div className="p-8 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
                <div className="space-y-8">
                  {/* Event Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                      Select Target Event
                    </label>
                    <select
                      value={selectedEventId}
                      onChange={(e) => setSelectedEventId(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
                    >
                      <option value="">Select an event for participant import</option>
                      {events.map((event) => (
                        <option key={event.id} value={event.id}>
                          {event.name} - {new Date(event.date).toLocaleDateString()}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* CSV Input */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-sm font-semibold text-gray-800">
                        Participant Data (CSV Format)
                      </label>
                      <motion.button
                        onClick={handleCSVImport}
                        disabled={!csvContent.trim()}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-blue-700 text-white rounded-lg hover:from-emerald-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        Parse CSV Data
                      </motion.button>
                    </div>
                    <textarea
                      value={csvContent}
                      onChange={(e) => setCsvContent(e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono text-sm transition-all duration-200 resize-none"
                      placeholder="Paste your CSV data here..."
                    />
                  </div>

                  {/* Sample CSV */}
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
                    <div className="flex items-center mb-3">
                      <FileSpreadsheet className="h-5 w-5 text-emerald-600 mr-2" />
                      <h4 className="text-sm font-bold text-gray-800">Sample CSV Format:</h4>
                    </div>
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap bg-white rounded-lg p-4 border border-emerald-200">{sampleCSV}</pre>
                  </div>

                  {/* Preview Table */}
                  {importData.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-bold text-gray-800 flex items-center">
                          <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                          Preview Data ({importData.length} participants)
                        </h4>
                      </div>
                      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {Object.keys(importData[0] || {}).map((key) => (
                                  <th key={key} className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                    {key}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {importData.slice(0, 5).map((row, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                  {Object.values(row).map((value: string | number, cellIndex) => (
                                    <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {importData.length > 5 && (
                            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-blue-50 text-sm text-gray-600 text-center border-t border-gray-200">
                              <TrendingUp className="h-4 w-4 inline mr-2" />
                              ... and {importData.length - 5} more participants ready to import
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-4">
                <motion.button
                  onClick={() => setShowImportModal(false)}
                  className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 font-medium"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleImportConfirm}
                  disabled={!selectedEventId || importData.length === 0}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-blue-700 text-white rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg flex items-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Import {importData.length} Participants
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ParticipantManagement;