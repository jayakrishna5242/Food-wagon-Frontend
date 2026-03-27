import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAddresses } from '../context/AddressContext';
import { useToast } from '../context/ToastContext';
import { useFavorites } from '../context/FavoritesContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { fetchOrders, rateOrder, updateUser } from '../services/api';
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

type Tab = 'menu' | 'orders' | 'profile' | 'addresses' | 'payments' | 'favorites';

const tabs: { id: Tab; label: string; icon: any }[] = [
  { id: 'orders', label: 'Orders', icon: ShoppingBag },
  { id: 'favorites', label: 'Favorites', icon: Heart },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'profile', label: 'Settings', icon: Settings },
];

const Profile: React.FC = () => {
  const { user, logout, login, isLoading: authLoading } = useAuth();
  const { addresses, addAddress, removeAddress } = useAddresses();
  const { favorites } = useFavorites();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>((searchParams.get('tab') as Tab) || 'menu');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async () => {
    if (profileForm.name.trim().length < 3) {
      showToast('Name must be at least 3 characters', 'error');
      return;
    }
    if (profileForm.phone.length !== 10) {
      showToast('Phone number must be 10 digits', 'error');
      return;
    }
    
    if (!user) return;

    setIsUpdating(true);
    try {
      const updated = await updateUser(user.id, {
        name: profileForm.name,
        phone: profileForm.phone
      });
      login(updated);
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update profile', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const [isAccountOpen, setIsAccountOpen] = useState(true);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const faqs = [
    { q: "How do I track my order?", a: "You can track your order in real-time from the 'Orders' section in your profile." },
    { q: "What are the payment options?", a: "We accept all major credit/debit cards, UPI, and net banking." },
    { q: "Can I cancel my order?", a: "Orders can be cancelled within 60 seconds of placement. After that, cancellation depends on the restaurant's acceptance." },
    { q: "How do I add a new address?", a: "Go to 'Addresses' in your profile and click on 'Add New' to save a new delivery location." },
    { q: "Is there a delivery fee?", a: "Delivery fees vary based on distance and order value. You can see the exact fee at checkout." }
  ];

  const menuItems = [
    { id: 'addresses', label: 'Manage Address', icon: MapPin },
    { id: 'favorites', label: 'My Favourites', icon: Heart },
    { id: 'orders', label: 'My Orders', icon: ShoppingBag },
    { id: 'payments', label: 'My Wallet', icon: CreditCard },
    { id: 'profile', label: 'Change Phone Number', icon: Settings },
    { id: 'delete', label: 'Delete My Account', icon: Trash2, color: 'text-red-500' },
  ];

  if (!user) return null;

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute top-40 left-0 w-48 h-48 bg-orange-100 rounded-full -ml-24 blur-3xl opacity-30 pointer-events-none"></div>

      {/* Header */}
      <div className="relative px-6 pt-12 pb-8">
        <div className="flex justify-between items-center mb-8">
          <div className="flex-1">
            <h1 className="text-3xl font-black text-dark uppercase tracking-tighter leading-none">
              {user.name}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-graytext font-medium">
                {user.email}
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl rotate-3 hover:rotate-0 transition-all duration-500">
              <img 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} 
                alt="Profile" 
                className="w-full h-full object-cover bg-orange-50"
              />
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
            <p className="text-xl font-black text-dark">{orders.length}</p>
            <p className="text-[10px] text-graytext font-bold uppercase tracking-widest">Orders</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
            <p className="text-xl font-black text-dark">{favorites.length}</p>
            <p className="text-[10px] text-graytext font-bold uppercase tracking-widest">Favorites</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 text-center">
            <p className="text-xl font-black text-dark">{addresses.length}</p>
            <p className="text-[10px] text-graytext font-bold uppercase tracking-widest">Places</p>
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="h-[1px] bg-gray-100 w-full mb-8"></div>
      </div>

      {/* My Account Section */}
      <div className="px-6 mb-4">
        <button 
          onClick={() => setIsAccountOpen(!isAccountOpen)}
          className="w-full flex justify-between items-center py-4 group"
        >
          <h2 className="text-xl font-black text-dark tracking-tight group-hover:text-primary transition-colors">My Account</h2>
          <motion.div
            animate={{ rotate: isAccountOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-6 h-6 text-dark rotate-90" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isAccountOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-1 py-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === 'delete') {
                        setIsDeleteModalOpen(true);
                      } else {
                        handleTabChange(item.id as Tab);
                      }
                    }}
                    className="w-full flex items-center justify-between py-4 group"
                  >
                    <div className="flex items-center gap-4">
                      <item.icon className={`w-5 h-5 ${item.color || 'text-gray-500'} group-hover:text-primary transition-colors`} />
                      <span className="text-base font-medium text-dark group-hover:text-primary transition-colors">{item.label}</span>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Help & FAQs Section */}
      <div className="px-6 mb-8">
        <button 
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="w-full flex justify-between items-center py-4 group border-t border-gray-100"
        >
          <h2 className="text-xl font-black text-dark tracking-tight group-hover:text-primary transition-colors">Help & FAQs</h2>
          <motion.div
            animate={{ rotate: isHelpOpen ? 90 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronRight className="w-6 h-6 text-dark" />
          </motion.div>
        </button>

        <AnimatePresence>
          {isHelpOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="space-y-4 py-2">
                {faqs.map((faq, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="font-bold text-dark text-sm mb-1">{faq.q}</p>
                    <p className="text-xs text-graytext leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Logout Button */}
      <div className="px-6 mt-4">
        <button 
          onClick={handleLogout}
          className="w-full py-4 bg-gray-50 rounded-xl flex items-center justify-center gap-2 text-red-500 font-bold border border-gray-100 hover:bg-red-50 transition-all"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>

      {/* Active Tab Content Modal/Overlay */}
      <AnimatePresence>
        {activeTab !== 'menu' && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[110] bg-white overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-8">
                <button 
                  onClick={() => handleTabChange('menu')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-all"
                >
                  <ChevronRight className="w-6 h-6 rotate-180" />
                </button>
                <h2 className="text-2xl font-black text-dark tracking-tight">
                  {tabs.find(t => t.id === activeTab)?.label}
                </h2>
              </div>

              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <p className="text-graytext font-medium">
                      {showAllOrders ? 'All Orders' : 'Recent Orders'}
                    </p>
                    {orders.length > 3 && (
                      <button 
                        onClick={() => setShowAllOrders(!showAllOrders)}
                        className="text-primary font-bold text-sm hover:underline"
                      >
                        {showAllOrders ? 'Show Less' : 'View All'}
                      </button>
                    )}
                  </div>
                  
                  {loadingOrders ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-32 bg-gray-50 rounded-2xl animate-pulse"></div>)}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-2" />
                      <p className="text-graytext font-medium">No orders yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(showAllOrders ? orders : orders.slice(0, 3)).map((order) => (
                        <div 
                          key={order.id}
                          onClick={() => {
                            setSelectedOrder(order);
                            setIsOrderModalOpen(true);
                          }}
                          className="p-4 border border-gray-100 rounded-2xl flex items-center gap-4 bg-white shadow-sm hover:border-primary transition-all cursor-pointer"
                        >
                          <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                            <img src={order.restaurantImageUrl || "https://picsum.photos/seed/food/200"} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <p className="font-bold text-dark line-clamp-1">{order.restaurantName}</p>
                            <p className="text-xs text-graytext mt-0.5">₹{order.totalAmount} • {new Date(order.date).toLocaleDateString()}</p>
                            <div className="flex items-center gap-1 mt-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${order.status === 'DELIVERED' ? 'bg-green-500' : 'bg-orange-500'}`}></div>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{order.status}</span>
                            </div>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-300" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'favorites' && (
                <div className="space-y-6">
                  {favorites.length === 0 ? (
                    <div className="text-center py-20">
                      <Heart className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                      <p className="text-graytext font-medium">No favorites yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {favorites.map((restaurant) => <RestaurantCard key={restaurant.id} restaurant={restaurant} />)}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <p className="text-graytext font-medium">Saved Addresses</p>
                    <button 
                      onClick={() => setIsAddressModalOpen(true)}
                      className="text-primary font-bold text-sm flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> Add New
                    </button>
                  </div>
                  <div className="space-y-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="p-4 border border-gray-100 rounded-2xl flex items-start gap-4">
                        <div className="p-2 bg-orange-50 text-primary rounded-lg">
                          {addr.type === 'Home' ? <Home className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <p className="font-bold text-dark">{addr.type}</p>
                          <p className="text-sm text-graytext">{addr.flatNo}, {addr.area}, {addr.city}</p>
                        </div>
                        <button onClick={() => handleRemoveAddress(addr.id)} className="text-red-500 p-2">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                      <input 
                        type="text" 
                        value={profileForm.name}
                        onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                      <input 
                        type="tel" 
                        value={profileForm.phone}
                        onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                        className="w-full p-4 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                      />
                    </div>
                    <button 
                      onClick={handleUpdateProfile}
                      disabled={isUpdating}
                      className="w-full bg-primary text-white font-black py-4 rounded-xl shadow-lg shadow-orange-500/20 mt-4 disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'payments' && (
                <div className="text-center py-20">
                  <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                  <p className="text-graytext font-medium">No payment methods added</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      {/* Delete Account Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Trash2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-dark tracking-tight mb-2">Delete Account?</h3>
              <p className="text-graytext text-sm font-medium mb-8 leading-relaxed">
                This action is permanent and cannot be undone. All your orders, favorites, and addresses will be lost.
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => {
                    showToast('Account deletion request submitted', 'info');
                    setIsDeleteModalOpen(false);
                  }}
                  className="w-full py-4 bg-red-500 text-white font-black rounded-2xl shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all"
                >
                  Yes, Delete My Account
                </button>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="w-full py-4 bg-gray-50 text-dark font-black rounded-2xl hover:bg-gray-100 transition-all"
                >
                  No, Keep It
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