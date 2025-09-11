/**
 * 차트 표시 모달 컴포넌트
 * 
 * 생성된 차트를 표시하고 관리하는 모달
 * - 차트 이미지 표시
 * - 차트 정보 및 메타데이터
 * - 다운로드, 공유, 복사 기능
 * - 차트 재생성 옵션
 * 
 * @author Role GPT Team  
 * @version 1.0.0
 */

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { 
  Download, 
  Copy, 
  ExternalLink, 
  Share2, 
  BarChart3, 
  TrendingUp, 
  PieChart,
  RefreshCw,
  Info
} from 'lucide-react';
import { ChartResponse } from '../src/services/chartService';
import { toast } from "sonner";

interface ChartDisplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  chart: ChartResponse | null;
  title?: string;
  description?: string;
  onRegenerate?: () => void;
}

/**
 * 차트 표시 모달 컴포넌트
 */
export function ChartDisplayModal({ 
  isOpen, 
  onClose, 
  chart, 
  title,
  description,
  onRegenerate 
}: ChartDisplayModalProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  if (!chart) return null;

  /**
   * 차트 URL 복사
   */
  const copyChartUrl = async () => {
    try {
      await navigator.clipboard.writeText(chart.chartUrl);
      toast.success('차트 URL이 클립보드에 복사되었습니다.');
    } catch (error) {
      console.error('URL 복사 실패:', error);
      toast.error('URL 복사에 실패했습니다.');
    }
  };

  /**
   * 차트 이미지 다운로드
   */
  const downloadChart = () => {
    try {
      const link = document.createElement('a');
      link.href = chart.chartUrl;
      link.download = `chart_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('차트 다운로드를 시작합니다.');
    } catch (error) {
      console.error('다운로드 실패:', error);
      toast.error('다운로드에 실패했습니다.');
    }
  };

  /**
   * 차트 공유 (Web Share API 사용)
   */
  const shareChart = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: title || '생성된 차트',
          text: description || 'Role GPT에서 생성된 데이터 시각화 차트',
          url: chart.chartUrl
        });
      } else {
        // Web Share API 미지원 시 URL 복사로 대체
        await copyChartUrl();
      }
    } catch (error) {
      console.error('공유 실패:', error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error('공유에 실패했습니다.');
      }
    }
  };

  /**
   * 차트 타입에 따른 아이콘 반환
   */
  const getChartIcon = () => {
    const chartType = chart.config?.type || 'bar';
    switch (chartType) {
      case 'line':
        return <TrendingUp className="w-5 h-5" />;
      case 'pie':
      case 'doughnut':
        return <PieChart className="w-5 h-5" />;
      default:
        return <BarChart3 className="w-5 h-5" />;
    }
  };

  /**
   * 차트 타입 한국어 이름
   */
  const getChartTypeName = () => {
    const chartType = chart.config?.type || 'bar';
    switch (chartType) {
      case 'line': return '라인 차트';
      case 'bar': return '막대 차트';
      case 'pie': return '파이 차트';
      case 'doughnut': return '도넛 차트';
      case 'area': return '영역 차트';
      case 'radar': return '레이더 차트';
      default: return '차트';
    }
  };

  /**
   * 이미지 로드 완료 핸들러
   */
  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  /**
   * 이미지 로드 오류 핸들러
   */
  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
    toast.error('차트 이미지를 불러올 수 없습니다.');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getChartIcon()}
            {title || `${getChartTypeName()} 표시`}
          </DialogTitle>
          <DialogDescription>
            {description || "생성된 차트를 확인하고 다운로드하거나 공유할 수 있습니다."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* 차트 이미지 */}
          <Card>
            <CardContent className="p-0">
              <div className="w-full overflow-auto bg-white rounded-lg">
                {imageLoading && (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin"></div>
                      차트를 불러오는 중...
                    </div>
                  </div>
                )}
                
                {imageError ? (
                  <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-sm">차트 이미지를 불러올 수 없습니다</p>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => window.open(chart.chartUrl, '_blank')}
                      className="mt-2"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      새 창에서 보기
                    </Button>
                  </div>
                ) : (
                  <img 
                    src={chart.chartUrl} 
                    alt={title || "Generated Chart"} 
                    className={`max-w-full h-auto rounded-lg ${imageLoading ? 'hidden' : ''}`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* 차트 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 기본 정보 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  차트 정보
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">타입</span>
                  <Badge variant="outline" className="text-xs">
                    {getChartTypeName()}
                  </Badge>
                </div>
                
                {chart.config?.data?.datasets && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">데이터셋</span>
                    <span className="text-xs">{chart.config.data.datasets.length}개</span>
                  </div>
                )}

                {chart.config?.data?.labels && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">데이터 포인트</span>
                    <span className="text-xs">{chart.config.data.labels.length}개</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">생성 시간</span>
                  <span className="text-xs">{new Date().toLocaleString('ko-KR')}</span>
                </div>
              </CardContent>
            </Card>

            {/* 네이버 데이터랩 정보 (있는 경우) */}
            {chart.summary && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    트렌드 분석 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground">검색어</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {chart.summary.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">분석 기간</span>
                    <span className="text-xs">{chart.summary.period}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">데이터 포인트</span>
                    <span className="text-xs">{chart.summary.dataPoints}개</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="flex flex-wrap gap-2 justify-center pt-4 border-t">
            <Button 
              onClick={downloadChart}
              variant="outline"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              다운로드
            </Button>
            
            <Button 
              onClick={copyChartUrl}
              variant="outline"
              size="sm"
            >
              <Copy className="w-4 h-4 mr-2" />
              URL 복사
            </Button>
            
            <Button 
              onClick={shareChart}
              variant="outline"
              size="sm"
            >
              <Share2 className="w-4 h-4 mr-2" />
              공유
            </Button>
            
            <Button 
              onClick={() => window.open(chart.chartUrl, '_blank')}
              variant="outline"
              size="sm"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              새 창에서 보기
            </Button>

            {onRegenerate && (
              <Button 
                onClick={onRegenerate}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 생성
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
