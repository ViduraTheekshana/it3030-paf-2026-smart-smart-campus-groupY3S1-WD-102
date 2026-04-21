import { useState, useEffect } from "react";
import { upload } from "../api/ResourceAPI";
import { motion } from "framer-motion";
import { 
  Upload, 
  Image as ImageIcon, 
  Save, 
  X,
  MapPin,
  Clock,
  Users,
  FileText,
  Building
} from "lucide-react";

export default function ResourceForm({ onSubmit, initialData = {} }) {
  const [form, setForm] = useState({
    name: "",
    type: "",
    capacity: "",
    location: "",
    availabilityStart: "",
    availabilityEnd: "",
    status: "",
    description: "",
    imageUrl: ""
  });

  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData && initialData.resourceID) {
      setForm({
        ...initialData,
        availabilityStart: initialData.availabilityStart || "",
        availabilityEnd: initialData.availabilityEnd || ""
      });
    }
  }, [initialData]);

  const validateField = (name, value) => {
    const newErrors = { ...errors };

    switch (name) {
      case 'name':
        if (!value || value.trim() === '') {
          newErrors.name = 'Resource name is required';
        } else if (value.length < 3) {
          newErrors.name = 'Resource name must be at least 3 characters';
        } else if (value.length > 100) {
          newErrors.name = 'Resource name must be less than 100 characters';
        } else {
          delete newErrors.name;
        }
        break;
        
      case 'type':
        if (!value) {
          newErrors.type = 'Resource type is required';
        } else {
          delete newErrors.type;
        }
        break;
        
      case 'capacity':
        if (!value) {
          newErrors.capacity = 'Capacity is required';
        } else if (isNaN(value) || value <= 0) {
          newErrors.capacity = 'Capacity must be a positive number';
        } else if (value > 1000) {
          newErrors.capacity = 'Capacity must be less than 1000';
        } else {
          delete newErrors.capacity;
        }
        break;
        
      case 'location':
        if (!value || value.trim() === '') {
          newErrors.location = 'Location is required';
        } else if (value.length < 3) {
          newErrors.location = 'Location must be at least 3 characters';
        } else if (value.length > 200) {
          newErrors.location = 'Location must be less than 200 characters';
        } else {
          delete newErrors.location;
        }
        break;
        
      case 'status':
        if (!value) {
          newErrors.status = 'Status is required';
        } else {
          delete newErrors.status;
        }
        break;
        
      case 'description':
        if (value && value.length > 500) {
          newErrors.description = 'Description must be less than 500 characters';
        } else {
          delete newErrors.description;
        }
        break;
        
      case 'availabilityStart':
      case 'availabilityEnd':
        if (form.availabilityStart && form.availabilityEnd) {
          const start = form.availabilityStart;
          const end = form.availabilityEnd;
          if (start >= end) {
            newErrors.availabilityEnd = 'End time must be after start time';
            newErrors.availabilityStart = 'Start time must be before end time';
          } else {
            delete newErrors.availabilityStart;
            delete newErrors.availabilityEnd;
          }
        }
        break;
        
      default:
        break;
    }
    
    setErrors(newErrors);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    validateField(name, value);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields
    if (!form.name || form.name.trim() === '') {
      newErrors.name = 'Resource name is required';
    } else if (form.name.length < 3) {
      newErrors.name = 'Resource name must be at least 3 characters';
    } else if (form.name.length > 100) {
      newErrors.name = 'Resource name must be less than 100 characters';
    }
    
    if (!form.type) {
      newErrors.type = 'Resource type is required';
    }
    
    if (!form.capacity) {
      newErrors.capacity = 'Capacity is required';
    } else if (isNaN(form.capacity) || form.capacity <= 0) {
      newErrors.capacity = 'Capacity must be a positive number';
    } else if (form.capacity > 1000) {
      newErrors.capacity = 'Capacity must be less than 1000';
    }
    
    if (!form.location || form.location.trim() === '') {
      newErrors.location = 'Location is required';
    } else if (form.location.length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    } else if (form.location.length > 200) {
      newErrors.location = 'Location must be less than 200 characters';
    }
    
    if (!form.status) {
      newErrors.status = 'Status is required';
    }
    
    if (form.description && form.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    
    // Validate availability times
    if (form.availabilityStart && form.availabilityEnd) {
      if (form.availabilityStart >= form.availabilityEnd) {
        newErrors.availabilityEnd = 'End time must be after start time';
        newErrors.availabilityStart = 'Start time must be before end time';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    // Validate form before submission
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    let imageUrl = form.imageUrl;

    try {
      if (file) {
        console.log("Uploading file:", file.name);
        const data = new FormData();
        data.append("file", file);
        const res = await upload(data);
        console.log("Upload response:", res.data);
        imageUrl = res.data;
      }

      console.log("Final imageUrl being submitted:", imageUrl);
      await onSubmit({ ...form, imageUrl });
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("Error uploading image. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = () => {
    setFile(null);
    setForm({ ...form, imageUrl: "" });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">
              {form.resourceID ? "Update Resource" : "Add New Resource"}
            </h1>
            <p className="text-blue-100">
              {form.resourceID ? "Modify the resource details below" : "Fill in the details to create a new resource"}
            </p>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resource Name *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="name"
                    placeholder="Enter resource name"
                    value={form.name}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Type and Capacity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.type ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select type</option>
                    <option value="LAB">Laboratory</option>
                    <option value="ROOM">Room</option>
                    <option value="HALL">Hall</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-xs text-red-600">{errors.type}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Capacity *
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      name="capacity"
                      placeholder="0"
                      value={form.capacity}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.capacity ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.capacity && (
                    <p className="mt-1 text-xs text-red-600">{errors.capacity}</p>
                  )}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    name="location"
                    placeholder="Building, Floor, Room Number"
                    value={form.location}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                </div>
                {errors.location && (
                  <p className="mt-1 text-xs text-red-600">{errors.location}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.status ? 'border-red-500' : 'border-gray-300'
                  }`}
                  required
                >
                  <option value="">Select status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="OUT_OF_SERVICE">Out of Service</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-xs text-red-600">{errors.status}</p>
                )}
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Availability Hours
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Start Time</label>
                    <input
                      type="time"
                      name="availabilityStart"
                      value={form.availabilityStart}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.availabilityStart ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.availabilityStart && (
                      <p className="mt-1 text-xs text-red-600">{errors.availabilityStart}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">End Time</label>
                    <input
                      type="time"
                      name="availabilityEnd"
                      value={form.availabilityEnd}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.availabilityEnd ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.availabilityEnd && (
                      <p className="mt-1 text-xs text-red-600">{errors.availabilityEnd}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FileText className="inline w-4 h-4 mr-1" />
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Provide a detailed description of the resource..."
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ImageIcon className="inline w-4 h-4 mr-1" />
                  Resource Image
                </label>
                
                <div
                  className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    dragActive
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                  <p className="text-sm text-gray-600 mb-1">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>

                {/* Image Preview */}
                {(file || form.imageUrl) && (
                  <div className="mt-4 relative">
                    <img
                      src={file ? URL.createObjectURL(file) : form.imageUrl}
                      alt="Resource preview"
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      onClick={removeImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  onClick={() => window.history.back()}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {form.resourceID ? "Update Resource" : "Save Resource"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}