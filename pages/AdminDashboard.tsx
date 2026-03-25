
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  Store, 
  ShoppingBag, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Search,
  Filter,
  MoreVertical,
  LogOut,
  CheckCircle2
} from 'lucide-react';
import { fetchOrders, fetchRestaurants, clearStoredUser, fetchAllUsers, verifyUser } from '../services/api';
import { Order, Restaurant, User } from '../types';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'restaurants' | 'orders' | 'users' | 'verification'>('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [o, r, u] = await Promise.all([fetchOrders(), fetchRestaurants(undefined, true), fetchAllUsers()]);
        setOrders(o);
        setRestaurants(r);
        setUsers(u);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleVerify = async (userId: number) => {
    try {
      await verifyUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: true } : u));
      showToast('User verified successfully', 'success');
    } catch (err) {
      showToast('Failed to verify user', 'error');
    }
  };

  const handleLogout = () => {
    clearStoredUser();
    logout();
    navigate('/login');
  };

  const stats = [
    { label: 'Total Revenue', value: `₹${orders.reduce((acc, o) => acc + o.totalAmount, 0).toLocaleString()}`, icon: BarChart3, trend: '+12.5%', trendUp: true, color: 'bg-blue-500' },
    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, trend: '+8.2%', trendUp: true, color: 'bg-orange-500' },
    { label: 'Active Restaurants', value: restaurants.length, icon: Store, trend: '+3.1%', trendUp: true, color: 'bg-green-500' },
    { label: 'Total Customers', value: '1,284', icon: Users, trend: '-1.4%', trendUp: false, color: 'bg-purple-500' },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark text-white hidden lg:flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-black text-white">F</div>
            <span className="text-xl font-black tracking-tighter">FOODWAGON <span className="text-[10px] text-primary block -mt-1">ADMIN</span></span>
          </div>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <BarChart3 className="w-5 h-5" />
            <span>Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab('restaurants')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'restaurants' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Store className="w-5 h-5" />
            <span>Restaurants</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'orders' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Orders</span>
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'users' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <Users className="w-5 h-5" />
            <span>Users</span>
          </button>
          <button 
            onClick={() => setActiveTab('verification')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${activeTab === 'verification' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>Verification</span>
            {users.filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY')).length > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                {users.filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY')).length}
              </span>
            )}
          </button>
        </nav>

        <div className="p-4 border-t border-gray-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-y-auto pb-24 md:pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Global Overview</h1>
            <p className="text-sm text-gray-400 font-medium">Welcome back, Admin. Here's what's happening today.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="bg-white border border-gray-200 rounded-xl py-2.5 px-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 transition-all">
              <Filter className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-12">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-bold ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-2xl font-black text-dark">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-black text-dark tracking-tight">Recent Global Orders</h2>
                <button className="text-primary font-bold text-sm hover:underline">View All</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Restaurant</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders.slice(0, 8).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-dark text-sm">#{order.id.toString().slice(-6)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-dark text-sm">{order.customerName}</span>
                            <span className="text-[10px] text-gray-400 font-medium">New Customer</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-dark text-sm">{order.restaurantName}</td>
                        <td className="px-6 py-4 font-black text-dark text-sm">₹{order.totalAmount}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                            order.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-400">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4">
                          <button className="p-2 hover:bg-gray-100 rounded-lg transition-all">
                            <MoreVertical className="w-4 h-4 text-gray-400" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'verification' && (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-black text-dark tracking-tight">Pending Verifications</h2>
              <p className="text-sm text-gray-400 font-medium">Review and verify new partners and delivery boys.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Email / Phone</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY')).map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 uppercase">
                            {user.name.charAt(0)}
                          </div>
                          <span className="font-bold text-dark text-sm">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.role === 'PARTNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-dark font-medium">{user.email}</span>
                          <span className="text-xs text-gray-400">{user.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-black uppercase tracking-wider">
                          Pending
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => handleVerify(user.id)}
                          className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-primary/20"
                        >
                          Verify
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY')).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-gray-400 font-medium">
                        No pending verifications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-2 md:hidden flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'overview' ? 'text-primary' : 'text-gray-400'}`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Overview</span>
        </button>
        <button 
          onClick={() => setActiveTab('restaurants')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'restaurants' ? 'text-primary' : 'text-gray-400'}`}
        >
          <Store className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Stores</span>
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 p-2 ${activeTab === 'orders' ? 'text-primary' : 'text-gray-400'}`}
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Orders</span>
        </button>
        <button 
          onClick={() => setActiveTab('verification')}
          className={`flex flex-col items-center gap-1 p-2 relative ${activeTab === 'verification' ? 'text-primary' : 'text-gray-400'}`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Verify</span>
          {users.filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY')).length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-[8px] w-3 h-3 flex items-center justify-center rounded-full">
              {users.filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY')).length}
            </span>
          )}
        </button>
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 p-2 text-red-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[8px] font-black uppercase tracking-widest">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
