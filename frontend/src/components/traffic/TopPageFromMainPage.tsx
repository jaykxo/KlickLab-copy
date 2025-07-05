import React, { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';

interface PageClickData {
  id: string;
  name: string;
  page: string;
  clicks: number;
  uniqueClicks: number;
  clickRate: number; // 클릭률 (%)
  avgTimeToClick: number; // 평균 클릭까지 걸린 시간 (초)
  rank: number;
}

interface TopPageFromMainPageProps {
  data?: PageClickData[];
}

export const TopPageFromMainPage: React.FC<TopPageFromMainPageProps> = ({ data }) => {
  const [clickData, setClickData] = useState<PageClickData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchPageClicks = async () => {
      try {
        // API 호출 (실제 구현 시)
        // const response = await fetch(`http://localhost:3000/api/stats/main-page-navigation`);
        // const result = await response.json();
        // setClickData(result.items || []);
        
        // Mock data 사용
        const mockData: PageClickData[] = [
          {
            id: '1',
            name: '상품 목록 페이지',
            page: '/products',
            clicks: 1247,
            uniqueClicks: 892,
            clickRate: 85.2,
            avgTimeToClick: 3.2,
            rank: 1
          },
          {
            id: '2',
            name: '장바구니 페이지',
            page: '/cart',
            clicks: 892,
            uniqueClicks: 743,
            clickRate: 72.1,
            avgTimeToClick: 4.8,
            rank: 2
          },
          {
            id: '3',
            name: '상품 상세 페이지',
            page: '/product-detail',
            clicks: 743,
            uniqueClicks: 456,
            clickRate: 68.7,
            avgTimeToClick: 6.5,
            rank: 3
          },
          {
            id: '4',
            name: '로그인 페이지',
            page: '/login',
            clicks: 456,
            uniqueClicks: 234,
            clickRate: 45.3,
            avgTimeToClick: 2.1,
            rank: 4
          },
          {
            id: '5',
            name: '회원가입 페이지',
            page: '/register',
            clicks: 234,
            uniqueClicks: 189,
            clickRate: 42.8,
            avgTimeToClick: 4.3,
            rank: 5
          },
          {
            id: '6',
            name: '마이페이지',
            page: '/mypage',
            clicks: 189,
            uniqueClicks: 156,
            clickRate: 38.9,
            avgTimeToClick: 5.7,
            rank: 6
          },
          {
            id: '7',
            name: '검색 결과 페이지',
            page: '/search',
            clicks: 156,
            uniqueClicks: 123,
            clickRate: 28.5,
            avgTimeToClick: 1.8,
            rank: 7
          },
          {
            id: '8',
            name: '고객센터 페이지',
            page: '/support',
            clicks: 123,
            uniqueClicks: 98,
            clickRate: 22.3,
            avgTimeToClick: 2.4,
            rank: 8
          },
          {
            id: '9',
            name: '이벤트 페이지',
            page: '/events',
            clicks: 98,
            uniqueClicks: 76,
            clickRate: 18.7,
            avgTimeToClick: 3.1,
            rank: 9
          },
          {
            id: '10',
            name: '공지사항 페이지',
            page: '/notice',
            clicks: 76,
            uniqueClicks: 54,
            clickRate: 15.2,
            avgTimeToClick: 2.8,
            rank: 10
          }
        ];
        
        setClickData(mockData);
      } catch (error) {
        console.error('Failed to fetch page clicks:', error);
        // Fallback data
        setClickData([
          {
            id: '1',
            name: '상품 목록',
            page: '/products',
            clicks: 1203,
            uniqueClicks: 892,
            clickRate: 85.2,
            avgTimeToClick: 3.2,
            rank: 1
          },
          {
            id: '2',
            name: '장바구니',
            page: '/cart',
            clicks: 987,
            uniqueClicks: 743,
            clickRate: 72.1,
            avgTimeToClick: 4.8,
            rank: 2
          },
          {
            id: '3',
            name: '로그인',
            page: '/login',
            clicks: 756,
            uniqueClicks: 456,
            clickRate: 68.7,
            avgTimeToClick: 6.5,
            rank: 3
          },
          {
            id: '4',
            name: '검색 결과',
            page: '/search',
            clicks: 543,
            uniqueClicks: 234,
            clickRate: 45.3,
            avgTimeToClick: 2.1,
            rank: 4
          },
          {
            id: '5',
            name: '상품 상세',
            page: '/product-detail',
            clicks: 432,
            uniqueClicks: 189,
            clickRate: 42.8,
            avgTimeToClick: 4.3,
            rank: 5
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchPageClicks();
    
    // 10초마다 데이터 갱신
    const interval = setInterval(fetchPageClicks, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-gray-500">데이터 로딩 중...</div>
      </div>
    );
  }

  const maxClicks = Math.max(...clickData.map(item => item.clicks));
  const displayedData = showAll ? clickData : clickData.slice(0, 3);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">메인 페이지에서 이동하는 페이지 Top</h3>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-xs text-gray-500">실시간</span>
        </div>
      </div>
      
      <div className="space-y-3">
        {displayedData.map((item, index) => {
          const percentage = maxClicks > 0 ? (item.clicks / maxClicks) * 100 : 0;
          const intensity = Math.max(0.3, percentage / 100); // 최소 30% 투명도
          
          return (
            <div 
              key={item.id} 
              className="relative"
              onMouseEnter={() => setHoveredItem(item.name)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-600 text-xs font-bold rounded-full">
                  {index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.page}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {item.clicks.toLocaleString()}
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
              {hoveredItem === item.name && (
                <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-300">{item.page}</div>
                  <div>{item.clicks.toLocaleString()}회 클릭</div>
                  <div className="text-gray-300">
                    클릭률: {item.clickRate.toFixed(1)}%
                  </div>
                  <div className="text-gray-300">
                    평균 클릭 시간: {item.avgTimeToClick.toFixed(1)}초
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 토글 버튼 */}
      {clickData.length > 3 && (
        <div className="flex justify-center pt-2">
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 px-3 py-1 text-xs text-gray-600 hover:text-gray-800 transition-colors"
          >
            <span>{showAll ? '접기' : '더보기'}</span>
            <span className={`transform transition-transform duration-200 ${showAll ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
        </div>
      )}
      
      <div className="pt-2 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>총 클릭 수</span>
          <span className="font-medium">
            {clickData.reduce((sum, item) => sum + item.clicks, 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}; 