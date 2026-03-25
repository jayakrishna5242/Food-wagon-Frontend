
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { motion, AnimatePresence } from 'framer-motion';

const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [earnings, setEarnings] = useState<EarningsSummary | null>(null);
  const [orderRequests, setOrderRequests] = useState<OrderRequest[]>([]);
  const [activeTab, setActiveTab] = useState<'trips' | 'history'>('trips');
  const [loading, setLoading] = useState(true);
  const [requestTimers, setRequestTimers] = useState<Record<number, number>>({});
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [expandedTrip, setExpandedTrip] = useState<number | null>(null);
  
  const currentUser = getStoredUser();

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
  }, [currentUser, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      setRequestTimers(prev => {
        const next = { ...prev };
        let changed = false;
        Object.keys(next).forEach(id => {
          const numId = Number(id);
          if (next[numId] > 0) {
            next[numId] -= 1;
            changed = true;
          } else {
            // Remove expired requests
            setOrderRequests(current => current.filter(r => r.id !== numId));
            delete next[numId];
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    clearStoredUser();
    logout();
    navigate('/login');
  };

  const handleStatusUpdate = async (orderId: number, status: Order['status']) => {
    try {
      await updateOrderStatus(orderId, status, currentUser?.id, currentUser?.name);
      showToast(`Order status updated to ${status}`, 'success');
      loadData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  const handleAcceptRequest = async (requestId: number) => {
    if (!currentUser) return;
    try {
      await acceptOrderRequest(requestId, currentUser.id);
      showToast('Order accepted! Head to the restaurant.', 'success');
      setOrderRequests(prev => prev.filter(r => r.id !== requestId));
      loadData();
    } catch (err) {
      showToast('Failed to accept order', 'error');
    }
  };

  const handleRejectRequest = async (requestId: number) => {
    if (!currentUser) return;
    try {
      await rejectOrderRequest(requestId, currentUser.id);
      setOrderRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      showToast('Failed to reject order', 'error');
    }
  };

  const activeDeliveries = orders.filter(o => o.status === 'READY' || o.status === 'DISPATCHED');

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
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 p-4 md:p-6 sticky top-0 z-50">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-black shadow-lg shadow-primary/20">
              {currentUser?.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-lg font-black text-dark tracking-tight">Hello, {currentUser?.name}</h1>
              <div className="flex items-center gap-2">
                <p className="text-[10px] text-green-600 font-black uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  Active & Online
                </p>
                {currentUser?.rating && (
                  <div className="flex items-center gap-0.5 bg-yellow-100 px-1.5 py-0.5 rounded text-[8px] font-black text-yellow-700">
                    <span>★</span>
                    <span>{currentUser.rating}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="container mx-auto max-w-2xl p-4 md:p-6 space-y-6">
        
        {/* Incoming Requests Overlay */}
        <AnimatePresence>
          {orderRequests.map(request => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-dark text-white rounded-[32px] p-6 shadow-2xl border border-white/10 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                <div className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse">
                  NEW REQUEST
                </div>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black tracking-tight">₹{request.payout} Payout</h3>
                  <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{request.distance} km trip</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Pickup</p>
                    <p className="text-sm font-bold">{request.restaurantName}</p>
                    <p className="text-xs text-gray-500">{request.restaurantAddress}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Delivery</p>
                    <p className="text-sm font-bold">{request.deliveryAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => handleRejectRequest(request.id)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                >
                  Reject
                </button>
                <button 
                  onClick={() => handleAcceptRequest(request.id)}
                  className="flex-[2] bg-primary hover:bg-primary/90 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                >
                  Accept ({requestTimers[request.id] || 0}s)
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {activeTab === 'trips' ? (
          <>
            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Today's Earnings</p>
                <h3 className="text-xl font-black text-dark">₹{earnings?.daily || 0}</h3>
                <div className="flex items-center gap-1 text-[10px] text-green-500 font-bold mt-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>+15% vs yesterday</span>
                </div>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Trips</p>
                <h3 className="text-xl font-black text-dark">{earnings?.totalTrips || 0}</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1">Keep it up!</p>
              </div>
            </div>

            {/* Active Deliveries */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-dark tracking-tight">Active Deliveries</h2>
                <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {activeDeliveries.length} Current
                </span>
              </div>

              {activeDeliveries.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-200">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-sm text-gray-400 font-bold">No active deliveries right now.</p>
                  <p className="text-[10px] text-gray-300 mt-1">Wait for new orders to be ready.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeDeliveries.map((order) => (
                    <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-dark">Order #{order.id.toString().slice(-6)}</span>
                          <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                            {order.status}
                          </span>
                        </div>
                        <span className="text-xs font-black text-primary">₹{order.totalAmount}</span>
                      </div>
                      
                      <div className="p-4 space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <Store className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Pickup From</p>
                            <h4 className="text-sm font-bold text-dark truncate">{order.restaurantName}</h4>
                            <p className="text-xs text-gray-500 font-medium truncate">Restaurant address location...</p>
                          </div>
                          <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <Navigation className="w-4 h-4 text-primary" />
                          </button>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-blue-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Deliver To</p>
                            <h4 className="text-sm font-bold text-dark truncate">{order.customerName}</h4>
                            <p className="text-xs text-gray-500 font-medium truncate">{order.deliveryAddress}</p>
                          </div>
                          <button className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                            <Phone className="w-4 h-4 text-green-500" />
                          </button>
                        </div>
                      </div>

                      <div className="p-4 bg-gray-50 flex gap-3">
                        {order.status === 'READY' ? (
                          <button 
                            onClick={() => handleStatusUpdate(order.id, 'DISPATCHED')}
                            className="flex-1 bg-dark text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all flex items-center justify-center gap-2"
                          >
                            <Package className="w-4 h-4" />
                            Pick Up Order
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleStatusUpdate(order.id, 'DELIVERED')}
                            className="flex-1 bg-green-600 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Mark Delivered
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <>
            {/* Earnings History */}
            <section className="space-y-6">
              <div className="bg-dark text-white rounded-[32px] p-8 shadow-xl">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Balance</p>
                    <h2 className="text-4xl font-black">₹{earnings?.monthly.toLocaleString()}</h2>
                  </div>
                  <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
                    <Wallet className="w-7 h-7 text-white" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Total Tips</p>
                    <p className="text-sm font-black text-green-400">₹{earnings?.totalTips || 0}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Deductions</p>
                    <p className="text-sm font-black text-red-400">₹{earnings?.totalDeductions || 0}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Daily</p>
                    <p className="text-sm font-black">₹{earnings?.daily}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Weekly</p>
                    <p className="text-sm font-black">₹{earnings?.weekly}</p>
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1">Trips</p>
                    <p className="text-sm font-black">{earnings?.totalTrips}</p>
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-black text-dark uppercase tracking-widest">Filter by Date</h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1 block">From</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-2 text-xs font-bold text-dark focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-1 block">To</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-gray-50 border-none rounded-xl p-2 text-xs font-bold text-dark focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                </div>
                {(startDate || endDate) && (
                  <button 
                    onClick={() => { setStartDate(''); setEndDate(''); }}
                    className="mt-3 text-[8px] text-primary font-black uppercase tracking-widest flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Clear Filters
                  </button>
                )}
              </div>

              <div>
                <h2 className="text-lg font-black text-dark tracking-tight mb-4">Trip History</h2>
                <div className="space-y-3">
                  {trips.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center border border-gray-100">
                      <Calendar className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-sm text-gray-400 font-bold">No trip history yet.</p>
                    </div>
                  ) : (
                    trips.map((trip) => (
                      <div key={trip.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div 
                          onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}
                          className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
                              <Package className="w-5 h-5 text-gray-400" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-dark">{trip.restaurantName}</h4>
                              <p className="text-[10px] text-gray-400 font-medium">
                                {new Date(trip.date).toLocaleDateString()} • {new Date(trip.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-sm font-black text-green-600">+₹{trip.payout}</p>
                              <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest">{trip.distance} km</p>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${expandedTrip === trip.id ? 'rotate-90' : ''}`} />
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedTrip === trip.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 border-t border-gray-50"
                            >
                              <div className="pt-4 space-y-4">
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="bg-gray-50 p-2 rounded-xl">
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Base Pay</p>
                                    <p className="text-xs font-bold text-dark">₹{trip.basePay || 40}</p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded-xl">
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Tips</p>
                                    <p className="text-xs font-bold text-green-600">₹{trip.tips || 0}</p>
                                  </div>
                                  <div className="bg-gray-50 p-2 rounded-xl">
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-widest mb-0.5">Deductions</p>
                                    <p className="text-xs font-bold text-red-500">₹{trip.deductions || 0}</p>
                                  </div>
                                </div>

                                <div className="space-y-2">
                                  <div className="flex items-start gap-2">
                                    <MapPin className="w-3 h-3 text-gray-300 mt-0.5" />
                                    <p className="text-[10px] text-gray-500 font-medium">{trip.deliveryAddress}</p>
                                  </div>
                                  {trip.rating && (
                                    <div className="bg-yellow-50 p-3 rounded-2xl border border-yellow-100">
                                      <div className="flex items-center gap-1 mb-1">
                                        {[...Array(5)].map((_, i) => (
                                          <span key={i} className={`text-xs ${i < (trip.rating || 0) ? 'text-yellow-500' : 'text-gray-200'}`}>★</span>
                                        ))}
                                        <span className="text-[10px] font-black text-yellow-700 ml-1">Customer Rating</span>
                                      </div>
                                      {trip.feedback && (
                                        <p className="text-[10px] text-yellow-800 italic font-medium">"{trip.feedback}"</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Mobile Bottom Nav - Specific for Delivery */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:hidden flex justify-around items-center z-50">
        <button 
          onClick={() => setActiveTab('trips')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'trips' ? 'text-primary' : 'text-gray-300'}`}
        >
          <Navigation className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Trips</span>
        </button>
        <button 
          onClick={() => setActiveTab('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === 'history' ? 'text-primary' : 'text-gray-300'}`}
        >
          <Clock className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">History</span>
        </button>
        <button 
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center gap-1 text-gray-300"
        >
          <User className="w-6 h-6" />
          <span className="text-[8px] font-black uppercase tracking-widest">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default DeliveryDashboard;
