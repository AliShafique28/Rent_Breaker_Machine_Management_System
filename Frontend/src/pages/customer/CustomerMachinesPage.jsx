import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { MACHINE_ENDPOINTS, RENTAL_ENDPOINTS } from '../../services/endpoints';
import { MonitorPlay, MapPin, Tag, Calendar, X } from 'lucide-react';

const CustomerMachinesPage = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [requestForm, setRequestForm] = useState({
    startDate: '',
    endDate: '',
    notes: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchAvailableMachines();
  }, []);

  const fetchAvailableMachines = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(MACHINE_ENDPOINTS.AVAILABLE);
      if (data.success) {
        setMachines(data.data);
      }
    } catch (error) {
      toast.error('Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!requestForm.startDate || !requestForm.endDate) {
      return toast.warning('Please select start and end dates');
    }

    setFormLoading(true);
    try {
      const payload = {
        machineId: selectedMachine._id,
        startDate: requestForm.startDate,
        endDate: requestForm.endDate,
        notes: requestForm.notes
      };

      await apiClient.post(RENTAL_ENDPOINTS.REQUEST, payload);
      toast.success('Rental request submitted successfully! Staff will review it shortly.');

      setSelectedMachine(null); // close modal
      setRequestForm({ startDate: '', endDate: '', notes: '' }); // reset form

      // Navigate them to their rentals page so they can see the pending request
      navigate('/customer/rentals');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Available Machines</h1>
          <p className="text-sm text-gray-500 mt-1">Browse our inventory and request a rental.</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading available machines...</div>
      ) : machines.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center shadow-sm border border-gray-100">
          <MonitorPlay size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No machines available right now.</h3>
          <p className="text-gray-500">Please check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {machines.map((m) => (
            <div key={m._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition">
              <div className="h-40 bg-gray-100 flex items-center justify-center border-b border-gray-200">
                <MonitorPlay size={64} className="text-gray-300" />
              </div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-800">{m.name}</h3>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-2.5 py-1 rounded-full">
                    Available
                  </span>
                </div>

                <div className="space-y-2 mt-4 text-sm text-gray-600">
                  <p className="flex items-center"><Tag size={16} className="mr-2 text-gray-400" /> Capacity: {m.capacity}</p>
                  <p className="flex items-center"><MapPin size={16} className="mr-2 text-gray-400" /> Location: {m.location}</p>
                  <p className="flex items-center font-medium text-green-700 mt-2">
                    <span className="text-lg">Rs. {m.rentalPricePerDay}</span><span className="text-xs ml-1 text-gray-500 font-normal">/ day</span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedMachine(m)}
                  className="w-full mt-5 bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg transition"
                >
                  Request Rental
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Request Modal */}
      {selectedMachine && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50">
              <h3 className="text-lg font-bold text-gray-800">Request: {selectedMachine.name}</h3>
              <button onClick={() => setSelectedMachine(null)} className="text-gray-400 hover:text-gray-600 bg-white rounded-md p-1 shadow-sm border">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleRequestSubmit} className="p-6 space-y-5">
              <div className="bg-green-50 text-green-800 p-3 rounded-md text-sm border border-green-100 mb-4">
                <p><strong>Rate:</strong> Rs. {selectedMachine.rentalPricePerDay} / day</p>
                <p className="text-xs mt-1">Your request will be marked as 'Pending' until staff approves it.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={14} className="mr-1" /> Start Date
                  </label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={requestForm.startDate}
                    onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
                    <Calendar size={14} className="mr-1" /> End Date
                  </label>
                  <input
                    type="date"
                    required
                    min={requestForm.startDate || new Date().toISOString().split('T')[0]}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500"
                    value={requestForm.endDate}
                    onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Notes / Instructions</label>
                <textarea
                  rows="2"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Where will it be used, etc."
                  value={requestForm.notes}
                  onChange={(e) => setRequestForm({ ...requestForm, notes: e.target.value })}
                ></textarea>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 rounded-lg transition disabled:bg-green-400"
                >
                  {formLoading ? 'Submitting Request...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerMachinesPage;
