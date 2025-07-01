import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

// 타입 정의
interface TestFilterOptions {
  mainCategory: 'all' | 'mobile' | 'desktop';
  subCategory: 'all' | 'ios' | 'android' | 'macos' | 'windows';
}

interface TestFilterTabsProps {
  filters: TestFilterOptions;
  onFilterChange: (key: keyof TestFilterOptions, value: string) => void;
}

export const TestFilterTabs: React.FC<TestFilterTabsProps> = ({ filters, onFilterChange }) => {
  const [isMainOpen, setIsMainOpen] = useState(false);
  const [isSubOpen, setIsSubOpen] = useState(false);

  const mainCategories = [
    { value: 'all', label: '전체' },
    { value: 'mobile', label: '모바일' },
    { value: 'desktop', label: '데스크탑' }
  ];
  
  const subCategories = {
    all: [
      { value: 'all', label: '전체' }
    ],
    mobile: [
      { value: 'all', label: '전체' },
      { value: 'iOS', label: 'iOS' },
      { value: 'Android', label: '안드로이드' }
    ],
    desktop: [
      { value: 'all', label: '전체' },
      { value: 'Windows', label: '윈도우' },
      { value: 'macOS', label: '맥OS' }
    ]
  };

  const selectedMainCategory = mainCategories.find(cat => cat.value === filters.mainCategory);
  const currentSubCategories = subCategories[filters.mainCategory];
  const selectedSubCategory = currentSubCategories.find(cat => cat.value === filters.subCategory);

  // 대분류 변경 시 소분류를 'all'로 리셋
  const handleMainCategoryChange = (value: string) => {
    onFilterChange('mainCategory', value);
    onFilterChange('subCategory', 'all');
    setIsMainOpen(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">플랫폼 필터</h3>
        <p className="text-sm text-gray-600">클릭 데이터를 플랫폼별로 필터링하세요</p>
      </div>
      
      <div className="flex justify-center gap-4">
        {/* 대분류 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => {
              setIsMainOpen(!isMainOpen);
              setIsSubOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[150px]"
          >
            <span className="text-sm font-medium text-gray-900">
              {selectedMainCategory?.label || '대분류 선택'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isMainOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isMainOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {mainCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => handleMainCategoryChange(category.value)}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    filters.mainCategory === category.value 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-700'
                  } ${category.value === 'all' ? 'border-b border-gray-200' : ''}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 소분류 드롭다운 */}
        <div className="relative">
          <button
            onClick={() => {
              setIsSubOpen(!isSubOpen);
              setIsMainOpen(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-w-[150px]"
          >
            <span className="text-sm font-medium text-gray-900">
              {selectedSubCategory?.label || '소분류 선택'}
            </span>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isSubOpen ? 'rotate-180' : ''}`} />
          </button>
          
          {isSubOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10">
              {currentSubCategories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => {
                    onFilterChange('subCategory', category.value);
                    setIsSubOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors ${
                    filters.subCategory === category.value 
                      ? 'bg-primary-50 text-primary-700 font-medium' 
                      : 'text-gray-700'
                  } ${category.value === 'all' ? 'border-b border-gray-200' : ''}`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 드롭다운 외부 클릭 시 닫기 */}
      {(isMainOpen || isSubOpen) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setIsMainOpen(false);
            setIsSubOpen(false);
          }}
        />
      )}
    </div>
  );
}; 