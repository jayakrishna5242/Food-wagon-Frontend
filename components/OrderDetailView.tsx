import React from 'react';
import { X, MapPin, CheckCircle2 } from 'lucide-react';
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
        {order.status !== 'CANCELLED' && (
          <div>
            <h5 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
              <div className="w-1 h-4 bg-primary rounded-full"></div>
              Order Tracking
            </h5>
            <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 relative">
              <div className="flex justify-between relative z-10">
                {['Placed', 'Preparing', 'Dispatched', 'Delivered'].map((step, index) => {
                  const statusSteps: Record<string, number> = {
                    'PENDING': 0,
                    'PREPARING': 1,
                    'READY': 1,
                    'DISPATCHED': 2,
                    'DELIVERED': 3
                  };
                  const currentStep = statusSteps[order.status] ?? -1;
                  const isActive = index <= currentStep;
                  
                  return (
                    <div key={step} className="flex flex-col items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-500 shadow-sm ${
                        isActive 
                          ? 'bg-primary border-orange-100 text-white' 
                          : 'bg-white border-gray-100 text-gray-300'
                      }`}>
                        {isActive && index < currentStep ? (
                          <CheckCircle2 className="w-5 h-5 !stroke-[3]" />
                        ) : (
                          <span className="text-[10px] font-black">{index + 1}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest text-center max-w-[60px] ${
                        isActive ? 'text-dark' : 'text-gray-300'
                      }`}>
                        {step}
                      </span>
                    </div>
                  );
                })}

                {/* Progress Line */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-gray-200 -z-10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-700 ease-out"
                    style={{ 
                      width: `${
                        order.status === 'DELIVERED' ? 100 : 
                        order.status === 'DISPATCHED' ? 66.6 : 
                        (order.status === 'PREPARING' || order.status === 'READY') ? 33.3 : 0
                      }%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {order.status === 'CANCELLED' && (
          <div className="bg-red-50 p-6 rounded-3xl border border-red-100 flex items-center gap-4">
             <div className="p-3 bg-red-100 rounded-2xl text-red-600">
               <X className="w-6 h-6" />
             </div>
             <div>
               <h5 className="font-black text-red-600 uppercase tracking-widest text-xs">Order Cancelled</h5>
               <p className="text-red-500/70 text-sm font-medium">This order was cancelled and will not be processed further.</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailView;
