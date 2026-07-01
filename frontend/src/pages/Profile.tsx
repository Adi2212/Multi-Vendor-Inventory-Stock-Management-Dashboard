import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User as UserIcon, Mail, Building2, Shield, CalendarDays } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  const roleColor = user.role === 'SUPER_ADMIN' ? 'text-red-400 bg-red-400/10 border-red-400/20' : 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  const roleName = user.role.replace('_', ' ');

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <UserIcon className="w-8 h-8 text-neutral-400" />
          My Profile
        </h1>
        <p className="text-neutral-400 mt-1">Manage your account settings and preferences</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow-xl">
        {/* Header Cover */}
        <div className="h-32 bg-gradient-to-r from-neutral-800 to-neutral-900 relative">
          <div className="absolute -bottom-12 left-8">
            <div className="w-24 h-24 rounded-2xl bg-neutral-800 border-4 border-neutral-900 flex items-center justify-center text-4xl font-bold text-white uppercase shadow-lg">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
          </div>
        </div>

        <div className="pt-16 pb-8 px-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">{user.firstName} {user.lastName}</h2>
              <p className="text-neutral-400">{user.email}</p>
            </div>
            <div className={`px-3 py-1 rounded-full border text-sm font-semibold tracking-wide uppercase ${roleColor}`}>
              {roleName}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Email Address</p>
                <p className="text-neutral-200 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                <Shield className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Access Role</p>
                <p className="text-neutral-200 font-medium capitalize">{roleName.toLowerCase()}</p>
              </div>
            </div>
            
            {user.role !== 'SUPER_ADMIN' && (
              <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-neutral-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400 mb-1">Company / Vendor ID</p>
                  <p className="text-neutral-200 font-medium">#{user.vendorId}</p>
                </div>
              </div>
            )}

            <div className="p-4 rounded-xl bg-neutral-950/50 border border-neutral-800/50 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center shrink-0">
                <CalendarDays className="w-5 h-5 text-neutral-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-neutral-400 mb-1">Account Status</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-neutral-200 font-medium">Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
