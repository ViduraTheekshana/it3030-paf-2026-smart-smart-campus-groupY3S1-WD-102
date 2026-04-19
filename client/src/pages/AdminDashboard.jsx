import { useEffect, useState } from "react";
import { summary } from "../api/ResourceAPI";
import Sidebar from "../components/Sidebar";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";
import { motion } from "framer-motion";
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  BarChart3, 
  PieChart,
  Calendar
} from "lucide-react";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

export default function AdminDashboard() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    summary().then(res => {
      setData(res.data);
      setLoading(false);
    });
  }, []);

  const labels = data.types ? Object.keys(data.types) : [];
  const values = data.types ? Object.values(data.types) : [];
  const total = data.total || 0;
  const active = data.active || 0;
  const inactive = data.inactive || 0;
  const activePercentage = total > 0 ? ((active / total) * 100).toFixed(1) : 0;

  // Resource Type Distribution Chart
  const resourceTypeData = {
    labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()),
    datasets: [{ 
      label: "Resources", 
      data: values,
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(251, 146, 60, 0.8)',
        'rgba(147, 51, 234, 0.8)',
      ],
      borderColor: [
        'rgba(59, 130, 246, 1)',
        'rgba(16, 185, 129, 1)',
        'rgba(251, 146, 60, 1)',
        'rgba(147, 51, 234, 1)',
      ],
      borderWidth: 2,
      borderRadius: 8,
      barThickness: 40
    }]
  };

  // Status Distribution Chart
  const statusData = {
    labels: ['Active', 'Inactive'],
    datasets: [{
      data: [active, inactive],
      backgroundColor: [
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
      borderColor: [
        'rgba(16, 185, 129, 1)',
        'rgba(239, 68, 68, 1)',
      ],
      borderWidth: 2
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        borderRadius: 8,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="ml-64 p-8 w-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar />

      <div className="ml-64 flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Resource Management Dashboard</h1>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Database className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Total</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{total}</div>
              <div className="text-sm text-gray-600 mt-1">Total Resources</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Active</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{active}</div>
              <div className="text-sm text-green-600 mt-1">Available Resources</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Inactive</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{inactive}</div>
              <div className="text-sm text-red-600 mt-1">Out of Service</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500 font-medium">Utilization</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{activePercentage}%</div>
              <div className="text-sm text-purple-600 mt-1">Active Rate</div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Resource Type Distribution */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="xl:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  Resource Type Distribution
                </h2>
                <span className="text-sm text-gray-500">By Category</span>
              </div>
              <div className="h-80">
                <Bar data={resourceTypeData} options={chartOptions} />
              </div>
            </motion.div>

            {/* Status Overview */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-purple-600" />
                  Status Overview
                </h2>
              </div>
              <div className="h-80 flex items-center justify-center">
                <Doughnut 
                  data={statusData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          padding: 15,
                          font: {
                            size: 12
                          }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        borderRadius: 8
                      }
                    }
                  }} 
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}