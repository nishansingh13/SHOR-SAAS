import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LayoutDashboard, Calendar, BookTemplate as FileTemplate, Users, BarChart3, Award as LogoIcon, BarChart2 } from 'lucide-react';

type RouteType = 'dashboard' | 'events' | 'templates' | 'participants' | 'certificates' | 'email' | 'reports' | 'participate';

interface SidebarProps {
  currentPage: RouteType;
  onPageChange?: (page: RouteType) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', label: 'Events', icon: Calendar },
    { id: 'templates', label: 'Templates', icon: FileTemplate },
  { id: 'approvals', label: 'Approvals', icon: Users },
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'others', label: 'Others', icon: BarChart2 }
  ];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(item => {
    if (user?.role === 'organizer') {
      // Organizers can't access reports
      return item.id !== 'reports' && item.id !== 'approvals';
    }
    // Only admins should see approvals
    if (item.id === 'approvals') return user?.role === 'admin';
    return true;
  });

  const handleNavigation = (page: RouteType) => {
    navigate(`/${page}`);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <div className="h-8 w-8 bg-gradient-to-r from-emerald-600 to-blue-700 rounded-lg flex items-center justify-center">
          <LogoIcon className="h-5 w-5 text-white" />
        </div>
        <span className="ml-2 text-xl font-bold text-gray-900">SETU</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.id as RouteType)}
              className={`
                w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive
                  ? 'bg-gradient-to-r from-emerald-50 to-blue-50 text-emerald-700 border-r-2 border-emerald-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="px-4 py-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="h-8 w-8 bg-gradient-to-r from-emerald-600 to-blue-700 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">
              {(user?.name?.charAt(0)?.toUpperCase()) || 'S'}
            </span>
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name ?? 'Guest'}</p>
            <p className="text-xs text-gray-500 capitalize">{user?.role ?? 'guest'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;