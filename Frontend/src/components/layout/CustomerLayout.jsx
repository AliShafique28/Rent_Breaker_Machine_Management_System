import { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User, ChevronDown, Menu, X } from 'lucide-react'; // ← X & Menu add kiya

const CustomerLayout = () => {
  const logout   = useAuthStore((s) => s.logout);
  const user     = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  
  const [dropdownOpen, setDropdownOpen]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false); // ← NEW
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || 'C';
  };

  const handleLogout = () => {
    logout();
    navigate('/customer/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/customer" className="font-bold text-xl text-green-600 tracking-tight">
            RentBreaker
          </Link>

          {/* Desktop Nav Links — hidden on mobile */}
          <nav className="hidden md:flex space-x-6 items-center">
            <NavLink 
              to="/customer" end
              className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/customer/machines"
              className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Machines
            </NavLink>
            <NavLink 
              to="/customer/rentals"
              className={({ isActive }) => `text-sm font-medium transition ${isActive ? 'text-green-600' : 'text-gray-600 hover:text-gray-900'}`}
            >
              My Rentals
            </NavLink>
          </nav>

          {/* Right Side: Avatar + Hamburger */}
          <div className="flex items-center space-x-3">

            {/* Avatar Dropdown — always visible */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none group"
              >
                <div className="w-9 h-9 rounded-full bg-green-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm group-hover:bg-green-700 transition">
                  {getInitials(user?.name)}
                </div>
                <div className="hidden md:flex flex-col items-start leading-tight">
                  <span className="text-sm font-medium text-gray-800">{user?.name}</span>
                  <span className="text-xs text-gray-400">Customer</span>
                </div>
                <ChevronDown 
                  size={16} 
                  className={`text-gray-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Avatar Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/customer/profile'); }}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                  >
                    <User size={16} className="mr-3 text-gray-400" />
                    My Profile
                  </button>
                  <div className="border-t border-gray-100 mt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                    >
                      <LogOut size={16} className="mr-3" />
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ↓↓↓ HAMBURGER BUTTON — only visible on mobile ↓↓↓ */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
            {/* ↑↑↑ HAMBURGER BUTTON END ↑↑↑ */}

          </div>
        </div>

        {/* ↓↓↓ MOBILE DROPDOWN MENU — only visible on mobile ↓↓↓ */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 px-4 py-3 space-y-1">
            <NavLink 
              to="/customer" end
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2.5 rounded-md text-sm font-medium transition ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Dashboard
            </NavLink>
            <NavLink 
              to="/customer/machines"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2.5 rounded-md text-sm font-medium transition ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Machines
            </NavLink>
            <NavLink 
              to="/customer/rentals"
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => `block px-3 py-2.5 rounded-md text-sm font-medium transition ${isActive ? 'bg-green-50 text-green-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              My Rentals
            </NavLink>
          </div>
        )}
        {/* ↑↑↑ MOBILE DROPDOWN MENU END ↑↑↑ */}

      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
