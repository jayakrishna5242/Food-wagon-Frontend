import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../context/AddressContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchOrders, rateOrder } from '../services/api';
import { Order } from '../types';
import AddressForm from '../components/AddressForm';
import RestaurantCard from '../components/RestaurantCard';
import { 
  LogOut, 
  User as UserIcon, 
  MapPin, 
  Settings, 
  ShoppingBag, 
  CreditCard, 
  Heart, 
  Home, 
  Briefcase,
  MoreVertical,
  CheckCircle2,
  Trash2,
  Plus,
  Edit,
  Utensils,
  ChevronRight,
  Clock,
  ArrowRight,
  Star,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Tab = 'orders' | 'profile' | 'addresses' | 'payments' | 'favorites';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Settings', icon: Settings },
];

const Profile: React.FC = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const { addresses, addAddress, removeAddress } = useAddresses();
  const { favorites } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/login');
      return;
    }

    if (activeTab !== 'orders') return;

    const loadOrders = async () => {
      setLoadingOrders(true);
      try {
        const data = await fetchOrders();
        const sorted = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(sorted);
      } catch (error) {
        console.error('Failed to fetch orders');
      } finally {
        setLoadingOrders(false);
      }
    };

    loadOrders();
  }, [user, navigate, activeTab, authLoading]);

  const handleRateOrder = async (orderId: number, rating: number) => {
    try {
      await rateOrder(orderId, rating);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating } : o));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, rating } : null);
      }
      showToast('Thank you for your rating!', 'success');
    } catch (error) {
      showToast('Failed to submit rating', 'error');
    }
  };

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully. See you soon!', 'info');
    navigate('/');
  };

  const handleRemoveAddress = (id: string) => {
    removeAddress(id);
    showToast('Address removed successfully.', 'info');
  };

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: '9876543210'
  });

  useEffect(() => {
    if (user) {
      setProfileForm(prev => ({
        ...prev,
        name: user.name
      }));
    }
  }, [user]);

  const handleUpdateProfile = () => {
    if (profileForm.name.trim().length < 3) {
      showToast('Name must be at least 3 characters', 'error');
      return;
    }
    if (profileForm.phone.length !== 10) {
      showToast('Phone number must be 10 digits', 'error');
      return;
    }
    showToast('Profile updated successfully!', 'success');
  };

  if (!user) return null;

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-orange-100 rounded-[2.5rem] flex items-center justify-center text-orange-500 shadow-sm">
              <UserIcon className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-1">Account</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="font-medium">{user.name}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                <span className="font-medium">{user.email}</span>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-600 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm uppercase tracking-widest group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Logout
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`w-full flex items-center gap-4 px-6 py-4 rounded-3xl transition-all font-bold text-sm ${
                  activeTab === tab.id 
                    ? 'bg-gray-900 text-white shadow-xl shadow-gray-900/10' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-white' : 'text-gray-400'}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === 'orders' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Order History</h2>
                    
                    {loadingOrders ? (
                      <div className="space-y-6">
                         {[1,2,3].map(i => (
                           <div key={i} className="h-32 bg-gray-50 rounded-3xl animate-pulse" />
                         ))}
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                         <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                         <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
                         <p className="text-sm text-gray-500 mb-8">Ready to taste something delicious?</p>
                         <button 
                           onClick={() => navigate('/')} 
                           className="bg-orange-500 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all uppercase text-xs tracking-widest"
                         >
                            Browse Menu
                         </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {orders.map((order) => (
                          <motion.div 
                            key={order.id} 
                            whileHover={{ y: -4 }}
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsOrderModalOpen(true);
                            }}
                            className="bg-white rounded-[32px] p-6 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-500/5 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 rounded-2xl bg-gray-50 overflow-hidden border border-gray-100 group-hover:scale-105 transition-transform">
                                <img src={order.restaurantImageUrl || "https://picsum.photos/seed/food/200"} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-500 transition-colors">{order.restaurantName}</h3>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                    {new Date(order.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="w-1 h-1 bg-gray-200 rounded-full" />
                                  <span className="text-xs font-bold text-gray-900">₹{order.totalAmount}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6">
                              <div className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest ${
                                order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                              }`}>
                                {order.status}
                              </div>
                              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'favorites' && (
                  <div className="space-y-8">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Favorites</h2>
                    {favorites.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <h3 className="font-bold text-lg text-gray-900">No favorites yet</h3>
                        <p className="text-sm text-gray-500 mt-2">Save your favorite spots for quick access.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {favorites.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'addresses' && (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center">
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Addresses</h2>
                      <button 
                        onClick={() => setIsAddressModalOpen(true)} 
                        className="bg-orange-500 text-white font-bold text-xs px-6 py-3 rounded-2xl hover:bg-orange-600 transition-all uppercase tracking-widest flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add New
                      </button>
                    </div>
                    {addresses.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                        <MapPin className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <h3 className="font-bold text-lg text-gray-900">No addresses</h3>
                        <p className="text-sm text-gray-500 mt-2">Add an address to speed up your checkout.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {addresses.map((addr) => (
                          <div key={addr.id} className="bg-white p-8 rounded-[32px] border border-gray-100 hover:border-orange-500 hover:shadow-xl hover:shadow-orange-500/5 transition-all group relative">
                            <div className="flex items-start gap-4">
                              <div className="p-3 bg-gray-50 rounded-2xl text-gray-400 group-hover:bg-orange-100 group-hover:text-orange-500 transition-colors">
                                {addr.type === 'Home' && <Home className="w-5 h-5" />}
                                {addr.type === 'Work' && <Briefcase className="w-5 h-5" />}
                                {addr.type === 'Other' && <MapPin className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-1">{addr.type}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed font-medium">{addr.flatNo}, {addr.area}, {addr.city}</p>
                                <div className="mt-6 flex gap-4">
                                   <button 
                                     onClick={() => handleRemoveAddress(addr.id)} 
                                     className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-widest transition-colors flex items-center gap-1.5"
                                   >
                                     <Trash2 className="w-3.5 h-3.5" /> Delete
                                   </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'profile' && (
                  <div className="space-y-8">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h2>
                      <p className="text-gray-500 text-sm mt-1">Manage your personal information.</p>
                    </div>
                    
                    <div className="max-w-md space-y-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                          <input 
                            type="text" 
                            value={profileForm.name} 
                            onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                            className="w-full bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white outline-none px-6 py-4 rounded-2xl font-bold text-sm transition-all" 
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                          <input type="email" defaultValue={user.email} className="w-full bg-gray-50 border border-transparent px-6 py-4 rounded-2xl font-bold text-sm text-gray-400 cursor-not-allowed" disabled />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                          <input 
                            type="tel" 
                            value={profileForm.phone} 
                            onChange={e => setProfileForm({...profileForm, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                            className="w-full bg-gray-50 border border-transparent focus:border-orange-500 focus:bg-white outline-none px-6 py-4 rounded-2xl font-bold text-sm transition-all" 
                          />
                       </div>
                       <button 
                        onClick={handleUpdateProfile}
                        className="w-full bg-gray-900 text-white font-bold py-5 rounded-2xl shadow-xl shadow-gray-900/10 hover:bg-black transition-all uppercase text-xs tracking-widest mt-4"
                       >
                        Save Changes
                       </button>
                    </div>
                  </div>
                )}

                {activeTab === 'payments' && (
                   <div className="text-center py-20 bg-gray-50 rounded-[40px] border border-dashed border-gray-200">
                      <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                      <h3 className="font-bold text-lg text-gray-900">No payments</h3>
                      <p className="text-sm text-gray-500 mt-2">Your saved payment methods will appear here.</p>
                   </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AddressForm isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onSave={(newAddr) => {
          addAddress(newAddr);
          showToast(`Address "${newAddr.type}" added successfully.`, "success");
          setIsAddressModalOpen(false);
      }} />

      {/* Order Details Modal */}
      <AnimatePresence>
        {isOrderModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-gray-100"
            >
              <div className="p-8 border-b border-gray-100 flex justify-between items-center bg-white">
                <div>
                  <h3 className="text-2xl font-black text-dark tracking-tight">Order Details</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Order #{selectedOrder.id}</p>
                </div>
                <button 
                  onClick={() => setIsOrderModalOpen(false)} 
                  className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-dark border border-transparent hover:border-gray-100 shadow-sm"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-10 no-scrollbar">
                {/* Restaurant Info */}
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 rounded-3xl bg-gray-50 overflow-hidden border border-gray-100 shadow-sm">
                    <img src={selectedOrder.restaurantImageUrl || (selectedOrder.items && selectedOrder.items[0]?.imageUrl)} alt="Restaurant" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="text-3xl font-black text-dark tracking-tight">{selectedOrder.restaurantName}</h4>
                    <p className="text-graytext flex items-center gap-1.5 text-sm mt-1.5 font-medium">
                      <MapPin className="w-4 h-4 text-primary" /> {selectedOrder.deliveryAddress}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                        selectedOrder.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
                      }`}>
                        {selectedOrder.status}
                      </span>
                      <span className="text-gray-200">•</span>
                      <span className="text-xs text-gray-400 font-black uppercase tracking-widest">{new Date(selectedOrder.date).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div>
                  <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <div className="w-1 h-4 bg-primary rounded-full"></div>
                    Items Ordered
                  </h5>
                  <div className="space-y-6">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center group">
                        <div className="flex items-center gap-4">
                          <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${item.isVeg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p className="font-black text-dark group-hover:text-primary transition-colors">{item.name}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">₹{item.price} x {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-black text-dark">₹{item.price * item.quantity}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Rating Section */}
                {selectedOrder.status === 'DELIVERED' && (
                  <div className="bg-gray-50/50 p-8 rounded-3xl border border-gray-100 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                      <h5 className="text-lg font-black text-dark tracking-tight">Rate your experience</h5>
                      {!selectedOrder.rating && (
                        <button 
                          onClick={() => navigate(`/order-rating/${selectedOrder.id}`)}
                          className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                        >
                          Detailed Review
                        </button>
                      )}
                    </div>
                    <div className="flex gap-3">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRateOrder(selectedOrder.id, star);
                          }}
                          className="transition-all hover:scale-125 active:scale-90"
                        >
                          <Star 
                            className={`w-10 h-10 ${
                              (selectedOrder.rating || 0) >= star 
                                ? 'fill-primary text-primary drop-shadow-sm' 
                                : 'text-gray-200'
                            }`} 
                          />
                        </button>
                      ))}
                    </div>
                    {selectedOrder.rating && (
                      <p className="text-xs text-green-600 font-black uppercase tracking-widest mt-4 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600"></div>
                        You rated this order {selectedOrder.rating} stars!
                      </p>
                    )}
                  </div>
                )}

                {/* Bill Summary */}
                <div className="border-t border-dashed border-gray-200 pt-8 space-y-3">
                  <div className="flex justify-between text-graytext text-sm font-medium">
                    <span>Item Total</span>
                    <span>₹{selectedOrder.totalAmount - 40}</span>
                  </div>
                  <div className="flex justify-between text-graytext text-sm font-medium">
                    <span>Delivery Fee</span>
                    <span>₹40</span>
                  </div>
                  <div className="flex justify-between text-dark font-black text-2xl pt-4 border-t border-gray-50">
                    <span className="tracking-tight">Total Amount</span>
                    <span className="text-primary">₹{selectedOrder.totalAmount}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={() => {
                    const rid = selectedOrder.restaurantId || (selectedOrder.items && selectedOrder.items[0]?.restaurantId);
                    if (rid) navigate(`/restaurant/${rid}`);
                    setIsOrderModalOpen(false);
                  }}
                  className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg hover:bg-[#e26e10] transition-all uppercase tracking-widest text-sm"
                >
                  Reorder from this restaurant
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;