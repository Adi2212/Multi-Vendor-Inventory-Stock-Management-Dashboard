import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { getPurchases, createPurchase, getSuppliers, getProducts, updatePurchaseStatus } from '../services/inventory.service';
import { Plus, Search, Truck, Loader2, Trash2 } from 'lucide-react';

const Purchases: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);
  
  const { data: purchases = [], isLoading } = useQuery({ queryKey: ['purchases'], queryFn: getPurchases });
  const { data: suppliers = [] } = useQuery({ queryKey: ['suppliers'], queryFn: getSuppliers });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const { register, control, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      supplierId: '',
      items: [{ productId: '', quantity: 1, unitCost: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const addMutation = useMutation({
    mutationFn: createPurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock increases
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setIsAdding(false);
      reset();
    }
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number, status: string }) => updatePurchaseStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      setUpdatingStatusId(null);
    }
  });

  const onSubmit = (data: any) => {
    const payload = {
      supplier: data.supplierId ? { id: parseInt(data.supplierId) } : null,
      items: data.items.map((item: any) => ({
        product: { id: parseInt(item.productId) },
        quantity: parseInt(item.quantity),
        unitCost: parseFloat(item.unitCost)
      }))
    };
    addMutation.mutate(payload);
  };

  const watchItems = watch('items');
  const totalAmount = watchItems.reduce((acc, curr) => acc + (Number(curr.unitCost || 0) * Number(curr.quantity || 0)), 0);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'PENDING': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'CANCELLED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
    }
  };

  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Truck className="w-8 h-8 text-blue-500" />
            Purchases (Restock)
          </h1>
          <p className="text-neutral-400 mt-1">Manage incoming stock and supplier orders.</p>
        </div>
        
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-5 h-5" /> New Purchase</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-xl p-6 mb-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-4">Create Purchase Order</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Supplier (Optional)</label>
              <select {...register('supplierId')} className="w-full md:w-1/3 bg-neutral-950/50 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors">
                <option value="">No Supplier Selected</option>
                {suppliers.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            <div className="border-t border-neutral-800 pt-4">
              <h3 className="text-lg font-medium text-white mb-4">Line Items</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4 bg-neutral-950/50 p-4 rounded-lg border border-neutral-800">
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Product</label>
                    <select {...register(`items.${index}.productId` as const, { required: true })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors">
                      <option value="">Select Product...</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (In stock: {p.quantity})</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Quantity</label>
                    <input type="number" min="1" {...register(`items.${index}.quantity` as const, { required: true })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Unit Cost ($)</label>
                    <input type="number" step="0.01" {...register(`items.${index}.unitCost` as const, { required: true })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500 transition-colors" />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => remove(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" disabled={fields.length === 1}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" onClick={() => append({ productId: '', quantity: 1, unitCost: 0 })} className="mt-2 text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 transition-colors">
                <Plus className="w-4 h-4" /> Add Another Item
              </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center border-t border-neutral-800 pt-6">
              <div className="text-2xl font-bold text-white mb-4 md:mb-0">
                Total: <span className="text-blue-500">${totalAmount.toFixed(2)}</span>
              </div>
              <button disabled={isSubmitting || fields.length === 0} type="submit" className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Purchase (Restock)'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Purchases */}
      <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search orders..." className="w-full bg-neutral-950/50 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950/50 text-neutral-300 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Supplier</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Total Amount</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading purchases...</td></tr>
              ) : purchases.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">No purchases found.</td></tr>
              ) : (
                purchases.map((purchase: any) => (
                  <tr key={purchase.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">PO-{purchase.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4">{new Date(purchase.orderDate).toLocaleString()}</td>
                    <td className="px-6 py-4">{purchase.supplier?.name || 'N/A'}</td>
                    <td className="px-6 py-4">
                      {updatingStatusId === purchase.id ? (
                        <select 
                          className="bg-neutral-950 border border-neutral-700 text-white text-xs rounded px-2 py-1 focus:outline-none"
                          defaultValue={purchase.status || 'COMPLETED'}
                          onChange={(e) => statusMutation.mutate({ id: purchase.id, status: e.target.value })}
                          onBlur={() => setUpdatingStatusId(null)}
                          autoFocus
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      ) : (
                        <span 
                          onClick={() => setUpdatingStatusId(purchase.id)}
                          className={`px-2 py-1 rounded-md text-[10px] font-bold tracking-wider cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(purchase.status || 'COMPLETED')}`}
                          title="Click to edit status"
                        >
                          {purchase.status || 'COMPLETED'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">${purchase.totalAmount.toFixed(2)}</td>
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

export default Purchases;
