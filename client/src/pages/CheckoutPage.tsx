import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, CreditCard, Truck, ArrowRight, Lock, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Order } from '../types';

export const CheckoutPage: React.FC = () => {
  const { items, summary, refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [placingOrder, setPlacingOrder] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('123 Tech Park Road, Sector 5');
  const [city, setCity] = useState('Bengaluru');
  const [state, setState] = useState('Karnataka');
  const [postalCode, setPostalCode] = useState('560001');
  const [country] = useState('India');

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Card'>('COD');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Order Completed State
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Your cart is empty</h2>
        <Link to="/shop" className="inline-block px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs">
          Return to Shop
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!fullName || !phone || !street || !city || !postalCode) {
      showToast('Please complete all required shipping address fields', 'error');
      return;
    }

    try {
      setPlacingOrder(true);
      const res = await api.placeOrder({
        shippingAddress: {
          full_name: fullName,
          phone,
          street,
          city,
          state,
          postal_code: postalCode,
          country
        },
        paymentMethod
      });

      setCompletedOrder(res.order);
      await refreshCart();
      showToast('Order placed successfully!');
    } catch (err: any) {
      showToast(err.message || 'Failed to place order', 'error');
    } finally {
      setPlacingOrder(false);
    }
  };

  // Step 5 / Order Confirmation View
  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
            Order Confirmed
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-2">
            Thank You for Your Order!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Order Number: <span className="font-bold text-slate-900 dark:text-white">{completedOrder.order_number}</span>
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-left space-y-4 shadow-sm">
          <div className="flex justify-between items-center text-xs pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block">Estimated Delivery</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{completedOrder.estimated_delivery}</span>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block">Tracking Number</span>
              <span className="font-bold text-brand-600">{completedOrder.tracking_number}</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white">Ordered Items</h4>
            {completedOrder.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{item.quantity}x {item.product_name}</span>
                <span className="font-bold">₹{item.total.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
            <span>Total Paid</span>
            <span>₹{completedOrder.total_amount.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-4 pt-4">
          <Link
            to={`/orders/${completedOrder.id}`}
            className="px-6 py-3 rounded-2xl bg-brand-600 text-white font-bold text-xs shadow-lg hover:bg-brand-700 transition-colors"
          >
            Track Order Status
          </Link>
          <Link
            to="/shop"
            className="px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Stepper Bar */}
      <div className="flex items-center justify-between max-w-2xl mx-auto pb-6">
        {[
          { id: 1, name: 'Customer Info' },
          { id: 2, name: 'Shipping' },
          { id: 3, name: 'Review' },
          { id: 4, name: 'Payment' }
        ].map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === s.id
                  ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950'
                  : step > s.id
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
              }`}
            >
              {step > s.id ? <Check className="w-4 h-4" /> : s.id}
            </div>
            <span className={`text-xs font-bold hidden sm:inline ${step === s.id ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
              {s.name}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Container */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
          
          {/* Step 1: Customer Info */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 1: Customer Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
              </div>
              <button
                onClick={() => setStep(2)}
                disabled={!fullName || !phone}
                className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs disabled:opacity-50"
              >
                Next: Shipping Address
              </button>
            </div>
          )}

          {/* Step 2: Shipping Address */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 2: Shipping Address</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!street || !city || !postalCode}
                  className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs disabled:opacity-50"
                >
                  Next: Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Order Review */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 3: Review Order & Delivery</h2>
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs space-y-2">
                <p><span className="font-bold">Recipient:</span> {fullName} ({phone})</p>
                <p><span className="font-bold">Shipping Address:</span> {street}, {city}, {state} - {postalCode}, {country}</p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Items ({items.length})</h4>
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-xs py-1 border-b border-slate-100 dark:border-slate-800">
                    <span>{item.quantity}x {item.product.name}</span>
                    <span className="font-bold">₹{((item.product.effectivePrice || item.product.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-6 py-3 rounded-xl bg-brand-600 text-white font-bold text-xs"
                >
                  Next: Payment Method
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Payment Method */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Step 4: Select Payment Method</h2>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Truck className="w-6 h-6 text-brand-600 mb-2" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cash on Delivery (COD)</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pay in cash when delivered</p>
                </button>

                <button
                  onClick={() => setPaymentMethod('Card')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    paymentMethod === 'Card'
                      ? 'border-brand-600 bg-brand-50/50 dark:bg-brand-950/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <CreditCard className="w-6 h-6 text-indigo-600 mb-2" />
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Demo Card Payment</h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">Simulated instant gateway</p>
                </button>
              </div>

              {paymentMethod === 'Card' && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-emerald-500" /> Demo Payment Gate (No real money charged)
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full p-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="p-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl"
                    />
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="p-2.5 text-xs bg-white dark:bg-slate-900 border rounded-xl"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep(3)}
                  className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={placingOrder}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-accent-600 text-white font-bold text-xs shadow-xl hover:opacity-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {placingOrder ? 'Processing Order...' : `Place Order (₹${summary.total.toLocaleString('en-IN')})`}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Order Summary Side Card */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xl space-y-4 h-fit">
          <h3 className="text-base font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3">
            Summary ({summary.itemCount} items)
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="font-bold text-slate-900 dark:text-white">₹{summary.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Shipping Fee</span>
              <span className="font-bold text-emerald-600">{summary.shippingFee === 0 ? 'FREE' : `₹${summary.shippingFee}`}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Total Pay</span>
              <span className="text-brand-600">₹{summary.total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
