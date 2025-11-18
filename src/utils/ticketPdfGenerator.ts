import jsPDF from 'jspdf';
import { generateTicketQRCode } from '../utils/qrCodeUtils';

interface TicketData {
  ticketNumber: string;
  participantName: string;
  participantEmail: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventVenue: string;
  eventType: string;
  ticketType: string;
  price: number;
  eventId: string;
  participantId: string;
  onlineMeetingLink?: string;
  onlinePlatform?: string;
}

export const generateTicketPDF = async (ticketData: TicketData): Promise<Blob> => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  // Generate QR code
  const qrCodeImage = await generateTicketQRCode(
    ticketData.ticketNumber,
    ticketData.eventId,
    ticketData.participantId
  );

  // Colors
  const primaryColor = '#10b981'; // Emerald
  const secondaryColor = '#3b82f6'; // Blue
  const textColor = '#1f2937';
  const lightGray = '#f3f4f6';

  // Header with gradient effect
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, 210, 50, 'F');
  
  doc.setFillColor(59, 130, 246);
  doc.triangle(210, 0, 210, 50, 150, 50, 'F');

  // Event Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(ticketData.eventTitle, 20, 25, { maxWidth: 170 });

  // Ticket Number Header
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('TICKET #', 20, 40);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(ticketData.ticketNumber, 20, 46);

  // Main Content Background
  doc.setFillColor(243, 244, 246);
  doc.rect(10, 60, 190, 110, 'F');

  // Left Column - Participant Info
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 65, 85, 50, 3, 3, 'F');
  
  doc.setTextColor(31, 41, 55);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('PARTICIPANT', 20, 73);
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(ticketData.participantName, 20, 82, { maxWidth: 75 });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(107, 114, 128);
  doc.text(ticketData.participantEmail, 20, 88, { maxWidth: 75 });
  
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text('Ticket Type:', 20, 100);
  doc.setFont('helvetica', 'normal');
  doc.text(ticketData.ticketType, 20, 106);

  // Right Column - QR Code
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(110, 65, 85, 50, 3, 3, 'F');
  
  doc.addImage(qrCodeImage, 'PNG', 120, 70, 40, 40);
  
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.setFont('helvetica', 'normal');
  doc.text('Scan for check-in', 130, 112, { align: 'center' });

  // Event Details
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(15, 125, 180, 40, 3, 3, 'F');
  
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'bold');
  doc.text('EVENT DETAILS', 20, 133);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  
  // Date & Time
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', 20, 142);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date(ticketData.eventDate).toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  }), 35, 142);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Time:', 20, 149);
  doc.setFont('helvetica', 'normal');
  doc.text(ticketData.eventTime, 35, 149);

  // Venue/Platform
  doc.setFont('helvetica', 'bold');
  if (ticketData.eventType === 'online' && ticketData.onlinePlatform) {
    doc.text('Platform:', 20, 156);
    doc.setFont('helvetica', 'normal');
    doc.text(ticketData.onlinePlatform, 35, 156);
    
    if (ticketData.onlineMeetingLink) {
      doc.setFont('helvetica', 'bold');
      doc.text('Link:', 20, 163);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(59, 130, 246);
      doc.textWithLink(ticketData.onlineMeetingLink.substring(0, 50), 35, 163, { 
        url: ticketData.onlineMeetingLink 
      });
    }
  } else {
    doc.text('Venue:', 20, 156);
    doc.setFont('helvetica', 'normal');
    doc.text(ticketData.eventVenue, 35, 156, { maxWidth: 155 });
  }

  // Price
  doc.setFillColor(16, 185, 129);
  doc.roundedRect(140, 138, 50, 12, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`₹ ${ticketData.price.toFixed(2)}`, 165, 146, { align: 'center' });

  // Event Type Badge
  doc.setFillColor(59, 130, 246);
  doc.roundedRect(140, 152, 50, 10, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(ticketData.eventType.toUpperCase(), 165, 159, { align: 'center' });

  // Footer
  doc.setFillColor(243, 244, 246);
  doc.rect(0, 180, 210, 40, 'F');
  
  doc.setTextColor(107, 114, 128);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Important Information:', 20, 190);
  doc.setFontSize(7);
  doc.text('• Please bring this ticket (printed or digital) for entry', 20, 196);
  doc.text('• This ticket is non-transferable unless explicitly allowed', 20, 200);
  doc.text('• Check-in opens 30 minutes before the event', 20, 204);
  doc.text('• For support, contact the event organizer', 20, 208);

  // Branding
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(16, 185, 129);
  doc.text('SETU Event Platform', 105, 220, { align: 'center' });

  return doc.output('blob');
};

export const downloadTicketPDF = async (ticketData: TicketData): Promise<void> => {
  const blob = await generateTicketPDF(ticketData);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `ticket-${ticketData.ticketNumber}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
