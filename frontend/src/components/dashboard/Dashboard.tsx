import React, { useState } from 'react';
import { StatCard } from '../ui/StatCard';
import { VisitorChart } from './VisitorChart';
import { FilterTabs } from './FilterTabs';
import { ExitPageChart } from './ExitPageChart';
import { PageTimeChart } from './PageTimeChart';
import { mockDashboardData } from '../../data/mockData';
import { BarChart3, Users, TrendingUp, Clock } from 'lucide-react';

// 타입 정의를 직접 포함
interface FilterOptions {
  period: 'today' | 'week' | 'month' | 'year';
  gender: 'all' | 'male' | 'female';
  ageGroup: 'all' | '10s' | '20s' | '30s' | '40s' | '50s+';
}

export const Dashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    period: 'week',
    gender: 'all',
    ageGroup: 'all'
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary-600 rounded-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">KlickLab</h1>
                <p className="text-sm text-gray-600">사용자 행동 분석 대시보드</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">마지막 업데이트</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date().toLocaleString('ko-KR')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 필터 */}
        <div className="mb-8">
          <FilterTabs filters={filters} onFilterChange={handleFilterChange} />
        </div>

        {/* 통계 카드 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">주요 통계</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockDashboardData.stats.map((stat, index) => (
              <StatCard key={index} data={stat} />
            ))}
          </div>
        </div>

        {/* 방문자 추이 차트 */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">방문자 추이</h2>
          </div>
          <VisitorChart data={mockDashboardData.visitorTrend} />
        </div>

        {/* 차트 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 이탈 페이지 분석 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">이탈 페이지 분석</h2>
            </div>
            <ExitPageChart data={mockDashboardData.exitPages} />
          </div>

          {/* 페이지별 체류시간 */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">페이지별 체류시간</h2>
            </div>
            <PageTimeChart data={mockDashboardData.pageTimes} />
          </div>
        </div>
      </main>
    </div>
  );
}; 