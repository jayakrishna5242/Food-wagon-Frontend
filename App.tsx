
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import RestaurantDetail from './pages/RestaurantDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Partner from './pages/Partner';
import PartnerDashboard from './pages/PartnerDashboard';
import AboutUs from './pages/AboutUs';
import OrderRating from './pages/OrderRating';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { LocationProvider } from './context/LocationContext';
import { AddressProvider } from './context/AddressContext';
import { ToastProvider } from './context/ToastContext';
import { FavoritesProvider } from './context/FavoritesContext';

import AdminDashboard from './pages/AdminDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import JoinWithUs from './pages/JoinWithUs';

const Layout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const hideNavFooterPaths = [
    '/login', 
    '/forgot-password', 
    '/partner/dashboard',
    '/admin/dashboard',
    '/delivery/dashboard',
    '/join-us'
  ];
  const shouldHide = hideNavFooterPaths.includes(location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      {!shouldHide && <Navbar />}
      <main className="flex-grow pb-20 md:pb-0">
        {children}
      </main>
      {!shouldHide && <Footer />}
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
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/search" element={<Search />} />
                      <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/partner" element={<Partner />} />
                      <Route path="/partner/dashboard" element={<PartnerDashboard />} />
                      <Route path="/admin/dashboard" element={<AdminDashboard />} />
                      <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
                      <Route path="/join-us" element={<JoinWithUs />} />
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
