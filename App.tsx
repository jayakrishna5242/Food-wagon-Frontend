
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Home from './pages/user/Home';
import RestaurantDetail from './pages/user/RestaurantDetail';
import Cart from './pages/user/Cart';
import Login from './pages/user/Login';
import ForgotPassword from './pages/user/ForgotPassword';
import Profile from './pages/user/Profile';
import Search from './pages/user/Search';
import Restaurants from './pages/user/Restaurants';
import PartnerDashboard from './pages/partner/PartnerDashboard';
import AboutUs from './pages/user/AboutUs';
import OrderRating from './pages/user/OrderRating';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { AddressProvider } from './context/AddressContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';

import AdminDashboard from './pages/admin/AdminDashboard';
import DeliveryDashboard from './pages/rider/DeliveryDashboard';
import PartnerRegistration from './pages/partner/PartnerRegistration';
import FreshStores from './pages/user/FreshStores';
import Supermarket from './pages/user/Supermarket';
import DeliveryService from './pages/rider/DeliveryService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!isLoading) {
      if (!user) {
        navigate('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.role)) {
        navigate('/');
      }
    }
  }, [user, isLoading, navigate, allowedRoles]);

  if (isLoading) return <div className="h-screen flex items-center justify-center font-bold text-primary animate-pulse">Loading...</div>;
  if (!user) return null;
  if (allowedRoles && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
};

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const hideNavFooterPaths: string[] = [];
  const shouldHide = hideNavFooterPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHide && <Navbar />}
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
      {!shouldHide && <BottomNav />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <FavoritesProvider>
          <CartProvider>
            <LocationProvider>
              <AddressProvider>
                <HashRouter>
                  <ScrollToTop />
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/restaurants" element={<Restaurants />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                      <Route path="/partner/dashboard" element={<ProtectedRoute allowedRoles={['PARTNER']}><PartnerDashboard /></ProtectedRoute>} />
                      <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
                      <Route path="/delivery/dashboard" element={<ProtectedRoute allowedRoles={['DELIVERY']}><DeliveryDashboard /></ProtectedRoute>} />
                      <Route path="/join-us" element={<PartnerRegistration />} />
                      <Route path="/fresh-stores" element={<FreshStores />} />
                      <Route path="/supermarket" element={<Supermarket />} />
                      <Route path="/delivery-service" element={<DeliveryService />} />
                      <Route path="/about" element={<AboutUs />} />
                      <Route path="/order-rating/:orderId" element={<OrderRating />} />
                    </Routes>
                  </Layout>
                </HashRouter>
              </AddressProvider>
            </LocationProvider>
          </CartProvider>
        </FavoritesProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
