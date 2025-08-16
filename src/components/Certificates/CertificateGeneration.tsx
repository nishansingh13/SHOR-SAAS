import React, { useState, useEffect, useCallback } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants, type Participant } from '../../contexts/ParticipantContext';
import { useTemplates } from '../../contexts/TemplateContext';
import { useCertificates } from '../../contexts/CertificateContext';
import { 
  Award, 
  Download, 
  Eye, 
  Play,
  FileText,
  Image,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

type ImagePlaceholder = {
  id: string;
  name: string;
  x: number; y: number; width: number; height: number;
  fontSize: number; fontFamily: string; color: string; fontWeight?: string; textAlign: 'left'|'center'|'right'; rotation: number;
  text?: string;
};

type PreviewContent =
  | { type: 'image'; backgroundImage?: string; placeholders: ImagePlaceholder[] }
  | string;

const CertificateGeneration: React.FC = () => {
  const { events } = useEvents();
  const { getParticipantsByEvent, loadParticipants, updateParticipantCertificateStatus } = useParticipants();
  const { templates } = useTemplates();
  const { 
    generateCertificate, 
    downloadCertificate: downloadCertificateFile, 
    sendEmail, 
    loadCertificates, 
    certificates 
  } = useCertificates();
  
  // This is a temporary bridge until we fully refactor to use only CertificateContext
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).updateParticipantCertificateStatus = updateParticipantCertificateStatus;
    return () => {
      // Clean up when component unmounts
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (window as any).updateParticipantCertificateStatus;
    };
  }, [updateParticipantCertificateStatus]);
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewParticipant, setPreviewParticipant] = useState<Participant | null>(null);
  const [generating, setGenerating] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const eventParticipants = selectedEventId ? getParticipantsByEvent(selectedEventId) : [];

  const eventCertificates = selectedEventId ? certificates.filter(c => String(c.eventId) === String(selectedEventId)) : [];

  useEffect(() => {
    if (selectedEventId) {
      loadParticipants(selectedEventId);
      // Load certificates for this event
      loadCertificates(selectedEventId);
    }
  }, [selectedEventId, loadParticipants, loadCertificates]);
  
  // Load participants for all events when component mounts
  useEffect(() => {
    // Load participants for all events to get accurate counts
    events.forEach(event => {
      loadParticipants(event.id);
    });
    // Load all certificates
    loadCertificates();
  }, [events, loadParticipants, loadCertificates]);

  const handlePreview = (participant: Participant) => {
    if (!selectedTemplate) return;
    setPreviewParticipant(participant);
  };

  const generatePreviewContent = (participant: Participant): PreviewContent => {
    if (!selectedTemplate) return '';
    
    const event = events.find(e => e.id === participant.eventId);
    
    if (selectedTemplate.type === 'image') {
      // For image templates, return the structured data
      const templateData = JSON.parse(selectedTemplate.content || '{}');
      return {
        type: 'image',
        backgroundImage: templateData.backgroundImage,
        placeholders: (templateData.placeholders || []).map((p: ImagePlaceholder) => ({
          ...p,
          text: p.name === 'participant_name' ? participant.name :
                p.name === 'event_name' ? (event?.name || '') :
                p.name === 'event_date' ? (event?.date ? new Date(event.date).toLocaleDateString() : '') :
                p.name === 'certificate_id' ? (participant.certificateId || 'CERT-PREVIEW') :
                p.name === 'organizer_name' ? (event?.organizer || '') :
                p.name === 'completion_date' ? new Date().toLocaleDateString() :
                p.name === 'event_description' ? (event?.description || '') :
                p.name
        })) || []
      };
    } else {
      // For HTML templates, return the processed HTML
      return selectedTemplate.content
        .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name)
        .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '')
        .replace(/\{\{\s*event_date\s*\}\}/g, event?.date ? new Date(event.date).toLocaleDateString() : '')
        .replace(/\{\{\s*certificate_id\s*\}\}/g, participant.certificateId || 'CERT-PREVIEW')
        .replace(/\{\{\s*organizer_name\s*\}\}/g, event?.organizer || '');
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedEventId || !selectedTemplateId) return;
    
    setGenerating(true);
    
    // Generate certificates using the certificate context
    for (let i = 0; i < eventParticipants.length; i++) {
      const participant = eventParticipants[i];
      if (!participant.certificateGenerated) {
        try {
          // Use the certificate context to generate certificates
          const certificate = await generateCertificate(participant.id, selectedEventId);
          if (certificate) {
            // Update the participant status
            const participantId = participant.id;
        
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).updateParticipantCertificateStatus?.(participantId, selectedEventId, certificate.id);
          }
        } catch (error) {
          console.error(`Failed to generate certificate for ${participant.name}:`, error);
        }
      }
    }
    
    // Reload certificates to refresh the list
    await loadCertificates(selectedEventId);
    
    setGenerating(false);
  };

  const handleDownloadCertificate = async (participant: Participant, format: 'pdf' | 'jpg') => {
    if (!participant.certificateId) {
      console.error('Cannot download certificate: missing certificate ID');
      return;
    }
    
    // Find certificate in our certificates array
    const certificate = certificates.find(c => c.id === participant.certificateId);
    
    if (!certificate) {
      console.error(`Certificate ID ${participant.certificateId} not found in certificates array`);
      // Try to fetch certificates again to see if it's available
      await loadCertificates(participant.eventId);
      return;
    }
    
    try {
      // Use the certificate context to download the certificate
      await downloadCertificateFile(participant.certificateId, format);
    } catch (error) {
      console.error(`Failed to download ${format} for ${participant.name}:`, error);
    }
  };

  const handleSendEmail = async (participant: Participant) => {
    if (!participant.certificateId) {
      console.error('Cannot send certificate email: missing certificate ID');
      return;
    }

    try {
      const result = await sendEmail(participant.certificateId, participant.email);
      if (result) {
        alert(`Certificate sent successfully to ${participant.email}`);
      } else {
        alert(`Failed to send certificate to ${participant.email}`);
      }
    } catch (error) {
      console.error(`Failed to send certificate to ${participant.email}:`, error);
      alert(`Error sending certificate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };



  const pendingCount = eventParticipants.filter(p => !p.certificateGenerated).length;
  const generatedCount = eventParticipants.filter(p => p.certificateGenerated).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Generation</h1>
          <p className="text-gray-600">Generate and download certificates for event participants</p>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose an event</option>
              {events.map((event) => {
                const participantCount = getParticipantsByEvent(event.id).length;
                return (
                  <option key={event.id} value={event.id}>
                    {event.name} ({participantCount} participants)
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Template
            </label>
            <select
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a template</option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedEventId && selectedTemplateId && (
          <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                Ready to generate {pendingCount} certificates for {selectedEvent?.name}
              </span>
            </div>
            <button
              onClick={handleBulkGenerate}
              disabled={generating || pendingCount === 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Generate All Certificates
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      {selectedEventId && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Participants</p>
                <p className="text-2xl font-bold text-gray-900">{eventParticipants.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Generated</p>
                <p className="text-2xl font-bold text-emerald-600">{generatedCount}</p>
              </div>
              <div className="h-12 w-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{pendingCount}</p>
              </div>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Participants List */}
      {selectedEventId && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Participants - {selectedEvent?.name}
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Certificate ID
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
                      <span className="text-sm text-gray-500">
                        {/* show certificate number if available, fallback to id */}
                        {(() => {
                          if (!participant.certificateId) return '-';
                          const cert = certificates.find(c => c.id === participant.certificateId);
                          return cert?.certificateNumber || participant.certificateId || '-';
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {selectedTemplateId && (
                          <button
                            onClick={() => handlePreview(participant)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Preview
                          </button>
                        )}
                        {participant.certificateGenerated && (
                          <>
                            <button
                              onClick={() => handleDownloadCertificate(participant, 'pdf')}
                              className="text-emerald-600 hover:text-emerald-900 flex items-center"
                              title="Download as PDF"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              PDF
                            </button>
                            <button
                              onClick={() => handleDownloadCertificate(participant, 'jpg')}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                              title="Download as JPG"
                            >
                              <Image className="h-4 w-4 mr-1" />
                              JPG
                            </button>
                            <button
                              onClick={() => handleSendEmail(participant)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                              title={`Send certificate to ${participant.email}`}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Email
                            </button>
                          </>
                        )}
                        {!participant.certificateGenerated && (
                          <button
                            onClick={()=>generateCertificate(participant.id, selectedEventId)}
                            className="text-orange-600 hover:text-orange-900 flex items-center"
                          >
                            <Award className="h-4 w-4 mr-1" />
                            Generates
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

      {/* Certificates for this event */}
      {selectedEventId && eventCertificates.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Certificates for {selectedEvent?.name}</h3>
          <div className="space-y-2">
            {eventCertificates.map((c) => {
              const owner = eventParticipants.find(p => p.id === (c.participantId || ''))?.name || 'Unknown participant';
              return (
                <div key={c.id} className="flex items-center justify-between p-2 rounded-md border border-gray-100">
                  <div className="text-sm text-gray-700">{c.certificateNumber || c.id}</div>
                  <div className="text-sm text-gray-500">for: {owner}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewParticipant && selectedTemplate && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Certificate Preview - {previewParticipant.name}
              </h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadCertificate(previewParticipant, 'pdf')}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={() => setPreviewParticipant(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-auto bg-gray-50" style={{ maxHeight: 'calc(90vh - 100px)' }}>
              <div className="bg-white p-8 rounded-lg shadow-sm">
                {(() => {
                  const content = generatePreviewContent(previewParticipant);
                  
                  if (typeof content === 'object' && content.type === 'image') {
                    return (
                      <div className="flex justify-center">
                        <div className="relative" style={{ width: '800px', height: '600px' }}>
                          {content.backgroundImage && (
                            <img
                              src={content.backgroundImage}
                              alt="Certificate background"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          )}
                          {content.placeholders?.map((placeholder: ImagePlaceholder) => (
                             <div
                               key={placeholder.id}
                               className="absolute"
                               style={{
                                 left: `${placeholder.x}px`,
                                 top: `${placeholder.y}px`,
                                 width: `${placeholder.width}px`,
                                 height: `${placeholder.height}px`,
                                 fontSize: `${placeholder.fontSize}px`,
                                 fontFamily: placeholder.fontFamily,
                                 color: placeholder.color,
                                 fontWeight: placeholder.fontWeight,
                                 textAlign: placeholder.textAlign,
                                 transform: `rotate(${placeholder.rotation}deg)`,
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: placeholder.textAlign === 'center' ? 'center' : placeholder.textAlign === 'right' ? 'flex-end' : 'flex-start',
                                 lineHeight: '1.2'
                               }}
                             >
                               {placeholder.text}
                             </div>
                           ))}
                        </div>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: content as string
                        }}
                      />
                    );
                  }
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CertificateGeneration;