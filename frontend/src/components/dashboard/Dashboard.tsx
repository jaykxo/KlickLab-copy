import React, { useState, useEffect } from 'react';
import { StatCard } from '../ui/StatCard';
import { Sidebar } from '../ui/Sidebar';
import { VisitorChart } from './VisitorChart';
import { FilterTabs } from './FilterTabs';
import { ExitPageChart } from './ExitPageChart';
import { PageTimeChart } from './PageTimeChart';
import Test from './Test';
import type { DataTypes } from '../../data/types';
import { BarChart3, Users, TrendingUp, Clock } from 'lucide-react';

interface DashboardData {
  visitors: number;
  visitorsRate: number;
  clicks: number;
  clicksRate: number;
  topClicks: { target_text: string; cnt: number }[];
  clickTrend: { hour: string; cnt: number }[];
  summary: string;
}

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

  const [dashboardData, setdashboardData] = useState<DashboardData | null>(null);
  useEffect(() => {
    fetch(`/api/analytics/getDashboardData`, {
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
              {dashboardData && (
                <div className="max-w-2xl mx-auto mt-8 bg-white shadow-md rounded-xl p-6 space-y-6 border">
                  <h2 className="text-xl font-semibold border-b pb-2">📊 대시보드 요약</h2>
              
                  <div className="space-y-1">
                    <p>✅ <span className="font-medium">일일 방문자 수:</span> {dashboardData.visitors}</p>
                    <p className="text-sm text-gray-600 ml-5">
                      전일 대비{' '}
                      {isNaN(dashboardData.visitorsRate)
                        ? '데이터 없음'
                        : dashboardData.visitorsRate === 0
                        ? '변화 없음'
                        : (
                            <span className={dashboardData.visitorsRate > 0 ? 'text-green-500' : 'text-red-500'}>
                              {dashboardData.visitorsRate > 0
                                ? `▲${dashboardData.visitorsRate}% 증가`
                                : `▼${Math.abs(dashboardData.visitorsRate)}% 감소`}
                            </span>
                          )}
                    </p>

                    <p>✅ <span className="font-medium">일일 클릭 수:</span> {dashboardData.clicks}</p>
                    <p className="text-sm text-gray-600 ml-5">
                      전일 대비{' '}
                      {isNaN(dashboardData.clicksRate)
                        ? '데이터 없음'
                        : dashboardData.clicksRate === 0
                        ? '변화 없음'
                        : (
                            <span className={dashboardData.clicksRate > 0 ? 'text-green-500' : 'text-red-500'}>
                              {dashboardData.clicksRate > 0
                                ? `▲${dashboardData.clicksRate}% 증가`
                                : `▼${Math.abs(dashboardData.clicksRate)}% 감소`}
                            </span>
                          )}
                    </p>
                  </div>
              
                  <div>
                    <h3 className="text-lg font-semibold mt-4">🔥 Top 5 클릭 요소</h3>
                    <ul className="list-decimal list-inside">
                      {dashboardData.topClicks.map((item, i) => (
                        <li key={i}>
                          <span className="text-gray-800">'{item.target_text}'</span> — {item.cnt}회
                        </li>
                      ))}
                    </ul>
                  </div>
              
                  <div>
                    <h3 className="text-lg font-semibold mt-4">⏰ 시간대별 클릭 수</h3>
                    <ul className="space-y-1">
                      {dashboardData.clickTrend.map((item, i) => (
                        <li key={i}>
                          <span className="inline-block w-16 font-mono">{item.hour}</span> → {item.cnt}회
                        </li>
                      ))}
                    </ul>
                  </div>
              
                  <div>
                    <h3 className="text-lg font-semibold mt-4">📝 요약</h3>
                    <p className="bg-gray-100 rounded p-3 text-sm text-gray-700">{dashboardData.summary}</p>
                  </div>
                </div>
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