import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, useFieldArray } from 'react-hook-form';
import { getSales, createSale, getCustomers, getProducts } from '../services/inventory.service';
import { Plus, Search, Loader2, Trash2, ShoppingCart, FileText } from 'lucide-react';
import { downloadInvoice } from '../services/inventory.service';

const Sales: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const { data: sales = [], isLoading } = useQuery({ queryKey: ['sales'], queryFn: getSales });
  const { data: customers = [] } = useQuery({ queryKey: ['customers'], queryFn: getCustomers });
  const { data: products = [] } = useQuery({ queryKey: ['products'], queryFn: getProducts });

  const { register, control, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm({
    defaultValues: {
      customerId: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const addMutation = useMutation({
    mutationFn: createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] }); // Stock decreases
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
      setIsAdding(false);
      setErrorMsg('');
      reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to process sale. Check stock levels.');
    }
  });

  const onSubmit = (data: any) => {
    setErrorMsg('');
    const payload = {
      customer: data.customerId ? { id: parseInt(data.customerId) } : null,
      items: data.items.map((item: any) => ({
        product: { id: parseInt(item.productId) },
        quantity: parseInt(item.quantity),
        unitPrice: parseFloat(item.unitPrice)
      }))
    };
    addMutation.mutate(payload);
  };

  const watchItems = watch('items');
  const totalAmount = watchItems.reduce((acc, curr) => acc + (Number(curr.unitPrice || 0) * Number(curr.quantity || 0)), 0);



  return (
    <div className="p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShoppingCart className="w-8 h-8 text-indigo-500" />
            Sales (POS)
          </h1>
          <p className="text-neutral-400 mt-1">Record new sales and generate invoices.</p>
        </div>
        
        <button 
          onClick={() => { setIsAdding(!isAdding); setErrorMsg(''); }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors"
        >
          {isAdding ? 'Cancel' : <><Plus className="w-5 h-5" /> New Sale</>}
        </button>
      </div>

      {isAdding && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-4">New Sale / Invoice</h2>
          
          {errorMsg && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 font-medium">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Customer (Optional)</label>
              <select {...register('customerId')} className="w-full md:w-1/3 bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                <option value="">Walk-in Customer</option>
                {customers.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div className="border-t border-neutral-800 pt-4">
              <h3 className="text-lg font-medium text-white mb-4">Cart Items</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end mb-4 bg-neutral-950 p-4 rounded-lg border border-neutral-800">
                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Product</label>
                    <select {...register(`items.${index}.productId` as const, { required: true })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500">
                      <option value="">Select Product...</option>
                      {products.map((p: any) => <option key={p.id} value={p.id}>{p.name} (In stock: {p.quantity}) - ${p.price}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Quantity</label>
                    <input type="number" min="1" {...register(`items.${index}.quantity` as const, { required: true })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-neutral-400 mb-1">Selling Price ($)</label>
                    <input type="number" step="0.01" {...register(`items.${index}.unitPrice` as const, { required: true })} className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
                  </div>
                  <div className="md:col-span-1 flex justify-end">
                    <button type="button" onClick={() => remove(index)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" disabled={fields.length === 1}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}

              <button type="button" onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })} className="mt-2 text-sm text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                <Plus className="w-4 h-4" /> Add Another Item
              </button>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center border-t border-neutral-800 pt-6">
              <div className="text-2xl font-bold text-white mb-4 md:mb-0">
                Total: <span className="text-indigo-500">${totalAmount.toFixed(2)}</span>
              </div>
              <button disabled={isSubmitting || fields.length === 0} type="submit" className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-colors disabled:opacity-50">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Complete Sale'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Sales */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search sales..." className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-400">
            <thead className="bg-neutral-950/50 text-neutral-300 border-b border-neutral-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Total Amount</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center">Loading sales...</td></tr>
              ) : sales.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-400">No sales recorded yet.</td></tr>
              ) : (
                sales.map((sale: any) => (
                  <tr key={sale.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">INV-{sale.id.toString().padStart(4, '0')}</td>
                    <td className="px-6 py-4">{new Date(sale.saleDate).toLocaleString()}</td>
                    <td className="px-6 py-4">{sale.customer?.name || 'Walk-in'}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded-md text-xs font-bold">
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-400 text-right">+${sale.totalAmount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => downloadInvoice(sale.id)}
                        className="p-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-lg transition-colors inline-flex items-center gap-1"
                        title="Download Invoice"
                      >
                        <FileText className="w-4 h-4" />
                        <span className="sr-only">Download</span>
                      </button>
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

export default Sales;
