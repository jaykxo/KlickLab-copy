import React, { useState } from 'react';
import { Settings, Code, Globe, Users, Bell } from 'lucide-react';

// 타입 정의
interface DomainData {
  id: string;
  domain: string;
  status: 'active' | 'inactive' | 'pending';
  lastEvent: string;
  eventCount: number;
}

export const SettingsDashboard: React.FC = () => {
  const [domains, setDomains] = useState<DomainData[]>([
    {
      id: '1',
      domain: 'example.com',
      status: 'active',
      lastEvent: '2024-01-07 15:30:00',
      eventCount: 1247
    },
    {
      id: '2',
      domain: 'test-site.com',
      status: 'active',
      lastEvent: '2024-01-07 14:45:00',
      eventCount: 892
    }
  ]);

  const sdkCode = `
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://your-domain.com/analytics-sdk.js';
    script.async = true;
    document.head.appendChild(script);
    
    script.onload = function() {
      window.KlickLab.init({
        projectId: 'your-project-id',
        endpoint: 'https://your-api-endpoint.com'
      });
    };
  })();
</script>`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // 실제로는 토스트 메시지 표시
    console.log('Copied to clipboard');
  };

  return (
    <div className="space-y-8">
      {/* SDK 설치 가이드 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Code className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">SDK 설치 가이드</h2>
        </div>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            웹사이트에 아래 코드를 추가하여 이벤트 수집을 시작하세요.
          </p>
          <div className="relative">
            <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">
              <code>{sdkCode}</code>
            </pre>
            <button
              onClick={() => copyToClipboard(sdkCode)}
              className="absolute top-2 right-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
            >
              복사
            </button>
          </div>
        </div>
      </div>

      {/* 도메인 연동 리스트 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">도메인 연동 리스트</h2>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            도메인 추가
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">도메인</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">상태</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">마지막 이벤트</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">이벤트 수</th>
                <th className="text-center py-3 px-4 font-medium text-gray-900">액션</th>
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={domain.id} className="border-b border-gray-100">
                  <td className="py-3 px-4 text-gray-700 font-medium">{domain.domain}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      domain.status === 'active' ? 'bg-green-100 text-green-800' :
                      domain.status === 'inactive' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {domain.status === 'active' ? '활성' : 
                       domain.status === 'inactive' ? '비활성' : '대기중'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center text-gray-600">{domain.lastEvent}</td>
                  <td className="py-3 px-4 text-right text-gray-700">{domain.eventCount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">설정</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 향후 구현 예정 컴포넌트들 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 사용자 권한 관리 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">사용자 권한 관리</h3>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            개발 중...
          </div>
        </div>

        {/* 알림 설정 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">알림 설정</h3>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            개발 중...
          </div>
        </div>
      </div>
    </div>
  );
}; 