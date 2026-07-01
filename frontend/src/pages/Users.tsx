import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getUsers, createUser, updateUser, deleteUser } from '../services/inventory.service';
import { Plus, Search, Trash2, Edit, Users as UsersIcon, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Users: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: getUsers
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm();

  const addMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAdding(false);
      reset();
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number, data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingId(null);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  const onSubmit = (data: any) => {
    if (editingId) {
      // Don't send empty password on update
      const payload = { ...data };
      if (!payload.password) delete payload.password;
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      addMutation.mutate(data);
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setIsAdding(false);
    reset({ firstName: u.firstName, lastName: u.lastName, email: u.email, role: u.role, status: u.status, password: '' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    reset({ firstName: '', lastName: '', email: '', role: 'STAFF', status: 'ACTIVE', password: '' });
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <UsersIcon className="w-8 h-8 text-emerald-500" />
            Users
          </h1>
          <p className="text-neutral-400 mt-1">Manage staff and managers for your company</p>
        </div>
        
        <button 
          onClick={() => {
            if (isAdding || editingId) {
              handleCancel();
            } else {
              setIsAdding(true);
            }
          }}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors"
        >
          {isAdding || editingId ? 'Cancel' : <><Plus className="w-5 h-5" /> Add User</>}
        </button>
      </div>

      {(isAdding || editingId) && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">
            {editingId ? 'Edit User' : 'Add New User'}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">First Name *</label>
                <input {...register('firstName', { required: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Last Name *</label>
                <input {...register('lastName', { required: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Email *</label>
                <input type="email" {...register('email', { required: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">
                 Password {editingId && <span className="text-neutral-400 text-xs">(Leave blank to keep current)</span>}
                </label>
                <input type="password" {...register('password', { required: !editingId })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Role *</label>
                <select {...register('role', { required: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  {currentUser?.role === 'VENDOR_ADMIN' && <option value="VENDOR_ADMIN">Vendor Admin</option>}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Status *</label>
                <select {...register('status', { required: true })} className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button disabled={isSubmitting} type="submit" className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingId ? 'Update User' : 'Save User')}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search users..." 
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950/50 text-neutral-300 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">No users found. Add one above!</td></tr>
              ) : (
                users.map((u: any) => (
                  <tr key={u.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{u.firstName} {u.lastName}</div>
                    </td>
                    <td className="px-6 py-4">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded text-xs tracking-wide">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium tracking-wide ${u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleEdit(u)} className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        {currentUser?.id !== u.id && (
                          <button 
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this user?')) {
                                deleteMutation.mutate(u.id);
                              }
                            }}
                            className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
