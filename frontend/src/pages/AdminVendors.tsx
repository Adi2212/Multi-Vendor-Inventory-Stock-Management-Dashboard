import React from 'react';
import { ShieldAlert } from 'lucide-react';

const AdminVendors: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ShieldAlert className="w-8 h-8 text-red-500" />
          Platform Vendors
        </h1>
        <p className="text-neutral-400 mt-1">Manage all registered SaaS tenants.</p>
      </div>
      
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center">
        <p className="text-neutral-400">Vendor Management features coming soon.</p>
      </div>
    </div>
  );
};

export default AdminVendors;
