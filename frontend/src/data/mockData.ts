// 타입 정의
export interface StatCardData {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

export interface VisitorData {
  date: string;
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
}

export interface ExitPageData {
  page: string;
  exitCount: number;
  percentage: number;
}

export interface PageTimeData {
  page: string;
  averageTime: number;
  visitCount: number;
}

export interface DeviceData {
  device: string;
  users: number;
  percentage: number;
}

export interface ClickRankingData {
  id: string;
  name: string;
  type: 'button' | 'link' | 'menu' | 'card' | 'banner';
  clicks: number;
  uniqueClicks: number;
  clickRate: number;
  avgTimeToClick: number;
  rank: number;
}

export interface DashboardData {
  stats: StatCardData[];
  visitorTrend: VisitorData[];
  exitPages: ExitPageData[];
  pageTimes: PageTimeData[];
  devices: DeviceData[];
  clickRanking: ClickRankingData[];
  userSegments?: any[];
  behaviorAnalytics?: any[];
  conversionFunnel?: any[];
  performanceMetrics?: any[];
  customReports?: any[];
  [key: string]: any;
}

// 각종 더미 데이터 import 또는 정의 생략 (본문에 다 포함되어 있음)

// 통합 mock 데이터 export
export const mockDashboardData: DashboardData = {
  stats: statsData,
  visitorTrend: visitorTrendData,
  exitPages: exitPageData,
  pageTimes: pageTimeData,
  devices: deviceData,
  clickRanking: clickRankingData,
  userSegments: userSegmentData,
  osDistribution: osDistributionData,
  browserDistribution: browserDistributionData,
  userBehavior: userBehaviorData,
  conversionFunnel: conversionFunnelData,
  performanceMetrics: performanceMetricsData,
  regionalData: regionalData,
  timeBasedData: timeBasedData
};

// 개별 데이터 export (필요시 사용)
export {
  statsData,
  visitorTrendData,
  exitPageData,
  pageTimeData,
  deviceData,
  clickRankingData,
  userSegmentData,
  osDistributionData,
  browserDistributionData,
  userBehaviorData,
  conversionFunnelData,
  performanceMetricsData,
  regionalData,
  timeBasedData,
  genderSegmentData,
  ageSegmentData,
  signupPathSegmentData,
  deviceSegmentData,
  genderSegmentGroupData,
  ageSegmentGroupData,
  signupPathSegmentGroupData,
  deviceSegmentGroupData
};

// 세그먼트 클릭 데이터 타입
export interface UserSegmentClickData {
  userId: string;
  gender: 'male' | 'female' | 'other';
  ageGroup: '10s' | '20s' | '30s' | '40s' | '50s' | '60s+';
  signupPath: 'google' | 'facebook' | 'email' | 'kakao' | 'naver' | 'direct' | 'instagram';
  device: 'mobile' | 'desktop' | 'tablet';
  clickCount: number;
  topElements: Array<{
    element: string;
    clicks: number;
    percentage: number;
  }>;
}

export interface SegmentGroupData {
  segmentValue: string;
  totalUsers: number;
  totalClicks: number;
  averageClicksPerUser: number;
  topElements: Array<{
    element: string;
    totalClicks: number;
    percentage: number;
    userCount: number;
  }>;
  userDistribution: {
    gender?: { [key: string]: number };
    ageGroup?: { [key: string]: number };
    signupPath?: { [key: string]: number };
    device?: { [key: string]: number };
  };
}
