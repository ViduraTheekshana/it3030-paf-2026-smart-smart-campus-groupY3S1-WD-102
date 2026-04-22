import { useState, useEffect } from "react";
import { createBooking } from "../api/BookingApi";
import { getAllResources } from "../api/ResourceAPI";

const BookingForm = ({ addBooking, userId }) => {
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

  const [errors, setErrors] = useState({});

  // Get today's date
  const today = new Date().toISOString().split("T")[0];

  // Fetch resources on component mount
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await getAllResources(token);
        setResources(response.data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };
    fetchResources();
  }, []);

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
        break;

      case "attendees":
        if (value && value < 1)
          error = "Must be at least 1 attendee";
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

    try {
      const payload = {
        ...formData,
        attendees: Number(formData.attendees),
        status: "PENDING",
      };

      await createBooking(payload, selectedResource, token);

      addBooking(payload); // update UI instantly

      alert("Booking created successfully!");

      setFormData({
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
        attendees: "",
      });
      setSelectedResource("");

      setErrors({});
    } catch (err) {
      console.log("ERROR FULL:", err);
      console.log("RESPONSE:", err.response);

      alert(JSON.stringify(err.response?.data || err.message));
    }
  };

  // Input style helper
  const inputStyle = (field) =>
    `w-full border rounded-lg p-2 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <h2 className="text-lg font-semibold mb-4">
        Create New Booking
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Resource */}
          <div>
            <label className="block mb-1 font-medium">
              Resource *
            </label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className={`w-full border rounded-lg p-2 ${
                errors.resource ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a resource...</option>
              {resources.map((resource) => (
                <option key={resource.resourceID} value={resource.resourceID}>
                  {resource.name}
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
            <label className="block mb-1 font-medium">
              Date *
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              min={today}
              onChange={handleChange}
              className={inputStyle("date")}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">
                {errors.date}
              </p>
            )}
          </div>

          {/* Start Time */}
          <div>
            <label className="block mb-1 font-medium">
              Start Time *
            </label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={inputStyle("startTime")}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.startTime}
              </p>
            )}
          </div>

          {/* End Time */}
          <div>
            <label className="block mb-1 font-medium">
              End Time *
            </label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={inputStyle("endTime")}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">
                {errors.endTime}
              </p>
            )}
          </div>

          {/* Purpose */}
          <div>
            <label className="block mb-1 font-medium">
              Purpose *
            </label>
            <input
              type="text"
              name="purpose"
              placeholder="e.g., Lab session, Meeting"
              value={formData.purpose}
              onChange={handleChange}
              className={inputStyle("purpose")}
            />
            {errors.purpose && (
              <p className="text-red-500 text-sm mt-1">
                {errors.purpose}
              </p>
            )}
          </div>

          {/* Attendees */}
          <div>
            <label className="block mb-1 font-medium">
              Attendees
            </label>
            <input
              type="number"
              name="attendees"
              min="1"
              value={formData.attendees}
              onChange={handleChange}
              className={inputStyle("attendees")}
            />
            {errors.attendees && (
              <p className="text-red-500 text-sm mt-1">
                {errors.attendees}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Create Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;