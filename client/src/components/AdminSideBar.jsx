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
      icon: FolderOpen, 
      label: "Resource Management", 
      path: "/admin",
      section: "resourceManagement"
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
          {menuItems.map((item) => {
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