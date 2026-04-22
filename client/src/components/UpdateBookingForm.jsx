import { useState, useEffect, useCallback, useMemo } from "react";
import { updateBooking, getAllBookings } from "../api/BookingApi";
import { getAllResources } from "../api/ResourceAPI";

const UpdateBookingForm = ({ booking, onUpdate, onClose }) => {
  const token = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
    attendees: "",
  });
  const [selectedResource, setSelectedResource] = useState("");
  const [resources, setResources] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState(null);
  const [conflicts, setConflicts] = useState([]);
  const [suggestedSlots, setSuggestedSlots] = useState([]);
  const [changesMade, setChangesMade] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Quick templates for common purposes
  const purposeTemplates = [
    "Team meeting for project discussion",
    "Client presentation and demo",
    "Training session and workshop",
    "Study group and collaboration",
    "Research and development work",
    "Departmental planning meeting",
    "Interview and candidate assessment",
    "Brainstorming and ideation session"
  ];

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Initialize form with booking data
  useEffect(() => {
    if (booking) {
      setFormData({
        date: booking.date || "",
        startTime: booking.startTime || "",
        endTime: booking.endTime || "",
        purpose: booking.purpose || "",
        attendees: booking.attendees?.toString() || "",
      });
      setSelectedResource(booking.resource?.resourceID?.toString() || "");
    }
  }, [booking]);

  // Fetch resources and bookings on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resourcesResponse, bookingsResponse] = await Promise.all([
          getAllResources(token),
          getAllBookings()
        ]);
        setResources(resourcesResponse.data);
        setAllBookings(bookingsResponse.data || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Check availability in real-time
  const checkAvailability = useCallback(async () => {
    if (!selectedResource || !formData.date || !formData.startTime || !formData.endTime) {
      setAvailabilityStatus(null);
      setConflicts([]);
      setSuggestedSlots([]);
      return;
    }

    setCheckingAvailability(true);
    
    try {
      // Simulate availability check (in real app, this would be an API call)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const resourceBookings = allBookings.filter(b => 
        b.resource?.resourceID === Number(selectedResource) && 
        b.date === formData.date &&
        b.bookingId !== booking.bookingId // Exclude current booking
      );

      const newStartTime = new Date(`${formData.date}T${formData.startTime}`);
      const newEndTime = new Date(`${formData.date}T${formData.endTime}`);

      const conflictingBookings = resourceBookings.filter(b => {
        const existingStart = new Date(`${b.date}T${b.startTime}`);
        const existingEnd = new Date(`${b.date}T${b.endTime}`);
        
        return (newStartTime < existingEnd && newEndTime > existingStart);
      });

      setConflicts(conflictingBookings);
      
      if (conflictingBookings.length === 0) {
        setAvailabilityStatus('available');
        setSuggestedSlots([]);
      } else {
        setAvailabilityStatus('conflict');
        // Generate smart suggestions
        generateSmartSuggestions(conflictingBookings);
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      setAvailabilityStatus('error');
    } finally {
      setCheckingAvailability(false);
    }
  }, [selectedResource, formData.date, formData.startTime, formData.endTime, allBookings, booking.bookingId]);

  // Generate smart time slot suggestions
  const generateSmartSuggestions = (conflictingBookings) => {
    const suggestions = [];
    const bookedSlots = conflictingBookings.map(b => ({
      start: new Date(`${b.date}T${b.startTime}`),
      end: new Date(`${b.date}T${b.endTime}`)
    })).sort((a, b) => a.start - b.start);

    // Find available slots
    const dayStart = new Date(`${formData.date}T09:00`);
    const dayEnd = new Date(`${formData.date}T18:00`);
    
    let currentTime = dayStart;
    
    for (const slot of bookedSlots) {
      if (currentTime < slot.start && slot.start - currentTime >= 60 * 60 * 1000) { // At least 1 hour
        suggestions.push({
          start: currentTime,
          end: new Date(Math.min(currentTime.getTime() + 2 * 60 * 60 * 1000, slot.start.getTime()))
        });
      }
      currentTime = new Date(Math.max(currentTime, slot.end));
    }
    
    if (dayEnd - currentTime >= 60 * 60 * 1000) {
      suggestions.push({
        start: currentTime,
        end: new Date(Math.min(currentTime.getTime() + 2 * 60 * 60 * 1000, dayEnd.getTime()))
      });
    }
    
    setSuggestedSlots(suggestions.slice(0, 3)); // Show top 3 suggestions
  };

  // Auto-save draft functionality
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(changesMade).length > 0) {
        localStorage.setItem(`booking_draft_${booking.bookingId}`, JSON.stringify({
          ...formData,
          selectedResource,
          timestamp: new Date().toISOString()
        }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, selectedResource, changesMade, booking.bookingId]);

  // Track changes
  const handleChangeWithTracking = (e) => {
    const { name, value } = e.target;
    
    // Track what changed
    const originalValue = booking[name] || "";
    if (value !== originalValue.toString()) {
      setChangesMade(prev => ({ ...prev, [name]: true }));
    } else {
      setChangesMade(prev => {
        const newChanges = { ...prev };
        delete newChanges[name];
        return newChanges;
      });
    }
    
    handleChange(e);
  };

  // Load draft if exists
  useEffect(() => {
    const draft = localStorage.getItem(`booking_draft_${booking.bookingId}`);
    if (draft) {
      try {
        const draftData = JSON.parse(draft);
        const draftAge = new Date() - new Date(draftData.timestamp);
        
        // Only load if draft is less than 1 hour old
        if (draftAge < 60 * 60 * 1000) {
          setFormData({
            date: draftData.date || "",
            startTime: draftData.startTime || "",
            endTime: draftData.endTime || "",
            purpose: draftData.purpose || "",
            attendees: draftData.attendees || "",
          });
          setSelectedResource(draftData.selectedResource || "");
        }
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
  }, [booking.bookingId]);

  // Validation function
  const validate = (name, value, updatedData) => {
    let error = "";

    switch (name) {
      case "resource":
        if (!value) error = "Resource is required";
        break;

      case "date":
        if (!value) error = "Date is required";
        else if (value < today) error = "Cannot select past date";
        break;

      case "startTime":
        if (!value) error = "Start time is required";
        break;

      case "endTime":
        if (!value) error = "End time is required";
        else if (
          updatedData.startTime &&
          value <= updatedData.startTime
        ) {
          error = "End time must be after start time";
        }
        break;

      case "purpose":
        if (!value) error = "Purpose is required";
        else if (value.length < 3)
          error = "Minimum 3 characters required";
        else if (value.length > 200)
          error = "Maximum 200 characters allowed";
        break;

      case "attendees":
        if (value && Number(value) < 1)
          error = "Must be at least 1 attendee";
        else if (value && Number(value) > 1000)
          error = "Maximum 1000 attendees allowed";
        break;

      default:
        break;
    }

    return error;
  };

  // Handle change with instant validation
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    const error = validate(name, value, updatedData);

    setErrors({
      ...errors,
      [name]: error,
    });

    // Special case: revalidate endTime when startTime changes
    if (name === "startTime" && formData.endTime) {
      const endError = validate(
        "endTime",
        formData.endTime,
        updatedData
      );

      setErrors((prev) => ({
        ...prev,
        endTime: endError,
      }));
    }
  };

  // Real-time availability checking
  useEffect(() => {
    checkAvailability();
  }, [checkAvailability]);

  // Handle resource change
  const handleResourceChange = (e) => {
    const value = e.target.value;
    setSelectedResource(value);
    
    const error = validate("resource", value, formData);
    setErrors({
      ...errors,
      resource: error,
    });
  };

  // Final submit validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // Validate resource
    if (!selectedResource) {
      newErrors.resource = "Resource is required";
    }

    // Validate other fields
    Object.keys(formData).forEach((key) => {
      const error = validate(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoading(true);

    try {
      const payload = {
        ...formData,
        attendees: formData.attendees ? Number(formData.attendees) : 1,
        resourceID: Number(selectedResource),
      };

      console.log("Updating booking:", payload, "Booking ID:", booking.bookingId);
      
      const response = await updateBooking(booking.bookingId, payload);
      console.log("Update response:", response);

      alert("Booking updated successfully!");

      // Call parent callback to update UI
      if (onUpdate) {
        onUpdate(response.data || payload);
      }

      // Close modal
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error("Booking update error:", err);
      
      let errorMessage = "Failed to update booking";
      
      if (err.response) {
        console.error("Error response:", err.response.data);
        errorMessage = err.response.data?.message || 
                        err.response.data?.error || 
                        JSON.stringify(err.response.data) || 
                        errorMessage;
      } else if (err.request) {
        errorMessage = "Network error - please check your connection";
      } else {
        errorMessage = err.message || errorMessage;
      }
      
      alert(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Input style helper
  const inputStyle = (field) =>
    `w-full border rounded-lg p-2 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold text-gray-900">
            Update Booking
          </h2>
          {draftSaved && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Draft Saved
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            {showPreview ? 'Hide' : 'Show'} Preview
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Booking Preview */}
      {showPreview && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-3">Booking Preview</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Resource:</span>
              <span className="ml-2 font-medium">
                {resources.find(r => r.resourceID === Number(selectedResource))?.name || 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Date:</span>
              <span className="ml-2 font-medium">{formData.date || 'Not selected'}</span>
            </div>
            <div>
              <span className="text-gray-600">Time:</span>
              <span className="ml-2 font-medium">
                {formData.startTime && formData.endTime ? `${formData.startTime} - ${formData.endTime}` : 'Not selected'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Attendees:</span>
              <span className="ml-2 font-medium">{formData.attendees || 'Not specified'}</span>
            </div>
          </div>
          {formData.purpose && (
            <div className="mt-3">
              <span className="text-gray-600">Purpose:</span>
              <p className="mt-1 text-gray-800">{formData.purpose}</p>
            </div>
          )}
        </div>
      )}

      {/* Availability Status */}
      {availabilityStatus && (
        <div className={`mb-6 p-4 rounded-lg border ${
          availabilityStatus === 'available' 
            ? 'bg-green-50 border-green-200 text-green-800'
            : availabilityStatus === 'conflict'
            ? 'bg-red-50 border-red-200 text-red-800'
            : 'bg-yellow-50 border-yellow-200 text-yellow-800'
        }`}>
          <div className="flex items-center gap-2">
            {checkingAvailability ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                <span>Checking availability...</span>
              </>
            ) : availabilityStatus === 'available' ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Resource is available!</span>
              </>
            ) : availabilityStatus === 'conflict' ? (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Scheduling conflict detected!</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Unable to check availability</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Conflict Details */}
      {conflicts.length > 0 && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Conflicting Bookings:</h4>
          <div className="space-y-2">
            {conflicts.map((conflict, index) => (
              <div key={index} className="text-sm text-red-700">
                <span className="font-medium">{conflict.startTime} - {conflict.endTime}</span>
                <span className="ml-2">({conflict.user?.fullName || 'Unknown user'})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Suggestions */}
      {suggestedSlots.length > 0 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-3">Suggested Alternative Times:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {suggestedSlots.map((slot, index) => (
              <button
                key={index}
                type="button"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    startTime: slot.start.toTimeString().slice(0, 5),
                    endTime: slot.end.toTimeString().slice(0, 5)
                  }));
                }}
                className="bg-white border border-blue-300 rounded p-2 text-sm hover:bg-blue-100 transition-colors"
              >
                <div className="font-medium text-blue-800">
                  {slot.start.toTimeString().slice(0, 5)} - {slot.end.toTimeString().slice(0, 5)}
                </div>
                <div className="text-xs text-blue-600">
                  {Math.round((slot.end - slot.start) / (1000 * 60))} minutes
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Resource */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Resource *
            </label>
            <select
              value={selectedResource}
              onChange={handleResourceChange}
              disabled={loading}
              className={`w-full border rounded-lg p-2 ${
                errors.resource ? "border-red-500" : "border-gray-300"
              } ${loading ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Select a resource...</option>
              {resources.map((resource) => (
                <option key={resource.resourceID} value={resource.resourceID}>
                  {resource.name} ({resource.type})
                </option>
              ))}
            </select>
            {errors.resource && (
              <p className="text-red-500 text-sm mt-1">
                {errors.resource}
              </p>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              min={today}
              onChange={handleChangeWithTracking}
              disabled={loading}
              className={`${inputStyle("date")} ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date}
              </p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChangeWithTracking}
              disabled={loading}
              className={`${inputStyle("startTime")} ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startTime}
              </p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              End Time *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChangeWithTracking}
              disabled={loading}
              className={`${inputStyle("endTime")} ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.endTime}
              </p>
            )}
          </div>

          {/* Purpose */}
          <div className="md:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">
              Purpose *
            </label>
            <div className="space-y-2">
              <textarea
                name="purpose"
                placeholder="e.g., Lab session, Meeting, Study group"
                value={formData.purpose}
                onChange={handleChangeWithTracking}
                disabled={loading}
                rows={3}
                className={`${inputStyle("purpose")} ${
                  loading ? "bg-gray-100 cursor-not-allowed" : ""
                }`}
              />
              {errors.purpose && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.purpose}
                </p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {formData.purpose.length}/200 characters
              </p>
              
              {/* Quick Templates */}
              <div className="mt-2">
                <p className="text-xs text-gray-600 mb-1">Quick templates:</p>
                <div className="flex flex-wrap gap-1">
                  {purposeTemplates.slice(0, 4).map((template, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, purpose: template }))}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded transition-colors"
                    >
                      {template.substring(0, 20)}...
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Attendees */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Number of Attendees
            </label>
            <input
              type="number"
              name="attendees"
              min="1"
              max="1000"
              value={formData.attendees}
              onChange={handleChange}
              disabled={loading}
              className={`${inputStyle("attendees")} ${
                loading ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {errors.attendees && (
              <p className="text-red-500 text-sm mt-1">
                {errors.attendees}
              </p>
            )}
          </div>

          {/* Change Tracking */}
          {Object.keys(changesMade).length > 0 && (
            <div className="md:col-span-2">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 mb-2">Changes Made:</p>
                <div className="flex flex-wrap gap-1">
                  {Object.keys(changesMade).map(field => (
                    <span key={field} className="text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      {field.charAt(0).toUpperCase() + field.slice(1)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Booking Info Display */}
          <div className="md:col-span-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Booking ID:</strong> #{booking.bookingId}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Status:</strong> {booking.status}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Current Resource:</strong> {booking.resource?.name}
              </p>
              <p className="text-sm text-blue-800">
                <strong>Last Updated:</strong> {new Date(booking.lastUpdated || booking.date).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className={`px-4 py-2 border rounded-lg transition-colors ${
              loading 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded-lg transition-colors ${
              loading
                ? "bg-gray-400 text-white cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Booking"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateBookingForm;
