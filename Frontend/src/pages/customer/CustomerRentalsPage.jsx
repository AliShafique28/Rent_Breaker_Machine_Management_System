import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { RENTAL_ENDPOINTS } from '../../services/endpoints';
import { Clock, CheckCircle, CheckCircle2 } from 'lucide-react';

const CustomerRentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyRentals();
  }, []);

  const fetchMyRentals = async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get(RENTAL_ENDPOINTS.MY_LIST);
      if (data.success) {
        setRentals(data.data);
      }
    } catch (error) {
      toast.error('Failed to load your rentals');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock size={16} className="text-orange-500 mr-1" />;
      case 'Active': return <CheckCircle size={16} className="text-blue-500 mr-1" />;
      case 'Completed': return <CheckCircle2 size={16} className="text-gray-500 mr-1" />;
      default: return null;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-orange-50 border-orange-200 text-orange-700';
      case 'Active': return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'Completed': return 'bg-gray-100 border-gray-200 text-gray-600';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">My Rental History</h1>
        <p className="text-sm text-gray-500 mt-1">Track the status and billing of your requests.</p>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading your history...</div>
      ) : rentals.length === 0 ? (
        <div className="bg-white p-12 rounded-lg text-center shadow-sm border border-gray-100">
          <Clock size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-700">No rentals found.</h3>
          <p className="text-gray-500 mt-1">Go to the Machines page to request your first rental.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rentals.map((r) => (
            <div key={r._id} className={`p-6 rounded-xl border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center ${getStatusColor(r.status)}`}>
              
              {/* Left Side: Machine Info & Dates */}
              <div className="mb-4 md:mb-0">
                <div className="flex items-center mb-1">
                  {getStatusIcon(r.status)}
                  <span className="font-semibold uppercase tracking-wider text-xs">{r.status}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{r.machine?.name}</h3>
                <p className="text-sm mt-1 opacity-80">
                  {new Date(r.startDate).toLocaleDateString()} to {new Date(r.endDate).toLocaleDateString()}
                </p>
                {r.notes && <p className="text-xs italic mt-2 opacity-70">Note: "{r.notes}"</p>}
              </div>

              {/* Right Side: Financials */}
              <div className="bg-white p-4 rounded-lg shadow-sm border border-white bg-opacity-60 min-w-[200px]">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Total Bill:</span>
                  <span className="font-semibold text-gray-800">Rs. {r.totalRent}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold text-green-600">Rs. {r.advancePaid}</span>
                </div>
                <div className="flex justify-between text-sm mt-2 pt-2 border-t border-gray-200">
                  <span className="font-medium text-gray-800">Remaining:</span>
                  <span className="font-bold text-red-600">Rs. {r.remainingBalance}</span>
                </div>
                
                <div className="mt-3 text-right">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    r.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                    r.paymentStatus === 'Partial' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Payment: {r.paymentStatus}
                  </span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerRentalsPage;
