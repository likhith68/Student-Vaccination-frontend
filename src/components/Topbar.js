import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate,Link } from 'react-router-dom';
import {
  ChartBarSquareIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const Topbar = () => {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username') || 'User';
    setUsername(storedUsername);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://127.0.0.1:8000/auth/logout/', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <header className="bg-white shadow-sm z-20 sticky top-0">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left section with icons */}
        <div className="flex items-center space-x-4">
          {/* App title/icon */}
          <div className="flex items-center">
            <span className="lg:hidden text-lg font-semibold text-gray-800 hidden sm:inline">
              Vaccine Tracker
            </span>
            <span className="lg:hidden text-lg font-semibold text-blue-600 sm:hidden">
              V
            </span>
          </div>

          {/* Navigation icons */}
          <div className="flex space-x-4 lg:hidden">
            <NavIcon to="/" Icon={ChartBarSquareIcon} text="Dashboard" />
            <NavIcon to="/drives" Icon={CalendarDaysIcon} text="Drives" />
            <NavIcon to="/register" Icon={UserPlusIcon} text="Register" />
            <NavIcon to="/reports" Icon={DocumentChartBarIcon} text="Reports" />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* User info - shown on tablet and up */}
          <div className="hidden sm:flex items-center">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
              <span className="text-sm font-medium text-blue-800">
                {username.charAt(0).toUpperCase()}
              </span>
            </span>
            <span className="ml-2 text-sm font-medium text-gray-700 hidden md:inline">
              {username}
            </span>
          </div>

          {/* Enhanced logout button */}
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 font-medium group"
          >
            <div className="p-1 rounded-full group-hover:bg-blue-100 transition-colors">
              <svg 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                />
              </svg>
            </div>
            <span className="hidden sm:inline text-sm">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

const NavIcon = ({ to, Icon, text }) => (
  <Link 
    to={to} 
    className="
      p-2 rounded-md 
      text-gray-700 hover:text-blue-600 hover:bg-blue-50
      transition-colors
      flex items-center justify-center
    "
    title={text}
  >
    <Icon className="h-5 w-5" />
  </Link>
);

export default Topbar;