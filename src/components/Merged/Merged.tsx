import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AOS from 'aos';
import 'aos/dist/aos.css';
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
  Mail,
  Users,
  Calendar,
  FileImage,
  Send,
  Settings,
  Zap
} from 'lucide-react';
import { useEmail } from '../../contexts/EmailContext';

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
  const { events, emailTemplate, setEmailTemplate } = useEvents();
  const { getParticipantsByEvent, loadParticipants, updateParticipantCertificateStatus, sendEmail } = useParticipants();
  const { templates } = useTemplates();
  const { 
    generateCertificate, 
    loadCertificates, 
    certificates 
  } = useCertificates();
  const {updateEmailStatus} = useEmail();

  const [activeTab, setActiveTab] = useState<TabType>('generate');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [previewParticipant, setPreviewParticipant] = useState<Participant | null>(null);
  // Offscreen render target used for programmatic captures (so users don't see the modal)
  const [offscreenPreviewParticipant, setOffscreenPreviewParticipant] = useState<Participant | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editedTemplate, setEditedTemplate] = useState({ 
    subject: emailTemplate.subject, 
    content: emailTemplate.content 
  });

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  // Events are already scoped by backend via auth; keep an extra UI filter if needed later
  const selectedEvent = events.find(e => e.id === selectedEventId);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
  const eventParticipants = selectedEventId ? getParticipantsByEvent(selectedEventId) : [];
  // const eventCertificates = selectedEventId ? certificates.filter(c => String(c.eventId) === String(selectedEventId)) : [];

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

  // Prepare preview for capture. If showModal is true, the visible modal will be used,
  // otherwise populate the offscreen render target.
  const preparePreviewForCapture = async (participant: Participant, showModal = false) => {
    if (showModal) setPreviewParticipant(participant);
    else setOffscreenPreviewParticipant(participant);
    // Give React time to render
    await new Promise((r) => setTimeout(r, 200));
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
                p.name === 'certificate_id' ? (participant.id || 'CERT-PREVIEW') :
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
        .replace(/\{\{\s*certificate_id\s*\}\}/g, participant.id || 'CERT-PREVIEW')
        .replace(/\{\{\s*organizer_name\s*\}\}/g, event?.organizer || '');
    }
  };

  // Certificate generation
  const generatePDFFromPreview = async (contentElement: HTMLElement, participant: Participant): Promise<Blob> => {
    try {
      const width = contentElement.scrollWidth;
      const height = contentElement.scrollHeight;
      const canvas = await html2canvas(contentElement, {
  scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
      width: width,
      height: height
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
          if (certificate && certificate.id) {
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

  const waitForImages = async(element: HTMLElement): Promise<void> => {
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

  // Prepare an offscreen preview for capture (don't show modal)
  await preparePreviewForCapture(participant, false);

  // Get the offscreen preview content element
  const certificateElement = document.querySelector('#certificate-render-root .certificate-preview-content') as HTMLElement;
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
  onclone: async (_doc, element) => {
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

        // Clear offscreen preview now that we have the PDF
        setOffscreenPreviewParticipant(null);

        return base64Data;
      } catch (pdfError) {
        console.error('PDF generation error:', pdfError);
        throw new Error(`Failed to generate PDF: ${pdfError instanceof Error ? pdfError.message : 'Unknown error'}`);
      }
      
    } catch (error) {
      console.error('Error generating certificate PDF:', error);
      // Clear offscreen preview on error as well
      setOffscreenPreviewParticipant(null);
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
        const certificatePDF = await generateCertificatePDF(participant);
        const binarySize = (certificatePDF.length * 3) / 4;
        const sizeInMB = binarySize / (1024 * 1024);
        
        console.log(`PDF size: ${sizeInMB.toFixed(2)}MB`);
        
        if (sizeInMB > 20) { // Keep well under the 25MB limit
          throw new Error(`Certificate PDF too large (${sizeInMB.toFixed(1)}MB). Maximum size is 20MB.`);
        }
        
        console.log('Sending email...');
        const content = emailTemplate.content
          .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name)
          .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '')
          .replace(/\{\{\s*event_date\s*\}\}/g, event?.date ? new Date(event.date).toLocaleDateString() : '')
          .replace(/\{\{\s*certificate_id\s*\}\}/g, participant.id || '')
          .replace(/\{\{\s*organizer_name\s*\}\}/g, event?.organizer || '');

        const subject = emailTemplate.subject
          .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '');

        const emailData = {
          subject,
          content,
          certificatePDF
        };
        
        const result = await sendEmail(participant.id, selectedEventId, emailData);
        console.log('Email sent result:', result);
        
        // Update email status and wait for it to complete
        try {
          await updateEmailStatus(participant.email, selectedEventId);
          console.log(`Updated email status for ${participant.email}`);
        } catch (error) {
          console.error(`Failed to update email status for ${participant.email}:`, error);
        }
        
      } catch (error) {
        let errorMessage = 'Unknown error';
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'object' && error !== null) {
          // Handle Axios errors or other error objects
          const errorObj = error as unknown as { message?: string; response?: { data?: { message?: string } } };
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

      const content = emailTemplate.content
        .replace(/\{\{\s*participant_name\s*\}\}/g, participant.name)
        .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '')
        .replace(/\{\{\s*event_date\s*\}\}/g, event?.date ? new Date(event.date).toLocaleDateString() : '')
        .replace(/\{\{\s*certificate_id\s*\}\}/g, participant.id || '')
        .replace(/\{\{\s*organizer_name\s*\}\}/g, event?.organizer || '');

      const subject = emailTemplate.subject
        .replace(/\{\{\s*event_name\s*\}\}/g, event?.name || '');

      const emailData = {
        subject,
        content,
        certificatePDF
      };
      const result = await sendEmail(participant.id, selectedEventId, emailData);
      console.log("Executing email status update...");
      try {
        await updateEmailStatus(participant.email, selectedEventId);
        await loadParticipants(selectedEventId);
      } catch (error) {
        console.error("Failed to update email status:", error);
      }
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      {/* SETU Header */}
      <motion.div 
        className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-8 py-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-6">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Certificate Management</h1>
              <p className="text-emerald-100 text-lg">Generate and distribute certificates with professional efficiency - SETU Platform</p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            <motion.button
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'generate'
                  ? 'bg-white text-emerald-700 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('generate')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Award className="h-5 w-5 mr-2" />
              Generate Certificates
            </motion.button>
            <motion.button
              className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                activeTab === 'email'
                  ? 'bg-white text-blue-700 shadow-lg'
                  : 'text-white hover:bg-white/10'
              }`}
              onClick={() => setActiveTab('email')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Send className="h-5 w-5 mr-2" />
              Email Distribution
            </motion.button>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Configuration Panel */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-8"
          data-aos="fade-up"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center">
              <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Configuration</h2>
                <p className="text-blue-100 text-sm">Set up your certificate generation preferences</p>
              </div>
            </div>
          </div>

          <div className="p-8">
            {activeTab === 'email' && (
              <motion.div 
                className="mb-8 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border border-blue-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center">
                    <Mail className="h-5 w-5 text-blue-600 mr-2" />
                    <h3 className="text-lg font-bold text-gray-800">Email Template</h3>
                  </div>
                  <motion.button
                    onClick={() => setIsEditingTemplate(!isEditingTemplate)}
                    className="bg-gradient-to-r from-blue-600 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-blue-700 hover:to-emerald-700 transition-all duration-300 text-sm font-medium"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isEditingTemplate ? 'Cancel' : 'Edit Template'}
                  </motion.button>
                </div>
                {isEditingTemplate ? (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Subject Template
                      </label>
                      <input
                        type="text"
                        value={editedTemplate.subject}
                        onChange={(e) => setEditedTemplate(prev => ({ ...prev, subject: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter email subject template..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Content Template
                      </label>
                      <textarea
                        value={editedTemplate.content}
                        onChange={(e) => setEditedTemplate(prev => ({ ...prev, content: e.target.value }))}
                        rows={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        placeholder="Enter email content template..."
                      />
                    </div>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                      <p className="text-sm font-bold text-emerald-800 mb-2">Available Variables:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {['{{ participant_name }}', '{{ event_name }}', '{{ event_date }}', '{{ certificate_id }}', '{{ organizer_name }}'].map((variable) => (
                          <span key={variable} className="bg-emerald-100 text-emerald-800 text-xs font-medium px-3 py-1 rounded-full">
                            {variable}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <motion.button
                        onClick={() => {
                          setEmailTemplate(editedTemplate);
                          setIsEditingTemplate(false);
                        }}
                        className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 font-medium shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Save Template
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm font-bold text-gray-700 mb-2">Current Subject:</p>
                      <p className="text-sm text-gray-600">{emailTemplate.subject}</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                      <p className="text-sm font-bold text-gray-700 mb-2">Current Content:</p>
                      <p className="text-sm text-gray-600 whitespace-pre-wrap max-h-32 overflow-y-auto">{emailTemplate.content}</p>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  <Calendar className="h-4 w-4 inline mr-2 text-emerald-600" />
                  Select Event
                </label>
                <select
                  value={selectedEventId}
                  onChange={(e) => setSelectedEventId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-white"
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
              </motion.div>

              {activeTab === 'generate' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    <FileImage className="h-4 w-4 inline mr-2 text-blue-600" />
                    Select Template
                  </label>
                  <select
                    value={selectedTemplateId}
                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Choose a template</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name} ({template.type})
                      </option>
                    ))}
                  </select>
                </motion.div>
              )}
            </div>

            {selectedEventId && (
              <motion.div 
                className="mt-8 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <CheckCircle className="h-6 w-6 text-emerald-600 mr-3" />
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {activeTab === 'generate' 
                          ? `Ready to generate ${pendingCount} certificates`
                          : `Ready to email ${readyToEmailCount} certificates`}
                      </h3>
                      <p className="text-sm text-gray-600">for {selectedEvent?.name}</p>
                    </div>
                  </div>
                  {activeTab === 'generate' ? (
                    <motion.button
                      onClick={handleBulkGenerate}
                      disabled={generating || pendingCount === 0 || !selectedTemplateId}
                      className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-emerald-700 hover:to-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-lg"
                      whileHover={{ scale: generating ? 1 : 1.05 }}
                      whileTap={{ scale: generating ? 1 : 0.95 }}
                    >
                      {generating ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Generate All Certificates
                        </>
                      )}
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={handleBulkEmail}
                      disabled={sending || readyToEmailCount === 0}
                      className="bg-gradient-to-r from-blue-600 to-purple-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center font-medium shadow-lg"
                      whileHover={{ scale: sending ? 1 : 1.05 }}
                      whileTap={{ scale: sending ? 1 : 0.95 }}
                    >
                      {sending ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-5 w-5 mr-2" />
                          Send All Emails
                        </>
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Statistics Dashboard */}
        {selectedEventId && (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
            data-aos="fade-up"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Participants</p>
                  <p className="text-2xl font-bold text-gray-900">{eventParticipants.length}</p>
                  <p className="text-xs text-gray-500 mt-1">Registered attendees</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-emerald-100 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Generated</p>
                  <p className="text-2xl font-bold text-emerald-600">{generatedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Certificates created</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-emerald-100 to-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Emailed</p>
                  <p className="text-2xl font-bold text-blue-600">{emailedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">Successfully sent</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: 1.02, y: -2 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-orange-600">{activeTab === 'generate' ? pendingCount : readyToEmailCount}</p>
                  <p className="text-xs text-gray-500 mt-1">{activeTab === 'generate' ? 'To generate' : 'Ready to email'}</p>
                </div>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-100 to-yellow-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

      {/* Offscreen render root for programmatic captures (kept offscreen so users don't see it) */}
      <div id="certificate-render-root" aria-hidden="true" style={{ position: 'absolute', left: '-9999px', top: 0, width: '210mm', height: '297mm', overflow: 'hidden', pointerEvents: 'none', zIndex: -1 }}>
        {offscreenPreviewParticipant && selectedTemplate && (
          <div className="bg-white p-4" style={{ maxWidth: '100%', overflowX: 'auto' }}>
            <div className="certificate-preview-content" style={{ 
              width: '210mm', 
              minHeight: '297mm', 
              background: '#fff', 
              position: 'relative', 
              padding: '15mm',
              boxSizing: 'border-box',
              margin: '0 auto'
            }}>
              {(() => {
                const content = generatePreviewContent(offscreenPreviewParticipant);
                if (typeof content === 'object' && content.type === 'image') {
                  return (
                    <div className="flex justify-center">
                      <div className="relative" style={{ width: '180mm', minHeight: '267mm', margin: '0 auto' }}>
                        {content.backgroundImage && (
                          <img src={content.backgroundImage} alt="Certificate background" className="w-full h-full object-contain rounded-lg" />
                        )}
                        {content.placeholders?.map((placeholder: ImagePlaceholder) => (
                          <div key={placeholder.id} className="absolute" style={{
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
                          }}>
                            {placeholder.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                } else {
                  return (
                    <div dangerouslySetInnerHTML={{ __html: content as string }} style={{ width: '180mm', minHeight: '267mm', margin: '0 auto' }} />
                  );
                }
              })()}
            </div>
          </div>
        )}
      </div>

        {/* Participants Table */}
        {selectedEventId && (
          <motion.div 
            className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden"
            data-aos="fade-up"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="bg-gradient-to-r from-purple-600 to-emerald-600 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Participants</h2>
                    <p className="text-purple-100 text-sm">{selectedEvent?.name} - {eventParticipants.length} participants</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm font-medium">
                    {eventParticipants.length} Total
                  </span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-emerald-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Participant
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Certificate ID
                    </th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  <AnimatePresence>
                    {eventParticipants.map((participant, index) => (
                      <motion.tr 
                        key={participant.id} 
                        className="hover:bg-gradient-to-r hover:from-gray-50 hover:to-emerald-50 transition-all duration-300"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-full flex items-center justify-center mr-4">
                              <span className="text-emerald-700 font-bold text-sm">
                                {participant.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900">{participant.name}</div>
                              <div className="text-sm text-gray-600 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {participant.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          {participant.certificateGenerated ? (
                            participant.emailSent ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                <Mail className="h-3 w-3 mr-1" />
                                Emailed
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Generated
                              </span>
                            )
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-mono text-gray-600">
                              {(() => {
                                if (!participant.id) return 'N/A';
                                const cert = certificates.find(c => c.id === participant.id);
                                return cert?.certificateNumber || participant.id || 'N/A';
                              })()}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center space-x-2">
                            {activeTab === 'generate' && selectedTemplateId && (
                              <motion.button
                                onClick={() => handlePreview(participant)}
                                className="flex items-center px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-all duration-200 text-xs font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </motion.button>
                            )}
                            {participant.certificateGenerated && (
                              <>
                                <motion.button
                                  onClick={() => handleDownloadCertificate(participant, 'pdf')}
                                  className="flex items-center px-3 py-2 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 text-xs font-medium"
                                  title="Download as PDF"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <FileText className="h-3 w-3 mr-1" />
                                  PDF
                                </motion.button>
                                <motion.button
                                  onClick={() => handleDownloadCertificate(participant, 'jpg')}
                                  className="flex items-center px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-all duration-200 text-xs font-medium"
                                  title="Download as JPG"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <ImageIcon className="h-3 w-3 mr-1" />
                                  JPG
                                </motion.button>
                                {!participant.emailSent && (
                                  <motion.button
                                    onClick={() => handleSendEmail(participant)}
                                    className="flex items-center px-3 py-2 bg-gradient-to-r from-blue-100 to-emerald-100 text-blue-700 rounded-lg hover:from-blue-200 hover:to-emerald-200 transition-all duration-200 text-xs font-medium"
                                    title={`Send certificate to ${participant.email}`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    <Mail className="h-3 w-3 mr-1" />
                                    Email
                                  </motion.button>
                                )}
                              </>
                            )}
                            {!participant.certificateGenerated && activeTab === 'generate' && selectedTemplateId && (
                              <motion.button
                                onClick={() => generateCertificate(participant.id, selectedEventId)}
                                className="flex items-center px-3 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-all duration-200 text-xs font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Award className="h-3 w-3 mr-1" />
                                Generate
                              </motion.button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {eventParticipants.length === 0 && (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 font-medium">No participants found</p>
                  <p className="text-gray-400 text-sm">Add participants to this event to get started</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Enhanced Preview Modal */}
        <AnimatePresence>
          {previewParticipant && selectedTemplate && (
            <motion.div 
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={(e) => e.target === e.currentTarget && setPreviewParticipant(null)}
            >
              <motion.div 
                className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden"
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 50 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-gradient-to-r from-emerald-600 to-blue-700 px-8 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                        <Eye className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">
                          Certificate Preview
                        </h2>
                        <p className="text-emerald-100 text-sm">{previewParticipant.name} - SETU Platform</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <motion.button
                        onClick={() => handleDownloadCertificate(previewParticipant, 'pdf')}
                        className="flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </motion.button>
                      <motion.button
                        onClick={() => setPreviewParticipant(null)}
                        className="text-white/80 hover:text-white hover:bg-white/10 rounded-lg p-2 transition-all duration-200"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✕
                      </motion.button>
                    </div>
                  </div>
                </div>
                
                <div className="p-8 overflow-auto bg-gradient-to-br from-gray-50 to-emerald-50" style={{ maxHeight: 'calc(90vh - 120px)' }}>
                  <div id="certificate-wrapper" className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200 flex justify-center" style={{ maxWidth: '100%', overflowX: 'auto' }}>
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
                            <div className="relative shadow-2xl rounded-xl overflow-hidden" style={{ width: '180mm', minHeight: '267mm', margin: '0 auto' }}>
                              {content.backgroundImage && (
                                <img
                                  src={content.backgroundImage}
                                  alt="Certificate background"
                                  className="w-full h-full object-contain"
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
                            className="shadow-2xl rounded-xl overflow-hidden bg-white"
                            dangerouslySetInnerHTML={{
                              __html: content as string
                            }}
                            style={{ width: '180mm', minHeight: '267mm', margin: '0 auto', padding: '20px' }}
                          />
                        );
                      }
                    })()}
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Merged;
