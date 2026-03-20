import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { AUTH_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';

const CustomerLogin = () => {
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
      const { data } = await apiClient.post(AUTH_ENDPOINTS.CUSTOMER_LOGIN, {
        email,
        password,
      });

      // From backend customer login: _id, name, email, phone, token
      const { token, ...customerData } = data;
      
      // Set auth in Zustand with hardcoded 'customer' role
      setAuth(customerData, token, 'customer');
      
      toast.success(`Welcome back, ${customerData.name}!`);
      navigate('/customer'); // Redirect to customer dashboard
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Customer Login</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Sign in to request rentals and view your history.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
            <input
              type="email"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
            <input
              type="password"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:bg-green-400"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          <p className="mb-2">
            Don't have an account?{' '}
            <Link to="/customer/register" className="text-green-600 font-medium hover:underline">
              Register here
            </Link>
          </p>
          <p>
            <Link to="/login" className="text-gray-500 hover:text-gray-700 underline text-xs">
              Go to Admin/Staff login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CustomerLogin;
