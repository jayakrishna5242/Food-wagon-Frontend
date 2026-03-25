
import React, { useState, useEffect } from 'react';
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
  XCircle,
  Package,
  ChevronRight,
  Tag,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Save,
  PlusCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

import { useAuth } from '../context/AuthContext';
import { 
  fetchOrders, 
  updateOrderStatus, 
  clearStoredUser, 
  getStoredUser, 
  fetchPartnerRestaurant, 
  fetchOffers, 
  addOffer, 
  deleteOffer,
  fetchMenu,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleStock,
  updateRestaurantDetails
} from '../services/api';
import { Order, Restaurant, Offer, MenuItem } from '../types';

const PartnerDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<MenuItem | null>(null);
  const [newMenuItem, setNewMenuItem] = useState<Partial<MenuItem>>({
    name: '',
    description: '',
    price: 0,
    imageUrl: '',
    isVeg: true,
    category: ''
  });
  const [newOffer, setNewOffer] = useState<Partial<Offer>>({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    minOrderValue: 0
  });
  const [settingsForm, setSettingsForm] = useState({
    name: '',
    cuisines: '',
    costForTwo: '',
    deliveryTime: '',
    imageUrl: '',
    operatingHours: ''
  });
  const user = getStoredUser();

  useEffect(() => {
    const loadData = async () => {
      if (!user || !user.restaurantId) return;
      try {
        const [o, r, ofs, menu] = await Promise.all([
          fetchOrders(),
          fetchPartnerRestaurant(user.restaurantId),
          fetchOffers(user.restaurantId),
          fetchMenu(user.restaurantId)
        ]);
        setOrders(o);
        setRestaurant(r);
        setOffers(ofs);
        setMenuItems(menu);
        if (r) {
          setSettingsForm({
            name: r.name,
            cuisines: r.cuisines.join(', '),
            costForTwo: r.costForTwo,
            deliveryTime: r.deliveryTime,
            imageUrl: r.imageUrl,
            operatingHours: r.operatingHours || '9:00 AM - 11:00 PM'
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId) return;

    // Validations
    if (!newMenuItem.name || newMenuItem.name.length < 3) {
      showToast('Item name must be at least 3 characters', 'error');
      return;
    }
    if (!newMenuItem.price || newMenuItem.price <= 0) {
      showToast('Price must be greater than 0', 'error');
      return;
    }
    if (!newMenuItem.category) {
      showToast('Category is required', 'error');
      return;
    }
    if (!newMenuItem.imageUrl) {
      showToast('Image URL is required', 'error');
      return;
    }

    try {
      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem.id, newMenuItem);
        showToast('Menu item updated', 'success');
      } else {
        await addMenuItem({ ...newMenuItem, restaurantId: user.restaurantId });
        showToast('Menu item added', 'success');
      }
      const updated = await fetchMenu(user.restaurantId);
      setMenuItems(updated);
      setShowAddMenuItem(false);
      setEditingMenuItem(null);
      setNewMenuItem({ name: '', description: '', price: 0, imageUrl: '', isVeg: true, category: '' });
    } catch (err) {
      showToast('Action failed', 'error');
    }
  };

  const handleDeleteMenuItem = async (id: number) => {
    if (!user?.restaurantId) return;
    try {
      await deleteMenuItem(id);
      const updated = await fetchMenu(user.restaurantId);
      setMenuItems(updated);
      showToast('Item deleted', 'success');
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  const handleToggleStock = async (id: number) => {
    if (!user?.restaurantId) return;
    try {
      await toggleStock(id);
      const updated = await fetchMenu(user.restaurantId);
      setMenuItems(updated);
    } catch (err) {
      showToast('Failed to update stock', 'error');
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId) return;

    // Validations
    if (settingsForm.name.length < 3) {
      showToast('Restaurant name must be at least 3 characters', 'error');
      return;
    }
    if (!settingsForm.cuisines) {
      showToast('Cuisines are required', 'error');
      return;
    }

    try {
      await updateRestaurantDetails(user.restaurantId, {
        ...settingsForm,
        cuisines: settingsForm.cuisines.split(',').map(c => c.trim())
      });
      const updated = await fetchPartnerRestaurant(user.restaurantId);
      setRestaurant(updated);
      showToast('Settings updated successfully', 'success');
    } catch (err) {
      showToast('Failed to update settings', 'error');
    }
  };

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.restaurantId) return;

    // Validations
    if (!newOffer.code || newOffer.code.length < 3) {
      showToast('Coupon code must be at least 3 characters', 'error');
      return;
    }
    if (!newOffer.discountValue || newOffer.discountValue <= 0) {
      showToast('Discount value must be greater than 0', 'error');
      return;
    }

    try {
      await addOffer({ ...newOffer, restaurantId: user.restaurantId });
      const updated = await fetchOffers(user.restaurantId);
      setOffers(updated);
      setShowAddOffer(false);
      setNewOffer({ code: '', description: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderValue: 0 });
      showToast('Offer added successfully', 'success');
    } catch (err) {
      showToast('Failed to add offer', 'error');
    }
  };

  const handleDeleteOffer = async (id: string) => {
    if (!user?.restaurantId) return;
    try {
      await deleteOffer(id);
      const updated = await fetchOffers(user.restaurantId);
      setOffers(updated);
      showToast('Offer deleted', 'success');
    } catch (err) {
      showToast('Failed to delete offer', 'error');
    }
  };

  const handleStatusUpdate = async (orderId: number, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status);
      const updated = await fetchOrders();
      setOrders(updated);
      showToast(`Order status updated to ${status}`, 'success');
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const stats = [
    { label: 'Total Sales', value: `₹${orders.filter(o => o.status === 'DELIVERED').reduce((acc, o) => acc + o.totalAmount, 0)}`, icon: DollarSign, color: 'bg-green-500/10 text-green-500', trend: '+15.2%', isPositive: true },
    { label: 'Active Orders', value: orders.filter(o => ['PENDING', 'PREPARING', 'READY', 'DISPATCHED'].includes(o.status)).length.toString(), icon: ShoppingBag, color: 'bg-blue-500/10 text-blue-500', trend: '+5.4%', isPositive: true },
    { label: 'Total Customers', value: new Set(orders.map(o => o.userId)).size.toString(), icon: Users, color: 'bg-purple-500/10 text-purple-500', trend: '+2.1%', isPositive: true },
    { label: 'Growth', value: '+12.5%', icon: TrendingUp, color: 'bg-orange-500/10 text-orange-500', trend: '+1.2%', isPositive: true },
  ];

  const chartData = [
    { name: 'Week 1', orders: 45, income: 12000 },
    { name: 'Week 2', orders: 52, income: 15000 },
    { name: 'Week 3', orders: 48, income: 13500 },
    { name: 'Week 4', orders: 61, income: 18000 },
  ];

  const comparisonData = [
    { month: 'Last Month', orders: 180, income: 52000, deliveries: 175 },
    { month: 'This Month', orders: 210, income: 58500, deliveries: 205 },
  ];

  const handleLogout = () => {
    clearStoredUser();
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user && !user.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-primary animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-dark mb-2 tracking-tight">Verification Pending</h1>
          <p className="text-gray-500 font-medium mb-8">
            Your account is currently being reviewed by our team. You'll have full access once verified.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-sm font-black text-dark uppercase tracking-wider mb-4">Your Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Name</span>
                <span className="text-sm text-dark font-bold">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Email</span>
                <span className="text-sm text-dark font-bold">{user.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Phone</span>
                <span className="text-sm text-dark font-bold">{user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Role</span>
                <span className="text-sm text-dark font-bold">{user.role}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="w-full bg-dark text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    );
  }

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
            onClick={() => setActiveTab('offers')}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all ${activeTab === 'offers' ? 'bg-primary text-white shadow-lg shadow-orange-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Tag size={20} />
            <span>Offers & Coupons</span>
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
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Welcome back, {restaurant?.name}!</h1>
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

        {/* Offers Section */}
        {activeTab === 'offers' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Offers & Coupons</h2>
                <p className="text-gray-500 font-medium">Manage discounts and promotional codes for your customers.</p>
              </div>
              <button 
                onClick={() => setShowAddOffer(true)}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
              >
                <Plus size={18} />
                Create New Offer
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {offers.filter(o => o.restaurantId === user?.restaurantId).map((offer) => (
                <motion.div 
                  key={offer.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteOffer(offer.id)}
                      className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-primary">
                      <Tag size={24} />
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Coupon Code</div>
                      <div className="text-xl font-black text-gray-900 tracking-tight">{offer.code}</div>
                    </div>
                  </div>

                  <p className="text-gray-500 text-sm font-medium mb-6">{offer.description}</p>

                  <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-50">
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Discount</div>
                      <div className="text-lg font-black text-gray-900">
                        {offer.discountType === 'PERCENTAGE' ? `${offer.discountValue}%` : `₹${offer.discountValue}`}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Min Order</div>
                      <div className="text-lg font-black text-gray-900">₹{offer.minOrderValue}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {offers.filter(o => o.restaurantId === user?.restaurantId).length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Tag className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">No offers created yet</h3>
                  <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2">Create your first coupon code to attract more customers to your restaurant.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Menu Management Section */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Menu Management</h2>
                <p className="text-gray-500 font-medium">Add, edit or remove items from your restaurant's menu.</p>
              </div>
              <button 
                onClick={() => {
                  setEditingMenuItem(null);
                  setNewMenuItem({ name: '', description: '', price: 0, imageUrl: '', isVeg: true, category: '' });
                  setShowAddMenuItem(true);
                }}
                className="bg-primary text-white px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
              >
                <PlusCircle size={18} />
                Add New Item
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden group"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button 
                        onClick={() => {
                          setEditingMenuItem(item);
                          setNewMenuItem(item);
                          setShowAddMenuItem(true);
                        }}
                        className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-xl hover:bg-white transition-colors shadow-lg"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteMenuItem(item.id)}
                        className="p-2 bg-red-500/90 backdrop-blur-sm text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="absolute bottom-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${item.isVeg ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                        {item.isVeg ? 'Veg' : 'Non-Veg'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-black text-gray-900 tracking-tight">{item.name}</h3>
                      <span className="text-lg font-black text-primary">₹{item.price}</span>
                    </div>
                    <p className="text-gray-500 text-sm font-medium line-clamp-2 mb-6">{item.description}</p>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                      <div className="text-xs font-black text-gray-400 uppercase tracking-widest">{item.category}</div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest ${item.inStock ? 'text-green-500' : 'text-red-500'}`}>
                          {item.inStock ? 'In Stock' : 'Out of Stock'}
                        </span>
                        <button 
                          onClick={() => handleToggleStock(item.id)}
                          className={`w-10 h-5 rounded-full relative transition-colors ${item.inStock ? 'bg-green-500' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.inStock ? 'right-1' : 'left-1'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
              {menuItems.length === 0 && (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="text-gray-300" size={32} />
                  </div>
                  <h3 className="text-lg font-black text-gray-900">Your menu is empty</h3>
                  <p className="text-gray-500 font-medium max-w-xs mx-auto mt-2">Start adding delicious items to your menu to begin receiving orders.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Settings Section */}
        {activeTab === 'settings' && (
          <div className="max-w-4xl">
            <div className="mb-10">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Restaurant Settings</h2>
              <p className="text-gray-500 font-medium">Update your restaurant's profile and operational details.</p>
            </div>

            <form onSubmit={handleUpdateSettings} className="space-y-8">
              <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Restaurant Name</label>
                      <input 
                        required
                        type="text"
                        value={settingsForm.name}
                        onChange={e => setSettingsForm({...settingsForm, name: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cuisines (Comma separated)</label>
                      <input 
                        required
                        type="text"
                        value={settingsForm.cuisines}
                        onChange={e => setSettingsForm({...settingsForm, cuisines: e.target.value})}
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cost for Two</label>
                        <input 
                          required
                          type="text"
                          value={settingsForm.costForTwo}
                          onChange={e => setSettingsForm({...settingsForm, costForTwo: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Delivery Time</label>
                        <input 
                          required
                          type="text"
                          value={settingsForm.deliveryTime}
                          onChange={e => setSettingsForm({...settingsForm, deliveryTime: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Operating Hours</label>
                      <input 
                        required
                        type="text"
                        value={settingsForm.operatingHours}
                        onChange={e => setSettingsForm({...settingsForm, operatingHours: e.target.value})}
                        placeholder="e.g. 9:00 AM - 11:00 PM"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Restaurant Image URL</label>
                      <div className="relative">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input 
                          required
                          type="url"
                          value={settingsForm.imageUrl}
                          onChange={e => setSettingsForm({...settingsForm, imageUrl: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 pl-12 pr-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>
                    <div className="aspect-video rounded-3xl overflow-hidden border-4 border-gray-50 shadow-inner">
                      <img 
                        src={settingsForm.imageUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop';
                        }}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50 flex justify-end">
                  <button 
                    type="submit"
                    className="bg-primary text-white px-10 py-4 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center gap-3 hover:bg-orange-600 transition-all shadow-xl shadow-orange-500/20"
                  >
                    <Save size={20} />
                    Save Changes
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Add/Edit Menu Item Modal */}
        <AnimatePresence>
          {showAddMenuItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddMenuItem(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden"
              >
                <div className="p-10">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">
                    {editingMenuItem ? 'Edit Menu Item' : 'Add New Menu Item'}
                  </h2>
                  <p className="text-gray-500 font-medium mb-8">Provide the details for your dish.</p>

                  <form onSubmit={handleAddMenuItem} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Item Name</label>
                        <input 
                          required
                          type="text"
                          value={newMenuItem.name}
                          onChange={e => setNewMenuItem({...newMenuItem, name: e.target.value})}
                          placeholder="E.g. Butter Chicken"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                        <input 
                          required
                          type="text"
                          value={newMenuItem.category}
                          onChange={e => setNewMenuItem({...newMenuItem, category: e.target.value})}
                          placeholder="E.g. Main Course"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                      <textarea 
                        required
                        rows={3}
                        value={newMenuItem.description}
                        onChange={e => setNewMenuItem({...newMenuItem, description: e.target.value})}
                        placeholder="Describe your dish..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Price (₹)</label>
                        <input 
                          required
                          type="number"
                          value={newMenuItem.price}
                          onChange={e => setNewMenuItem({...newMenuItem, price: Number(e.target.value)})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Type</label>
                        <div className="flex bg-gray-50 p-1 rounded-2xl border border-gray-100">
                          <button 
                            type="button"
                            onClick={() => setNewMenuItem({...newMenuItem, isVeg: true})}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${newMenuItem.isVeg ? 'bg-green-500 text-white shadow-md' : 'text-gray-400'}`}
                          >
                            Veg
                          </button>
                          <button 
                            type="button"
                            onClick={() => setNewMenuItem({...newMenuItem, isVeg: false})}
                            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!newMenuItem.isVeg ? 'bg-red-500 text-white shadow-md' : 'text-gray-400'}`}
                          >
                            Non-Veg
                          </button>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Image URL</label>
                        <input 
                          required
                          type="url"
                          value={newMenuItem.imageUrl}
                          onChange={e => setNewMenuItem({...newMenuItem, imageUrl: e.target.value})}
                          placeholder="https://..."
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowAddMenuItem(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                      >
                        {editingMenuItem ? 'Update Item' : 'Add Item'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Add Offer Modal */}
        <AnimatePresence>
          {showAddOffer && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddOffer(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl relative overflow-hidden"
              >
                <div className="p-10">
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Create New Offer</h2>
                  <p className="text-gray-500 font-medium mb-8">Fill in the details to create a new promotional coupon.</p>

                  <form onSubmit={handleAddOffer} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Coupon Code</label>
                        <input 
                          required
                          type="text"
                          value={newOffer.code}
                          onChange={e => setNewOffer({...newOffer, code: e.target.value.toUpperCase()})}
                          placeholder="E.g. WELCOME50"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Discount Type</label>
                        <select 
                          value={newOffer.discountType}
                          onChange={e => setNewOffer({...newOffer, discountType: e.target.value as any})}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all appearance-none"
                        >
                          <option value="PERCENTAGE">Percentage (%)</option>
                          <option value="FIXED">Fixed Amount (₹)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description</label>
                      <input 
                        required
                        type="text"
                        value={newOffer.description}
                        onChange={e => setNewOffer({...newOffer, description: e.target.value})}
                        placeholder="E.g. Get 50% off on your first order"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Discount Value</label>
                        <input 
                          required
                          type="number"
                          value={newOffer.discountValue}
                          onChange={e => setNewOffer({...newOffer, discountValue: Number(e.target.value)})}
                          placeholder="Value"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Min Order Value</label>
                        <input 
                          required
                          type="number"
                          value={newOffer.minOrderValue}
                          onChange={e => setNewOffer({...newOffer, minOrderValue: Number(e.target.value)})}
                          placeholder="Min Order"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary/50 transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setShowAddOffer(false)}
                        className="flex-1 bg-gray-100 text-gray-600 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        className="flex-1 bg-primary text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-lg shadow-orange-500/20"
                      >
                        Create Offer
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Dashboard Content */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                    <div className={`flex items-center gap-1 text-xs font-black ${stat.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {stat.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      {stat.trend}
                    </div>
                  </div>
                  <div className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1">{stat.label}</div>
                  <div className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-black text-gray-900 tracking-tight">Income Analysis</h3>
                    <p className="text-xs text-gray-500 font-medium mt-1">Monthly revenue comparison</p>
                  </div>
                  <div className="bg-green-50 text-green-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                    +12.5% Growth
                  </div>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#fc8019" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#fc8019" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}}
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 10, fontWeight: 700, fill: '#9ca3af'}}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        labelStyle={{ fontWeight: 900, color: '#111827', marginBottom: '4px' }}
                      />
                      <Area type="monotone" dataKey="income" stroke="#fc8019" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
                <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Top Selling Items</h3>
                <div className="space-y-6">
                  {menuItems.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-black text-gray-900">{item.name}</div>
                        <div className="text-xs text-gray-400 font-medium">{Math.floor(Math.random() * 50) + 10} orders</div>
                      </div>
                      <div className="text-sm font-black text-primary">₹{item.price}</div>
                    </div>
                  ))}
                  {menuItems.length === 0 && <p className="text-center text-gray-400 py-10">No items yet</p>}
                </div>
              </div>

              {/* Month over Month Comparison */}
              <div className="lg:col-span-3 bg-dark p-8 md:p-10 rounded-[2.5rem] text-white shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                  <div>
                    <h3 className="text-2xl font-black tracking-tight">Month over Month Performance</h3>
                    <p className="text-gray-400 font-medium mt-1">Comparing this month's growth with the previous month.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Income Growth</p>
                      <p className="text-xl font-black text-green-400">+₹6,500</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Order Growth</p>
                      <p className="text-xl font-black text-blue-400">+30 Orders</p>
                    </div>
                  </div>
                </div>
                
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={comparisonData} layout="vertical" margin={{ left: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis type="number" hide />
                      <YAxis 
                        dataKey="month" 
                        type="category" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{fontSize: 12, fontWeight: 900, fill: '#fff'}}
                      />
                      <Tooltip 
                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                        contentStyle={{ backgroundColor: '#1f2937', borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px' }}
                        itemStyle={{ color: '#fff', fontWeight: 700 }}
                      />
                      <Bar dataKey="income" fill="#fc8019" radius={[0, 10, 10, 0]} barSize={30} name="Income (₹)" />
                      <Bar dataKey="orders" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={30} name="Orders" />
                      <Bar dataKey="deliveries" fill="#10b981" radius={[0, 10, 10, 0]} barSize={30} name="Deliveries" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        {activeTab === 'orders' && (
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
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-8 py-12 text-center text-gray-400 font-bold">No orders found.</td>
                    </tr>
                  ) : (
                    orders.map((order, i) => (
                      <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-8 py-6 font-black text-gray-900">#{order.id.toString().slice(-6)}</td>
                        <td className="px-8 py-6 font-bold text-gray-700">{order.customerName}</td>
                        <td className="px-8 py-6 text-sm text-gray-500 font-medium max-w-xs truncate">
                          {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                        </td>
                        <td className="px-8 py-6 font-black text-gray-900">₹{order.totalAmount}</td>
                        <td className="px-8 py-6">
                          <span className={`
                            px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider
                            ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : ''}
                            ${order.status === 'PREPARING' ? 'bg-blue-100 text-blue-600' : ''}
                            ${order.status === 'READY' ? 'bg-purple-100 text-purple-600' : ''}
                            ${order.status === 'DISPATCHED' ? 'bg-indigo-100 text-indigo-600' : ''}
                            ${order.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : ''}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-400 font-bold">
                          {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-2">
                            {order.status === 'PENDING' && (
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors" 
                                title="Start Preparing"
                              >
                                <Clock size={18} />
                              </button>
                            )}
                            {order.status === 'PREPARING' && (
                              <button 
                                onClick={() => handleStatusUpdate(order.id, 'READY')}
                                className="p-2 bg-purple-50 text-purple-600 rounded-xl hover:bg-purple-100 transition-colors" 
                                title="Mark Ready for Pickup"
                              >
                                <Package size={18} />
                              </button>
                            )}
                            {order.status === 'READY' && (
                              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Waiting for Rider</span>
                            )}
                            {order.status === 'DISPATCHED' && (
                              <div className="flex items-center gap-1 text-indigo-600">
                                <TrendingUp size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">On the Way</span>
                              </div>
                            )}
                            {order.status === 'DELIVERED' && (
                              <div className="flex items-center gap-1 text-green-600">
                                <CheckCircle2 size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Completed</span>
                              </div>
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
        )}
      </main>
    </div>
  );
};

export default PartnerDashboard;
