import React from 'react';
import { Link } from 'react-router-dom';
import {
  ChartBarSquareIcon,
  CalendarDaysIcon,
  UserPlusIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';

const Sidebar = () => {
  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="w-64 bg-white h-screen fixed top-0 left-0 shadow-lg p-6 z-30">
        <div className="text-2xl font-bold text-blue-600 mb-10">Vaccine Tracker</div>
        <nav className="flex flex-col gap-6">
          <NavItem to="/" Icon={ChartBarSquareIcon} text="Dashboard" />
          <NavItem to="/drives" Icon={CalendarDaysIcon} text="Drives" />
          <NavItem to="/register" Icon={UserPlusIcon} text="Register" />
          <NavItem to="/reports" Icon={DocumentChartBarIcon} text="Reports" />
        </nav>
      </div>
    </div>
  );
};

const NavItem = ({ to, Icon, text }) => (
  <Link 
    to={to} 
    className="
      flex items-center 
      p-2 rounded-md 
      text-gray-700 hover:text-blue-600 hover:bg-blue-50
      transition-colors
    "
  >
    <Icon className="h-5 w-5 mr-3" />
    <span>{text}</span>
  </Link>
);

export default Sidebar;