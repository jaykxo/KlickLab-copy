import React, { useState } from 'react';
import { FileText, Download, Share2, Calendar } from 'lucide-react';
import { mockDashboardData } from '../../data/mockData';

// 타입 정의
interface FilterOptions {
  period: '1day' | '1week' | '1month' | '3months';
  format: 'table' | 'chart' | 'summary';
  export: 'pdf' | 'csv' | 'excel';
}

export const ReportDashboard: React.FC = () => {
  const [filters, setFilters] = useState<FilterOptions>({
    period: '1week',
    format: 'table',
    export: 'pdf'
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}...`);
    // 실제로는 API 호출로 파일 다운로드
  };

  const handleShare = () => {
    console.log('Sharing report...');
    // 실제로는 링크 생성 및 공유
  };

  return (
    <div className="space-y-8">
      {/* 필터 및 액션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">리포트 설정</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport(filters.export)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              내보내기
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              공유
            </button>
          </div>
        </div>
        <div className="flex gap-4">
          <select 
            value={filters.period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="1day">최근 1일</option>
            <option value="1week">최근 1주</option>
            <option value="1month">최근 1개월</option>
            <option value="3months">최근 3개월</option>
          </select>
          <select 
            value={filters.format}
            onChange={(e) => handleFilterChange('format', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="table">테이블 형식</option>
            <option value="chart">차트 형식</option>
            <option value="summary">요약 형식</option>
          </select>
          <select 
            value={filters.export}
            onChange={(e) => handleFilterChange('export', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="pdf">PDF</option>
            <option value="csv">CSV</option>
            <option value="excel">Excel</option>
          </select>
        </div>
      </div>

      {/* KPI 테이블 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">KPI 요약 테이블</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">지표</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">현재값</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">전일 대비</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">전주 대비</th>
              </tr>
            </thead>
            <tbody>
              {mockDashboardData.stats.slice(0, 4).map((stat, index) => (
                <tr key={index} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700">{stat.title}</td>
                  <td className="py-3 px-4 text-right font-medium text-gray-900">
                    {stat.value.toLocaleString()}
                  </td>
                  <td className={`py-3 px-4 text-right ${
                    stat.change > 0 ? 'text-green-600' : stat.change < 0 ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    {stat.change > 0 ? '+' : ''}{stat.change}%
                  </td>
                  <td className="py-3 px-4 text-right text-gray-500">
                    {Math.round(stat.change * 0.8)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 향후 구현 예정 컴포넌트들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* PDF 다운로드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Download className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">CSV 다운로드</h3>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            개발 중...
          </div>
        </div>

        {/* CSV 다운로드 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">no name</h3>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            개발 중...
          </div>
        </div>
      </div>
    </div>
  );
}; 