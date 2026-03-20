import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { AUTH_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';

const CustomerRegister = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cnic: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    const { name, email, password, phone, cnic, address } = formData;
    if (!name || !email || !password || !phone || !cnic || !address) {
      return toast.warning('Please fill in all fields');
    }

    setLoading(true);

    try {
      const { data } = await apiClient.post(AUTH_ENDPOINTS.CUSTOMER_REGISTER, formData);

      // Backend returns: _id, name, email, phone, cnic, address, token
      const { token, ...customerData } = data;
      
      // Auto-login after registration
      setAuth(customerData, token, 'customer');
      
      toast.success('Registration successful! Welcome.');
      navigate('/customer'); 
      
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-10 px-4">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-md p-8 border border-gray-100">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Create an Account</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Register to browse and request rental machines.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Full Name</label>
            <input
              type="text"
              name="name"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email}
                onChange={handleChange}
                placeholder="john@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone</label>
              <input
                type="text"
                name="phone"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.phone}
                onChange={handleChange}
                placeholder="0300-1234567"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">CNIC</label>
              <input
                type="text"
                name="cnic"
                className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.cnic}
                onChange={handleChange}
                placeholder="36502-1234567-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Address</label>
            <textarea
              name="address"
              rows="2"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street, City"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-md transition-colors disabled:bg-green-400 mt-2"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600 pt-4 border-t border-gray-100">
          Already have an account?{' '}
          <Link to="/customer/login" className="text-green-600 font-medium hover:underline">
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CustomerRegister;
