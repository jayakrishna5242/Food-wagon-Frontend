
import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Settings, 
  LogOut, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle2, 
  Clock, 
  XCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const PartnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();
  const { showToast } = useToast();

  const stats = [
    { label: 'Total Sales', value: '₹45,230', icon: DollarSign, color: 'bg-green-500/10 text-green-500' },
    { label: 'Active Orders', value: '12', icon: ShoppingBag, color: 'bg-blue-500/10 text-blue-500' },
    { label: 'Total Customers', value: '1,240', icon: Users, color: 'bg-purple-500/10 text-purple-500' },
    { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'bg-orange-500/10 text-orange-500' },
  ];

  const orders = [
    { id: '#ORD-7821', customer: 'Rahul Sharma', items: '2x Paneer Tikka, 1x Butter Naan', total: '₹450', status: 'Preparing', time: '12 mins ago' },
    { id: '#ORD-7820', customer: 'Priya Patel', items: '1x Veg Thali, 1x Coke', total: '₹280', status: 'Ready', time: '18 mins ago' },
    { id: '#ORD-7819', customer: 'Amit Kumar', items: '3x Masala Dosa', total: '₹360', status: 'Delivered', time: '45 mins ago' },
    { id: '#ORD-7818', customer: 'Sneha Gupta', items: '1x Chole Bhature', total: '₹150', status: 'Cancelled', time: '1 hour ago' },
  ];

  const handleLogout = () => {
    showToast('Logged out successfully', 'info');
    navigate('/partner');
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#171a29] text-white hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#fc8019] rounded-xl flex items-center justify-center font-black text-xl">F</div>
            <span className="text-xl font-black tracking-tight">FoodWagon <span className="text-[#fc8019] text-xs uppercase tracking-widest block font-black">Partner</span></span>
          </div>
        </div>

        <nav className="flex-1 p-6 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'dashboard' ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <ShoppingBag size={20} />
            <span>Orders</span>
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'menu' ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Plus size={20} />
            <span>Menu Items</span>
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Settings size={20} />
            <span>Settings</span>
          </button>
        </nav>

        <div className="p-6 border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
           <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, Royal Spice!</h1>
              <p className="text-gray-500 font-medium mt-1">Here's what's happening with your restaurant today.</p>
           </div>
           <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search orders..." 
                  className="bg-white border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all w-64"
                />
              </div>
              <button className="bg-white border border-gray-200 p-3 rounded-2xl hover:bg-gray-50 transition-colors">
                <Filter size={20} className="text-gray-600" />
              </button>
           </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-2xl ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={20} />
                </button>
              </div>
              <div className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="text-2xl font-black text-gray-900">{stat.value}</div>
            </motion.div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b border-gray-50 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">Recent Orders</h2>
            <button className="text-primary font-black text-sm hover:underline">View All Orders</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Items</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Total</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Time</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {orders.map((order, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6 font-black text-gray-900">{order.id}</td>
                    <td className="px-8 py-6 font-bold text-gray-700">{order.customer}</td>
                    <td className="px-8 py-6 text-sm text-gray-500 font-medium max-w-xs truncate">{order.items}</td>
                    <td className="px-8 py-6 font-black text-gray-900">{order.total}</td>
                    <td className="px-8 py-6">
                      <span className={`
                        px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider
                        ${order.status === 'Preparing' ? 'bg-blue-100 text-blue-600' : ''}
                        ${order.status === 'Ready' ? 'bg-orange-100 text-orange-600' : ''}
                        ${order.status === 'Delivered' ? 'bg-green-100 text-green-600' : ''}
                        ${order.status === 'Cancelled' ? 'bg-red-100 text-red-600' : ''}
                      `}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-sm text-gray-400 font-bold">{order.time}</td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-2">
                          <button className="p-2 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-colors" title="Accept">
                             <CheckCircle2 size={18} />
                          </button>
                          <button className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors" title="Reject">
                             <XCircle size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PartnerDashboard;
