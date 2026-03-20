import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { RENTAL_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { 
  TrendingUp, 
  Wallet, 
  Clock, 
  FileText, 
  Wrench, 
  Users, 
  MonitorPlay 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  const user = useAuthStore((s) => s.user);
  const [stats, setStats] = useState({
    totalRentals: 0,
    totalRevenue: 0,
    totalAdvance: 0,
    totalRemaining: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(RENTAL_ENDPOINTS.BILLING_SUMMARY);
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      toast.error('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => `Rs. ${amount?.toLocaleString()}`;

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
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm">Welcome back, {user?.name}. Here is what's happening today.</p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Rentals" 
          value={stats.totalRentals} 
          icon={FileText} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={TrendingUp} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Advance Collected" 
          value={formatCurrency(stats.totalAdvance)} 
          icon={Wallet} 
          colorClass="bg-purple-500" 
        />
        <StatCard 
          title="Pending Payments" 
          value={formatCurrency(stats.totalRemaining)} 
          icon={Clock} 
          colorClass="bg-orange-500" 
        />
      </div>

      {/* Quick Actions Row */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/admin/machines" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition flex items-center space-x-3 group">
            <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition">
              <MonitorPlay className="text-blue-600" size={20} />
            </div>
            <span className="font-medium text-gray-700">Manage Machines</span>
          </Link>
          
          <Link to="/admin/customers" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition flex items-center space-x-3 group">
            <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition">
              <Users className="text-green-600" size={20} />
            </div>
            <span className="font-medium text-gray-700">View Customers</span>
          </Link>

          <Link to="/admin/maintenance" className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition flex items-center space-x-3 group">
            <div className="bg-red-50 p-3 rounded-lg group-hover:bg-red-100 transition">
              <Wrench className="text-red-600" size={20} />
            </div>
            <span className="font-medium text-gray-700">Maintenance Records</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
