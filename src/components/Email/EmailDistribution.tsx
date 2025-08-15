import React, { useState } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants } from '../../contexts/ParticipantContext';
import { 
  Mail, 
  Send, 
  Settings, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  Eye,
  X
} from 'lucide-react';

const EmailDistribution: React.FC = () => {
  const { events } = useEvents();
  const { participants, getParticipantsByEvent, sendEmail } = useParticipants();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sending, setSending] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: 'Your Certificate for {{ event_name }}',
    content: `Dear {{ participant_name }},

Congratulations on successfully completing {{ event_name }}!

Please find your certificate of completion attached to this email. This certificate validates your participation and successful completion of the program.

Event Details:
- Event: {{ event_name }}
- Date: {{ event_date }}
- Certificate ID: {{ certificate_id }}

Thank you for your participation!

Best regards,
{{ organizer_name }}`
  });

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventParticipants = selectedEventId ? getParticipantsByEvent(selectedEventId) : [];
  const readyToSend = eventParticipants.filter(p => p.certificateGenerated && !p.emailSent);
  const alreadySent = eventParticipants.filter(p => p.emailSent);
  const pending = eventParticipants.filter(p => !p.certificateGenerated);

  const handleBulkSend = async () => {
    if (readyToSend.length === 0) return;
    
    setSending(true);
    
    // Simulate sending emails
    for (let i = 0; i < readyToSend.length; i++) {
      const participant = readyToSend[i];
      await new Promise(resolve => setTimeout(resolve, 1000));
      sendEmail(participant.id);
    }
    
    setSending(false);
  };

  const generatePreviewContent = (participant: any) => {
    const event = events.find(e => e.id === participant.eventId);
    return {
      subject: emailTemplate.subject
        .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '')
        .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name),
      content: emailTemplate.content
        .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name)
        .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '')
        .replace(/\{\{\s*event_date\s*\}\}/g, event?.date ? new Date(event.date).toLocaleDateString() : '')
        .replace(/\{\{\s*certificate_id\s*\}\}/g, participant.certificateId || '')
        .replace(/\{\{\s*organizer_name\s*\}\}/g, event?.organizer || '')
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Distribution</h1>
          <p className="text-gray-600">Send certificates to participants via email</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowSettings(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
          >
            <Settings className="h-4 w-4 mr-2" />
            Email Settings
          </button>
          <button
            onClick={() => setShowPreview(true)}
            disabled={!selectedEventId}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </button>
        </div>
      </div>

      {/* Event Selection */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Event</h2>
        <select
          value={selectedEventId}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Choose an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.name} ({event.participantCount} participants)
            </option>
          ))}
        </select>
      </div>

      {/* Stats */}
      {selectedEventId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Send</p>
                <p className="text-2xl font-bold text-emerald-600">{readyToSend.length}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Already Sent</p>
                <p className="text-2xl font-bold text-blue-600">{alreadySent.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Certificates</p>
                <p className="text-2xl font-bold text-orange-600">{pending.length}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Success Rate</p>
                <p className="text-2xl font-bold text-purple-600">
                  {eventParticipants.length > 0 
                    ? Math.round((alreadySent.length / eventParticipants.length) * 100)
                    : 0}%
                </p>
              </div>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Actions */}
      {selectedEventId && readyToSend.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Ready to Send</h3>
              <p className="text-gray-600">{readyToSend.length} emails ready to be sent</p>
            </div>
            <button
              onClick={handleBulkSend}
              disabled={sending}
              className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-emerald-700 hover:to-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {sending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Sending Emails...
                </>
              ) : (
                <>
                  <Send className="h-5 w-5 mr-2" />
                  Send All Emails
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Participants List */}
      {selectedEventId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Email Status - {selectedEvent?.name}
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {eventParticipants.map((participant) => (
                  <tr key={participant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{participant.name}</div>
                        <div className="text-sm text-gray-500">{participant.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {participant.certificateGenerated ? (
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-sm text-green-700">Generated</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                          <span className="text-sm text-orange-700">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${participant.emailStatus === 'sent' ? 'bg-green-100 text-green-800' : ''}
                        ${participant.emailStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${participant.emailStatus === 'failed' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {participant.emailStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {participant.certificateGenerated && !participant.emailSent && (
                          <button
                            onClick={() => sendEmail(participant.id)}
                            className="text-emerald-600 hover:text-emerald-900 flex items-center"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </button>
                        )}
                        {participant.emailSent && (
                          <button
                            onClick={() => sendEmail(participant.id)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Resend
                          </button>
                        )}
                        <button className="text-gray-600 hover:text-gray-900">
                          View History
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Email Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Subject
                </label>
                <input
                  type="text"
                  value={emailTemplate.subject}
                  onChange={(e) => setEmailTemplate({ ...emailTemplate, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Content
                </label>
                <textarea
                  value={emailTemplate.content}
                  onChange={(e) => setEmailTemplate({ ...emailTemplate, content: e.target.value })}
                  rows={12}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Available Placeholders:</h4>
                <div className="flex flex-wrap gap-2">
                  {['participant_name', 'event_name', 'event_date', 'certificate_id', 'organizer_name'].map((placeholder) => (
                    <code
                      key={placeholder}
                      className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {`{{ ${placeholder} }}`}
                    </code>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {showPreview && selectedEventId && eventParticipants.length > 0 && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Email Preview</h2>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              {(() => {
                const sampleParticipant = eventParticipants[0];
                const preview = generatePreviewContent(sampleParticipant);
                return (
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="bg-white rounded-lg p-6 shadow-sm">
                      <div className="border-b border-gray-200 pb-4 mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Subject:</h3>
                        <p className="text-gray-700">{preview.subject}</p>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Content:</h3>
                        <div className="whitespace-pre-wrap text-gray-700">
                          {preview.content}
                        </div>
                      </div>
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <p className="text-sm text-gray-500">
                          📎 Certificate attached: {sampleParticipant.certificateId || 'certificate'}.pdf
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDistribution;