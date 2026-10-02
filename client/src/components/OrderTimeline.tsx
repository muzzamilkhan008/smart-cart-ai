import React from 'react';
import { CheckCircle2, Clock, Truck, PackageCheck, AlertTriangle } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
}

const steps = [
  { key: 'Confirmed', label: 'Order Confirmed', icon: CheckCircle2 },
  { key: 'Processing', label: 'Processing', icon: Clock },
  { key: 'Shipped', label: 'Shipped', icon: Truck },
  { key: 'Out for Delivery', label: 'Out for Delivery', icon: Truck },
  { key: 'Delivered', label: 'Delivered', icon: PackageCheck },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ status }) => {
  if (status === 'Cancelled') {
    return (
      <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-3 text-rose-700 dark:text-rose-300">
        <AlertTriangle className="w-5 h-5 shrink-0" />
        <div>
          <h4 className="text-sm font-bold">Order Cancelled</h4>
          <p className="text-xs mt-0.5">This order has been cancelled and any reserved items were restored to inventory.</p>
        </div>
      </div>
    );
  }

  const getStepStatus = (stepKey: string) => {
    const orderFlow = ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered'];
    const currentIndex = orderFlow.indexOf(status);
    const stepIndex = orderFlow.indexOf(stepKey);

    if (currentIndex >= stepIndex) return 'completed';
    if (currentIndex === stepIndex - 1) return 'current';
    return 'upcoming';
  };

  return (
    <div className="py-6 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative">
        {steps.map((step, idx) => {
          const state = getStepStatus(step.key);
          const IconComponent = step.icon;

          return (
            <div key={step.key} className="flex-1 flex items-center md:flex-col md:text-center gap-3 w-full relative z-10">
              {/* Connector line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-4 left-[50%] w-full h-0.5 bg-slate-200 dark:bg-slate-800 -z-10">
                  <div
                    className={`h-full bg-brand-600 transition-all duration-500 ${
                      state === 'completed' ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}

              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 shadow-md ${
                  state === 'completed'
                    ? 'bg-brand-600 text-white ring-4 ring-brand-100 dark:ring-brand-950'
                    : state === 'current'
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 dark:ring-amber-950 animate-pulse'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                }`}
              >
                <IconComponent className="w-4 h-4" />
              </div>

              <div>
                <span
                  className={`text-xs font-semibold block ${
                    state === 'completed' || state === 'current'
                      ? 'text-slate-900 dark:text-white font-bold'
                      : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
