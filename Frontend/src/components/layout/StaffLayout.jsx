import { Outlet, NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut } from 'lucide-react';

const StaffLayout = () => {
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h1 className="text-xl font-bold text-blue-600">Rent Breaker</h1>
          <span className="text-xs font-semibold bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">
            Staff Portal
          </span>
          <p className="text-sm text-gray-500 mt-2">{user?.name}</p>
        </div>
        
        <nav className="p-4 space-y-2 flex-1">
          <NavLink 
            to="/staff" 
            end
            className={({ isActive }) => `block px-4 py-2.5 rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Dashboard
          </NavLink>
          <NavLink 
            to="/staff/rentals" 
            className={({ isActive }) => `block px-4 py-2.5 rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Rentals
          </NavLink>
          <NavLink 
            to="/staff/maintenance" 
            className={({ isActive }) => `block px-4 py-2.5 rounded-md transition-colors ${isActive ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
          >
            Maintenance
          </NavLink>
        </nav>

        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex justify-center items-center px-4 py-2.5 rounded-md bg-red-50 text-red-600 hover:bg-red-100 font-medium transition"
          >
            <LogOut size={18} className="mr-2" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StaffLayout;
