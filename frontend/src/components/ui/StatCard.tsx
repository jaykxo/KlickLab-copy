import React from 'react';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  UserMinus, 
  Smartphone,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import clsx from 'clsx';

// 타입 정의를 직접 포함
interface StatCardData {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

interface StatCardProps {
  data: StatCardData;
}

const iconMap = {
  Users,
  UserPlus,
  UserCheck,
  UserMinus,
  Smartphone
};

const colorMap = {
  blue: 'text-blue-600 bg-blue-50',
  green: 'text-green-600 bg-green-50',
  purple: 'text-purple-600 bg-purple-50',
  red: 'text-red-600 bg-red-50'
};

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const IconComponent = iconMap[data.icon as keyof typeof iconMap] || Users;
  
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const getChangeIcon = () => {
    switch (data.changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getChangeColor = () => {
    switch (data.changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="card hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className={clsx('p-2 rounded-lg', colorMap[data.color as keyof typeof colorMap])}>
              <IconComponent className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">{data.title}</h3>
          </div>
          
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatNumber(data.value)}
            </span>
            
            {data.change !== 0 && (
              <div className={clsx('flex items-center gap-1 text-sm font-medium', getChangeColor())}>
                {getChangeIcon()}
                <span>{Math.abs(data.change)}%</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 