import React, { useState, useEffect } from 'react';
import { useEvents } from '../../contexts/EventContext';
import { useParticipants, type Participant } from '../../contexts/ParticipantContext';
import { useTemplates } from '../../contexts/TemplateContext';
import { useCertificates } from '../../contexts/CertificateContext';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Award, 
  Download, 
  Eye, 
  Play,
  FileText,
  Image as ImageIcon,
  CheckCircle,
  AlertTriangle,
  Mail
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

type TabType = 'generate' | 'email';

const Merged: React.FC = () => {
  const { events } = useEvents();
  const { getParticipantsByEvent, loadParticipants, updateParticipantCertificateStatus, sendEmail } = useParticipants();
  const { templates } = useTemplates();
  const { 
    generateCertificate, 
    downloadCertificate: downloadCertificateFile,
    loadCertificates, 
    certificates 
  } = useCertificates();

  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewParticipant, setPreviewParticipant] = useState<Participant | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const eventParticipants = selectedEventId ? getParticipantsByEvent(selectedEventId) : [];
  const eventCertificates = selectedEventId ? certificates.filter(c => String(c.eventId) === String(selectedEventId)) : [];

  // Load data effects
  useEffect(() => {
    if (selectedEventId) {
      loadParticipants(selectedEventId);
      loadCertificates(selectedEventId);
    }
  }, [selectedEventId, loadParticipants, loadCertificates]);

  useEffect(() => {
    events.forEach(event => {
      loadParticipants(event.id);
    });
    loadCertificates();
  }, [events, loadParticipants, loadCertificates]);

  // Counts for stats
  const pendingCount = eventParticipants.filter(p => !p.certificateGenerated).length;
  const generatedCount = eventParticipants.filter(p => p.certificateGenerated).length;
  const emailedCount = eventParticipants.filter(p => p.certificateGenerated && p.emailSent).length;
  const readyToEmailCount = eventParticipants.filter(p => p.certificateGenerated && !p.emailSent).length;

  // Preview handling
  const handlePreview = (participant: Participant) => {
    if (!selectedTemplate) return;
    setPreviewParticipant(participant);
  };

  const generatePreviewContent = (participant: Participant): PreviewContent => {
    if (!selectedTemplate) return '';
    
    const event = events.find(e => e.id === participant.eventId);
    
    if (selectedTemplate.type === 'image') {
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
      return selectedTemplate.content
        .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name)
        .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '')
        .replace(/\{\{\s*event_date\s*\}\}/g, event?.date ? new Date(event.date).toLocaleDateString() : '')
        .replace(/\{\{\s*certificate_id\s*\}\}/g, participant.certificateId || 'CERT-PREVIEW')
        .replace(/\{\{\s*organizer_name\s*\}\}/g, event?.organizer || '');
    }
  };

  // Certificate generation
  const generatePDFFromPreview = async (contentElement: HTMLElement, participant: Participant): Promise<Blob> => {
    try {
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.setProperties({
        title: `Certificate - ${participant.name}`,
        subject: 'Certificate of Completion',
        author: selectedEvent?.organizer || 'Organization',
        keywords: 'certificate, completion',
        creator: 'Certificate Generation System'
      });

      return pdf.output('blob');
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  };

  const handleBulkGenerate = async () => {
    if (!selectedEventId || !selectedTemplateId) return;
    
    setGenerating(true);
    
    for (let i = 0; i < eventParticipants.length; i++) {
      const participant = eventParticipants[i];
      if (!participant.certificateGenerated) {
        try {
          const certificate = await generateCertificate(participant.id, selectedEventId);
          if (certificate) {
            const participantId = participant.id;
            await updateParticipantCertificateStatus(participantId, selectedEventId, certificate.id);
          }
        } catch (error) {
          console.error(`Failed to generate certificate for ${participant.name}:`, error);
        }
      }
    }
    
    await loadCertificates(selectedEventId);
    setGenerating(false);
  };

  const waitForImages = (element: HTMLElement): Promise<void> => {
    const images = element.getElementsByTagName('img');
    const imagePromises = Array.from(images).map(img => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
    });
    return Promise.all(imagePromises).then(() => {});
  };

  const generateCertificatePDF = async (participant: Participant): Promise<string> => {
    try {
      if (!selectedTemplate) {
        throw new Error('No template selected');
      }

      // First show preview
      handlePreview(participant);
      
      // Wait for preview to render and stabilize
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get the preview content element
      const certificateElement = document.querySelector('#certificate-wrapper .certificate-preview-content') as HTMLElement;
      if (!certificateElement) {
        throw new Error('Certificate preview element not found');
      }

      // Wait for all images to load in the original element
      await waitForImages(certificateElement);

      // Generate PDF blob with optimized settings
      console.log('Rendering certificate to canvas...');
      const canvas = await html2canvas(certificateElement, {
        scale: 1.5,
        logging: true,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        imageTimeout: 15000, // Increase timeout for image loading
        onclone: async (doc, element) => {
          // Wait for all images in the cloned document
          const clonedImages = element.getElementsByTagName('img');
          console.log(`Waiting for ${clonedImages.length} images to load in clone...`);
          await Promise.all(Array.from(clonedImages).map(img => {
            if (img.complete) return Promise.resolve();
            return new Promise(resolve => {
              img.onload = resolve;
              img.onerror = resolve; // Don't fail on error, just continue
            });
          }));
        }
      });

      console.log('Creating PDF...');
      // Calculate dimensions
      const width = canvas.width;
      const height = canvas.height;
      const aspectRatio = width / height;

      // Create PDF with proper dimensions
      const pdf = new jsPDF({
        orientation: aspectRatio > 1 ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });

      try {
        // Convert to JPEG with compression
        const imageData = canvas.toDataURL('image/jpeg', 0.85);
        
        // Add the image to PDF
        pdf.addImage(imageData, 'JPEG', 0, 0, width, height);

        // Set PDF metadata
        pdf.setProperties({
          title: `Certificate - ${participant.name}`,
          subject: 'Certificate',
          author: selectedEvent?.organizer || 'Organization',
          creator: 'Certificate Generation System'
        });

        // Convert to base64
        const base64String = pdf.output('datauristring');
        const base64Data = base64String.split(',')[1];

        // Verify we have data
        if (!base64Data) {
          throw new Error('Failed to generate PDF data');
        }

        return base64Data;
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        throw new Error(`Failed to generate PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      throw new Error(`Failed to generate certificate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleBulkEmail = async () => {
    if (!selectedEventId) return;
    
    setSending(true);
    const readyParticipants = eventParticipants.filter(p => p.certificateGenerated && !p.emailSent);
    const event = events.find(e => e.id === selectedEventId);
    
    for (const participant of readyParticipants) {
      if (!participant.certificateId || !participant.email) continue;
      try {
        console.log(`Generating PDF for ${participant.name}...`);
        // Generate PDF certificate
        const certificatePDF = await generateCertificatePDF(participant);
        
        // Check file size (base64 is ~33% larger than binary)
        const binarySize = (certificatePDF.length * 3) / 4;
        const sizeInMB = binarySize / (1024 * 1024);
        
        console.log(`PDF size: ${sizeInMB.toFixed(2)}MB`);
        
        if (sizeInMB > 20) { // Keep well under the 25MB limit
          throw new Error(`Certificate PDF too large (${sizeInMB.toFixed(1)}MB). Maximum size is 20MB.`);
        }
        
        console.log('Sending email...');
        const emailData = {
          subject: `Your certificate for ${event?.name || 'the event'}`,
          content: `Dear ${participant.name},\n\nYour certificate for ${event?.name || 'the event'} is ready.\nPlease find your certificate attached to this email.\nCertificate ID: ${participant.certificateId}\n\nBest regards,\n${event?.organizer || 'The Team'}`,
          certificatePDF
        };
        
        const result = await sendEmail(participant.id, selectedEventId, emailData);
        console.log('Email sent result:', result);
        
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          // Handle Axios errors or other error objects
          const errorObj = error as any;
          errorMessage = errorObj.message || errorObj.response?.data?.message || JSON.stringify(error);
        }
        
        console.error(`Failed to send email to ${participant.email}:`, error);
        alert(`Failed to send email to ${participant.email}: ${errorMessage}`);
      }
    }
    
    await loadParticipants(selectedEventId);
    setSending(false);
  };

  const handleDownloadCertificate = async (participant: Participant, format: 'pdf' | 'jpg') => {
    try {
      if (!previewParticipant) {
        handlePreview(participant);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      const certificateElement = document.querySelector('#certificate-wrapper .certificate-preview-content') as HTMLElement;
      if (!certificateElement) {
        throw new Error('Certificate preview element not found');
      }

      if (format === 'pdf') {
        const pdfBlob = await generatePDFFromPreview(certificateElement, participant);
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${participant.name}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        const canvas = await html2canvas(certificateElement, {
          scale: 2,
          logging: false,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const url = canvas.toDataURL('image/jpeg', 0.9);
        const link = document.createElement('a');
        link.href = url;
        link.download = `certificate-${participant.name}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error(`Failed to generate ${format} for ${participant.name}:`, error);
    }
  };

  const handleSendEmail = async (participant: Participant) => {
    if (!participant.certificateId || !selectedEventId) {
      console.error('Cannot send certificate email: missing certificate ID or event ID');
      return;
    }

    try {
      const event = events.find(e => e.id === selectedEventId);
      // Generate PDF certificate
      const certificatePDF = await generateCertificatePDF(participant);

      const emailData = {
        subject: `Your certificate for ${event?.name || 'the event'}`,
        content: `Dear ${participant.name},\n\nYour certificate for ${event?.name || 'the event'} is ready.\nPlease find your certificate attached to this email.\nCertificate ID: ${participant.certificateId}\n\nBest regards,\n${event?.organizer || 'The Team'}`,
        certificatePDF
      };
      const result = await sendEmail(participant.id, selectedEventId, emailData);
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

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Certificate Management</h1>
        <div className="flex space-x-4 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'generate'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('generate')}
          >
            Generate Certificates
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'email'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('email')}
          >
            Email Distribution
          </button>
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

          {activeTab === 'generate' && (
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
          )}
        </div>

        {selectedEventId && (
          <div className="mt-6 flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-900">
                {activeTab === 'generate' 
                  ? `Ready to generate ${pendingCount} certificates for ${selectedEvent?.name}`
                  : `Ready to email ${readyToEmailCount} certificates for ${selectedEvent?.name}`}
              </span>
            </div>
            {activeTab === 'generate' ? (
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
            ) : (
              <button
                onClick={handleBulkEmail}
                disabled={sending || readyToEmailCount === 0}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send All Emails
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Stats */}
      {selectedEventId && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                <p className="text-sm font-medium text-gray-600">Emailed</p>
                <p className="text-2xl font-bold text-blue-600">{emailedCount}</p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
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
                        participant.emailSent ? (
                          <div className="flex items-center">
                            <Mail className="h-4 w-4 text-blue-500 mr-2" />
                            <span className="text-sm text-blue-700">Emailed</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            <span className="text-sm text-green-700">Generated</span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2" />
                          <span className="text-sm text-orange-700">Pending</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">
                        {(() => {
                          if (!participant.certificateId) return '-';
                          const cert = certificates.find(c => c.id === participant.certificateId);
                          return cert?.certificateNumber || participant.certificateId || '-';
                        })()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {activeTab === 'generate' && selectedTemplateId && (
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
                              <ImageIcon className="h-4 w-4 mr-1" />
                              JPG
                            </button>
                            {!participant.emailSent && (
                              <button
                                onClick={() => handleSendEmail(participant)}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title={`Send certificate to ${participant.email}`}
                              >
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                              </button>
                            )}
                          </>
                        )}
                        {!participant.certificateGenerated && activeTab === 'generate' && (
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
              <div id="certificate-wrapper" className="bg-white p-4 rounded-lg shadow-sm flex justify-center" style={{ maxWidth: '100%', overflowX: 'auto' }}>
                <div className="certificate-preview-content" style={{ 
                  width: '210mm', 
                  minHeight: '297mm', 
                  background: '#fff', 
                  position: 'relative', 
                  padding: '15mm',
                  boxSizing: 'border-box',
                  margin: '0 auto',
                  transform: 'scale(0.9)',
                  transformOrigin: 'top center'
                }}>
                {(() => {
                  const content = generatePreviewContent(previewParticipant);
                  
                  if (typeof content === 'object' && content.type === 'image') {
                    return (
                      <div className="flex justify-center">
                        <div className="relative" style={{ width: '180mm', minHeight: '267mm', margin: '0 auto' }}>
                          {content.backgroundImage && (
                            <img
                              src={content.backgroundImage}
                              alt="Certificate background"
                              className="w-full h-full object-contain rounded-lg"
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
                        style={{ width: '180mm', minHeight: '267mm', margin: '0 auto' }}
                      />
                    );
                  }
                })()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Merged;
