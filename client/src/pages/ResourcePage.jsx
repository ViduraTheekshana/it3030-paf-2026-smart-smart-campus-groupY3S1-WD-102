import { useEffect, useState } from "react";
import { getAllResources, filterResources } from "../api/ResourceAPI";
import ResourceCard from "../components/ResourceCard";
import FilterBar from "../components/FilterBar";
import ResourceModal from "../components/ResourceModal";

export default function ResourcePage() {
  const [resources, setResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");

  // Filter states
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const res = await getAllResources();
      setResources(res.data);
      setFilteredResources(res.data);
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    setLoading(true);
    try {
      const res = await filterResources({
        type: type || null,
        location: location || null,
        capacity: capacity || null
      });
      let filtered = res.data;
      
      // Apply additional client-side filters
      if (status) {
        filtered = filtered.filter(r => {
          const resourceStatus = r.status.toLowerCase().replace(/[_\s]+/g, ' ');
          const filterStatus = status.toLowerCase().replace(/[_\s]+/g, ' ');
          return resourceStatus === filterStatus;
        });
      }
      
      setFilteredResources(filtered);
      setShowFilters(false);
    } catch (error) {
      console.error("Error applying filters:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setType("");
    setLocation("");
    setCapacity("");
    setStatus("");
    setSearchTerm("");
    setFilteredResources(resources);
    setShowFilters(false);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
    const filtered = resources.filter(resource => 
      resource.name.toLowerCase().includes(term.toLowerCase()) ||
      resource.location.toLowerCase().includes(term.toLowerCase()) ||
      resource.type.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredResources(filtered);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 sm:px-8 lg:px-12 xl:px-16">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Campus Resources</h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">Find and book campus facilities</p>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right">
                <div className="text-xl sm:text-2xl font-bold text-gray-900">{filteredResources.length}</div>
                <div className="text-xs sm:text-sm text-gray-500">Resources</div>
              </div>
            </div>
          </div>

          <FilterBar 
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            viewMode={viewMode}
            setViewMode={setViewMode}
            type={type}
            setType={setType}
            location={location}
            setLocation={setLocation}
            capacity={capacity}
            setCapacity={setCapacity}
            status={status}
            setStatus={setStatus}
            applyFilters={applyFilters}
            resetFilters={resetFilters}
            filteredResourcesCount={filteredResources.length}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6 sm:px-8 lg:px-12 xl:px-16">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredResources.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No resources found</h3>
            <p className="text-gray-600 text-sm">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className={
            viewMode === "grid" 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              : "space-y-3 sm:space-y-4"
          }>
            {filteredResources.map((resource) => (
              <ResourceCard 
                key={resource.resourceID}
                resource={resource}
                viewMode={viewMode}
                onClick={setSelected}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resource Modal */}
      <ResourceModal resource={selected} onClose={() => setSelected(null)} />
    </div>
  );
}