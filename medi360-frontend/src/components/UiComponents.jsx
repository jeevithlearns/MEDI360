import React from 'react';

export function StatCard({ title, value, icon: Icon, colorClass, subtitle }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      {/* Decorative gradient blob */}
      <div className={`absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10 ${colorClass} group-hover:scale-110 transition-transform blur-2xl`}></div>
      
      <div className="flex justify-between items-start relative z-10">
        <div>
          <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
          </div>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>
        
        <div className={`p-4 rounded-xl shadow-sm ${colorClass} bg-opacity-10 text-white`}>
          {Icon && <Icon className="text-2xl" />}
        </div>
      </div>
    </div>
  );
}

export function SectionHeader({ title, description, action }) {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
        {description && <p className="text-gray-500 mt-1">{description}</p>}
      </div>
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}

export function ChartCard({ title, children, action }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        {action}
      </div>
      <div className="flex-grow w-full h-full min-h-[200px] h-[250px] overflow-hidden">
        {children}
      </div>
    </div>
  );
}
