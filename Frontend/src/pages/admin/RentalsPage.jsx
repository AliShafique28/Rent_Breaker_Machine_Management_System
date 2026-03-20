import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { RENTAL_ENDPOINTS, MACHINE_ENDPOINTS, CUSTOMER_ENDPOINTS } from '../../services/endpoints';
import { Plus, Edit, DollarSign, X } from 'lucide-react';

const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Available data for dropdowns when adding a rental
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);

  // 'list' | 'add' | 'manage'
  const [viewState, setViewState] = useState('list');
  const [currentRental, setCurrentRental] = useState(null);
  
  const [formLoading, setFormLoading] = useState(false);

  // Form State for Adding Rental
  const [addForm, setAddForm] = useState({
    machineId: '',
    customerId: '',
    startDate: '',
    endDate: '',
    status: 'Pending',
    advancePaid: 0,
    notes: ''
  });

  // Form State for Managing Status & Payment
  const [manageForm, setManageForm] = useState({
    status: '',
    paymentAmount: 0,
  });

  useEffect(() => {
    if (viewState === 'list') {
      fetchRentals();
    } else if (viewState === 'add') {
      fetchDropdownData();
    }
  }, [viewState]);

  const fetchRentals = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(RENTAL_ENDPOINTS.LIST);
      if (data.success) setRentals(data.data);
    } catch (error) {
      toast.error('Failed to load rentals');
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Only fetch available machines for new rentals
      const machineRes = await apiClient.get(MACHINE_ENDPOINTS.AVAILABLE);
      const customerRes = await apiClient.get(CUSTOMER_ENDPOINTS.LIST);
      setMachines(machineRes.data.data || []);
      setCustomers(customerRes.data.data || []);
    } catch (error) {
      toast.error('Failed to load form data');
    }
  };

  const handleAddChange = (e) => {
    setAddForm({ ...addForm, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!addForm.machineId || !addForm.customerId || !addForm.startDate || !addForm.endDate) {
      return toast.warning('Please fill all required fields');
    }

    setFormLoading(true);
    try {
      // Convert advancePaid to number
      const payload = { ...addForm, advancePaid: Number(addForm.advancePaid) };
      await apiClient.post(RENTAL_ENDPOINTS.CREATE_STAFF, payload);
      
      toast.success('Rental created successfully');
      setViewState('list');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create rental');
    } finally {
      setFormLoading(false);
    }
  };

  const openManageForm = (rental) => {
    setCurrentRental(rental);
    setManageForm({
      status: rental.status,
      paymentAmount: 0
    });
    setViewState('manage');
  };

  const handleStatusUpdate = async () => {
    if (manageForm.status === currentRental.status) return toast.info('Status is already set');
    
    setFormLoading(true);
    try {
      await apiClient.put(RENTAL_ENDPOINTS.UPDATE(currentRental._id), { status: manageForm.status });
      toast.success('Status updated');
      
      // Update local state to reflect change without re-fetching everything immediately
      setCurrentRental({ ...currentRental, status: manageForm.status });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePaymentSubmit = async () => {
    const amount = Number(manageForm.paymentAmount);
    if (amount <= 0) return toast.warning('Enter a valid amount');
    if (amount > currentRental.remainingBalance) return toast.error('Payment exceeds remaining balance!');

    setFormLoading(true);
    try {
      const { data } = await apiClient.put(RENTAL_ENDPOINTS.PAYMENT(currentRental._id), { amount });
      toast.success('Payment recorded successfully');
      
      // Update local state with the newly calculated billing data from backend
      setCurrentRental(data.data);
      setManageForm({ ...manageForm, paymentAmount: 0 }); // Reset input
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setFormLoading(false);
    }
  };

  // --- Render Functions ---

  const renderAddForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-3xl">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Create New Rental</h2>
          <p className="text-sm text-gray-500">Book a machine directly from the counter.</p>
        </div>
        <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleAddSubmit} className="space-y-5">
        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer</label>
            <select name="customerId" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" value={addForm.customerId} onChange={handleAddChange}>
              <option value="">-- Choose Customer --</option>
              {customers.map(c => <option key={c._id} value={c._id}>{c.name} ({c.phone})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Machine</label>
            <select name="machineId" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" value={addForm.machineId} onChange={handleAddChange}>
              <option value="">-- Choose Available Machine --</option>
              {machines.map(m => <option key={m._id} value={m._id}>{m.name} - Rs.{m.rentalPricePerDay}/day</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input type="date" name="startDate" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={addForm.startDate} onChange={handleAddChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input type="date" name="endDate" required className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={addForm.endDate} onChange={handleAddChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Status</label>
            <select name="status" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white" value={addForm.status} onChange={handleAddChange}>
              <option value="Pending">Pending (Reserve only)</option>
              <option value="Active">Active (Hand over immediately)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Advance Payment (Rs)</label>
            <input type="number" name="advancePaid" min="0" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={addForm.advancePaid} onChange={handleAddChange} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <input type="text" name="notes" className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" value={addForm.notes} onChange={handleAddChange} placeholder="Any specific instructions..." />
        </div>

        <div className="pt-4 flex justify-end space-x-3">
          <button type="button" onClick={() => setViewState('list')} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-50">Cancel</button>
          <button type="submit" disabled={formLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-400">
            {formLoading ? 'Creating...' : 'Create Rental'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderManageView = () => {
    if (!currentRental) return null;
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-w-4xl overflow-hidden">
        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Manage Rental</h2>
            <p className="text-sm text-gray-500">Rental ID: {currentRental._id.slice(-6)}</p>
          </div>
          <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-gray-700 bg-white p-1.5 rounded-md border shadow-sm">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
          {/* Left Column: Details & Status */}
          <div className="p-6 border-r border-gray-200 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Rental Details</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p><span className="font-medium">Customer:</span> {currentRental.customer?.name} ({currentRental.customer?.phone})</p>
                <p><span className="font-medium">Machine:</span> {currentRental.machine?.name}</p>
                <p><span className="font-medium">Period:</span> {new Date(currentRental.startDate).toLocaleDateString()} to {new Date(currentRental.endDate).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Update Status</h3>
              <div className="flex space-x-2">
                <select 
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  value={manageForm.status} 
                  onChange={(e) => setManageForm({...manageForm, status: e.target.value})}
                  disabled={currentRental.status === 'Completed'}
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                </select>
                <button 
                  onClick={handleStatusUpdate}
                  disabled={currentRental.status === 'Completed' || formLoading}
                  className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md text-sm transition disabled:bg-gray-400"
                >
                  Update
                </button>
              </div>
              {currentRental.status === 'Completed' && <p className="text-xs text-red-500 mt-2">Completed rentals cannot change status.</p>}
            </div>
          </div>

          {/* Right Column: Billing & Payment */}
          <div className="p-6 space-y-6 bg-gray-50">
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Billing Summary</h3>
              <div className="bg-white p-4 rounded-md border border-gray-200 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-600">Total Rent:</span> <span className="font-medium">Rs. {currentRental.totalRent}</span></div>
                <div className="flex justify-between"><span className="text-gray-600">Advance/Paid:</span> <span className="text-green-600 font-medium">Rs. {currentRental.advancePaid}</span></div>
                <div className="flex justify-between border-t pt-2 mt-2"><span className="font-semibold">Remaining:</span> <span className="font-bold text-red-600">Rs. {currentRental.remainingBalance}</span></div>
              </div>
              <div className="mt-3">
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  currentRental.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                  currentRental.paymentStatus === 'Partial' ? 'bg-orange-100 text-orange-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  Status: {currentRental.paymentStatus}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Record Payment</h3>
              <div className="flex flex-col space-y-2">
                <input 
                  type="number" 
                  min="1"
                  max={currentRental.remainingBalance}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                  placeholder="Amount in Rs."
                  value={manageForm.paymentAmount || ''}
                  onChange={(e) => setManageForm({...manageForm, paymentAmount: e.target.value})}
                  disabled={currentRental.remainingBalance <= 0}
                />
                <button 
                  onClick={handlePaymentSubmit}
                  disabled={currentRental.remainingBalance <= 0 || formLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center space-x-2 py-2 rounded-md text-sm transition disabled:bg-gray-400"
                >
                  <DollarSign size={16} /> <span>Pay Amount</span>
                </button>
              </div>
              {currentRental.remainingBalance <= 0 && <p className="text-xs text-green-600 mt-2 text-center font-medium">Fully Paid!</p>}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Rentals & Requests</h2>
          <p className="text-sm text-gray-500">Manage machine bookings and customer requests.</p>
        </div>
        <button onClick={() => setViewState('add')} className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition">
          <Plus size={16} /> <span>New Rental</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Machine</th>
              <th className="p-4 font-medium">Dates</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Payment</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">Loading rentals...</td></tr>
            ) : rentals.length === 0 ? (
              <tr><td colSpan="6" className="p-8 text-center text-gray-500">No rentals found.</td></tr>
            ) : (
              rentals.map((r) => (
                <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{r.customer?.name}</td>
                  <td className="p-4 text-gray-600">{r.machine?.name}</td>
                  <td className="p-4 text-gray-500 text-xs">
                    {new Date(r.startDate).toLocaleDateString()} - <br/> {new Date(r.endDate).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      r.status === 'Completed' ? 'bg-gray-200 text-gray-700' :
                      r.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      r.paymentStatus === 'Paid' ? 'text-green-700' :
                      r.paymentStatus === 'Partial' ? 'text-orange-700' : 'text-red-700'
                    }`}>
                      {r.paymentStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openManageForm(r)}
                      className="text-blue-600 hover:text-blue-800 font-medium hover:underline inline-flex items-center"
                    >
                      <Edit size={14} className="mr-1"/> Manage
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
      {viewState === 'add' && renderAddForm()}
      {viewState === 'manage' && renderManageView()}
    </div>
  );
};

export default RentalsPage;
