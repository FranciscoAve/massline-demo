import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Search, User } from 'lucide-react';

interface BottomNavProps {
  className?: string;
}

const BottomNav: React.FC<BottomNavProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/query', icon: Search, label: 'Consultas' },
    { path: '/profile', icon: User, label: 'Perfil' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 ${className}`}>
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1.5 px-6 py-2 transition-colors ${
              isActive(item.path)
                ? 'text-blue-600'
                : 'text-gray-400 active:text-blue-600'
            }`}
          >
            <item.icon className="h-7 w-7" />
            <span className={`text-xs ${isActive(item.path) ? 'font-semibold' : 'font-medium'}`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
