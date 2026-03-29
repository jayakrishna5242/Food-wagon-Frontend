
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
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
  Star,
  CheckCircle2,
  Eye,
  X,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Phone,
  Mail,
  FileText,
  Truck
} from 'lucide-react';
import { fetchOrders, fetchRestaurants, clearStoredUser, fetchAllUsers, verifyUser, verifyRestaurant } from '../../services/api';
import { Order, Restaurant, User } from '../../types';
import { motion, AnimatePresence } from 'motion/react';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => setSearchParams({ tab });
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
      
      // If user was a partner, update the restaurant in state too
      const user = users.find(u => u.id === userId);
      if (user?.restaurantId) {
        setRestaurants(prev => prev.map(r => r.id === user.restaurantId ? { ...r, isVerified: true } : r));
      }
      
      showToast('User verified successfully', 'success');
    } catch (err) {
      showToast('Failed to verify user', 'error');
    }
  };

  const handleVerifyRestaurant = async (restaurantId: number) => {
    try {
      await verifyRestaurant(restaurantId);
      setRestaurants(prev => prev.map(r => r.id === restaurantId ? { ...r, isVerified: true } : r));
      
      // Update the partner user in state too
      setUsers(prev => prev.map(u => u.restaurantId === restaurantId ? { ...u, isVerified: true } : u));
      
      showToast('Restaurant verified successfully', 'success');
    } catch (err) {
      showToast('Failed to verify restaurant', 'error');
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
    { label: 'Total Customers', value: users.filter(u => u.role === 'CUSTOMER').length.toLocaleString(), icon: Users, trend: '-1.4%', trendUp: false, color: 'bg-purple-500' },
  ];

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Loading Admin Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <motion.aside 
        initial={{ width: 80 }}
        whileHover={{ width: 260 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-dark text-white hidden lg:flex flex-col sticky top-0 h-screen z-50 overflow-hidden group/sidebar"
      >
        <div className="p-6 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex-shrink-0 flex items-center justify-center font-black text-white">F</div>
            <div className="text-xl font-black tracking-tighter whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-all duration-300 transform translate-x-[-10px] group-hover/sidebar:translate-x-0 overflow-hidden">
              FOODWAGON <span className="text-[10px] text-primary block -mt-1">ADMIN</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-grow p-4 space-y-2 overflow-y-auto no-scrollbar">
          {[
            { id: 'overview', icon: BarChart3, label: 'Overview' },
            { id: 'restaurants', icon: Store, label: 'Restaurants' },
            { id: 'orders', icon: ShoppingBag, label: 'Orders' },
            { id: 'users', icon: Users, label: 'Users' },
            { id: 'activities', icon: TrendingUp, label: 'Recent Activities' },
            { id: 'verification', icon: CheckCircle2, label: 'Verification', badge: users.filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY')).length }
          ].map((item) => (
            <button 
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all relative group ${activeTab === item.id ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity overflow-hidden">
                {item.label}
              </span>
              {item.badge > 0 && (
                <span className={`absolute right-4 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full transition-opacity ${activeTab === item.id ? 'opacity-100' : 'opacity-0 group-hover/sidebar:opacity-100'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-bold transition-all group"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="whitespace-nowrap opacity-0 group-hover/sidebar:opacity-100 transition-opacity overflow-hidden">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 lg:p-12 overflow-y-auto pb-24 lg:pb-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 md:mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-dark tracking-tight">Global Overview</h1>
              <p className="text-sm text-gray-400 font-medium">Welcome back, Admin. Here's what's happening today.</p>
            </div>
            <button 
              onClick={handleLogout}
              className="lg:hidden p-3 bg-red-50 text-red-500 rounded-2xl"
            >
              <LogOut size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search anything..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 md:space-y-8"
          >
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-3 md:mb-4">
                    <div className={`${stat.color} p-2 md:p-3 rounded-xl md:rounded-2xl text-white shadow-lg shadow-current/20 group-hover:scale-110 transition-transform`}>
                      <stat.icon className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-[10px] md:text-xs font-bold ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <p className="text-[10px] md:text-sm text-gray-400 font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                  <h3 className="text-lg md:text-2xl font-black text-dark">{stat.value}</h3>
                </div>
              ))}
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="text-xl font-black text-dark tracking-tight">Recent Global Orders</h2>
                <button 
                  onClick={() => setActiveTab('orders')}
                  className="text-primary font-bold text-sm hover:underline"
                >
                  View All
                </button>
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {orders
                      .filter(o => 
                        o.id.toString().includes(searchQuery) || 
                        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        o.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                      .slice(0, 8).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors group">
                        <td className="px-6 py-4 font-bold text-dark text-sm">#{order.id.toString().slice(-6)}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-dark text-sm">{order.customerName}</span>
                            <span className="text-[10px] text-gray-400 font-medium">Customer</span>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'restaurants' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-black text-dark tracking-tight">All Restaurants</h2>
              <p className="text-sm text-gray-400 font-medium">Manage and monitor all registered restaurants.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                    <th className="px-6 py-4">Restaurant</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Rating</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {restaurants
                    .filter(r => 
                      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      r.city.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((res) => (
                    <tr key={res.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={res.imageUrl} alt={res.name} className="w-10 h-10 rounded-xl object-cover" />
                          <div className="flex flex-col">
                            <span className="font-bold text-dark text-sm">{res.name}</span>
                            <span className="text-[10px] text-gray-400 font-medium">{res.cuisines.join(', ')}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                          <MapPin className="w-3 h-3" />
                          <span>{res.location}, {res.city}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1 text-xs font-black text-yellow-600">
                          <Star className="w-3 h-3 fill-yellow-600" />
                          <span>{res.rating || '--'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          res.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {res.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedRestaurant(res)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4 text-gray-400" />
                          </button>
                          {!res.isVerified && (
                            <button 
                              onClick={() => handleVerifyRestaurant(res.id)}
                              className="p-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-all"
                              title="Verify Restaurant"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'orders' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-black text-dark tracking-tight">Global Order History</h2>
              <p className="text-sm text-gray-400 font-medium">Complete list of all orders placed on the platform.</p>
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
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders
                    .filter(o => 
                      o.id.toString().includes(searchQuery) || 
                      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      o.restaurantName.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-dark text-sm">#{order.id.toString().slice(-6)}</td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-dark text-sm">{order.customerName}</span>
                          <span className="text-[10px] text-gray-400 font-medium">{order.customerPhone}</span>
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
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-black text-dark tracking-tight">User Management</h2>
              <p className="text-sm text-gray-400 font-medium">View and manage all registered users.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-[10px] uppercase tracking-widest font-black text-gray-400">
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users
                    .filter(u => 
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.phone.includes(searchQuery)
                    )
                    .map((user) => (
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
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          user.role === 'PARTNER' ? 'bg-purple-100 text-purple-700' :
                          user.role === 'DELIVERY' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
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
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => setSelectedUser(user)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                        >
                          <Eye className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'activities' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-50">
              <h2 className="text-xl font-black text-dark tracking-tight">Recent Activities</h2>
              <p className="text-sm text-gray-400 font-medium">Latest actions across the platform.</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {orders.slice(0, 15).map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-dark">Order #{order.id.toString().slice(-6)} placed by {order.customerName}</p>
                      <p className="text-xs text-gray-400 font-medium">{new Date(order.date).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'verification' && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
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
                  {users
                    .filter(u => !u.isVerified && (u.role === 'PARTNER' || u.role === 'DELIVERY'))
                    .filter(u => 
                      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      u.email.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((user) => (
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
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => setSelectedUser(user)}
                            className="p-2 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all border border-gray-100"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleVerify(user.id)}
                            className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-lg shadow-primary/20"
                          >
                            Verify
                          </button>
                        </div>
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
          </motion.div>
        )}
      </main>

      {/* User Detail Modal */}
      <AnimatePresence>
        {selectedUser && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedUser(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl font-black text-gray-400 uppercase">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-dark tracking-tight">{selectedUser.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        selectedUser.role === 'PARTNER' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {selectedUser.role}
                      </span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedUser(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Mail className="w-3 h-3" /> Email Address
                      </p>
                      <p className="text-sm font-bold text-dark">{selectedUser.email}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> Phone Number
                      </p>
                      <p className="text-sm font-bold text-dark">{selectedUser.phone}</p>
                    </div>
                  </div>

                  {selectedUser.role === 'DELIVERY' && (
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs font-black text-dark uppercase tracking-widest flex items-center gap-2">
                        <Truck className="w-4 h-4 text-primary" /> Vehicle Information
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Vehicle Type</p>
                          <p className="text-sm font-bold text-dark">{selectedUser.vehicleType || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Vehicle Number</p>
                          <p className="text-sm font-bold text-dark">{selectedUser.vehicleNumber || 'Not provided'}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Driving License</p>
                          <p className="text-sm font-bold text-dark">{selectedUser.drivingLicense || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedUser.role === 'PARTNER' && (
                    <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <h4 className="text-xs font-black text-dark uppercase tracking-widest flex items-center gap-2">
                        <Store className="w-4 h-4 text-primary" /> Restaurant Information
                      </h4>
                      <div>
                        <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest">Restaurant ID</p>
                        <p className="text-sm font-bold text-dark">#{selectedUser.restaurantId}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex gap-3">
                    {!selectedUser.isVerified && (
                      <button 
                        onClick={() => {
                          handleVerify(selectedUser.id);
                          setSelectedUser(null);
                        }}
                        className="flex-grow bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <ShieldCheck className="w-5 h-5" />
                        Approve & Verify
                      </button>
                    )}
                    <button 
                      onClick={() => setSelectedUser(null)}
                      className="flex-grow bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                    >
                      Close Details
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOrder(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-dark tracking-tight">Order Details</h3>
                    <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">#{selectedOrder.id.toString().slice(-8)}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-all"
                  >
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Customer</p>
                      <p className="font-bold text-dark">{selectedOrder.customerName}</p>
                      <p className="text-xs text-gray-500">{selectedOrder.customerPhone}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Restaurant</p>
                      <p className="font-bold text-dark">{selectedOrder.restaurantName}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Delivery Address</p>
                    <p className="text-sm font-bold text-dark leading-relaxed">{selectedOrder.deliveryAddress}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
                      selectedOrder.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-2xl overflow-hidden mb-8">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50">
                      <tr className="text-[10px] uppercase tracking-widest font-black text-gray-400">
                        <th className="px-6 py-4">Item</th>
                        <th className="px-6 py-4 text-center">Qty</th>
                        <th className="px-6 py-4 text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {selectedOrder.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="px-6 py-4 font-bold text-dark text-sm">{item.name}</td>
                          <td className="px-6 py-4 text-center font-bold text-dark text-sm">{item.quantity}</td>
                          <td className="px-6 py-4 text-right font-black text-dark text-sm">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={2} className="px-6 py-4 text-right font-black text-dark uppercase text-xs">Total Amount</td>
                        <td className="px-6 py-4 text-right font-black text-primary text-lg">₹{selectedOrder.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="w-full bg-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Restaurant Detail Modal */}
      <AnimatePresence>
        {selectedRestaurant && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRestaurant(null)}
              className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="relative h-48">
                <img src={selectedRestaurant.imageUrl} alt={selectedRestaurant.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
                <button 
                  onClick={() => setSelectedRestaurant(null)}
                  className="absolute top-4 right-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
                <div className="absolute bottom-6 left-8">
                  <h3 className="text-3xl font-black text-white tracking-tight">{selectedRestaurant.name}</h3>
                  <div className="flex items-center gap-2 text-white/80 text-sm font-bold">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedRestaurant.location}, {selectedRestaurant.city}</span>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Rating</p>
                    <div className="flex items-center justify-center gap-1 font-black text-yellow-600">
                      <Star className="w-4 h-4 fill-yellow-600" />
                      <span>{selectedRestaurant.rating || '--'}</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Delivery</p>
                    <p className="font-black text-dark text-sm">{selectedRestaurant.deliveryTime}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl text-center">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Cost</p>
                    <p className="font-black text-dark text-sm">{selectedRestaurant.costForTwo.split(' ')[0]}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Cuisines</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedRestaurant.cuisines.map((c, i) => (
                        <span key={i} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-wider">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">FSSAI License</p>
                    <div className="flex items-center gap-2 font-bold text-dark">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span>{selectedRestaurant.fssaiLicense || 'Not provided'}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      selectedRestaurant.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedRestaurant.isVerified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  {!selectedRestaurant.isVerified && (
                    <button 
                      onClick={() => {
                        handleVerifyRestaurant(selectedRestaurant.id);
                        setSelectedRestaurant(null);
                      }}
                      className="flex-grow bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-5 h-5" />
                      Approve Restaurant
                    </button>
                  )}
                  <button 
                    onClick={() => setSelectedRestaurant(null)}
                    className={`flex-grow ${!selectedRestaurant.isVerified ? 'bg-gray-100 text-gray-600' : 'bg-dark text-white'} py-4 rounded-2xl font-black uppercase tracking-widest hover:opacity-90 transition-all`}
                  >
                    Close Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
