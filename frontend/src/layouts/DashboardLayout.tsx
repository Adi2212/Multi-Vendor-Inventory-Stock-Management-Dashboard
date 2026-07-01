import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Package2, Users, LayoutDashboard, Truck, Contact, Menu, X, User as UserIcon } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Purchases', path: '/purchases', icon: Truck }, 
    { name: 'Sales', path: '/sales', icon: Package2 },         
    { name: 'Products', path: '/products', icon: Package2 },
    { name: 'Categories', path: '/categories', icon: Package2 },
    { name: 'Suppliers', path: '/suppliers', icon: Truck },
    { name: 'Customers', path: '/customers', icon: Contact },
    { name: 'Users', path: '/users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col md:flex-row transition-colors duration-300">
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-neutral-800 bg-neutral-900 sticky top-0 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Package2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold">Invo.</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="p-2 text-neutral-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-colors`}>
        <div className="p-6 hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Package2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Invo.</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-2 md:mt-4 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-500' 
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-neutral-800">
          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 mb-4 px-2 hover:bg-neutral-800/50 p-2 rounded-lg cursor-pointer transition-colors group">
            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-emerald-500 font-bold uppercase group-hover:bg-neutral-700 transition-colors">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-neutral-400 truncate">{user?.role}</p>
            </div>
            <UserIcon className="w-4 h-4 text-neutral-400 hover:text-white" />
          </Link>
          <button 
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-400/20 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto bg-neutral-950 md:min-w-0">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
