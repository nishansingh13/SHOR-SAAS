import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AdminProvider } from './contexts/AdminContext';
import { EventProvider } from './contexts/EventContext';
import { TemplateProvider } from './contexts/TemplateContext';
import { ParticipantProvider } from './contexts/ParticipantContext';
import { CertificateProvider } from './contexts/CertificateContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import EventManagement from './components/Events/EventManagement';
import TemplateManagement from './components/Templates/TemplateManagement';
import AdminApproval from './components/Admin/AdminApproval';
import ParticipantManagement from './components/Participants/ParticipantManagement';

import EmailDistribution from './components/Email/EmailDistribution';
import Reports from './components/Reports/Reports';
import ParticipantPortal from './components/Participants/ParticipantPortal';
import CertificateGeneration from './components/Certificates/CertificateGeneration';
// import { Merge } from 'lucide-react';
import Merged from './components/Merged/Merged';
import EmailProvider from './contexts/EmailContext';
import LandingPage from './components/Landing/LandingPage';
import EventLocationPicker from './components/Events/LocationTracker';

// Type defining all valid routes in the app
type RouteType = 'dashboard' | 'events' | 'templates' | 'participants' | 'certificates' | 'email' | 'reports' | 'participate';

// Protected route component that requires authentication
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for authentication to finish loading before making a decision
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {  
    // Redirect to login if not authenticated, but remember the page they tried to access
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>; 
};

// Layout component for admin pages with sidebar and header
const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  
  // Extract current page from URL path
  const currentPage = location.pathname.substring(1) || 'dashboard';

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-gray-600 opacity-75"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <Sidebar currentPage={currentPage as RouteType} />
      </div>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header 
          onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Routes>
 
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events" element={<EventManagement />} />
              <Route path="/templates" element={<TemplateManagement />} />
              <Route path="/approvals" element={<AdminApproval />} />
              <Route path="/participants" element={<ParticipantManagement />} />
              <Route path="/certificates" element={<CertificateGeneration />} />
              <Route path="/email" element={<EmailDistribution />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/others" element={<Merged/>}/>
              <Route path ='/some' element={<EventLocationPicker />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AdminProvider>
        <EventProvider>
          <TemplateProvider>
            <ParticipantProvider>
              <CertificateProvider>
                <EmailProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/participate" element={<ParticipantPortal />} />
                  <Route path="/login" element={<Login />} />
                  {/* Protected admin routes */}
                  <Route 
                    path="/*" 
                    element={
                      <ProtectedRoute>
                        <AdminLayout />
                        </ProtectedRoute>
                    } 
                  />
                </Routes>
                </EmailProvider>
              </CertificateProvider>
            </ParticipantProvider>
          </TemplateProvider>
        </EventProvider>
        </AdminProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;