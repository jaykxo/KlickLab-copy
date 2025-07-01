// 타입 정의를 직접 포함
interface StatCardData {
  title: string;
  value: number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: string;
  color: string;
}

interface VisitorData {
  date: string;
  visitors: number;
  newVisitors: number;
  returningVisitors: number;
}

interface ExitPageData {
  page: string;
  exitCount: number;
  percentage: number;
}

interface PageTimeData {
  page: string;
  averageTime: number;
  visitCount: number;
}

interface DeviceData {
  device: string;
  users: number;
  percentage: number;
}

interface DashboardData {
  stats: StatCardData[];
  visitorTrend: VisitorData[];
  exitPages: ExitPageData[];
  pageTimes: PageTimeData[];
  devices: DeviceData[];
}

// 통계 카드 더미 데이터
const statsData: StatCardData[] = [
  {
    title: '일일 방문자',
    value: 1247,
    change: 12.5,
    changeType: 'increase',
    icon: 'Users',
    color: 'blue'
  },
  {
    title: '신규 사용자',
    value: 892,
    change: 8.2,
    changeType: 'increase',
    icon: 'UserPlus',
    color: 'green'
  },
  {
    title: '재방문자',
    value: 355,
    change: -3.1,
    changeType: 'decrease',
    icon: 'UserCheck',
    color: 'purple'
  },
  {
    title: '탈퇴자',
    value: 23,
    change: 0,
    changeType: 'neutral',
    icon: 'UserMinus',
    color: 'red'
  },
  {
    title: 'Android 사용자',
    value: 743,
    change: 15.3,
    changeType: 'increase',
    icon: 'Smartphone',
    color: 'green'
  },
  {
    title: 'iOS 사용자',
    value: 504,
    change: 5.7,
    changeType: 'increase',
    icon: 'Smartphone',
    color: 'blue'
  }
];

// 방문자 추이 더미 데이터 (최근 7일)
const visitorTrendData: VisitorData[] = [
  { date: '2024-01-01', visitors: 1150, newVisitors: 820, returningVisitors: 330 },
  { date: '2024-01-02', visitors: 1280, newVisitors: 890, returningVisitors: 390 },
  { date: '2024-01-03', visitors: 1420, newVisitors: 950, returningVisitors: 470 },
  { date: '2024-01-04', visitors: 1380, newVisitors: 920, returningVisitors: 460 },
  { date: '2024-01-05', visitors: 1560, newVisitors: 1050, returningVisitors: 510 },
  { date: '2024-01-06', visitors: 1680, newVisitors: 1120, returningVisitors: 560 },
  { date: '2024-01-07', visitors: 1247, newVisitors: 892, returningVisitors: 355 }
];

// 이탈 페이지 더미 데이터
const exitPageData: ExitPageData[] = [
  { page: '/products', exitCount: 156, percentage: 12.5 },
  { page: '/cart', exitCount: 89, percentage: 7.1 },
  { page: '/checkout', exitCount: 67, percentage: 5.4 },
  { page: '/login', exitCount: 45, percentage: 3.6 },
  { page: '/register', exitCount: 34, percentage: 2.7 },
  { page: '/about', exitCount: 23, percentage: 1.8 },
  { page: '/contact', exitCount: 18, percentage: 1.4 }
];

// 페이지별 체류시간 더미 데이터
const pageTimeData: PageTimeData[] = [
  { page: '/home', averageTime: 2.5, visitCount: 1247 },
  { page: '/products', averageTime: 4.2, visitCount: 892 },
  { page: '/product-detail', averageTime: 6.8, visitCount: 743 },
  { page: '/cart', averageTime: 1.8, visitCount: 456 },
  { page: '/checkout', averageTime: 3.5, visitCount: 234 },
  { page: '/profile', averageTime: 5.2, visitCount: 189 },
  { page: '/about', averageTime: 2.1, visitCount: 123 }
];

// 디바이스별 사용자 더미 데이터
const deviceData: DeviceData[] = [
  { device: 'Android', users: 743, percentage: 59.6 },
  { device: 'iOS', users: 504, percentage: 40.4 }
];

export const mockDashboardData: DashboardData = {
  stats: statsData,
  visitorTrend: visitorTrendData,
  exitPages: exitPageData,
  pageTimes: pageTimeData,
  devices: deviceData
}; 