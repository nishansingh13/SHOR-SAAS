import React, { useState } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants } from '../../contexts/ParticipantContext';
import { 
  Send, 
  CheckCircle, 
  AlertTriangle,
  Settings,
} from 'lucide-react';
import { useEmail } from '../../contexts/EmailContext';

interface Participant {
  id: string;
  name: string;
  email: string;  
  certificateGenerated?: boolean;
  emailSent?: boolean;
  certificateId?: string;
}

const EmailDistribution: React.FC = () => {
  const { events, emailTemplate, setEmailTemplate } = useEvents();
  const { getParticipantsByEvent, sendEmail } = useParticipants();
  const [showSettings, setShowSettings] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const {updateEmailStatus} = useEmail();
  const [sending, setSending] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const eventParticipants = selectedEventId ? getParticipantsByEvent(selectedEventId) : [];
  const readyToSend = eventParticipants.filter(p => p.certificateGenerated && !p.emailSent);
  const alreadySent = eventParticipants.filter(p => p.emailSent);
  const pending = eventParticipants.filter(p => !p.certificateGenerated);

  const processTemplate = (participant: Participant) => {
    return {
      subject: emailTemplate.subject
        .replace(/\{\{\s*event_name\s*\}\}/g, selectedEvent?.name || '')
        .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name),
      content: emailTemplate.content
        .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name)
        .replace(/\{\{\s*event_name\s*\}\}/g, selectedEvent?.name || '')
        .replace(/\{\{\s*event_date\s*\}\}/g, selectedEvent?.date ? new Date(selectedEvent.date).toLocaleDateString() : '')
        .replace(/\{\{\s*certificate_id\s*\}\}/g, participant.certificateId || '')
        .replace(/\{\{\s*organizer_name\s*\}\}/g, selectedEvent?.organizer || '')
    };
  };

  const handleBulkSend = async () => {
    if (readyToSend.length === 0) return;
    
    setSending(true);
    
    try {
      for (const participant of readyToSend) {
         await sendEmail(participant.id,participant.email,processTemplate(participant));
         await updateEmailStatus(participant.email , selectedEvent?.id);
      }
    } catch (error) {
      console.error('Error sending emails:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Distribution</h1>
          <p className="text-gray-600">Send certificates to participants via email</p>
        </div>
        <button
          onClick={() => setShowSettings(true)}
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center"
        >
          <Settings className="h-4 w-4 mr-2" />
          Email Settings
        </button>
      </div>

      {/* Email Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Email Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Configure the email template for certificate distribution</p>
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
                  placeholder="Subject line with placeholders"
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
                  placeholder="Email content with placeholders"
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
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ready to Send</p>
                <p className="text-2xl font-bold text-emerald-600">{readyToSend.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Already Sent</p>
                <p className="text-2xl font-bold text-blue-600">{alreadySent.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pending.length}</p>
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
              className="bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
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
                      {participant.emailSent ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {participant.certificateGenerated && !participant.emailSent && (
                          <button
                            onClick={() => sendEmail(participant.id, participant.email, processTemplate(participant))}
                            className="text-emerald-600 hover:text-emerald-900 flex items-center"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Send
                          </button>
                        )}
                        {participant.emailSent && (
                          <button
                            onClick={() => sendEmail(participant.id, participant.email, processTemplate(participant))}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Resend
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDistribution;