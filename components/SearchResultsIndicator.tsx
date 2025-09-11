/**
 * Search Results Indicator Component
 * 
 * 메시지 입력창에서 검색 결과가 있을 때 표시하는 인디케이터
 * - 검색된 소스 개수 표시
 * - 소스별 아이콘 및 개수
 * - 컴팩트한 디자인
 * 
 * @version 1.0.0
 */

import React, { useState } from 'react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Search, BarChart3, TrendingUp, PieChart } from 'lucide-react';
import { DataSourceResult, generateSearchDistributionChart, generateRelevanceChart } from '../src/services/dataSourceService';
import { ChartResponse } from '../src/services/chartService';
import { toast } from "sonner";

interface SearchResultsIndicatorProps {
  searchResults: DataSourceResult[];
  className?: string;
  showChartButton?: boolean;
  onChartGenerated?: (chart: ChartResponse, type: 'distribution' | 'relevance') => void;
}

export function SearchResultsIndicator({ 
  searchResults, 
  className = '', 
  showChartButton = false,
  onChartGenerated
}: SearchResultsIndicatorProps) {
  const [generating, setGenerating] = useState(false);

  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  // 소스별 개수 계산
  const sourceCounts = searchResults.reduce((acc, result) => {
    acc[result.source] = (acc[result.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 소스별 한국어 이름
  const getSourceName = (sourceType: string) => {
    switch (sourceType) {
      case 'web': return '웹';
      case 'news': return '뉴스';
      case 'blog': return '블로그';
      case 'academic': return '학문';
      case 'business': return '비즈니스';
      case 'culture': return '문화';
      case 'lifestyle': return '라이프스타일';
      default: return sourceType;
    }
  };

  // 분포 차트 생성
  const handleGenerateDistributionChart = async () => {
    if (generating) return;
    
    setGenerating(true);
    try {
      const chart = await generateSearchDistributionChart(searchResults);
      onChartGenerated?.(chart, 'distribution');
      toast.success('검색 결과 분포 차트가 생성되었습니다!');
    } catch (error) {
      console.error('분포 차트 생성 실패:', error);
      toast.error('차트 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  // 관련성 차트 생성 (검색어가 필요하므로 임시로 첫 번째 결과의 제목 사용)
  const handleGenerateRelevanceChart = async () => {
    if (generating) return;
    
    setGenerating(true);
    try {
      // 임시로 첫 번째 결과의 제목에서 키워드 추출
      const query = searchResults[0]?.title.split(' ').slice(0, 2).join(' ') || '검색어';
      const chart = await generateRelevanceChart(searchResults, query);
      onChartGenerated?.(chart, 'relevance');
      toast.success('관련성 분석 차트가 생성되었습니다!');
    } catch (error) {
      console.error('관련성 차트 생성 실패:', error);
      toast.error('차트 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        <Search className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">검색 결과:</span>
      </div>
      
      <div className="flex items-center gap-1">
        {Object.entries(sourceCounts).map(([sourceType, count]) => {
          const sourceName = getSourceName(sourceType);
          
          return (
            <Badge
              key={sourceType}
              variant="secondary"
              className="px-2 py-0.5 h-5 text-xs flex items-center gap-1 bg-muted/50 hover:bg-muted"
              title={`${sourceName}에서 ${count}개 결과`}
            >
              <span className="text-xs">{sourceName}</span>
              <span className="text-xs">{count}</span>
            </Badge>
          );
        })}
      </div>
      
      <Badge variant="outline" className="px-2 py-0.5 h-5 text-xs text-muted-foreground border-muted-foreground/30">
        총 {searchResults.length}개
      </Badge>

      {/* 차트 생성 버튼들 */}
      {showChartButton && (
        <div className="flex items-center gap-1 ml-2">
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={handleGenerateDistributionChart}
            disabled={generating}
            title="소스별 분포 차트 생성"
          >
            <PieChart className="w-3 h-3 mr-1" />
            분포
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-6 px-2 text-xs"
            onClick={handleGenerateRelevanceChart}
            disabled={generating}
            title="관련성 분석 차트 생성"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            분석
          </Button>
        </div>
      )}
    </div>
  );
}

/**
 * 메시지 입력창 하단에 표시되는 검색 결과 미리보기
 */
interface SearchResultsPreviewProps {
  searchResults: DataSourceResult[];
  onDismiss?: () => void;
  className?: string;
  showChartButtons?: boolean;
  onChartGenerated?: (chart: ChartResponse, type: 'distribution' | 'relevance') => void;
}

export function SearchResultsPreview({ 
  searchResults, 
  onDismiss, 
  className = '',
  showChartButtons = false,
  onChartGenerated
}: SearchResultsPreviewProps) {
  const [generating, setGenerating] = useState(false);

  if (!searchResults || searchResults.length === 0) {
    return null;
  }

  // 상위 3개 결과만 표시
  const topResults = searchResults.slice(0, 3);

  // 트렌드 차트 생성 (검색어 추출)
  const handleGenerateTrendChart = async () => {
    if (generating) return;
    
    setGenerating(true);
    try {
      // 검색 결과에서 공통 키워드 추출 (간단한 방법)
      const allTitles = searchResults.map(r => r.title).join(' ');
      const keywords = allTitles
        .split(/\s+/)
        .filter(word => word.length > 2)
        .slice(0, 3); // 상위 3개 키워드

      if (keywords.length === 0) {
        throw new Error('트렌드 분석할 키워드를 찾을 수 없습니다.');
      }

      const { generateTrendChart } = await import('../src/services/dataSourceService');
      const chart = await generateTrendChart(keywords, 6);
      onChartGenerated?.(chart, 'distribution'); // 타입은 임시로 distribution
      toast.success(`${keywords.join(', ')} 키워드의 트렌드 차트가 생성되었습니다!`);
    } catch (error) {
      console.error('트렌드 차트 생성 실패:', error);
      toast.error('트렌드 차트 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className={`bg-muted/30 backdrop-blur-sm border border-border/50 rounded-xl p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground/90">검색된 관련 정보</span>
          <Badge variant="secondary" className="h-5 text-xs">
            {searchResults.length}개
          </Badge>
        </div>
        
        <div className="flex items-center gap-2">
          {/* 차트 생성 버튼들 */}
          {showChartButtons && (
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                className="h-6 px-2 text-xs"
                onClick={handleGenerateTrendChart}
                disabled={generating}
                title="검색 키워드 트렌드 분석"
              >
                <TrendingUp className="w-3 h-3 mr-1" />
                트렌드
              </Button>
            </div>
          )}
          
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground text-xs"
              title="닫기"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {topResults.map((result, index) => {
          return (
            <div key={index} className="flex items-start gap-2 p-2 rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-foreground/90 line-clamp-1 mb-1">
                  {result.title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                  {result.summary}
                </p>
                {result.url && (
                  <a
                    href={result.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-500 hover:text-blue-600 hover:underline"
                  >
                    원문 보기 →
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {searchResults.length > 3 && (
        <div className="mt-2 pt-2 border-t border-border/30">
          <p className="text-xs text-muted-foreground text-center">
            그 외 {searchResults.length - 3}개의 추가 정보가 AI 답변에 활용됩니다
          </p>
        </div>
      )}
    </div>
  );
}
