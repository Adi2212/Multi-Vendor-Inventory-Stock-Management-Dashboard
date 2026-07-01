import React, { useState } from 'react';
import { Outlet, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Menu, X, ShieldAlert } from 'lucide-react';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Global Stats', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Platform Vendors', path: '/admin/vendors', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-black flex overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 
        bg-red-950/20 border-r border-red-900/50
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="h-16 flex items-center px-6 border-b border-red-900/50">
          <ShieldAlert className="w-8 h-8 text-red-500 mr-2" />
          <span className="text-white text-xl font-bold tracking-tight">Super Admin</span>
          <button 
            className="ml-auto md:hidden text-neutral-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-red-500/20 text-red-400 font-medium border border-red-500/30' 
                    : 'text-neutral-400 hover:bg-red-950/30 hover:text-red-300'
                  }
                `}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-red-400' : 'text-neutral-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-red-900/50">
          <Link to="/admin/profile" onClick={() => setSidebarOpen(false)} className="block px-4 py-3 mb-2 rounded-lg bg-red-950/30 border border-red-900/50 hover:bg-red-900/50 transition-colors group cursor-pointer">
            <div className="text-sm font-medium text-white truncate group-hover:text-red-100">{user.firstName} {user.lastName}</div>
            <div className="text-xs text-red-400 truncate uppercase mt-1 tracking-wider">{user.role.replace('_', ' ')}</div>
          </Link>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 text-sm text-neutral-400 hover:text-white hover:hover:bg-neutral-900 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-neutral-950 transition-colors">
        <header className="h-16 flex items-center justify-between px-4 md:px-8 bg-neutral-950/50 backdrop-blur-sm border-b border-neutral-900 sticky top-0 z-30 transition-colors">
          <button 
            className="md:hidden p-2 text-neutral-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4 ml-auto">
             <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                <ShieldAlert className="w-4 h-4 text-red-400" />
             </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
