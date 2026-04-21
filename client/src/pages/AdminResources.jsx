import { useEffect, useState } from "react";
import { getAll, remove, getSummary } from "../api/ResourceAPI";
import ResourceModal from "../components/AdminResourceModal";
import { motion } from "framer-motion";
import { 
  Search, 
  Plus, 
  Grid, 
  List, 
  Edit, 
  Trash2, 
  Eye,
  TrendingUp,
  Users,
  MapPin,
  Home,
  Microscope,
  Building,
  Package,
  AlertCircle
} from "lucide-react";

export default function AdminResources() {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0, types: 0 });

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const filtered = data.filter(resource =>
      resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.location?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const load = () => {
    setLoading(true);
    Promise.all([
      getAll(),
      getSummary()
    ]).then(([resourcesRes, summaryRes]) => {
      setData(resourcesRes.data || []);
      setSummary(summaryRes.data || { total: 0, active: 0, inactive: 0, types: 0 });
      setLoading(false);
    }).catch(error => {
      console.error('Error loading data:', error);
      setLoading(false);
    });
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this resource? This action cannot be undone.")) {
      remove(id).then(() => {
        setSelected(null);
        load();
      });
    }
  };

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
    <div className="flex bg-gray-50 min-h-screen">

      <div className="ml-64 flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Management</h1>
                  <p className="text-gray-600">Manage and monitor all campus resources</p>
                </div>
                <button
                  onClick={() => window.location.href = "/add"}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Add Resource
                </button>
              </div>
            </div>
          </motion.div>

          {/* Summary Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Resources</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Active Resources</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.active}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Out of Service</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.inactive}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Resource Types</p>
                  <p className="text-2xl font-bold text-gray-900">{summary.types}</p>
                </div>
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Package className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Controls */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 bg-white rounded-2xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources by name, type, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-3 rounded-xl transition-colors ${
                    viewMode === "grid" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-3 rounded-xl transition-colors ${
                    viewMode === "list" 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </motion.div>

          {/* Resources Grid/List */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-3"}
          >
            {filteredData.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              filteredData.map((resource) => (
                <motion.div
                  key={resource.resourceID}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -4 }}
                  className={viewMode === "grid" 
                    ? "bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200" 
                    : "bg-white rounded-2xl shadow-sm border border-gray-200 p-4 hover:shadow-lg transition-all duration-200"
                  }
                >
                  {viewMode === "grid" ? (
                    <>
                      {/* Resource Image */}
                      <div className="h-36 bg-gradient-to-br from-gray-100 to-gray-200 relative">
                        {resource.imageUrl ? (
                          <img
                            src={resource.imageUrl}
                            alt={resource.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            {getResourceIcon(resource.type)}
                          </div>
                        )}
                        <div className="absolute top-3 right-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                            {resource.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                      
                      {/* Resource Info */}
                      <div className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getResourceIcon(resource.type)}
                          <span className="text-sm text-gray-500">{resource.type}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 mb-2 text-base">{resource.name}</h3>
                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="w-4 h-4" />
                            <span>{resource.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{resource.capacity} capacity</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelected(resource)}
                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          <button
                            onClick={() => window.location.href = `/edit/${resource.resourceID}`}
                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    /* List View */
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex-shrink-0 overflow-hidden">
                        {resource.imageUrl ? (
                          <img
                            src={resource.imageUrl}
                            alt={resource.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            {getResourceIcon(resource.type)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(resource.status)}`}>
                                {resource.status?.replace('_', ' ')}
                              </span>
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                {getResourceIcon(resource.type)}
                                <span>{resource.type}</span>
                              </div>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-lg">{resource.name}</h3>
                          </div>
                          <div className="flex gap-2">
                            <button
                                onClick={() => setSelected(resource)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            <button
                                onClick={() => window.location.href = `/edit/${resource.resourceID}`}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            <button
                                onClick={() => handleDelete(resource.resourceID)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{resource.location}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{resource.capacity} capacity</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Modal */}
          <ResourceModal
            resource={selected}
            onClose={() => setSelected(null)}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </div>
  );
}