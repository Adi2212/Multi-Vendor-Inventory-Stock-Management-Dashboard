import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getDashboardStats, getProducts } from '../services/inventory.service';
import { Package2, AlertTriangle, Users, DollarSign, Loader2, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../services/api';

const fetchChartData = async () => {
  const res = await api.get('/dashboard/chart-data');
  return res.data.data;
};

const Dashboard: React.FC = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
    refetchInterval: 5000 // refresh every 5 seconds
  });

  const { data: chartData } = useQuery({
    queryKey: ['chartData'],
    queryFn: fetchChartData,
    refetchInterval: 10000 // refresh every 10 seconds
  });

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const lowStockProducts = products.filter((p: any) => p.quantity <= p.reorderLevel);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">Dashboard</h1>
        <p className="text-neutral-400 mt-1">Welcome back. Here is what's happening with your inventory today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Products */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl hover:border-blue-500/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium text-blue-400 transition-colors">Total Products</h3>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <Package2 className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">{stats?.totalProducts || 0}</div>
        </div>

        {/* Total Stock Value */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl hover:border-emerald-500/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium text-emerald-400 transition-colors">Total Stock Value</h3>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-6 h-6 text-emerald-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">
            ${stats?.totalStockValue ? stats.totalStockValue.toFixed(2) : '0.00'}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl hover:border-orange-500/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium text-orange-400 transition-colors">Low Stock Alerts</h3>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">{stats?.lowStockItems || 0}</div>
        </div>

        {/* Active Staff */}
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl hover:border-purple-500/30 transition-colors group">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-neutral-400 font-medium text-purple-400 transition-colors">Active Staff</h3>
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <div className="text-4xl font-bold text-white tracking-tight">{stats?.activeUsers || 0}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Revenue Overview (Last 7 Days)</h3>
          <div className="h-[350px] w-full">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} />
                  <YAxis stroke="#525252" tick={{fill: '#a3a3a3', fontSize: 12}} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                    labelStyle={{ color: '#a3a3a3' }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-neutral-400">
                Loading chart data...
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-2xl p-6 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Items to Restock
            </h3>
            <Link to="/products" className="text-sm text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 group">
              View All <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 py-12">
                <Package2 className="w-12 h-12 mb-3 opacity-20" />
                <p>All stock levels are optimal.</p>
              </div>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p.id} className="p-4 rounded-xl bg-neutral-950/50 border border-orange-500/20 flex items-center justify-between hover:bg-neutral-800/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-white">{p.name}</h4>
                    <p className="text-xs text-neutral-400 mt-1">SKU: {p.sku}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-orange-400">{p.quantity} left</div>
                    <div className="text-xs text-neutral-400">Reorder at {p.reorderLevel}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
