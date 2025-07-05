import React, { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, ArrowRight } from 'lucide-react';

interface DropoffData {
  page: string;
  dropRate: number;
}

interface DropoffSummaryData {
  data: DropoffData[];
}

export const DropoffInsightsCard: React.FC = () => {
  const [data, setData] = useState<DropoffData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDropoffData = async () => {
      try {
        const response = await fetch('/api/stats/dropoff-summary');
        const result: DropoffSummaryData = await response.json();
        setData(result.data || []);
      } catch (error) {
        console.error('Failed to fetch dropoff data:', error);
        // Mock data
        setData([
          { page: "/signup", dropRate: 43.2 },
          { page: "/checkout", dropRate: 31.8 },
          { page: "/pricing", dropRate: 21.7 },
          { page: "/product-detail", dropRate: 18.5 },
          { page: "/cart", dropRate: 15.3 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDropoffData();
    const interval = setInterval(fetchDropoffData, 60000); // 1분마다 갱신
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="text-center text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>이탈률 데이터가 없습니다</p>
        </div>
      </div>
    );
  }

  const topDropoff = data[0]; // 가장 이탈률이 높은 페이지
  const top3 = data.slice(0, 3);

  const getPageDisplayName = (page: string) => {
    const pageNames: { [key: string]: string } = {
      '/signup': '회원가입',
      '/checkout': '결제',
      '/pricing': '요금제',
      '/product-detail': '상품상세',
      '/cart': '장바구니',
      '/login': '로그인',
      '/profile': '프로필',
      '/settings': '설정'
    };
    return pageNames[page] || page;
  };

  const getDropoffColor = (rate: number) => {
    if (rate >= 40) return 'text-red-600';
    if (rate >= 25) return 'text-orange-600';
    if (rate >= 15) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getDropoffBgColor = (rate: number) => {
    if (rate >= 40) return 'bg-red-50';
    if (rate >= 25) return 'bg-orange-50';
    if (rate >= 15) return 'bg-yellow-50';
    return 'bg-green-50';
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-50 rounded-lg">
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">이탈률 인사이트</h3>
            <p className="text-sm text-gray-500">UX 개선을 위한 분석</p>
          </div>
        </div>
      </div>

      {/* 주요 이탈률 강조 */}
      <div className={`mb-6 p-4 rounded-xl ${getDropoffBgColor(topDropoff.dropRate)} border border-red-100`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-gray-600">최고 이탈률</span>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {getPageDisplayName(topDropoff.page)}
            </div>
            <div className="text-sm text-gray-500">
              {topDropoff.page}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-4xl font-bold ${getDropoffColor(topDropoff.dropRate)}`}>
              {topDropoff.dropRate}%
            </div>
            <div className="text-sm text-gray-500">이탈률</div>
          </div>
        </div>
      </div>

      {/* TOP 3 리스트 */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">개선 우선순위</h4>
        {top3.map((item, index) => (
          <div 
            key={item.page}
            className={`flex items-center justify-between p-3 rounded-lg border transition-colors duration-200 ${
              index === 0 
                ? 'bg-red-50 border-red-200' 
                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-300 text-gray-700'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {getPageDisplayName(item.page)}
                </div>
                <div className="text-sm text-gray-500">
                  {item.page}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${getDropoffColor(item.dropRate)}`}>
                {item.dropRate}%
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}; 