import { useState, useEffect } from "react";
import { getBookings, approveBooking, rejectBooking } from "../api/BookingApi";

const AdminBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [rejectModal, setRejectModal] = useState({ isOpen: false, bookingId: null, reason: "" });

  // Fetch all bookings on component mount
  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await getBookings();
      setBookings(response.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch bookings: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await approveBooking(bookingId);
      await fetchBookings(); // Refresh the list
      alert("Booking approved successfully!");
    } catch (err) {
      alert("Failed to approve booking: " + (err.response?.data?.message || err.message));
    }
  };

  const handleReject = async () => {
    if (!rejectModal.reason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      await rejectBooking(rejectModal.bookingId, rejectModal.reason);
      await fetchBookings(); // Refresh the list
      setRejectModal({ isOpen: false, bookingId: null, reason: "" });
      alert("Booking rejected successfully!");
    } catch (err) {
      alert("Failed to reject booking: " + (err.response?.data?.message || err.message));
    }
  };

  const openRejectModal = (bookingId) => {
    setRejectModal({ isOpen: true, bookingId, reason: "" });
  };

  const closeRejectModal = () => {
    setRejectModal({ isOpen: false, bookingId: null, reason: "" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Booking Management</h1>
          <p className="text-gray-500">
            Review and manage all resource booking requests
          </p>
        </div>
        <button
          onClick={fetchBookings}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{booking.bookingId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.user?.fullName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.resource?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {booking.startTime} - {booking.endTime}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                      {booking.purpose}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {booking.status === "PENDING" && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(booking.bookingId)}
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(booking.bookingId)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {booking.status === "REJECTED" && booking.rejectReason && (
                        <button
                          onClick={() => openRejectModal(booking.bookingId)}
                          className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 text-xs"
                        >
                          View Reason
                        </button>
                      )}
                      {booking.status === "APPROVED" && (
                        <span className="text-green-600 text-xs">Approved</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Reject Booking</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this booking:</p>
            <textarea
              value={rejectModal.reason}
              onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
              className="w-full border border-gray-300 rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter rejection reason..."
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={closeRejectModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Reject Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingManagement;
