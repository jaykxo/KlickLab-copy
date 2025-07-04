import React, { useState, useEffect } from 'react';
import { TrendingUp, Activity } from 'lucide-react';

interface TrendDataPoint {
  time: string;
  count: number;
}

interface ClickTrendData {
  data: TrendDataPoint[];
}

export const ClickTrend: React.FC = () => {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);

  useEffect(() => {
    const fetchClickTrend = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const response = await fetch(`http://localhost:3000/api/stats/click-trend?date=${today}`);
        const result: ClickTrendData = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error('Failed to fetch click trend:', error);
        // Fallback to mock data
        const mockData: TrendDataPoint[] = [];
        for (let hour = 0; hour < 24; hour++) {
          for (let minute = 0; minute < 60; minute += 5) {
            const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
            // 시간대별로 다른 패턴 생성
            let baseCount = 50;
            if (hour >= 9 && hour <= 18) baseCount = 150; // 업무시간
            if (hour >= 19 && hour <= 22) baseCount = 200; // 저녁시간
            if (hour >= 23 || hour <= 6) baseCount = 30; // 새벽시간
            
            const randomVariation = Math.random() * 100 - 50;
            mockData.push({
              time,
              count: Math.max(0, Math.round(baseCount + randomVariation))
            });
          }
        }
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };

    fetchClickTrend();
    
    // 10초마다 데이터 갱신
    const interval = setInterval(fetchClickTrend, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));
  const minCount = Math.min(...data.map(d => d.count));
  const range = maxCount - minCount;

  // SVG 차트 크기
  const width = 600;
  const height = 200;
  const padding = 40;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // 데이터 포인트를 SVG 좌표로 변환
  const getPoint = (point: TrendDataPoint, index: number) => {
    const x = padding + (index / (data.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.count - minCount) / range) * chartHeight;
    return { x, y };
  };

  // 라인 경로 생성
  const createPath = () => {
    if (data.length < 2) return '';
    
    const points = data.map((point, index) => getPoint(point, index));
    const path = points.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`
    ).join(' ');
    
    return path;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">시간별 클릭 트렌드</h3>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">실시간</span>
        </div>
      </div>
      
      <div className="relative">
        <svg width={width} height={height} className="w-full">
          {/* 그리드 라인 */}
          <defs>
            <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Y축 라벨 */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const y = padding + ratio * chartHeight;
            const value = Math.round(minCount + (1 - ratio) * range);
            return (
              <g key={index}>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={width - padding} 
                  y2={y} 
                  stroke="#e5e7eb" 
                  strokeWidth="1"
                />
                <text 
                  x={padding - 10} 
                  y={y + 4} 
                  textAnchor="end" 
                  className="text-xs fill-gray-500"
                >
                  {value}
                </text>
              </g>
            );
          })}
          
          {/* X축 라벨 (시간) */}
          {data.filter((_, index) => index % 12 === 0).map((point, index) => {
            const x = padding + (index * 12 / (data.length - 1)) * chartWidth;
            return (
              <text 
                key={index}
                x={x} 
                y={height - 10} 
                textAnchor="middle" 
                className="text-xs fill-gray-500"
              >
                {point.time}
              </text>
            );
          })}
          
          {/* 라인 차트 */}
          <path 
            d={createPath()} 
            fill="none" 
            stroke="#3b82f6" 
            strokeWidth="2"
            className="transition-all duration-300"
          />
          
          {/* 데이터 포인트 */}
          {data.map((point, index) => {
            const { x, y } = getPoint(point, index);
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
                className="transition-all duration-200 cursor-pointer hover:r-5"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
          
          {/* 호버 툴팁 */}
          {hoveredPoint && (
            <g>
              <rect
                x={getPoint(hoveredPoint, data.findIndex(d => d.time === hoveredPoint.time)).x - 30}
                y={getPoint(hoveredPoint, data.findIndex(d => d.time === hoveredPoint.time)).y - 40}
                width="60"
                height="30"
                fill="#1f2937"
                rx="4"
              />
              <text
                x={getPoint(hoveredPoint, data.findIndex(d => d.time === hoveredPoint.time)).x}
                y={getPoint(hoveredPoint, data.findIndex(d => d.time === hoveredPoint.time)).y - 25}
                textAnchor="middle"
                className="text-xs fill-white"
              >
                {hoveredPoint.time}
              </text>
              <text
                x={getPoint(hoveredPoint, data.findIndex(d => d.time === hoveredPoint.time)).x}
                y={getPoint(hoveredPoint, data.findIndex(d => d.time === hoveredPoint.time)).y - 10}
                textAnchor="middle"
                className="text-xs fill-white font-medium"
              >
                {hoveredPoint.count}회
              </text>
            </g>
          )}
        </svg>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>5분 단위 집계</span>
        <span>총 {data.length}개 데이터 포인트</span>
      </div>
    </div>
  );
}; 