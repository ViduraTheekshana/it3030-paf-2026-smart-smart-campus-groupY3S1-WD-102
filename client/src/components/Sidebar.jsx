import { useLocation, Link } from "react-router-dom";
import { 
  LayoutDashboard, 
  FolderOpen, 
  PlusCircle, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Calendar,
  Ticket
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    resourceManagement: true
  });

  const menuItems = [
    { 
      icon: Users, 
      label: "User Management", 
      path: "/users",
      section: "userManagement"
    },
    { 
      icon: Calendar, 
      label: "Booking Management", 
      path: "/bookings",
      section: "resourceBooking"
    },
    { 
      icon: Ticket, 
      label: "Ticket Management", 
      path: "/tickets",
      section: "ticketManagement"
    },
  ];

  const resourceManagementItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: FolderOpen, label: "Resources", path: "/admin" },
    { icon: PlusCircle, label: "Add Resource", path: "/add" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className={`${isCollapsed ? 'hidden' : 'block'}`}>
            <h1 className="text-xl text-slate-400 font-bold">Smart Campus</h1>
            <p className="text-xs text-slate-400">Management Portal</p>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
          >
            {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4">
        <ul className="space-y-2">
          {/* User Management Section */}
          {menuItems.filter(item => item.section === 'userManagement').map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {!isCollapsed && (
                    <span className={`font-medium ${isActive(item.path) ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}

          {/* Resource Management Section */}
          <li>
            <button
              onClick={() => setExpandedSections(prev => ({
                ...prev,
                resourceManagement: !prev.resourceManagement
              }))}
              className={`flex items-center justify-between w-full px-4 py-3 rounded-lg transition-all duration-200 ${
                expandedSections.resourceManagement
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                  : 'hover:bg-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FolderOpen className="w-5 h-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium whitespace-nowrap">Resource Management</span>
                )}
              </div>
              {!isCollapsed && (
                expandedSections.resourceManagement ? 
                  <ChevronDown className="w-4 h-4" /> : 
                  <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {/* Sub-items */}
            {expandedSections.resourceManagement && !isCollapsed && (
              <ul className="mt-2 space-y-1 pl-4">
                {resourceManagementItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 group ${
                          isActive(item.path)
                            ? 'bg-blue-500/20 text-blue-300 border-l-2 border-blue-400'
                            : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive(item.path) ? 'text-blue-300' : 'text-slate-500 group-hover:text-slate-300'}`} />
                        <span className={`text-sm ${isActive(item.path) ? 'text-blue-300 font-medium' : ''}`}>
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>

          {/* Other Menu Items */}
          {menuItems.filter(item => item.section !== 'userManagement').map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                    isActive(item.path)
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                      : 'hover:bg-slate-700 text-slate-300 hover:text-white'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-white'}`} />
                  {!isCollapsed && (
                    <span className={`font-medium ${isActive(item.path) ? 'text-white' : ''}`}>
                      {item.label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
        <button className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 hover:bg-red-600/20 text-slate-300 hover:text-red-400 w-full ${isCollapsed ? 'justify-center' : ''}`}>
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
}