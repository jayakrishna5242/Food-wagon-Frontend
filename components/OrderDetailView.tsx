import React from 'react';
import { X, MapPin } from 'lucide-react';
import { Order } from '../types';

interface OrderDetailViewProps {
  order: Order;
  onBack: () => void;
}

const OrderDetailView: React.FC<OrderDetailViewProps> = ({ order, onBack }) => {
  return (
    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-xl border border-gray-100 p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-dark tracking-tight">Order Details</h3>
          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Order #{order.id}</p>
        </div>
        <button 
          onClick={onBack} 
          className="p-3 hover:bg-gray-50 rounded-2xl transition-all text-gray-400 hover:text-dark border border-transparent hover:border-gray-100 shadow-sm"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="space-y-10">
        {/* Restaurant Info */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gray-50 overflow-hidden border border-gray-100 shadow-sm">
            <img src={order.restaurantImageUrl || (order.items && order.items[0]?.imageUrl)} alt="Restaurant" className="w-full h-full object-cover" />
          </div>
          <div>
            <h4 className="text-3xl font-black text-dark tracking-tight">{order.restaurantName}</h4>
            <p className="text-graytext flex items-center gap-1.5 text-sm mt-1.5 font-medium">
              <MapPin className="w-4 h-4 text-primary" /> {order.deliveryAddress}
            </p>
            <div className="flex items-center gap-3 mt-4">
              <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                order.status === 'DELIVERED' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'
              }`}>
                {order.status}
              </span>
              <span className="text-gray-200">•</span>
              <span className="text-xs text-gray-400 font-black uppercase tracking-widest">{new Date(order.date).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
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
            {order.items.map((item, idx) => (
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

        {/* Tracking Status */}
        <div>
          <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full"></div>
            Order Tracking
          </h5>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <div className="flex justify-between mb-3">
              {['Placed', 'Preparing', 'Dispatched', 'Delivered'].map((step, index) => {
                const currentStep = order.status === 'DELIVERED' ? 3 : order.status === 'PENDING' ? 1 : 0;
                return (
                  <span key={step} className={`text-[10px] font-black uppercase tracking-widest ${index <= currentStep ? 'text-primary' : 'text-gray-300'}`}>
                    {step}
                  </span>
                );
              })}
            </div>
            <div className="h-2 bg-gray-200 rounded-full flex">
              {['Placed', 'Preparing', 'Dispatched', 'Delivered'].map((_, index) => {
                const currentStep = order.status === 'DELIVERED' ? 3 : order.status === 'PENDING' ? 1 : 0;
                return (
                  <div key={index} className={`flex-1 ${index <= currentStep ? 'bg-primary' : 'bg-transparent'}`}></div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailView;
