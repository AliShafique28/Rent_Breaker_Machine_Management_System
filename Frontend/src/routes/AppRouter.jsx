import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminStaffLogin from '../pages/auth/AdminStaffLogin.jsx';
import CustomerLogin from '../pages/auth/CustomerLogin.jsx';
import CustomerRegister from '../pages/auth/CustomerRegister.jsx';
import AdminLayout from '../components/layout/AdminLayout.jsx';
import StaffLayout from '../components/layout/StaffLayout.jsx';
import CustomerLayout from '../components/layout/CustomerLayout.jsx';
import AdminDashboard from '../pages/admin/AdminDashboard.jsx';
import StaffDashboard from '../pages/staff/StaffDashboard.jsx';
import CustomerDashboard from '../pages/customer/CustomerDashboard.jsx';
import MachinesPage from '../pages/admin/MachinesPage.jsx';
import StaffManagementPage from '../pages/admin/StaffManagementPage.jsx';
import CustomersPage from '../pages/admin/CustomersPage.jsx';
import RentalsPage from '../pages/admin/RentalsPage.jsx';
import MaintenancePage from '../pages/admin/MaintenancePage.jsx';
import ReportsPage from '../pages/admin/ReportsPage.jsx';
import CustomerProfilePage from '../pages/customer/CustomerProfilePage.jsx';
import CustomerMachinesPage from '../pages/customer/CustomerMachinesPage.jsx';
import CustomerRentalsPage from '../pages/customer/CustomerRentalsPage.jsx';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ allowedRoles, children }) => {
  const role = useAuthStore((s) => s.role);
  const token = useAuthStore((s) => s.token);

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth routes */}
        <Route path="/login" element={<AdminStaffLogin />} />
        <Route path="/customer/login" element={<CustomerLogin />} />
        <Route path="/customer/register" element={<CustomerRegister />} />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="staff" element={<StaffManagementPage />} />
          <Route path="machines" element={<MachinesPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="rentals" element={<RentalsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>

        {/* Staff routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff']}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StaffDashboard />} />
          <Route path="rentals" element={<RentalsPage />} />
          <Route path="maintenance" element={<MaintenancePage />} />
        </Route>

        {/* Customer routes */}
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRoles={['customer']}>
              <CustomerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CustomerDashboard />} />
          <Route path="profile" element={<CustomerProfilePage />} />
          <Route path="machines" element={<CustomerMachinesPage />} />
          <Route path="rentals" element={<CustomerRentalsPage />} />
        </Route>

        {/* Default */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
