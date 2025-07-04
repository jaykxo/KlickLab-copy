import React, { useState } from 'react';

interface PathData {
  from: string;
  to: string;
  value: number;
}

const mockData: PathData[] = [
  { from: '메인페이지', to: '상품목록', value: 120 },
  { from: '메인페이지', to: '검색', value: 85 },
  { from: '메인페이지', to: '로그인', value: 45 },
  { from: '상품목록', to: '상품상세', value: 95 },
  { from: '상품목록', to: '장바구니', value: 25 },
  { from: '검색', to: '상품상세', value: 65 },
  { from: '검색', to: '상품목록', value: 20 },
  { from: '상품상세', to: '장바구니', value: 78 },
  { from: '상품상세', to: '결제', value: 32 },
  { from: '장바구니', to: '결제', value: 45 },
  { from: '로그인', to: '마이페이지', value: 38 },
  { from: '로그인', to: '상품목록', value: 7 }
];

// 노드 depth 계산
function computeNodeDepths(paths: PathData[]): Map<string, number> {
  const nodeDepths = new Map<string, number>();
  const allFrom = new Set(paths.map(p => p.from));
  const allTo = new Set(paths.map(p => p.to));
  const roots = Array.from(allFrom).filter(f => !allTo.has(f));
  const queue: { name: string; depth: number }[] = roots.map(r => ({ name: r, depth: 0 }));
  while (queue.length > 0) {
    const { name, depth } = queue.shift()!;
    if (nodeDepths.has(name)) continue;
    nodeDepths.set(name, depth);
    paths.filter(p => p.from === name).forEach(p => {
      queue.push({ name: p.to, depth: depth + 1 });
    });
  }
  paths.forEach(p => {
    if (!nodeDepths.has(p.to)) nodeDepths.set(p.to, 0);
    if (!nodeDepths.has(p.from)) nodeDepths.set(p.from, 0);
  });
  return nodeDepths;
}

