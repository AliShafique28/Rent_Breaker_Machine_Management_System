import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { RENTAL_ENDPOINTS, MAINTENANCE_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { FileText, Wrench, AlertCircle, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const StaffDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({
    activeRentals: 0,
    pendingRentals: 0,
    maintenanceCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaffStats();
  }, []);

  const fetchStaffStats = async () => {
    try {
      setLoading(true);
      
      // Fetch all rentals to count Active and Pending
      const { data: rentalData } = await apiClient.get(RENTAL_ENDPOINTS.LIST);
      
      // Fetch maintenance records
      const { data: maintenanceData } = await apiClient.get(MAINTENANCE_ENDPOINTS.LIST);

      if (rentalData.success && maintenanceData.success) {
        const rentals = rentalData.data || [];
        
        setStats({
          activeRentals: rentals.filter(r => r.status === 'Active').length,
          pendingRentals: rentals.filter(r => r.status === 'Pending').length,
          maintenanceCount: maintenanceData.count || 0,
        });
      }
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center space-x-4">
      <div className={`p-4 rounded-full ${colorClass}`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-800">
          {loading ? '...' : value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Staff Portal</h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.name}. Manage daily operations here.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Active Rentals" 
          value={stats.activeRentals} 
          icon={CheckCircle} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Pending Requests" 
          value={stats.pendingRentals} 
          icon={AlertCircle} 
          colorClass="bg-orange-500" 
        />
        <StatCard 
          title="Maintenance Records" 
          value={stats.maintenanceCount} 
          icon={Wrench} 
          colorClass="bg-red-500" 
        />
      </div>

      {/* Quick Actions Row */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Operations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <Link to="/staff/rentals" className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-200 transition group flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 p-4 rounded-full mb-3 group-hover:bg-blue-100 transition">
              <FileText className="text-blue-600" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800">Manage Rentals</h3>
            <p className="text-xs text-gray-500 mt-1">Approve pending requests, update statuses, and collect payments.</p>
          </Link>

          <Link to="/staff/maintenance" className="bg-white p-5 rounded-lg shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition group flex flex-col items-center justify-center text-center">
            <div className="bg-red-50 p-4 rounded-full mb-3 group-hover:bg-red-100 transition">
              <Wrench className="text-red-600" size={28} />
            </div>
            <h3 className="font-semibold text-gray-800">Maintenance Log</h3>
            <p className="text-xs text-gray-500 mt-1">Record machine repairs, schedule dates, and track costs.</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
