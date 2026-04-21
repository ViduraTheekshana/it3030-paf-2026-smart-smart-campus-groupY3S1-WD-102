import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  X, 
  MapPin, 
  Users, 
  Clock, 
  Edit, 
  Trash2,
  Home,
  Microscope,
  Building,
  Package,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function AdminResourceModal({ resource, onClose, onDelete }) {
  const navigate = useNavigate();

  if (!resource) return null;

  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'lab': return <Microscope className="w-4 h-4" />;
      case 'hall': return <Building className="w-4 h-4" />;
      case 'room': return <Home className="w-4 h-4" />;
      case 'equipment': return <Package className="w-4 h-4" />;
      default: return <Home className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'text-green-600 bg-green-50 border-green-200';
      case 'out of service': return 'text-red-600 bg-red-50 border-red-200';
      case 'out_of_service': return 'text-red-600 bg-red-50 border-red-200';
      case 'available': return 'text-green-600 bg-green-50 border-green-200';
      case 'maintenance': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'occupied': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return <CheckCircle className="w-4 h-4" />;
      case 'out of service': return <XCircle className="w-4 h-4" />;
      case 'out_of_service': return <XCircle className="w-4 h-4" />;
      case 'available': return <CheckCircle className="w-4 h-4" />;
      case 'maintenance': return <XCircle className="w-4 h-4" />;
      case 'occupied': return <XCircle className="w-4 h-4" />;
      default: return <CheckCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{resource.name}</h2>
              <div className="flex items-center gap-3 mt-2">
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                  {getStatusIcon(resource.status)}
                  <span>{resource.status?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  {getResourceIcon(resource.type)}
                  <span>{resource.type}</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Image */}
        {resource.imageUrl && (
          <div className="border-b border-gray-200">
            <img 
              src={resource.imageUrl} 
              alt={resource.name}
              className="w-full h-40 object-cover"
            />
          </div>
        )}

        {/* All Data Fields */}
        <div className="p-4 space-y-4">
          {/* Description */}
          {resource.description && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Description</div>
              <div className="text-sm text-gray-600">{resource.description}</div>
            </div>
          )}

          {/* Basic Info Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Location</div>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{resource.location}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-gray-700 mb-1">Capacity</div>
              <div className="flex items-center gap-2 text-sm text-gray-900">
                <Users className="w-4 h-4 text-gray-400" />
                <span>{resource.capacity} people</span>
              </div>
            </div>
          </div>

          {/* Availability Times */}
          {(resource.availabilityStart || resource.availabilityEnd) && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">Availability Hours</div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Start Time</div>
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{resource.availabilityStart || 'Not set'}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">End Time</div>
                  <div className="flex items-center gap-2 text-sm text-gray-900">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{resource.availabilityEnd || 'Not set'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="space-y-3">
            <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
              <span className="text-sm text-gray-600">Resource ID</span>
              <span className="text-sm font-medium text-gray-900">#{resource.resourceID}</span>
            </div>

            {resource.status && (
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Status</span>
                <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                  {getStatusIcon(resource.status)}
                  <span>{resource.status?.replace('_', ' ')}</span>
                </div>
              </div>
            )}

            {resource.updatedAt && (
              <div className="flex justify-between py-2 px-3 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm text-gray-900">
                  {new Date(resource.updatedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* Admin Action Buttons */}
          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button 
              onClick={() => navigate(`/edit/${resource.resourceID}`)}
              className="flex-1 bg-yellow-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-yellow-700 transition-colors flex items-center justify-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Update Resource
            </button>
            <button 
              onClick={() => onDelete(resource.resourceID)}
              className="flex-1 bg-red-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete Resource
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}