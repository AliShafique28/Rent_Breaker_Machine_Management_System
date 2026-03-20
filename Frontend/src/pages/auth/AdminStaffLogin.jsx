import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { AUTH_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'react-toastify';

const AdminStaffLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      return toast.warning('Please enter both email and password');
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.ADMIN_STAFF_LOGIN, {
        email,
        password,
      });

      const { token, role, ...user } = data;
      setAuth(user, token, role);
      
      toast.success(`Welcome back, ${user.name}!`);

      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Admin & Staff Portal</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Sign in to manage the rental breaker system.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@rentalbreaker.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=""
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:bg-blue-400"
          >
            {loading ? 'Signing in...' : 'Login to Dashboard'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          Are you a customer?{' '}
          <button
            className="text-blue-600 font-medium hover:text-blue-800 hover:underline"
            onClick={() => navigate('/customer/login')}
          >
            Go to customer login
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminStaffLogin;
