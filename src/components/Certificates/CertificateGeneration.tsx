import React, { useState, useEffect } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants, type Participant } from '../../contexts/ParticipantContext';
import { useTemplates } from '../../contexts/TemplateContext';
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
  const { getParticipantsByEvent, generateCertificate, loadParticipants } = useParticipants();
  const { templates } = useTemplates();
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewParticipant, setPreviewParticipant] = useState<Participant | null>(null);
  const [generating, setGenerating] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const eventParticipants = selectedEventId ? getParticipantsByEvent(selectedEventId) : [];

  useEffect(() => {
    if (selectedEventId) {
      loadParticipants(selectedEventId);
    }
  }, [selectedEventId, loadParticipants]);
  
  // Load participants for all events when component mounts
  useEffect(() => {
    // Load participants for all events to get accurate counts
    events.forEach(event => {
      loadParticipants(event.id);
    });
  }, [events, loadParticipants]);

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
    
    // Simulate generation process
    for (let i = 0; i < eventParticipants.length; i++) {
      const participant = eventParticipants[i];
      if (!participant.certificateGenerated) {
        await new Promise(resolve => setTimeout(resolve, 500));
        generateCertificate(participant.id, selectedEventId);
      }
    }
    
    setGenerating(false);
  };

  const downloadCertificate = async (participant: Participant, format: 'pdf' | 'jpg') => {
    if (!selectedTemplate) return;
    
    // const content = generatePreviewContent(participant);
    
    if (format === 'pdf') {
      // In a real implementation, you would use a library like jsPDF or html2pdf
      console.log('Generating PDF for:', participant.name);
    } else {
      // In a real implementation, you would use html2canvas
      console.log('Generating JPG for:', participant.name);
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
                        {participant.certificateId || '-'}
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
                              onClick={() => downloadCertificate(participant, 'pdf')}
                              className="text-emerald-600 hover:text-emerald-900 flex items-center"
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              PDF
                            </button>
                            <button
                              onClick={() => downloadCertificate(participant, 'jpg')}
                              className="text-purple-600 hover:text-purple-900 flex items-center"
                            >
                              <Image className="h-4 w-4 mr-1" />
                              JPG
                            </button>
                          </>
                        )}
                        {!participant.certificateGenerated && (
                          <button
                            onClick={() => generateCertificate(participant.id, selectedEventId)}
                            className="text-orange-600 hover:text-orange-900 flex items-center"
                          >
                            <Award className="h-4 w-4 mr-1" />
                            Generate
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
                  onClick={() => downloadCertificate(previewParticipant, 'pdf')}
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