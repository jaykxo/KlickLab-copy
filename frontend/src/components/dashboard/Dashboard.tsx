import React, { useState, useEffect } from 'react';
import { StatCard } from '../ui/StatCard';
import { Sidebar } from '../ui/Sidebar';
import { VisitorChart } from './VisitorChart';
import { FilterTabs } from './FilterTabs';
import { ExitPageChart } from './ExitPageChart';
import { PageTimeChart } from './PageTimeChart';
import Test from './Test';
// import { mockDashboardData } from '../../data/mockData';
import type { DataTypes } from '../../data/types';
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

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const endpoint = import.meta.env.VITE_ENDPOINT;
  const [dashboardData, setdashboardData] = useState<DataTypes | null>(null);
  useEffect(() => {
    fetch(`http://${endpoint}:3000/api/analytics/getDashboardData`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("받은 데이터:", data);
        setdashboardData(data);
      })
      .catch((err) => {
        console.error("데이터 불러오기 실패:", err);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* 사이드바 */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 flex flex-col">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {activeTab === 'dashboard' && '대시보드'}
                  {activeTab === 'users' && '사용자 분석'}
                  {activeTab === 'traffic' && '트래픽 분석'}
                  {activeTab === 'engagement' && '참여도 분석'}
                  {activeTab === 'reports' && '리포트'}
                  {activeTab === 'settings' && '설정'}
                  {activeTab === 'test' && '데모용 테스트'}
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {activeTab === 'dashboard' && '전체 개요 및 주요 지표'}
                  {activeTab === 'users' && '사용자 행동 및 세그먼트 분석'}
                  {activeTab === 'traffic' && '방문자 추이 및 소스 분석'}
                  {activeTab === 'engagement' && '체류시간 및 참여도 분석'}
                  {activeTab === 'reports' && '상세 리포트 및 데이터 내보내기'}
                  {activeTab === 'settings' && '시스템 설정 및 계정 관리'}
                  {activeTab === 'test' && '차트 및 랭킹 데모'}
                </p>
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

        {/* 메인 콘텐츠 영역 */}
        <main className="flex-1 p-6">
          {/* 현재는 대시보드 탭만 구현 */}
          {activeTab === 'dashboard' && (
            <>
              {/* 필터 */}
              <div className="mb-8">
                <FilterTabs filters={filters} onFilterChange={handleFilterChange} />
              </div>

              {dashboardData && (
                <>
                  {/* 통계 카드 */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <Users className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">주요 통계</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dashboardData.stats.map((stat, index) => (
                        <StatCard key={index} data={stat} />
                      ))}
                    </div>
                  </div>

                  {/* 방문자 추이 */}
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-5 h-5 text-gray-600" />
                      <h2 className="text-lg font-semibold text-gray-900">방문자 추이</h2>
                    </div>
                    <VisitorChart data={dashboardData.visitorTrend} />
                  </div>

                  {/* 기타 차트 */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">이탈 페이지 분석</h2>
                      </div>
                      <ExitPageChart data={dashboardData.exitPages} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">페이지별 체류시간</h2>
                      </div>
                      <PageTimeChart data={dashboardData.pageTimes} />
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* Test 탭 */}
          {activeTab === 'test' && <Test />}

          {/* 다른 탭들은 향후 구현 예정 */}
          {activeTab !== 'dashboard' && activeTab !== 'test' && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'users' && '사용자 분석'}
                  {activeTab === 'traffic' && '트래픽 분석'}
                  {activeTab === 'engagement' && '참여도 분석'}
                  {activeTab === 'reports' && '리포트'}
                  {activeTab === 'settings' && '설정'}
                </h3>
                <p className="text-gray-500">
                  이 기능은 현재 개발 중입니다.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}; 