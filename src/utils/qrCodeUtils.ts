import QRCode from 'qrcode';

// Generate QR code as base64 image
export const generateQRCodeImage = async (data: string): Promise<string> => {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(data, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

// Generate QR code for ticket validation
export const generateTicketQRCode = async (
  ticketNumber: string,
  eventId: string,
  participantId: string
): Promise<string> => {
  const data = JSON.stringify({
    ticket: ticketNumber,
    event: eventId,
    participant: participantId,
    timestamp: Date.now(),
  });
  
  const base64Data = btoa(data);
  return await generateQRCodeImage(base64Data);
};

// Decode QR code data
export const decodeTicketQRData = (base64Data: string): {
  ticket: string;
  event: string;
  participant: string;
  timestamp: number;
} | null => {
  try {
    const decoded = atob(base64Data);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Error decoding QR data:', error);
    return null;
  }
};
