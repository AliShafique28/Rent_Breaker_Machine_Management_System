import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { CUSTOMER_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { User, Save, Loader2 } from 'lucide-react';

const CustomerProfilePage = () => {
  const user    = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const token   = useAuthStore((s) => s.token);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cnic: '',
    address: '',
  });

  const [loading, setLoading]     = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(CUSTOMER_ENDPOINTS.PROFILE_ME);
      if (data.success) {
        const { name, email, phone, cnic, address } = data.data;
        setFormData({ name, email, phone, cnic, address });
      }
    } catch (error) {
      toast.error('Failed to load your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.cnic || !formData.address) {
      return toast.warning('Please fill in all fields');
    }

    setSubmitting(true);
    try {
      const { data } = await apiClient.put(CUSTOMER_ENDPOINTS.PROFILE_UPDATE, formData);
      
      if (data.success) {
        toast.success('Profile updated successfully!');
        
        // Also update Zustand store so Navbar shows the latest name instantly
        setAuth(data.data, token, 'customer');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  // Generate initials for the big avatar circle
  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || 'C';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-green-600">
        <Loader2 className="animate-spin mr-3" size={32} /> 
        <span className="text-gray-500 font-medium">Loading your profile...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Profile Header Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-5">
        <div className="w-20 h-20 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-3xl shadow-md flex-shrink-0">
          {getInitials(formData.name)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{formData.name}</h1>
          <p className="text-gray-500 text-sm">{formData.email}</p>
          <span className="mt-2 inline-block text-xs font-semibold bg-green-100 text-green-700 px-3 py-1 rounded-full uppercase tracking-wide">
            Customer
          </span>
        </div>
      </div>

      {/* Edit Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center space-x-3 p-5 border-b border-gray-100">
          <User size={20} className="text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-800">Edit Your Information</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text" name="name" required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.name} onChange={handleChange}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email" name="email" required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.email} onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text" name="phone" required
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                value={formData.phone} onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
            <input
              type="text" name="cnic" required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.cnic} onChange={handleChange}
              placeholder="36502-1234567-1"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address" required rows="3"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              value={formData.address} onChange={handleChange}
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-md transition disabled:bg-green-400"
            >
              {submitting 
                ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</>
                : <><Save size={16} className="mr-2" /> Save Changes</>
              }
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default CustomerProfilePage;
