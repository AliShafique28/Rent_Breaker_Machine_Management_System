import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { AUTH_ENDPOINTS } from '../../services/endpoints';
import { confirmDelete } from '../../utils/alert';
import { Plus, Trash2, X, ShieldCheck } from 'lucide-react';

const StaffManagementPage = () => {
  const [staffMembers, setStaffMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 'list' | 'add'
  const [viewState, setViewState] = useState('list');
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (viewState === 'list') {
      fetchStaff();
    }
  }, [viewState]);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(AUTH_ENDPOINTS.LIST_STAFF);
      if (data.success) {
        setStaffMembers(data.data);
      }
    } catch (error) {
      toast.error('Failed to load staff list');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirmDelete(`Staff Member: ${name}`);
    if (!isConfirmed) return;

    try {
      await apiClient.delete(AUTH_ENDPOINTS.DELETE_STAFF(id));
      toast.success('Staff account deleted');
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    }
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      return toast.warning('Please fill in all fields');
    }

    setFormLoading(true);
    try {
      await apiClient.post(AUTH_ENDPOINTS.CREATE_STAFF, formData);
      toast.success('Staff account created successfully');
      setViewState('list');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create staff');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Render Functions ---

  const renderAddForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center text-gray-800">
          <ShieldCheck size={24} className="mr-2 text-blue-600" />
          <h2 className="text-xl font-semibold">Register New Staff</h2>
        </div>
        <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            type="text" name="name" required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500"
            value={formData.name} onChange={handleFormChange} placeholder="e.g. Ali Operator"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            type="email" name="email" required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500"
            value={formData.email} onChange={handleFormChange} placeholder="staff@company.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Password</label>
          <input
            type="password" name="password" required minLength="6"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500"
            value={formData.password} onChange={handleFormChange} placeholder="Minimum 6 characters"
          />
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button type="button" onClick={() => setViewState('list')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400">
            {formLoading ? 'Saving...' : 'Create Account'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Staff Accounts</h2>
          <p className="text-sm text-gray-500">Manage operators who handle rentals and maintenance.</p>
        </div>
        <button
          onClick={() => {
            setFormData({ name: '', email: '', password: '' });
            setViewState('add');
          }}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          <Plus size={16} /> <span>Add Staff</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Role</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">Loading staff...</td></tr>
            ) : staffMembers.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-gray-500">No staff members found.</td></tr>
            ) : (
              staffMembers.map((staff) => (
                <tr key={staff._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{staff.name}</td>
                  <td className="p-4 text-gray-600">{staff.email}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700 uppercase tracking-wider">
                      {staff.role}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDelete(staff._id, staff.name)}
                      className="text-red-500 hover:text-red-700 p-1 inline-block"
                      title="Delete Account"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl">
      {viewState === 'list' ? renderList() : renderAddForm()}
    </div>
  );
};

export default StaffManagementPage;
