import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, ArrowRight, User, Phone, Mail, ShieldCheck } from 'lucide-react';
import { registerDelivery } from '../../src/rider/api';
import { useToast } from '../../context/ToastContext';
import { motion } from 'motion/react';

const RiderRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [riderForm, setRiderForm] = useState({
    name: '',
    email: '',
    phone: '',
    vehicleType: '',
    vehicleNumber: '',
    drivingLicense: ''
  });

  const handleRiderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await registerDelivery(riderForm);
      showToast('Rider registration successful!', 'success');
      navigate('/delivery/dashboard');
    } catch (error) {
      showToast('Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Rider Registration</h1>
      <form onSubmit={handleRiderSubmit} className="space-y-4">
        <input type="text" placeholder="Name" value={riderForm.name} onChange={e => setRiderForm({...riderForm, name: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="email" placeholder="Email" value={riderForm.email} onChange={e => setRiderForm({...riderForm, email: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="tel" placeholder="Phone" value={riderForm.phone} onChange={e => setRiderForm({...riderForm, phone: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Vehicle Type" value={riderForm.vehicleType} onChange={e => setRiderForm({...riderForm, vehicleType: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Vehicle Number" value={riderForm.vehicleNumber} onChange={e => setRiderForm({...riderForm, vehicleNumber: e.target.value})} className="w-full p-2 border rounded" required />
        <input type="text" placeholder="Driving License" value={riderForm.drivingLicense} onChange={e => setRiderForm({...riderForm, drivingLicense: e.target.value})} className="w-full p-2 border rounded" required />
        <button type="submit" className="w-full p-2 bg-primary text-white rounded" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
      </form>
    </div>
  );
};

export default RiderRegistration;
