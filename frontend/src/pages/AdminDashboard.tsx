import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldAlert, Users, Store, Loader2 } from 'lucide-react';

// Using a custom fetch directly for Admin API to bypass the standard inventory endpoints
const fetchAdminStats = async () => {
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:8080/api/admin/stats', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to fetch stats');
  const json = await res.json();
  return json.data;
};

const AdminDashboard: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['adminStats'],
    queryFn: fetchAdminStats
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Platform Overview
        </h1>
        <p className="text-neutral-400 mt-1">Super Admin global statistics and monitoring.</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-red-400">
          Failed to load admin statistics. Make sure you have SUPER_ADMIN privileges.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-400 font-medium">Total Vendors</h3>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.totalVendors || 0}</div>
            <p className="text-sm text-neutral-400 mt-2">Registered businesses</p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-neutral-400 font-medium">Total Users</h3>
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-red-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white">{stats?.totalUsers || 0}</div>
            <p className="text-sm text-neutral-400 mt-2">Accounts across platform</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