export const UserPathSankeyChart: React.FC = () => {
  const [hoverLinkIdx, setHoverLinkIdx] = useState<number | null>(null);
  const nodeDepths = computeNodeDepths(mockData);
  // 노드 정보 생성
  const nodeMap = new Map<string, { name: string; depth: number; totalIn: number; totalOut: number }>();
  mockData.forEach(path => {
    if (!nodeMap.has(path.from)) nodeMap.set(path.from, { name: path.from, depth: nodeDepths.get(path.from)!, totalIn: 0, totalOut: 0 });
    if (!nodeMap.has(path.to)) nodeMap.set(path.to, { name: path.to, depth: nodeDepths.get(path.to)!, totalIn: 0, totalOut: 0 });
    nodeMap.get(path.from)!.totalOut += path.value;
    nodeMap.get(path.to)!.totalIn += path.value;
  });
  // depth별 그룹핑 및 위치 계산
  const depthGroups: { [depth: number]: string[] } = {};
  nodeMap.forEach(node => {
    if (!depthGroups[node.depth]) depthGroups[node.depth] = [];
    depthGroups[node.depth].push(node.name);
  });
  const depths = Object.keys(depthGroups).map(Number).sort((a, b) => a - b);
  // 위치 계산
  const chartWidth = 780;
  const chartHeight = 338;
  const nodeWidth = 143;
  const nodeHeight = 65;
  const nodeGapY = 23;
  const nodeGapX = (chartWidth - nodeWidth) / (depths.length - 1 || 1);
  const nodePositions = new Map<string, { x: number; y: number }>();
  depths.forEach((depth, dIdx) => {
    const group = depthGroups[depth];
    const totalHeight = group.length * nodeHeight + (group.length - 1) * nodeGapY;
    const startY = (chartHeight - totalHeight) / 2;
    group.forEach((name, nIdx) => {
      nodePositions.set(name, {
        x: dIdx * nodeGapX,
        y: startY + nIdx * (nodeHeight + nodeGapY)
      });
    });
  });
  const maxValue = Math.max(...mockData.map(d => d.value));
  const totalValue = mockData.reduce((sum, d) => sum + d.value, 0);

  // 툴팁 정보 계산
  let tooltip: null | {
    x: number;
    y: number;
    from: string;
    to: string;
    value: number;
    percent: string;
  } = null;
  if (hoverLinkIdx !== null) {
    const path = mockData[hoverLinkIdx];
    const from = nodePositions.get(path.from)!;
    const to = nodePositions.get(path.to)!;
    const x1 = from.x + nodeWidth;
    const y1 = from.y + nodeHeight / 2;
    const x2 = to.x;
    const y2 = to.y + nodeHeight / 2;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    tooltip = {
      x: mx,
      y: my,
      from: path.from,
      to: path.to,
      value: path.value,
      percent: ((path.value / totalValue) * 100).toFixed(1) + '%'
    };
  }

  return (
    <div className="overflow-x-auto">
      <svg width={chartWidth} height={chartHeight} style={{ position: 'relative', zIndex: 0 }}>
        {/* 링크(곡선) */}
        {mockData.map((path, idx) => {
          const from = nodePositions.get(path.from);
          const to = nodePositions.get(path.to);
          if (!from || !to) return null;
          const strokeWidth = (path.value / maxValue) * 18 + 2.6;
          const opacity = hoverLinkIdx === null
            ? (path.value / maxValue) * 0.5 + 0.3
            : (hoverLinkIdx === idx ? 0.95 : 0.15);
          const color = hoverLinkIdx === idx ? '#2563eb' : '#a5b4fc';
          const x1 = from.x + nodeWidth;
          const y1 = from.y + nodeHeight / 2;
          const x2 = to.x;
          const y2 = to.y + nodeHeight / 2;
          const mx = (x1 + x2) / 2;
          return (
            <path
              key={idx}
              d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`}
              stroke={color}
              strokeWidth={hoverLinkIdx === idx ? strokeWidth + 7.8 : strokeWidth}
              fill="none"
              opacity={opacity}
              style={{ transition: 'all 0.2s', cursor: 'pointer' }}
              onMouseEnter={() => setHoverLinkIdx(idx)}
              onMouseLeave={() => setHoverLinkIdx(null)}
            />
          );
        })}
        {/* 노드 */}
        {Array.from(nodeMap.values()).map((node) => {
          const pos = nodePositions.get(node.name)!;
          const isStart = node.depth === 0;
          const isEnd = node.totalOut === 0;
          // 강조: hover된 링크의 출발/도착 노드면 강조
          const isActive = hoverLinkIdx !== null && (mockData[hoverLinkIdx].from === node.name || mockData[hoverLinkIdx].to === node.name);
          return (
            <g key={node.name} transform={`translate(${pos.x},${pos.y})`} style={{ zIndex: isActive ? 2 : 1 }}>
              <rect
                width={nodeWidth}
                height={nodeHeight}
                rx={15.6}
                fill={isActive ? (isStart ? '#2563eb' : isEnd ? '#16a34a' : '#e0e7ef') : (isStart ? '#e0edff' : isEnd ? '#e6faea' : '#f3f4f6')}
                stroke={isActive ? (isStart ? '#1d4ed8' : isEnd ? '#059669' : '#a5b4fc') : (isStart ? '#60a5fa' : isEnd ? '#34d399' : '#d1d5db')}
                strokeWidth={isActive ? 3.25 : 2}
                style={{ transition: 'all 0.2s' }}
              />
              <circle
                cx={23.4}
                cy={nodeHeight / 2}
                r={9.1}
                fill={isStart ? '#3b82f6' : isEnd ? '#22c55e' : '#a3a3a3'}
              />
              <text x={46.8} y={nodeHeight / 2 - 5.2} fontSize={17} fontWeight="bold" fill="#222">
                {node.name}
              </text>
              <text x={46.8} y={nodeHeight / 2 + 16.9} fontSize={16.9} fill="#666">
                {isStart ? node.totalOut : node.totalIn}명
              </text>
            </g>
          );
        })}
        {/* 툴팁 */}
        {tooltip && (
          <g style={{ pointerEvents: 'none' }}>
            <rect
              x={tooltip.x - 78}
              y={tooltip.y - 57}
              width={170}
              height={49}
              rx={10.4}
              fill="#fff"
              stroke="#2563eb"
              strokeWidth={2}
              style={{ filter: 'drop-shadow(0 2.6px 10.4px #2563eb22)' }}
            />
            <text x={tooltip.x} y={tooltip.y - 36.4} fontSize={15} fontWeight="bold" fill="#222" textAnchor="middle">
              {tooltip.from} → {tooltip.to}
            </text>
            <text x={tooltip.x} y={tooltip.y - 13} fontSize={14} fill="#2563eb" textAnchor="middle">
              {tooltip.value}명 ({tooltip.percent})
            </text>
          </g>
        )}
      </svg>
    </div>
  );
}; 