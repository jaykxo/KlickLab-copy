import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

interface TopClickItem {
  label: string;
  count: number;
}

interface TopClicksData {
  items: TopClickItem[];
}

export const TopClicks: React.FC = () => {
  const [data, setData] = useState<TopClickItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopClicks = async () => {
      try {
        // const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`/api/stats/top-clicks`);
        const result: TopClicksData = await response.json();
        setData(result.items || []);
      } catch (error) {
        console.error('Failed to fetch top clicks:', error);
        // Fallback to mock data
        setData([
          { label: '구매하기', count: 1203 },
          { label: '장바구니', count: 987 },
          { label: '로그인', count: 756 },
          { label: '검색', count: 543 },
          { label: '상품상세', count: 432 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopClicks();
    
    // 10초마다 데이터 갱신
    const interval = setInterval(fetchTopClicks, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(item => item.count));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Top 5 클릭</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-500">실시간</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
          const intensity = Math.max(0.3, percentage / 100); // 최소 30% 투명도
          
          return (
            <div 
              key={index} 
              className="relative"
              onMouseEnter={() => setHoveredItem(item.label)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {item.label}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.count.toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${percentage}%`,
                        opacity: intensity
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Hover Tooltip */}
              {hoveredItem === item.label && (
                <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                  <div className="font-medium">{item.label}</div>
                  <div>{item.count.toLocaleString()}회 클릭</div>
                  <div className="text-gray-300">
                    전체의 {((item.count / data.reduce((sum, d) => sum + d.count, 0)) * 100).toFixed(1)}%
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>총 클릭 수</span>
          <span className="font-medium">
            {data.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}; 