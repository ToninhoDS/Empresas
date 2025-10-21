import React from 'react';
import { Users2, MessageSquare, Clock, CheckCircle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, className }) => (
  <div className={`bg-white rounded-lg p-4 shadow flex items-center justify-between ${className}`}>
    <div>
      <p className="text-sm text-gray-600">{title}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
    <div className="p-3 rounded-full bg-gray-100">
      {icon}
    </div>
  </div>
);

const DashboardStats: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatsCard
        title="Total de Mensagens"
        value="499"
        icon={<MessageSquare className="w-6 h-6 text-blue-600" />}
      />
      <StatsCard
        title="Mensagens não Lidas"
        value="10"
        icon={<Users2 className="w-6 h-6 text-yellow-600" />}
      />
      <StatsCard
        title="Em Atendimento"
        value="4"
        icon={<Clock className="w-6 h-6 text-orange-600" />}
      />
      <StatsCard
        title="Atendimentos Finalizados"
        value="3"
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
      />
    </div>
  );
};

export default DashboardStats; 