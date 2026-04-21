import { useState, useEffect } from "react";
import { createBooking } from "../api/BookingApi";
import { getAllResources } from "../api/ResourceApi";

const BookingForm = ({ addBooking }) => {
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

  const today = new Date().toISOString().split("T")[0];

  // Load resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        const response = await getAllResources();
        setResources(response.data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, []);

  // Validation
  const validate = (name, value, updatedData) => {
    let error = "";

    switch (name) {
      case "date":
        if (!value) error = "Date is required";
        else if (value < today) error = "Cannot select past date";
        break;

      case "startTime":
        if (!value) error = "Start time is required";
        break;

      case "endTime":
        if (!value) error = "End time is required";
        else if (updatedData.startTime && value <= updatedData.startTime)
          error = "End time must be after start time";
        break;

      case "purpose":
        if (!value) error = "Purpose is required";
        else if (value.length < 3) error = "Minimum 3 characters required";
        break;

      case "attendees":
        if (value && value < 1) error = "Must be at least 1 attendee";
        break;

      default:
        break;
    }

    return error;
  };

  // Handle input
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...formData, [name]: value };
    setFormData(updated);

    const error = validate(name, value, updated);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    // validate resource
    if (!selectedResource) {
      newErrors.resource = "Resource is required";
    }

    Object.keys(formData).forEach((key) => {
      const error = validate(key, formData[key], formData);
      if (error) newErrors[key] = error;
    });

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      // IMPORTANT: Backend compatible payload
      const payload = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
        purpose: formData.purpose,
        attendees: Number(formData.attendees),
      };

      await createBooking(payload, selectedResource);

      alert("Booking created successfully!");

      // UI update (optional)
      if (addBooking) addBooking(payload);

      // reset form
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
      console.log("ERROR:", err);
      alert(err.response?.data || err.message);
    }
  };

  const inputStyle = (field) =>
    `w-full border rounded-lg p-2 ${
      errors[field] ? "border-red-500" : "border-gray-300"
    }`;

  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <h2 className="text-lg font-semibold mb-4">Create Booking</h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Resource */}
          <div>
            <label>Resource *</label>
            <select
              value={selectedResource}
              onChange={(e) => setSelectedResource(e.target.value)}
              className={inputStyle("resource")}
            >
              <option value="">Select resource</option>
              {resources.map((r) => (
                <option key={r.resourceID} value={r.resourceID}>
                  {r.name}
                </option>
              ))}
            </select>
            {errors.resource && <p className="text-red-500">{errors.resource}</p>}
          </div>

          {/* Date */}
          <div>
            <label>Date *</label>
            <input
              type="date"
              name="date"
              min={today}
              value={formData.date}
              onChange={handleChange}
              className={inputStyle("date")}
            />
            {errors.date && <p className="text-red-500">{errors.date}</p>}
          </div>

          {/* Start Time */}
          <div>
            <label>Start Time *</label>
            <input
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              className={inputStyle("startTime")}
            />
            {errors.startTime && <p className="text-red-500">{errors.startTime}</p>}
          </div>

          {/* End Time */}
          <div>
            <label>End Time *</label>
            <input
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              className={inputStyle("endTime")}
            />
            {errors.endTime && <p className="text-red-500">{errors.endTime}</p>}
          </div>

          {/* Purpose */}
          <div>
            <label>Purpose *</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className={inputStyle("purpose")}
            />
            {errors.purpose && <p className="text-red-500">{errors.purpose}</p>}
          </div>

          {/* Attendees */}
          <div>
            <label>Attendees</label>
            <input
              type="number"
              name="attendees"
              value={formData.attendees}
              onChange={handleChange}
              className={inputStyle("attendees")}
            />
            {errors.attendees && <p className="text-red-500">{errors.attendees}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Create Booking
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;