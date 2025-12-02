import React from 'react';
import { ClipboardList, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats;
}

const StatCard = ({ title, value, icon, color, subText }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color} text-white`}>
      {icon}
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
      {subText && <p className="text-xs text-slate-400 mt-1">{subText}</p>}
    </div>
  </div>
);

const DashboardStatsCards: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard 
        title="งานทั้งหมด" 
        value={stats.total} 
        icon={<ClipboardList size={24} />} 
        color="bg-blue-500" 
      />
      <StatCard 
        title="กำลังดำเนินการ" 
        value={stats.inProgress + stats.pending} 
        icon={<Clock size={24} />} 
        color="bg-amber-500"
        subText={`รอ ${stats.pending} / ทำ ${stats.inProgress}`}
      />
      <StatCard 
        title="เสร็จสิ้น" 
        value={stats.completed} 
        icon={<CheckCircle size={24} />} 
        color="bg-green-500" 
      />
      <StatCard 
        title="งานด่วน / เกินกำหนด" 
        value={stats.urgent} 
        icon={<AlertTriangle size={24} />} 
        color="bg-red-500" 
        subText={`เกินกำหนด ${stats.overdue} งาน`}
      />
    </div>
  );
};

export default DashboardStatsCards;