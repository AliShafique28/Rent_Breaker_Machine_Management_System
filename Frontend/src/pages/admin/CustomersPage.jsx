import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { CUSTOMER_ENDPOINTS } from '../../services/endpoints';
import { confirmDelete } from '../../utils/alert';
import { Edit, Trash2, X, History } from 'lucide-react';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // 'list' | 'edit' | 'history'
  const [viewState, setViewState] = useState('list');
  
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerHistory, setCustomerHistory] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (viewState === 'list') {
      fetchCustomers();
    }
  }, [viewState]);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(CUSTOMER_ENDPOINTS.LIST);
      if (data.success) {
        setCustomers(data.data);
      }
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (id) => {
    try {
      setFormLoading(true);
      const { data } = await apiClient.get(CUSTOMER_ENDPOINTS.RENTALS_BY_ID(id));
      if (data.success) {
        setCustomerHistory(data.data);
      }
    } catch (error) {
      toast.error('Failed to load rental history');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirmDelete(`Customer: ${name}`);
    if (!isConfirmed) return;

    try {
      await apiClient.delete(CUSTOMER_ENDPOINTS.BY_ID(id));
      toast.success('Customer deleted successfully');
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleFormChange = (e) => {
    setCurrentCustomer({ ...currentCustomer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Remove password or _id from payload just to be safe
      const { _id, password, createdAt, updatedAt, __v, ...updateData } = currentCustomer;
      
      await apiClient.put(CUSTOMER_ENDPOINTS.BY_ID(_id), updateData);
      toast.success('Customer updated successfully');
      setViewState('list');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditForm = (customer) => {
    setCurrentCustomer(customer);
    setViewState('edit');
  };

  const openHistory = (customer) => {
    setCurrentCustomer(customer);
    setCustomerHistory([]);
    setViewState('history');
    fetchHistory(customer._id);
  };

  // --- Render Functions ---

  const renderEditForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Edit Customer</h2>
        <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={currentCustomer.name}
              onChange={handleFormChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={currentCustomer.email}
              onChange={handleFormChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="text"
              name="phone"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={currentCustomer.phone}
              onChange={handleFormChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">CNIC</label>
            <input
              type="text"
              name="cnic"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={currentCustomer.cnic}
              onChange={handleFormChange}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <textarea
            name="address"
            required
            rows="2"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 resize-none"
            value={currentCustomer.address}
            onChange={handleFormChange}
          ></textarea>
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => setViewState('list')}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={formLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400"
          >
            {formLoading ? 'Saving...' : 'Update Customer'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderHistory = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden max-w-4xl">
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Rental History</h2>
          <p className="text-sm text-gray-500">Showing rentals for: <span className="font-medium text-gray-700">{currentCustomer?.name}</span></p>
        </div>
        <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-gray-700 bg-gray-100 p-2 rounded-md">
          Back to List
        </button>
      </div>

      <div className="p-5">
        {formLoading ? (
          <p className="text-center text-gray-500">Loading history...</p>
        ) : customerHistory.length === 0 ? (
          <p className="text-center text-gray-500 py-4">No rental history found for this customer.</p>
        ) : (
          <div className="space-y-3">
            {customerHistory.map(rental => (
              <div key={rental._id} className="border border-gray-200 p-4 rounded-md flex justify-between items-center bg-gray-50">
                <div>
                  <h4 className="font-medium text-gray-800">{rental.machine?.name}</h4>
                  <p className="text-xs text-gray-500">
                    {new Date(rental.startDate).toLocaleDateString()} to {new Date(rental.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-800">Rs. {rental.totalRent}</p>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                    rental.status === 'Completed' ? 'bg-gray-200 text-gray-700' :
                    rental.status === 'Active' ? 'bg-blue-100 text-blue-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {rental.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">Customers</h2>
        <p className="text-sm text-gray-500">View and manage registered customers.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Email</th>
              <th className="p-4 font-medium">Phone</th>
              <th className="p-4 font-medium">CNIC</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">Loading customers...</td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">No customers registered yet.</td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{c.name}</td>
                  <td className="p-4 text-gray-600">{c.email}</td>
                  <td className="p-4 text-gray-600">{c.phone}</td>
                  <td className="p-4 text-gray-600">{c.cnic}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openHistory(c)}
                      className="text-green-600 hover:text-green-800 p-1 mr-2 inline-block"
                      title="View Rental History"
                    >
                      <History size={18} />
                    </button>
                    <button 
                      onClick={() => openEditForm(c)}
                      className="text-blue-600 hover:text-blue-800 p-1 mr-2 inline-block"
                      title="Edit Customer"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(c._id, c.name)}
                      className="text-red-500 hover:text-red-700 p-1 inline-block"
                      title="Delete Customer"
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
      {viewState === 'list' && renderList()}
      {viewState === 'edit' && renderEditForm()}
      {viewState === 'history' && renderHistory()}
    </div>
  );
};

export default CustomersPage;
