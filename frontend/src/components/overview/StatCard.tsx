import React from 'react';
import { 
  Users, 
  MousePointer,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import clsx from 'clsx';

// 타입 정의
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

export const StatCard: React.FC<StatCardProps> = ({ data }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users':
        return <Users className="w-5 h-5" />;
      case 'MousePointer':
        return <MousePointer className="w-5 h-5" />;
      default:
        return <Users className="w-5 h-5" />;
    }
  };

  const getChangeIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-4 h-4" />;
      case 'decrease':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Minus className="w-4 h-4" />;
    }
  };

  const getChangeColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-600';
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getBgColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50';
      case 'green':
        return 'bg-green-50';
      case 'purple':
        return 'bg-purple-50';
      case 'red':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getIconColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'text-blue-600';
      case 'green':
        return 'text-green-600';
      case 'purple':
        return 'text-purple-600';
      case 'red':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={clsx(
      'p-6 rounded-lg border border-gray-200',
      getBgColor(data.color)
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            'p-2 rounded-lg',
            getIconColor(data.color)
          )}>
            {getIcon(data.icon)}
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-600">{data.title}</h3>
            <p className="text-2xl font-bold text-gray-900">
              {data.title.includes('방문자') ? `${data.value.toLocaleString()}명` : `${data.value.toLocaleString()}회`}
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-4 flex items-center gap-2">
        {getChangeIcon(data.changeType)}
        <span className={clsx(
          'text-sm font-medium',
          getChangeColor(data.changeType)
        )}>
          {data.change > 0 ? '+' : ''}{data.change}%
        </span>
        <span className="text-sm text-gray-500">전일 대비</span>
      </div>
    </div>
  );
}; 