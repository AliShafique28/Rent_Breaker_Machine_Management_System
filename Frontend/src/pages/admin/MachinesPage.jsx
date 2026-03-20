import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { MACHINE_ENDPOINTS } from '../../services/endpoints';
import { confirmDelete } from '../../utils/alert';
import { Plus, Edit, Trash2, X } from 'lucide-react';

const MachinesPage = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State: 'list' | 'add' | 'edit'
  const [viewState, setViewState] = useState('list');
  const [currentMachine, setCurrentMachine] = useState({
    name: '',
    capacity: '',
    rentalPricePerDay: '',
    location: '',
    status: 'Available'
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    if (viewState === 'list') {
      fetchMachines();
    }
  }, [viewState]);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(MACHINE_ENDPOINTS.LIST);
      if (data.success) {
        setMachines(data.data);
      }
    } catch (error) {
      toast.error('Failed to load machines');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    const isConfirmed = await confirmDelete(`Machine: ${name}`);
    if (!isConfirmed) return;

    try {
      await apiClient.delete(MACHINE_ENDPOINTS.BY_ID(id));
      toast.success('Machine deleted successfully');
      fetchMachines();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete machine');
    }
  };

  const handleFormChange = (e) => {
    setCurrentMachine({ ...currentMachine, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      if (viewState === 'add') {
        await apiClient.post(MACHINE_ENDPOINTS.LIST, currentMachine);
        toast.success('Machine added successfully');
      } else if (viewState === 'edit') {
        await apiClient.put(MACHINE_ENDPOINTS.BY_ID(currentMachine._id), currentMachine);
        toast.success('Machine updated successfully');
      }
      setViewState('list'); // Switch back to list view
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save machine');
    } finally {
      setFormLoading(false);
    }
  };

  const openAddForm = () => {
    setCurrentMachine({ name: '', capacity: '', rentalPricePerDay: '', location: '', status: 'Available' });
    setViewState('add');
  };

  const openEditForm = (machine) => {
    setCurrentMachine(machine);
    setViewState('edit');
  };

  // --- Render Functions ---

  const renderForm = () => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">
          {viewState === 'add' ? 'Add New Machine' : 'Edit Machine'}
        </h2>
        <button onClick={() => setViewState('list')} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Machine Name</label>
          <input
            type="text"
            name="name"
            required
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            value={currentMachine.name}
            onChange={handleFormChange}
            placeholder="e.g. Breaker BM-200"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
            <input
              type="text"
              name="capacity"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={currentMachine.capacity}
              onChange={handleFormChange}
              placeholder="e.g. 200kg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price Per Day (Rs)</label>
            <input
              type="number"
              name="rentalPricePerDay"
              required
              min="1"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={currentMachine.rentalPricePerDay}
              onChange={handleFormChange}
              placeholder="2500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
              value={currentMachine.location}
              onChange={handleFormChange}
              placeholder="Warehouse A"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
              value={currentMachine.status}
              onChange={handleFormChange}
            >
              <option value="Available">Available</option>
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
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
            {formLoading ? 'Saving...' : 'Save Machine'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderList = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex justify-between items-center p-5 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">Machines</h2>
          <p className="text-sm text-gray-500">Manage your inventory of rental breaker machines.</p>
        </div>
        <button
          onClick={openAddForm}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition"
        >
          <Plus size={16} /> <span>Add Machine</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Capacity</th>
              <th className="p-4 font-medium">Price/Day</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">Loading machines...</td>
              </tr>
            ) : machines.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">No machines found. Click 'Add Machine' to create one.</td>
              </tr>
            ) : (
              machines.map((m) => (
                <tr key={m._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                  <td className="p-4 font-medium text-gray-800">{m.name}</td>
                  <td className="p-4 text-gray-600">{m.capacity}</td>
                  <td className="p-4 text-gray-600">Rs. {m.rentalPricePerDay}</td>
                  <td className="p-4 text-gray-600">{m.location}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      m.status === 'Available' ? 'bg-green-100 text-green-700' :
                      m.status === 'Rented' ? 'bg-blue-100 text-blue-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => openEditForm(m)}
                      className="text-blue-600 hover:text-blue-800 p-1 mr-2 inline-block"
                      title="Edit"
                    >
                      <Edit size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(m._id, m.name)}
                      className="text-red-500 hover:text-red-700 p-1 inline-block"
                      title="Delete"
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
      {viewState === 'list' ? renderList() : renderForm()}
    </div>
  );
};

export default MachinesPage;
