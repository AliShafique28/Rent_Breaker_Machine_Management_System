import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { MAINTENANCE_ENDPOINTS, MACHINE_ENDPOINTS } from '../../services/endpoints';
import { useAuthStore } from '../../store/authStore';
import { confirmDelete } from '../../utils/alert';
import { Plus, Edit, Trash2, X, Wrench } from 'lucide-react';

const MaintenancePage = () => {
  const [records, setRecords] = useState([]);
  const [machines, setMachines] = useState([]); // For the dropdown
  const [loading, setLoading] = useState(true);
  
  // 'list' | 'add' | 'edit'
  const [viewState, setViewState] = useState('list');
  const [currentRecord, setCurrentRecord] = useState({
    machineId: '',
    date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
    issue: '',
    cost: '',
    nextMaintenanceDate: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  // Need user role to conditionally show Delete button
  const userRole = useAuthStore((s) => s.role);

  useEffect(() => {
    if (viewState === 'list') {
      fetchRecords();
    } else if (viewState === 'add') {
      fetchMachines();
    }
  }, [viewState]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(MAINTENANCE_ENDPOINTS.LIST);
      if (data.success) {
        setRecords(data.data);
      }
    } catch (error) {
      toast.error('Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchMachines = async () => {
    try {
      const { data } = await apiClient.get(MACHINE_ENDPOINTS.LIST);
      if (data.success) setMachines(data.data);
    } catch (error) {
      toast.error('Failed to load machines');
    }
  };

  const handleDelete = async (id, machineName) => {
    const isConfirmed = await confirmDelete(`Maintenance record for ${machineName}`);
    if (!isConfirmed) return;

    try {
      await apiClient.delete(MAINTENANCE_ENDPOINTS.BY_ID(id));
      toast.success('Record deleted successfully');
      fetchRecords();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete record');
    }
  };

  const handleFormChange = (e) => {
    setCurrentRecord({ ...currentRecord, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Ensure cost is a number
      const payload = { ...currentRecord, cost: Number(currentRecord.cost) };
      
      if (viewState === 'add') {
        await apiClient.post(MAINTENANCE_ENDPOINTS.CREATE, payload);
        toast.success('Maintenance recorded successfully');
      } else if (viewState === 'edit') {
        // Backend update takes date, issue, cost, nextMaintenanceDate
        const { machine, _id, createdAt, updatedAt, __v, ...updatePayload } = payload;
        await apiClient.put(MAINTENANCE_ENDPOINTS.BY_ID(_id), updatePayload);
        toast.success('Maintenance record updated');
      }
      setViewState('list');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save record');
    } finally {
      setFormLoading(false);
    }
  };

  const openAddForm = () => {
    setCurrentRecord({ 
      machineId: '', 
      date: new Date().toISOString().split('T')[0], 
      issue: '', 
      cost: '', 
      nextMaintenanceDate: '' 
    });
    setViewState('add');
  };

  const openEditForm = (record) => {
    setCurrentRecord({
      ...record,
      // Format dates for HTML date input
      date: record.date ? new Date(record.date).toISOString().split('T')[0] : '',
      nextMaintenanceDate: record.nextMaintenanceDate ? new Date(record.nextMaintenanceDate).toISOString().split('T')[0] : ''
    });
    setViewState('edit');
  };

  // --- Render Functions ---

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center">
          <Wrench size={20} className="mr-2 text-gray-500" />
          {viewState === 'add' ? 'Record Maintenance' : 'Edit Record'}
        </h2>
        <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {viewState === 'add' ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Machine</label>
            <select
              name="machineId"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500 bg-white"
              value={currentRecord.machineId}
              onChange={handleFormChange}
            >
              <option value="">-- Choose Machine --</option>
              {machines.map(m => (
                <option key={m._id} value={m._id}>{m.name} ({m.status})</option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
            <input 
              type="text" 
              disabled 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-gray-50 text-gray-500" 
              value={currentRecord.machine?.name || 'Unknown'} 
            />
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Date</label>
            <input
              type="date"
              name="date"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
              value={currentRecord.date}
              onChange={handleFormChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost (Rs)</label>
            <input
              type="number"
              name="cost"
              required
              min="0"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
              value={currentRecord.cost}
              onChange={handleFormChange}
              placeholder="e.g. 5000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
          <textarea
            name="issue"
            required
            rows="3"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500 resize-none"
            value={currentRecord.issue}
            onChange={handleFormChange}
            placeholder="Describe the problem and parts replaced..."
          ></textarea>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Next Maintenance Date (Optional)</label>
          <input
            type="date"
            name="nextMaintenanceDate"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-red-500 focus:border-red-500"
            value={currentRecord.nextMaintenanceDate}
            onChange={handleFormChange}
          />
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
            className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:bg-red-400"
          >
            {formLoading ? 'Saving...' : 'Save Record'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Maintenance Log</h2>
          <p className="text-sm text-gray-500">Track machine repairs and associated costs.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          <Plus size={16} /> <span>Record Maintenance</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="p-4 font-medium">Machine</th>
              <th className="p-4 font-medium">Issue</th>
              <th className="p-4 font-medium">Date</th>
              <th className="p-4 font-medium">Cost</th>
              <th className="p-4 font-medium">Next Maintenance</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Loading records...</td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No maintenance records found.</td>
              </tr>
            ) : (
              records.map((r) => (
                <tr key={r._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{r.machine?.name}</td>
                  <td className="p-4 text-gray-600 truncate max-w-xs">{r.issue}</td>
                  <td className="p-4 text-gray-600">{new Date(r.date).toLocaleDateString()}</td>
                  <td className="p-4 text-gray-600 font-medium">Rs. {r.cost}</td>
                  <td className="p-4 text-gray-500 text-xs">
                    {r.nextMaintenanceDate ? new Date(r.nextMaintenanceDate).toLocaleDateString() : 'Not set'}
                  </td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button 
                      onClick={() => openEditForm(r)}
                      className="text-blue-600 hover:text-blue-800 p-1 mr-2 inline-block"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    {userRole === 'admin' && (
                      <button 
                        onClick={() => handleDelete(r._id, r.machine?.name)}
                        className="text-red-500 hover:text-red-700 p-1 inline-block"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
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
      {viewState === 'list' ? renderList() : renderForm()}
    </div>
  );
};

export default MaintenancePage;
