import { useState, useEffect } from "react";
import { getAllBookings, approveBooking, rejectBooking } from "../api/BookingApi";

const AdminDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    bookingId: null,
    reason: ""
  });

  const [filters, setFilters] = useState({
    status: "ALL",
    search: ""
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, filters]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      setBookings(res.data);
    } catch (err) {
      setError("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let data = [...bookings];

    if (filters.status !== "ALL") {
      data = data.filter(b => b.status === filters.status);
    }

    if (filters.search) {
      const s = filters.search.toLowerCase();
      data = data.filter(b =>
        b.user?.fullName?.toLowerCase().includes(s) ||
        b.resource?.name?.toLowerCase().includes(s)
      );
    }

    setFiltered(data);
  };

  const handleApprove = async (id) => {
    await approveBooking(id);
    fetchBookings();
  };

  const handleReject = async () => {
    await rejectBooking(rejectModal.bookingId, rejectModal.reason);
    setRejectModal({ isOpen: false, bookingId: null, reason: "" });
    fetchBookings();
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">

      <h1 className="text-2xl font-bold mb-4">Admin Booking Dashboard</h1>

      {error && <p className="text-red-500">{error}</p>}

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2"
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
        >
          <option value="ALL">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <input
          className="border p-2"
          placeholder="Search..."
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />
      </div>

      {/* Table */}
      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="border-b">
            <th>ID</th>
            <th>User</th>
            <th>Resource</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.map(b => (
            <tr key={b.bookingId} className="border-b">
              <td>{b.bookingId}</td>
              <td>{b.user?.fullName}</td>
              <td>{b.resource?.name}</td>
              <td>{b.status}</td>
              <td>
                {b.status === "PENDING" && (
                  <>
                    <button
                      className="bg-green-500 text-white px-2"
                      onClick={() => handleApprove(b.bookingId)}
                    >
                      Approve
                    </button>

                    <button
                      className="bg-red-500 text-white px-2 ml-2"
                      onClick={() =>
                        setRejectModal({ isOpen: true, bookingId: b.bookingId, reason: "" })
                      }
                    >
                      Reject
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-4 w-96">
            <textarea
              className="border w-full p-2"
              placeholder="Reason"
              value={rejectModal.reason}
              onChange={(e) =>
                setRejectModal({ ...rejectModal, reason: e.target.value })
              }
            />

            <button
              className="bg-red-600 text-white mt-2 px-4 py-2"
              onClick={handleReject}
            >
              Submit
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;