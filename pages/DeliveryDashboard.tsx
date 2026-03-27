
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Clock, 
  Phone, 
  User, 
  LogOut, 
  Package, 
  TrendingUp,
  ChevronRight,
  ArrowRight,
  Store,
  Wallet,
  Calendar,
  X,
  Bell
} from 'lucide-react';
import { 
  fetchOrders, 
  updateOrderStatus, 
  clearStoredUser, 
  getStoredUser,
  fetchEarningsSummary,
  fetchTrips,
  fetchOrderRequests,
  acceptOrderRequest,
  rejectOrderRequest
} from '../services/api';
import { Order, Trip, EarningsSummary, OrderRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { motion, AnimatePresence } from 'motion/react';

const DeliveryDashboard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'trips';
  const setActiveTab = (tab: string) => setSearchParams({ tab });
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [requestTimers, setRequestTimers] = useState<Record<number, number>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!currentUser) return;
    try {
      const [o, t, e, r] = await Promise.all([
        fetchOrders(),
        fetchTrips(currentUser.id, startDate, endDate),
        fetchEarningsSummary(currentUser.id),
        fetchOrderRequests(currentUser.id)
      ]);
      setOrders(o);
      setTrips(t);
      setEarnings(e);
      setOrderRequests(r);
      
      // Initialize timers
      const timers: Record<number, number> = {};
      r.forEach(req => {
        timers[req.id] = Math.max(0, Math.floor((req.expiresAt - Date.now()) / 1000));
      });
      setRequestTimers(timers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer effect
  useEffect(() => {
    if (orderRequests.length === 0 && Object.keys(requestTimers).length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      
      setRequestTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          const numId = Number(id);
          if (next[numId] > 0) {
            next[numId] -= 1;
            changed = true;
          } else {
            delete next[numId];
            changed = true;
          }
        });
        return changed ? next : prev;
      });

      setOrderRequests(current => {
        const filtered = current.filter(r => r.expiresAt > now);
        return filtered.length !== current.length ? filtered : current;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [orderRequests.length, Object.keys(requestTimers).length]);

  const handleLogout = () => {
    clearStoredUser();
    logout();
    navigate('/login');
  };

  const handleStatusUpdate = async (orderId: number, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status, currentUser?.id, currentUser?.name);
      showToast(`Order status updated to ${status.replace('_', ' ')}`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!currentUser) return;
    try {
      // Optimistically remove from UI
      setOrderRequests(prev => prev.filter(r => r.id !== requestId));
      await acceptOrderRequest(requestId, currentUser.id);
      showToast('Order accepted! Head to the restaurant.', 'success');
      loadData();
    } catch (err) {
      showToast('Failed to accept order', 'error');
      loadData(); // Re-fetch on error
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!currentUser) return;
    try {
      // Optimistically remove from UI
      setOrderRequests(prev => prev.filter(r => r.id !== requestId));
      await rejectOrderRequest(requestId, currentUser.id);
      showToast('Order request rejected', 'info');
    } catch (err) {
      showToast('Failed to reject order', 'error');
      loadData();
    }
  };

  const activeDeliveries = orders.filter(o => 
    (o.status === 'READY' || o.status === 'DISPATCHED' || o.status === 'PREPARING' || o.status === 'PENDING') && 
    (o.deliveryBoyId === currentUser?.id || (o.status === 'READY' && !o.deliveryBoyId))
  );

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Loading Delivery Dashboard...</div>;

  if (currentUser && !currentUser.isVerified) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-gray-100">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-blue-600 animate-pulse" />
          </div>
          <h1 className="text-2xl font-black text-dark mb-2 tracking-tight">Verification Pending</h1>
          <p className="text-gray-500 font-medium mb-8">
            Your delivery partner account is currently being reviewed. You'll be able to start accepting orders once verified.
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-sm font-black text-dark uppercase tracking-wider mb-4">Your Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Name</span>
                <span className="text-sm text-dark font-bold">{currentUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Email</span>
                <span className="text-sm text-dark font-bold">{currentUser.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Phone</span>
                <span className="text-sm text-dark font-bold">{currentUser.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-gray-400 font-bold uppercase">Role</span>
                <span className="text-sm text-dark font-bold">{currentUser.role}</span>
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
    <div className="min-h-screen bg-[#F8F9FA] pb-24 md:pb-0">
      {/* Header - Recipe 8 (Clean Utility) */}
      <header className="bg-white border-b border-gray-100 p-4 md:p-6 sticky top-20 z-50">
        <div className="container mx-auto max-w-4xl flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-dark rounded-2xl flex items-center justify-center text-white font-black shadow-xl shadow-dark/10">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-dark tracking-tight">Partner Dashboard</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                  Online & Accepting Orders
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-xs font-black text-dark">{currentUser?.name}</p>
              <p className="text-[10px] text-gray-400 font-bold">ID: #{currentUser?.id.toString().slice(-6)}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto max-w-4xl p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Stats & Requests */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Incoming Requests Overlay - Recipe 2 (Editorial) style for impact */}
          <AnimatePresence>
            {orderRequests.map(request => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                className="bg-dark text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden border border-white/10"
              >
                <div className="absolute top-0 right-0 p-6">
                  <div className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full animate-bounce">
                    NEW ORDER
                  </div>
                </div>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-16 h-16 bg-primary/20 rounded-[24px] flex items-center justify-center">
                    <Bell className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tighter">₹{request.payout}</h3>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Estimated Payout • {request.distance} km</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Pickup</p>
                    <h4 className="text-lg font-bold">{request.restaurantName}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{request.restaurantAddress}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Delivery</p>
                    <h4 className="text-lg font-bold">Customer Location</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">{request.deliveryAddress}</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRejectRequest(request.id)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all border border-white/10"
                  >
                    Pass
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAcceptRequest(request.id)}
                    className="flex-[2] bg-primary hover:bg-primary/90 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3"
                  >
                    Accept Order ({requestTimers[request.id] || 0}s)
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Stats Grid - Recipe 1 (Technical Dashboard) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Today', value: `₹${earnings?.daily || 0}`, icon: TrendingUp, color: 'text-green-500' },
              { label: 'Weekly', value: `₹${earnings?.weekly || 0}`, icon: Calendar, color: 'text-blue-500' },
              { label: 'Trips', value: earnings?.totalTrips || 0, icon: Package, color: 'text-orange-500' },
              { label: 'Rating', value: currentUser?.rating || '5.0', icon: Bell, color: 'text-yellow-500' }
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -4 }}
                className="bg-white p-5 rounded-[32px] border border-gray-100 shadow-sm"
              >
                <div className={`w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{stat.label}</p>
                <h3 className="text-xl font-black text-dark tracking-tight">{stat.value}</h3>
              </motion.div>
            ))}
          </div>

          {/* Active Deliveries - Recipe 8 (Clean Utility) */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-dark tracking-tight">Active Deliveries</h2>
              <div className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {activeDeliveries.length} Active
              </div>
            </div>

            {activeDeliveries.length === 0 ? (
              <div className="bg-white rounded-[40px] p-20 text-center border border-dashed border-gray-200">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package className="w-10 h-10 text-gray-200" />
                </div>
                <h3 className="text-lg font-bold text-dark mb-2">No active orders</h3>
                <p className="text-sm text-gray-400 font-medium">New orders will appear here once accepted.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {activeDeliveries.map((order) => (
                  <motion.div 
                    layout
                    key={order.id} 
                    className="bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                          <Package className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Order ID</p>
                          <h4 className="text-sm font-black text-dark">#{order.id.toString().slice(-6)}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Earnings</p>
                        <h4 className="text-lg font-black text-primary">₹{order.totalAmount}</h4>
                      </div>
                    </div>
                    
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <Store className="w-6 h-6 text-orange-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Pickup</p>
                          <h4 className="text-base font-bold text-dark truncate">{order.restaurantName}</h4>
                          <p className="text-xs text-gray-500 font-medium mt-1">{order.restaurantAddress}</p>
                          <button className="mt-3 flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-widest">
                            <Navigation className="w-3 h-3" /> Get Directions
                          </button>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-blue-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Delivery</p>
                          <h4 className="text-base font-bold text-dark truncate">{order.customerName}</h4>
                          <p className="text-xs text-gray-500 font-medium mt-1">{order.deliveryAddress}</p>
                          <div className="flex gap-4 mt-3">
                            <button className="flex items-center gap-2 text-[10px] text-green-600 font-black uppercase tracking-widest">
                              <Phone className="w-3 h-3" /> Call Customer
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-gray-50/50 border-t border-gray-50">
                      {order.status === 'READY' ? (
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'DISPATCHED')}
                          className="w-full bg-dark text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-3 shadow-xl shadow-dark/10"
                        >
                          <Package className="w-5 h-5" />
                          Confirm Pickup
                        </button>
                      ) : order.status === 'DISPATCHED' ? (
                        <button 
                          onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                          className="w-full bg-green-600 text-white py-5 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-green-600/10"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                          Complete Delivery
                        </button>
                      ) : (
                        <div className="w-full bg-white border border-gray-200 text-gray-400 py-5 rounded-3xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3">
                          <Clock className="w-5 h-5 animate-spin" />
                          Order is being prepared
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right Column: Earnings & History */}
        <div className="space-y-8">
          
          {/* Earnings Card - Recipe 4 (Dark Luxury) */}
          <div className="bg-dark text-white rounded-[40px] p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/20 rounded-full blur-3xl"></div>
            
            <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-2">Available Balance</p>
            <h2 className="text-5xl font-black tracking-tighter mb-8">₹{earnings?.monthly.toLocaleString()}</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-gray-400">Tips</span>
                </div>
                <span className="text-sm font-black text-green-400">₹{earnings?.totalTips || 0}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-bold text-gray-400">Fees</span>
                </div>
                <span className="text-sm font-black text-red-400">₹{earnings?.totalDeductions || 0}</span>
              </div>
            </div>

            <button className="w-full mt-8 bg-white text-dark py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all">
              Withdraw Funds
            </button>
          </div>

          {/* Trip History - Recipe 1 (Technical Dashboard) */}
          <section className="bg-white rounded-[40px] p-8 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black text-dark tracking-tight">Recent Trips</h2>
              <button 
                onClick={() => setActiveTab(activeTab === 'history' ? 'trips' : 'history')}
                className="text-[10px] text-primary font-black uppercase tracking-widest"
              >
                View All
              </button>
            </div>

            <div className="space-y-6">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Package className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-dark">{trip.restaurantName}</h4>
                      <p className="text-[10px] text-gray-400 font-medium">
                        {new Date(trip.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-dark">₹{trip.payout}</p>
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{trip.distance}km</p>
                  </div>
                </div>
              ))}
              
              {trips.length === 0 && (
                <p className="text-center text-xs text-gray-400 font-medium py-10">No trips recorded yet.</p>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DeliveryDashboard;
