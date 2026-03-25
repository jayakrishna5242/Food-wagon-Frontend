
import React from 'react';
import { CheckCircle2, TrendingUp, Wallet, Users, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Partner: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-[#0d0f17] text-white pt-20 pb-24 overflow-hidden">
        <div className="container mx-auto px-4 max-w-6xl relative z-10 flex flex-col md:flex-row items-center justify-between">
           <div className="md:w-1/2 mb-12 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-6">
                Partner with <span className="text-[#fc8019]">FoodWagon</span> <br/>
                at 0% commission
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-md">
                Join 100,000+ restaurants who trust us to grow their business.
              </p>
              <div className="flex gap-4">
                 <Link to="/partner/register" className="bg-[#fc8019] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#e66f0f] transition-colors shadow-lg shadow-orange-500/20">
                    Register Your Restaurant
                 </Link>
                 <Link to="/login" className="bg-white/10 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/20 transition-colors">
                    Login
                 </Link>
              </div>
           </div>
           
           <div className="md:w-1/2 relative">
             <div className="absolute inset-0 bg-[#fc8019] rounded-full filter blur-[100px] opacity-20"></div>
             <img 
               src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1974&auto=format&fit=crop" 
               alt="Restaurant Partner" 
               className="relative rounded-2xl shadow-2xl border-4 border-white/10 transform rotate-2 hover:rotate-0 transition-transform duration-500"
             />
           </div>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="bg-[#fc8019] py-8">
        <div className="container mx-auto px-4 max-w-6xl">
           <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
              <div>
                <div className="text-3xl font-extrabold">100+</div>
                <div className="text-sm font-medium opacity-90">Restaurant Partners</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold">10+</div>
                <div className="text-sm font-medium opacity-90">Cities</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold">30k+</div>
                <div className="text-sm font-medium opacity-90">Monthly Orders</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold">24x7</div>
                <div className="text-sm font-medium opacity-90">Support</div>
              </div>
           </div>
        </div>
      </div>

       {/* Why Partner */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">
            Why partner with this project?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Partner Workflow
              </h3>
              <p className="text-gray-500">
                Demonstrates how restaurants register, login,
                and manage their online presence.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Order Management
              </h3>
              <p className="text-gray-500">
                Learn how incoming orders, order status,
                and payouts are handled in real systems.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-shadow text-center">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Payments Logic
              </h3>
              <p className="text-gray-500">
                Simulates weekly settlements and revenue tracking
                for learning purposes.
              </p>
            </div>

          </div>
        </div>
      </div>


        {/* How it works */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How this module works
          </h2>

          <div className="space-y-8">

            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-[#fc8019] text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Register</h3>
                <p className="text-gray-500">
                  Partner registers using email, phone, and restaurant details.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-[#fc8019] text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Setup Menu</h3>
                <p className="text-gray-500">
                  Add menu items, prices, and availability through dashboard.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-10 h-10 bg-[#fc8019] text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Receive Orders</h3>
                <p className="text-gray-500">
                  Orders flow from customers → restaurant → delivery.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>


      {/* CTA Bottom */}
      <div className="bg-[#fc8019] py-16 text-center text-white px-4">
         <h2 className="text-3xl font-bold mb-6">Ready to grow your business?</h2>
         <button onClick={() => navigate('/partner/register')} className="bg-white text-[#fc8019] px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors shadow-xl">
            Get Started Today
         </button>
      </div>
    </div>
  );
};

export default Partner;