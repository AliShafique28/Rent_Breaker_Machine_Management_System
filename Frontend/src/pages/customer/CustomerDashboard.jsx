import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { CUSTOMER_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { MonitorPlay, History, User } from 'lucide-react';

const CustomerDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [rentalCount, setRentalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRentals();
  }, []);

  const fetchMyRentals = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(CUSTOMER_ENDPOINTS.PROFILE_MY_RENTALS);
      if (data.success) {
        setRentalCount(data.count);
      }
    } catch (error) {
      toast.error('Failed to load your rental history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-green-600 rounded-xl p-8 text-white shadow-md">
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name}!</h1>
        <p className="text-green-100">
          Find and request the best breaker machines for your projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Stat Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
          <div className="bg-gray-100 p-4 rounded-full mb-4">
            <History size={28} className="text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Your Rentals</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {loading ? '...' : rentalCount}
          </p>
          <p className="text-xs text-gray-500 mt-1">Total lifetime requests</p>
        </div>

        {/* Action Cards */}
        <Link 
          to="/customer/machines" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-green-200 transition group flex flex-col items-center justify-center text-center"
        >
          <div className="bg-green-50 p-4 rounded-full mb-4 group-hover:bg-green-100 transition">
            <MonitorPlay size={28} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Browse Machines</h3>
          <p className="text-sm text-gray-500 mt-2">View available machines and request a new rental.</p>
        </Link>

        <Link 
          to="/customer/rentals" 
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition group flex flex-col items-center justify-center text-center"
        >
          <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-blue-100 transition">
            <User size={28} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">My Requests</h3>
          <p className="text-sm text-gray-500 mt-2">Check the status and billing of your active rentals.</p>
        </Link>
      </div>
    </div>
  );
};

export default CustomerDashboard;
