import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../../services/apiClient';
import { REPORT_ENDPOINTS } from '../../services/endpoints';
import { Calendar, FileText, Download } from 'lucide-react';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('revenue');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Initialize with current month's start and end dates
  useEffect(() => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    
    setStartDate(firstDay);
    setEndDate(lastDay);
  }, []);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      return toast.warning('Please select both start and end dates');
    }

    setLoading(true);
    setReportData(null); // Clear previous data

    try {
      let endpoint = '';
      if (reportType === 'revenue') endpoint = REPORT_ENDPOINTS.REVENUE;
      else if (reportType === 'utilization') endpoint = REPORT_ENDPOINTS.MACHINE_UTILIZATION;
      else if (reportType === 'rentals') endpoint = REPORT_ENDPOINTS.RENTALS;

      const { data } = await apiClient.get(`${endpoint}?startDate=${startDate}&endDate=${endDate}`);
      
      if (data.success) {
        setReportData(data);
        toast.success('Report generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  // --- Render Sub-components for each report type ---

  const renderRevenueReport = () => {
    if (!reportData) return null;
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-green-50 border border-green-200 p-6 rounded-lg text-center">
          <p className="text-green-800 font-medium mb-2">Total Revenue Generated</p>
          <h3 className="text-3xl font-bold text-green-700">Rs. {reportData.totalRevenue?.toLocaleString()}</h3>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg text-center">
          <p className="text-blue-800 font-medium mb-2">Advance Collected</p>
          <h3 className="text-3xl font-bold text-blue-700">Rs. {reportData.totalAdvance?.toLocaleString()}</h3>
        </div>
        <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg text-center">
          <p className="text-orange-800 font-medium mb-2">Remaining Pending</p>
          <h3 className="text-3xl font-bold text-orange-700">Rs. {reportData.totalRemaining?.toLocaleString()}</h3>
        </div>
        <div className="md:col-span-3 text-center mt-4">
          <p className="text-gray-500">Based on <span className="font-semibold text-gray-800">{reportData.totalRentals}</span> active/completed rentals in this period.</p>
        </div>
      </div>
    );
  };

  const renderUtilizationReport = () => {
    if (!reportData || !reportData.data) return null;
    const machines = reportData.data;

    return (
      <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4 font-medium border-b">Machine Name</th>
              <th className="p-4 font-medium border-b text-center">Total Days Rented</th>
              <th className="p-4 font-medium border-b text-right">Revenue Generated</th>
            </tr>
          </thead>
          <tbody>
            {machines.length === 0 ? (
              <tr><td colSpan="3" className="p-6 text-center text-gray-500">No utilization data for this period.</td></tr>
            ) : (
              machines.map((m, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">{m.machineName}</td>
                  <td className="p-4 text-center text-gray-600">
                    <span className="bg-blue-100 text-blue-800 py-1 px-3 rounded-full font-semibold">{m.totalDaysRented} days</span>
                  </td>
                  <td className="p-4 text-right text-gray-800 font-semibold">Rs. {m.totalRent?.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  const renderRentalReport = () => {
    if (!reportData || !reportData.data) return null;
    const rentals = reportData.data;

    return (
      <div className="mt-6 overflow-x-auto border border-gray-200 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="p-4 font-medium border-b">Date Created</th>
              <th className="p-4 font-medium border-b">Customer</th>
              <th className="p-4 font-medium border-b">Machine</th>
              <th className="p-4 font-medium border-b">Status</th>
              <th className="p-4 font-medium border-b text-right">Total Rent</th>
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 ? (
              <tr><td colSpan="5" className="p-6 text-center text-gray-500">No rentals created in this period.</td></tr>
            ) : (
              rentals.map((r, idx) => (
                <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="p-4 text-gray-600">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 font-medium text-gray-800">{r.customer?.name}</td>
                  <td className="p-4 text-gray-600">{r.machine?.name}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      r.status === 'Completed' ? 'bg-gray-200 text-gray-700' :
                      r.status === 'Active' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="p-4 text-right text-gray-800 font-semibold">Rs. {r.totalRent?.toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="max-w-6xl">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <FileText className="text-gray-400" size={28} />
          <div>
            <h2 className="text-2xl font-bold text-gray-800">System Reports</h2>
            <p className="text-sm text-gray-500">Generate insights on revenue, machine usage, and rental volume.</p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="flex flex-col md:flex-row md:items-end gap-4 bg-gray-50 p-4 rounded-md border border-gray-100">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
            <select 
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm bg-white focus:ring-blue-500 focus:border-blue-500"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="revenue">Financial Revenue Report</option>
              <option value="utilization">Machine Utilization Report</option>
              <option value="rentals">Detailed Rental Log</option>
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <div className="relative">
              <input 
                type="date" 
                required
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <div className="relative">
              <input 
                type="date" 
                required
                className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
              <Calendar size={16} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-md transition disabled:bg-blue-400 h-[38px] flex items-center justify-center"
          >
            {loading ? 'Generating...' : 'Generate Report'}
          </button>
        </form>
      </div>

      {/* Report Display Area */}
      {reportData && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 animate-fade-in-up">
          <div className="flex justify-between items-center border-b pb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-800 capitalize">
                {reportType.replace('_', ' ')} Report
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                From: <span className="font-medium">{new Date(reportData.range?.start).toLocaleDateString()}</span> to <span className="font-medium">{new Date(reportData.range?.end).toLocaleDateString()}</span>
              </p>
            </div>
            
            {/* Future Enhancement stub for printing */}
            <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-blue-600 border border-gray-200 px-3 py-1.5 rounded-md hover:bg-gray-50 transition" onClick={() => window.print()}>
              <Download size={16} /> <span>Print / PDF</span>
            </button>
          </div>

          {reportType === 'revenue' && renderRevenueReport()}
          {reportType === 'utilization' && renderUtilizationReport()}
          {reportType === 'rentals' && renderRentalReport()}
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
