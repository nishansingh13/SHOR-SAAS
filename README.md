# SHOR-SAAS - Multi-Organizational Event Ticket Platform

A comprehensive event management platform with advanced ticketing, certificate generation, and multi-organizational support.

## 🚀 Key Features

### 1. Multi-Organization Support
- **Organization Management**: Create and manage multiple organizations
- **Role-Based Access**: Owner, Admin, Organizer, and Staff roles
- **Member Management**: Add/remove team members with specific roles
- **Organization Dashboard**: Dedicated space for each organization

### 2. Online/Offline/Hybrid Events
- **Event Types**:
  - **Offline**: In-person events with venue details
  - **Online**: Virtual events with meeting links (Zoom, Teams, etc.)
  - **Hybrid**: Combined in-person and virtual attendance
- **Meeting Integration**: Support for online meeting platforms
- **Flexible Venue Management**: Physical locations or virtual platforms

### 3. Advanced Ticket System
- **QR Code Generation**: Unique QR codes for each ticket
- **Ticket Types**: Support for multiple ticket types (General, VIP, Student, etc.)
- **Automatic Generation**: Tickets auto-generated on registration
- **Ticket Status Tracking**:
  - Valid
  - Used (checked in)
  - Cancelled
  - Expired
- **PDF Tickets**: Professional ticket PDFs with QR codes
- **Digital Tickets**: View and manage tickets online

### 4. Ticket Validator System
- **Real-time Validation**: Scan QR codes to validate tickets
- **Check-in Tracking**: Record check-in time and location
- **Staff Interface**: Dedicated portal for event staff
- **Duplicate Prevention**: Prevent double check-ins
- **Offline Capability**: Works with pre-downloaded ticket data

### 5. Check-in Dashboard
- **Real-time Statistics**:
  - Total tickets sold
  - Check-in count
  - Valid tickets remaining
  - Check-in rate percentage
- **Hourly Analytics**: View check-in patterns over 24 hours
- **Event Selection**: Switch between multiple events
- **Visual Charts**: Interactive charts and graphs

### 6. Certificate System
- **Certificate Generation**: Automatic certificate creation
- **Template Management**: Custom certificate templates
- **Bulk Distribution**: Send certificates to all participants
- **Email Integration**: Automated certificate delivery
- **Certificate Verification**: Verify authenticity of certificates

### 7. Participant Management
- **Registration System**: Easy participant registration
- **Profile Management**: Manage participant information
- **Volunteer Tracking**: Separate tracking for volunteers
- **T-shirt Size Collection**: For events providing merchandise
- **Payment Integration**: Razorpay payment gateway

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Axios** for API calls
- **jsPDF** for PDF generation
- **QRCode** library for QR code generation

### Backend
- **Node.js** with Express
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Nodemailer** for email
- **Cloudinary** for image uploads
- **Razorpay** for payments

## 📋 API Endpoints

### Organizations
- `POST /api/organizations` - Create organization
- `GET /api/organizations` - Get all organizations (admin)
- `GET /api/organizations/my-organization` - Get user's organization
- `GET /api/organizations/:id` - Get organization by ID
- `PUT /api/organizations/:id` - Update organization
- `POST /api/organizations/:id/members` - Add member
- `DELETE /api/organizations/:id/members/:memberId` - Remove member
- `DELETE /api/organizations/:id` - Delete organization

### Tickets
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket by ID
- `GET /api/tickets/number/:ticketNumber` - Get ticket by number
- `POST /api/tickets/validate` - Validate and check-in ticket
- `GET /api/tickets/event/:eventId` - Get all tickets for event
- `GET /api/tickets/participant/:participantId` - Get participant's tickets
- `PUT /api/tickets/:id/cancel` - Cancel ticket
- `GET /api/tickets/event/:eventId/stats` - Get check-in statistics

### Events
- Event CRUD operations
- Support for online/offline/hybrid types
- Organization-based event management

### Participants
- Registration with automatic ticket generation
- Participant listing and management
- Check-in status tracking

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Different permissions for different roles
- **QR Code Encryption**: Secure QR code data encoding
- **Geolocation Tracking**: Record check-in locations
- **Duplicate Prevention**: Prevent ticket reuse

## 📱 User Interfaces

### Admin Dashboard
- Event management
- Organization management
- Participant management
- Report generation
- Approval workflows

### Organizer Dashboard
- Create and manage events
- View participant lists
- Access check-in dashboard
- Generate certificates
- Send emails

### Staff Interface
- Ticket validator
- Check-in dashboard
- Event statistics

### Participant Portal
- Event registration
- View tickets
- Download PDF tickets
- Access certificates

## 🎨 Event Types

### Offline Events
- Venue-based events
- Physical check-in with QR codes
- Location tracking for check-ins

### Online Events
- Virtual event platform integration
- Meeting links provided on tickets
- No physical check-in required

### Hybrid Events
- Combined physical and virtual attendance
- Separate tracking for both types
- Flexible check-in options

## 📊 Analytics & Reporting

- Check-in statistics
- Participant demographics
- Event performance metrics
- Certificate distribution tracking
- Hourly check-in patterns

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nishansingh13/SHOR-SAAS.git
cd SHOR-SAAS
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_password
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

4. Run the development server:
```bash
# Frontend
npm run dev

# Backend
cd backend
node index.js
```

## 📝 Usage Examples

### Creating an Event
1. Log in as an organizer
2. Navigate to "Events"
3. Click "Create New Event"
4. Select event type (online/offline/hybrid)
5. Fill in event details
6. Add ticket types and prices
7. Save the event

### Validating Tickets
1. Log in as staff
2. Navigate to "Ticket Validator"
3. Scan QR code from participant's ticket
4. System validates and checks in automatically
5. View participant details and confirmation

### Viewing Statistics
1. Navigate to "Check-in Stats"
2. Select an event
3. View real-time statistics:
   - Total tickets
   - Checked-in count
   - Valid tickets
   - Check-in rate
   - Hourly patterns

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@setu-platform.com or open an issue in the repository.

## 🎯 Future Enhancements

- [ ] Mobile app for ticket scanning
- [ ] NFC/RFID support for check-ins
- [ ] Advanced analytics dashboard
- [ ] Integration with more payment gateways
- [ ] Social media integration
- [ ] Waitlist management
- [ ] Ticket transfer functionality
- [ ] Calendar app integration (iCal export)
- [ ] Multi-language support
- [ ] Custom branding for organizations
