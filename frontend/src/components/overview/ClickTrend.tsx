import React, { useState, useEffect, useMemo } from 'react';
import { Activity } from 'lucide-react';
import { subMinutes, eachMinuteOfInterval, format } from 'date-fns';

interface TrendDataPoint {
  time: string; // 'HH:mm'
  count: number;
}

interface ClickTrendData {
  data: TrendDataPoint[];
}

interface ClickTrendProps {
  period?: number; // 단위: 분 (기본 60)
  step?: number;   // 단위: 분 (기본 5)
}

export const ClickTrend: React.FC<ClickTrendProps> = ({ period = 60, step = 5 }) => {
  const [data, setData] = useState<TrendDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredPoint, setHoveredPoint] = useState<TrendDataPoint | null>(null);

  // 최근 period(분) 기준 5분 단위 타임슬롯 생성
  const timeBins = useMemo(() => {
    const start = subMinutes(new Date(), period);
    const points = eachMinuteOfInterval({ start, end: new Date() }, { step });
    return points.map((d: Date) => format(d, 'HH:mm'));
  }, [period, step]);

  useEffect(() => {
    const fetchClickTrend = async () => {
      try {
        // period, step을 쿼리로 넘길 수 있도록
        const response = await fetch(`http://localhost:3000/api/stats/click-trend?period=${period}&step=${step}`);
        const result: ClickTrendData = await response.json();
        setData(result.data || []);
      } catch (error) {
        // Fallback: mockData (랜덤)
        const mockData: TrendDataPoint[] = timeBins.map((time: string, idx: number) => {
          // 최근일수록 클릭이 많아지는 패턴
          let baseCount = 30 + Math.floor(idx * 2);
          if (idx > timeBins.length * 0.7) baseCount += 40;
          if (idx > timeBins.length * 0.9) baseCount += 30;
          const randomVariation = Math.random() * 30 - 15;
          return {
            time,
            count: Math.max(0, Math.round(baseCount + randomVariation))
          };
        });
        setData(mockData);
      } finally {
        setLoading(false);
      }
    };
    fetchClickTrend();
    const interval = setInterval(fetchClickTrend, 30000);
    return () => clearInterval(interval);
  }, [period, step, timeBins]);

  // 빈 구간 보완
  const filledData = useMemo(() => {
    return timeBins.map((bin: string) => data.find((d: TrendDataPoint) => d.time === bin) || { time: bin, count: 0 });
  }, [data, timeBins]);

  // 평균값 계산 (강조용)
  const avg = useMemo(() => filledData.reduce((sum: number, d: TrendDataPoint) => sum + d.count, 0) / (filledData.length || 1), [filledData]);

  // 차트 계산
  const chartData = useMemo(() => {
    if (filledData.length === 0) return null;
    const maxCount = Math.max(...filledData.map((d: TrendDataPoint) => d.count));
    const minCount = Math.min(...filledData.map((d: TrendDataPoint) => d.count));
    const range = maxCount - minCount || 1;
    return { maxCount, minCount, range };
  }, [filledData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }
  if (!chartData || filledData.length === 0) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">데이터가 없습니다</div>
      </div>
    );
  }
  const { maxCount, minCount, range } = chartData;

  // 차트 크기
  const width = 600;
  const height = 200;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // SVG 좌표 변환
  const getPoint = (point: TrendDataPoint, index: number) => {
    const x = padding + (index / (filledData.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((point.count - minCount) / range) * chartHeight;
    return { x, y };
  };

  // 곡선 path 생성 (Cubic Bezier)
  const createCurvePath = () => {
    if (filledData.length < 2) return '';
    const points = filledData.map((point, idx) => getPoint(point, idx));
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    return d;
  };

  // Y축 라벨
  const getYAxisLabels = (): { ratio: number; value: number }[] => {
    const labels: { ratio: number; value: number }[] = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      const ratio = i / steps;
      const value = Math.round(minCount + (1 - ratio) * range);
      labels.push({ ratio, value });
    }
    return labels;
  };

  // X축 라벨 (시작, 중간, 끝 등 5~6개만)
  const getXAxisLabels = (): TrendDataPoint[] => {
    const count = filledData.length;
    const labelCount = Math.min(6, count);
    const step = Math.max(1, Math.floor(count / (labelCount - 1)));
    return filledData.filter((_: TrendDataPoint, idx: number) => idx % step === 0 || idx === count - 1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">클릭 트렌드 (5분 단위 집계)</h3>
        <div className="flex items-center gap-2">
          <Activity className="w-3 h-3 text-green-500 animate-pulse" />
          <span className="text-xs text-gray-500">실시간</span>
        </div>
      </div>
      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-48"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <pattern id="grid" width="60" height="40" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 40" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          {/* Y축 라벨 */}
          {getYAxisLabels().map(({ ratio, value }: { ratio: number; value: number }, index: number) => {
            const y = padding + ratio * chartHeight;
            return (
              <g key={index}>
                <line
                  x1={padding}
                  y1={y}
                  x2={width - padding}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
                <text
                  x={padding - 10}
                  y={y + 4}
                  textAnchor="end"
                  fill="#6b7280"
                  fontSize="18"
                  fontWeight="500"
                >
                  {value}
                </text>
              </g>
            );
          })}
          {/* X축 라벨 */}
          {getXAxisLabels().map((point: TrendDataPoint, index: number) => {
            const pointIndex = filledData.findIndex((d: TrendDataPoint) => d.time === point.time);
            const x = padding + (pointIndex / (filledData.length - 1)) * chartWidth;
            return (
              <text
                key={index}
                x={x}
                y={height - 10}
                textAnchor="middle"
                fill="#6b7280"
                fontSize="18"
                fontWeight="500"
              >
                {point.time}
              </text>
            );
          })}
          {/* 곡선 라인 차트 */}
          <path
            d={createCurvePath()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            className="transition-all duration-300"
          />
          {/* 데이터 포인트 */}
          {filledData.map((point: TrendDataPoint, index: number) => {
            const { x, y } = getPoint(point, index);
            const isHighlight = point.count >= avg * 2 && point.count > 0;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={isHighlight ? '#ef4444' : '#3b82f6'}
                className="transition-all duration-200 cursor-pointer hover:r-6"
                onMouseEnter={() => setHoveredPoint(point)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
          {/* 호버 툴팁 */}
          {hoveredPoint && (
            <g>
              <foreignObject
                x={getPoint(hoveredPoint, filledData.findIndex((d: TrendDataPoint) => d.time === hoveredPoint.time)).x - 40}
                y={getPoint(hoveredPoint, filledData.findIndex((d: TrendDataPoint) => d.time === hoveredPoint.time)).y - 48}
                width="80"
                height="40"
              >
                <div className="px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg font-medium flex flex-col items-center justify-center" style={{ minWidth: 56, fontSize: 12 }}>
                  <div>{hoveredPoint.time}</div>
                  <div>{hoveredPoint.count}회</div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{step}분 단위 집계</span>
        <span>총 {filledData.length}개 데이터 포인트</span>
      </div>
    </div>
  );
}; 