import { useState, useEffect } from "react";
import { getAllBookings, approveBooking, rejectBooking, deleteBooking } from "../api/BookingApi";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { 
  Search, 
  Calendar, 
  Clock, 
  User, 
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Home,
  Microscope,
  Building,
  Package,
  Trash
} from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    bookingId: null,
    reason: ""
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, searchTerm, statusFilter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      setBookings(res.data || []);
      setError("");
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...bookings];

    // Filter by status
    if (statusFilter !== "ALL") {
      data = data.filter(b => b.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      data = data.filter(b =>
        b.user?.fullName?.toLowerCase().includes(s) ||
        b.user?.email?.toLowerCase().includes(s) ||
        b.resource?.name?.toLowerCase().includes(s) ||
        b.resource?.type?.toLowerCase().includes(s) ||
        b.purpose?.toLowerCase().includes(s)
      );
    }

    setFiltered(data);
  };

  const handleApprove = async (id) => {
    // Check if user has permission to approve
    if (!isAdmin() && user?.role !== "ROLE_MANAGER") {
      alert("You don't have permission to approve bookings");
      return;
    }

    try {
      console.log('Approving booking:', id);
      const response = await approveBooking(id);
      console.log('Approve response:', response);
      fetchBookings();
      alert("Booking approved successfully!");
    } catch (err) {
      console.error('Approve error:', err);
      let errorMessage = "Failed to approve booking";
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data?.message || err.response.data || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      alert(`Approve failed: ${errorMessage}`);
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert("Enter reason");
      return;
    }

    // Check if user has permission to reject
    if (!isAdmin() && user?.role !== "ROLE_MANAGER") {
      alert("You don't have permission to reject bookings");
      return;
    }

    try {
      console.log('Rejecting booking:', rejectModal.bookingId, 'reason:', rejectModal.reason);
      const response = await rejectBooking(rejectModal.bookingId, rejectModal.reason);
      console.log('Reject response:', response);
      setRejectModal({ isOpen: false, bookingId: null, reason: "" });
      fetchBookings();
      alert("Booking rejected successfully!");
    } catch (err) {
      console.error('Reject error:', err);
      let errorMessage = "Failed to reject booking";
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data?.message || err.response.data || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      alert(`Reject failed: ${errorMessage}`);
    }
  };

  const handleDelete = async (id) => {
    // Check if user has permission to delete
    if (!isAdmin() && user?.role !== "ROLE_MANAGER") {
      alert("You don't have permission to delete bookings");
      return;
    }

    if (!confirm("Are you sure you want to delete this booking? This action cannot be undone.")) {
      return;
    }

    try {
      console.log('Deleting booking:', id);
      const response = await deleteBooking(id);
      console.log('Delete response:', response);
      fetchBookings();
      alert("Booking deleted successfully!");
    } catch (err) {
      console.error('Delete error:', err);
      let errorMessage = "Failed to delete booking";
      
      if (err.response) {
        console.error('Error response:', err.response.data);
        errorMessage = err.response.data?.message || err.response.data || errorMessage;
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      alert(`Delete failed: ${errorMessage}`);
    }
  };

  // Summary Stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "PENDING").length,
    approved: bookings.filter(b => b.status === "APPROVED").length,
    rejected: bookings.filter(b => b.status === "REJECTED").length,
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
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED": return "bg-red-100 text-red-800 border-red-200";
      case "PENDING": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CANCELLED": return "bg-gray-100 text-gray-800 border-gray-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED": return <CheckCircle className="w-4 h-4" />;
      case "REJECTED": return <XCircle className="w-4 h-4" />;
      case "PENDING": return <AlertCircle className="w-4 h-4" />;
      case "CANCELLED": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-4 lg:p-8">
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
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Dashboard</h1>
                  <p className="text-gray-600">Manage and monitor all resource bookings</p>
                </div>
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
                  <p className="text-sm font-medium text-gray-600 mb-1">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.approved}</p>
                </div>
                <div className="p-2 bg-green-100 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.rejected}</p>
                </div>
                <div className="p-2 bg-red-100 rounded-lg">
                  <XCircle className="w-5 h-5 text-red-600" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Search and Filters */}
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
                  placeholder="Search bookings by user, resource, or purpose..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="PENDING">Pending</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </motion.div>
          )}

          {/* Bookings Grid */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filtered.length === 0 ? (
              <div className="col-span-full text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            ) : (
              filtered.map((booking) => (
                <motion.div
                  key={booking.bookingId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2, scale: 1.02 }}
                  className="bg-white rounded-2xl shadow-sm border-0 border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Status Badge Header */}
                  <div className="relative h-1 bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="absolute top-2 right-2">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Booking Content */}
                  <div className="p-6">
                    {/* Header with ID and Resource Icon */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-50 rounded-lg">
                          {getResourceIcon(booking.resource?.type)}
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Booking #{booking.bookingId}</p>
                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            {booking.resource?.name || "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User Information */}
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 font-medium">
                          {booking.user?.fullName || booking.user?.email || "N/A"}
                        </span>
                      </div>
                      {booking.resource?.location && (
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                          <MapPin className="w-3 h-3" />
                          <span>{booking.resource.location}</span>
                        </div>
                      )}
                    </div>

                    {/* Date & Time */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>Date</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-2">{booking.date}</p>
                      
                      {booking.startTime && booking.endTime && (
                        <>
                          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                            <Clock className="w-3 h-3" />
                            <span>Time</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </>
                      )}
                    </div>

                    {/* Purpose - Truncated */}
                    {booking.purpose && (
                      <div className="mb-5">
                        <p className="text-xs text-gray-500 mb-1">Purpose</p>
                        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
                          {booking.purpose}
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(booking.bookingId)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors duration-200"
                      >
                        <Trash className="w-3.5 h-3.5" />
                        Delete
                      </button>
                      
                      {/* Approve/Reject Buttons - Only for pending bookings */}
                      {booking.status === "PENDING" && (isAdmin() || user?.role === "ROLE_MANAGER") && (
                        <>
                          <button
                            onClick={() => handleApprove(booking.bookingId)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors duration-200"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              setRejectModal({
                                isOpen: true,
                                bookingId: booking.bookingId,
                                reason: ""
                              })
                            }
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 transition-colors duration-200"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Reject Modal */}
          {rejectModal.isOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50"
            >
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl w-96 p-6"
              >
                <h2 className="text-lg font-semibold mb-4">Reject Booking</h2>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter rejection reason..."
                  rows={4}
                  value={rejectModal.reason}
                  onChange={(e) =>
                    setRejectModal({ ...rejectModal, reason: e.target.value })
                  }
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() =>
                      setRejectModal({ isOpen: false, bookingId: null, reason: "" })
                    }
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject Booking
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;