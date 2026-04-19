import { motion } from "framer-motion";
import { 
  MapPin, 
  Users, 
  Home,
  Microscope,
  Building,
  Package
} from "lucide-react";

export default function ResourceCard({ resource, viewMode, onClick }) {
  const getResourceIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'lab': return <Microscope className="w-5 h-5" />;
      case 'hall': return <Building className="w-5 h-5" />;
      case 'room': return <Home className="w-5 h-5" />;
      case 'equipment': return <Package className="w-5 h-5" />;
      default: return <Home className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status) => {
    const normalizedStatus = status?.toLowerCase().replace(/[_\s]+/g, ' ');
    switch (normalizedStatus) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'out of service': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <motion.div
      key={resource.resourceID}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className={
        viewMode === "grid"
          ? "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all cursor-pointer"
          : "bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-all cursor-pointer"
      }
      onClick={() => onClick(resource)}
    >
      {viewMode === "grid" ? (
        <>
          <div className="h-32 sm:h-48 bg-gradient-to-br from-blue-100 to-indigo-100 relative">
            {resource.imageUrl ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                <Home className="w-8 h-8 text-blue-400" />
              </div>
            )}
            <div className="absolute top-2 right-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                {resource.status?.replace('_', ' ')}
              </span>
            </div>
          </div>
          <div className="p-3 sm:p-5">
            <div className="flex items-center gap-2 mb-2">
              {getResourceIcon(resource.type)}
              <span className="text-xs sm:text-sm text-gray-500">{resource.type}</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{resource.name}</h3>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3">
              <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{resource.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{resource.capacity} capacity</span>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm">
                View →
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex-shrink-0">
            {resource.imageUrl ? (
              <img 
                src={resource.imageUrl} 
                alt={resource.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-400" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                {resource.status?.replace('_', ' ')}
              </span>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                {getResourceIcon(resource.type)}
                <span>{resource.type}</span>
              </div>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{resource.name}</h3>
            <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{resource.location}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{resource.capacity} capacity</span>
              </div>
            </div>
          </div>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm">
            View →
          </button>
        </div>
      )}
    </motion.div>
  );
}