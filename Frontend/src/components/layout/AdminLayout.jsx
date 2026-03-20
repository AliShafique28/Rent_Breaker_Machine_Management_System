import { Outlet } from 'react-router-dom';
import Sidebar from '../common/Sidebar';

const AdminLayout = () => {
  const adminLinks = [
    { to: "/admin", label: "Dashboard", end: true },
    { to: "/admin/staff", label: "Manage Staff" },
    { to: "/admin/machines", label: "Machines" },
    { to: "/admin/customers", label: "Customers" },
    { to: "/admin/rentals", label: "Rentals" },
    { to: "/admin/maintenance", label: "Maintenance" },
    { to: "/admin/reports", label: "Reports" },
  ];

  return (
    <div className="min-h-screen flex bg-gray-100">
      <Sidebar portalName="Admin Portal" links={adminLinks} />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto"><Outlet /></div>
      </main>
    </div>
  );
};
export default AdminLayout;
