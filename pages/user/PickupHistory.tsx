import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Bike, History } from 'lucide-react';
import { fetchGenieBookings } from '../../services/api';
import { GenieBooking } from '../../types';

const PickupHistory: React.FC = () => {
  const [bookings, setBookings] = useState<GenieBooking[]>([]);

  useEffect(() => {
    const loadBookings = async () => {
      const data = await fetchGenieBookings();
      setBookings(data);
    };
    loadBookings();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white sticky top-20 z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <Link to="/delivery-service" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-dark" />
          </Link>
          <h1 className="text-xl font-bold text-dark">Pickup History</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
            <History className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-graytext font-medium">No pickup history found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-2xl ${booking.type === 'pickup' ? 'bg-pink-100 text-pink-600' : 'bg-orange-100 text-orange-600'}`}>
                    {booking.type === 'pickup' ? <Package className="w-6 h-6" /> : <Bike className="w-6 h-6" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark">{booking.type === 'pickup' ? 'Pick up & Drop' : 'Buy from Store'}</h4>
                    <p className="text-xs text-gray-500">{booking.pickupLocation} → {booking.dropLocation}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{new Date(booking.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                  booking.status === 'PENDING' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {booking.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PickupHistory;
