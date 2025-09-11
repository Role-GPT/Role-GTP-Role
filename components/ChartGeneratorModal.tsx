/**
 * 차트 생성기 모달 컴포넌트
 * 
 * 사용자가 다양한 타입의 차트를 생성할 수 있는 인터페이스
 * - 네이버 데이터랩 트렌드 차트
 * - 일반 데이터 차트 (막대, 파이, 라인)
 * - 사전 정의된 템플릿 사용
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { useState, useEffect } from 'react';
import { X, TrendingUp, BarChart3, PieChart, LineChart, Loader2, Download, Copy, ExternalLink, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ChartUsageBanner } from './ChartUsageBanner';
import { toast } from "sonner";
import { 
  chartService, 
  ChartTemplate, 
  ChartResponse, 
  DataLabChartOptions,
  ChartConfig 
} from '../src/services/chartService';
import { ChartUsageManager } from '../src/utils/chartUsageManager';

interface ChartGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChartGenerated?: (chartData: ChartResponse) => void;
}

/**
 * 차트 생성기 모달 컴포넌트
 */
export function ChartGeneratorModal({ isOpen, onClose, onChartGenerated }: ChartGeneratorModalProps) {
  // 상태 관리
  const [loading, setLoading] = useState(false);
  const [templates, setTemplates] = useState<ChartTemplate[]>([]);
  const [generatedChart, setGeneratedChart] = useState<ChartResponse | null>(null);
  const [canGenerateChart, setCanGenerateChart] = useState(true);
  const [usageInfo, setUsageInfo] = useState(ChartUsageManager.getUsageInfo());
  
  // 데이터랩 차트 폼 상태
  const [datalabForm, setDatalabForm] = useState<DataLabChartOptions>({
    keywords: ['AI'],
    startDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1년 전
    endDate: new Date().toISOString().split('T')[0],
    timeUnit: 'month',
    chartType: 'line',
    width: 800,
    height: 400
  });

  // 일반 차트 폼 상태
  const [simpleForm, setSimpleForm] = useState({
    title: '샘플 차트',
    type: 'bar' as 'bar' | 'pie' | 'line',
    labels: 'A,B,C,D',
    values: '10,20,15,25',
    width: 600,
    height: 400
  });

  // 템플릿 로드 및 사용량 확인
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
      checkUsageLimit();
    }
  }, [isOpen]);

  /**
   * 사용량 제한 확인
   */
  const checkUsageLimit = () => {
    const info = ChartUsageManager.getUsageInfo();
    setUsageInfo(info);
    setCanGenerateChart(info.canGenerate);
    
    if (!info.canGenerate) {
      console.log('📊 차트 생성 한도 도달:', info);
    }
  };

  /**
   * 차트 템플릿 목록 로드
   */
  const loadTemplates = async () => {
    try {
      const templateList = await chartService.getChartTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
      toast.error('차트 템플릿을 불러오지 못했습니다.');
    }
  };

  /**
   * 데이터랩 트렌드 차트 생성
   */
  const handleDataLabChart = async () => {
    // 사용량 제한 확인
    if (!ChartUsageManager.canGenerateChart()) {
      toast.error(ChartUsageManager.getLimitExceededMessage());
      return;
    }

    if (!datalabForm.keywords.length) {
      toast.error('검색어를 하나 이상 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      console.log('📊 데이터랩 차트 생성:', datalabForm);
      
      const result = await chartService.generateDataLabChart(datalabForm);
      
      // 사용량 증가
      const usageIncremented = ChartUsageManager.incrementUsage();
      if (usageIncremented) {
        checkUsageLimit(); // UI 업데이트
        setGeneratedChart(result);
        onChartGenerated?.(result);
        
        const newUsageInfo = ChartUsageManager.getUsageInfo();
        toast.success(`트렌드 차트가 생성되었습니다! (${result.summary?.dataPoints}개 데이터 포인트)\n${newUsageInfo.remainingUsage}번 더 생성 가능합니다.`);
      } else {
        toast.error('차트 생성 한도를 초과했습니다.');
      }
    } catch (error) {
      console.error('데이터랩 차트 생성 실패:', error);
      toast.error(error instanceof Error ? error.message : '차트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 일반 데이터 차트 생성
   */
  const handleSimpleChart = async () => {
    // 사용량 제한 확인
    if (!ChartUsageManager.canGenerateChart()) {
      toast.error(ChartUsageManager.getLimitExceededMessage());
      return;
    }

    const labels = simpleForm.labels.split(',').map(s => s.trim()).filter(s => s);
    const values = simpleForm.values.split(',').map(s => parseFloat(s.trim())).filter(n => !isNaN(n));

    if (labels.length === 0 || values.length === 0) {
      toast.error('레이블과 값을 올바르게 입력해주세요.');
      return;
    }

    if (labels.length !== values.length) {
      toast.error('레이블과 값의 개수가 일치하지 않습니다.');
      return;
    }

    setLoading(true);
    try {
      console.log('📊 일반 차트 생성:', { type: simpleForm.type, labels, values });
      
      let result: ChartResponse;
      
      if (simpleForm.type === 'bar') {
        result = await chartService.generateSimpleBarChart(
          simpleForm.title,
          labels,
          values,
          { width: simpleForm.width, height: simpleForm.height }
        );
      } else if (simpleForm.type === 'pie') {
        result = await chartService.generateSimplePieChart(
          simpleForm.title,
          labels,
          values,
          { width: simpleForm.width, height: simpleForm.height }
        );
      } else {
        // 라인 차트
        const config: ChartConfig = {
          type: 'line',
          data: {
            labels,
            datasets: [{
              label: '값',
              data: values,
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true
            }]
          },
          options: {
            responsive: true,
            plugins: {
              title: {
                display: true,
                text: simpleForm.title
              }
            },
            scales: {
              y: {
                beginAtZero: true
              }
            }
          }
        };
        
        result = await chartService.generateChart(config, {
          width: simpleForm.width,
          height: simpleForm.height
        });
      }
      
      // 사용량 증가
      const usageIncremented = ChartUsageManager.incrementUsage();
      if (usageIncremented) {
        checkUsageLimit(); // UI 업데이트
        setGeneratedChart(result);
        onChartGenerated?.(result);
        
        const newUsageInfo = ChartUsageManager.getUsageInfo();
        toast.success(`차트가 생성되었습니다!\n${newUsageInfo.remainingUsage}번 더 생성 가능합니다.`);
      } else {
        toast.error('차트 생성 한도를 초과했습니다.');
      }
    } catch (error) {
      console.error('일반 차트 생성 실패:', error);
      toast.error(error instanceof Error ? error.message : '차트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 템플릿으로 차트 생성
   */
  const handleTemplateChart = async (template: ChartTemplate) => {
    // 사용량 제한 확인
    if (!ChartUsageManager.canGenerateChart()) {
      toast.error(ChartUsageManager.getLimitExceededMessage());
      return;
    }

    setLoading(true);
    try {
      console.log('📊 템플릿 차트 생성:', template.name);
      
      const result = await chartService.generateChart(template.example, {
        width: 600,
        height: 400
      });
      
      // 사용량 증가
      const usageIncremented = ChartUsageManager.incrementUsage();
      if (usageIncremented) {
        checkUsageLimit(); // UI 업데이트
        setGeneratedChart(result);
        onChartGenerated?.(result);
        
        const newUsageInfo = ChartUsageManager.getUsageInfo();
        toast.success(`${template.name} 차트가 생성되었습니다!\n${newUsageInfo.remainingUsage}번 더 생성 가능합니다.`);
      } else {
        toast.error('차트 생성 한도를 초과했습니다.');
      }
    } catch (error) {
      console.error('템플릿 차트 생성 실패:', error);
      toast.error(error instanceof Error ? error.message : '차트 생성에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 차트 URL 복사
   */
  const copyChartUrl = () => {
    if (generatedChart?.chartUrl) {
      navigator.clipboard.writeText(generatedChart.chartUrl);
      toast.success('차트 URL이 클립보드에 복사되었습니다.');
    }
  };

  /**
   * 차트 이미지 다운로드
   */
  const downloadChart = () => {
    if (generatedChart?.chartUrl) {
      const link = document.createElement('a');
      link.href = generatedChart.chartUrl;
      link.download = `chart_${Date.now()}.png`;
      link.click();
      toast.success('차트 다운로드를 시작합니다.');
    }
  };

  /**
   * 키워드 입력 핸들러
   */
  const handleKeywordsChange = (value: string) => {
    const keywords = value.split(',').map(k => k.trim()).filter(k => k);
    setDatalabForm(prev => ({ ...prev, keywords }));
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            차트 생성기
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 사용량 배너 */}
          <ChartUsageBanner variant="detailed" showResetButton={process.env.NODE_ENV === 'development'} />
          
          {/* 한도 초과시 경고 메시지 */}
          {!canGenerateChart && (
            <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <div>
                    <h4 className="font-medium text-orange-900 dark:text-orange-100">
                      일일 차트 생성 한도 도달
                    </h4>
                    <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">
                      오늘 {usageInfo.maxDailyUsage}회의 차트 생성을 모두 사용했습니다. 
                      {usageInfo.resetTime}에 다시 사용할 수 있습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="datalab" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="datalab" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                트렌드 분석
              </TabsTrigger>
              <TabsTrigger value="simple" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                일반 차트
              </TabsTrigger>
              <TabsTrigger value="templates" className="flex items-center gap-2">
                <PieChart className="w-4 h-4" />
                템플릿
              </TabsTrigger>
            </TabsList>

            {/* 네이버 데이터랩 트렌드 차트 */}
            <TabsContent value="datalab" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>검색어 트렌드 분석</CardTitle>
                  <CardDescription>
                    네이버 데이터랩을 활용하여 검색어의 시간별 트렌드를 분석합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="keywords">검색어 (쉼표로 구분)</Label>
                      <Input
                        id="keywords"
                        placeholder="AI, 머신러닝, 딥러닝"
                        value={datalabForm.keywords.join(', ')}
                        onChange={(e) => handleKeywordsChange(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground">최대 5개까지 입력 가능</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="chartType">차트 타입</Label>
                      <Select 
                        value={datalabForm.chartType} 
                        onValueChange={(value: any) => setDatalabForm(prev => ({ ...prev, chartType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="line">라인 차트</SelectItem>
                          <SelectItem value="bar">막대 차트</SelectItem>
                          <SelectItem value="area">영역 차트</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">시작 날짜</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={datalabForm.startDate}
                        onChange={(e) => setDatalabForm(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="endDate">종료 날짜</Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={datalabForm.endDate}
                        onChange={(e) => setDatalabForm(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="timeUnit">기간 단위</Label>
                      <Select 
                        value={datalabForm.timeUnit} 
                        onValueChange={(value: any) => setDatalabForm(prev => ({ ...prev, timeUnit: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="date">일별</SelectItem>
                          <SelectItem value="week">주별</SelectItem>
                          <SelectItem value="month">월별</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleDataLabChart} 
                    disabled={loading || datalabForm.keywords.length === 0 || !canGenerateChart}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        차트 생성 중...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        트렌드 차트 생성
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 일반 데이터 차트 */}
            <TabsContent value="simple" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>일반 데이터 차트</CardTitle>
                  <CardDescription>
                    직접 입력한 데이터로 다양한 형태의 차트를 생성합니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">차트 제목</Label>
                      <Input
                        id="title"
                        value={simpleForm.title}
                        onChange={(e) => setSimpleForm(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="type">차트 타입</Label>
                      <Select 
                        value={simpleForm.type} 
                        onValueChange={(value: any) => setSimpleForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bar">막대 차트</SelectItem>
                          <SelectItem value="pie">파이 차트</SelectItem>
                          <SelectItem value="line">라인 차트</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="labels">레이블 (쉼표로 구분)</Label>
                      <Input
                        id="labels"
                        placeholder="A, B, C, D"
                        value={simpleForm.labels}
                        onChange={(e) => setSimpleForm(prev => ({ ...prev, labels: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="values">값 (쉼표로 구분)</Label>
                      <Input
                        id="values"
                        placeholder="10, 20, 15, 25"
                        value={simpleForm.values}
                        onChange={(e) => setSimpleForm(prev => ({ ...prev, values: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="width">가로 크기 (px)</Label>
                      <Input
                        id="width"
                        type="number"
                        value={simpleForm.width}
                        onChange={(e) => setSimpleForm(prev => ({ ...prev, width: parseInt(e.target.value) || 600 }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="height">세로 크기 (px)</Label>
                      <Input
                        id="height"
                        type="number"
                        value={simpleForm.height}
                        onChange={(e) => setSimpleForm(prev => ({ ...prev, height: parseInt(e.target.value) || 400 }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleSimpleChart} 
                    disabled={loading || !canGenerateChart}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        차트 생성 중...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        차트 생성
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* 차트 템플릿 */}
            <TabsContent value="templates" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-sm">{template.name}</CardTitle>
                      <CardDescription className="text-xs">
                        {template.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleTemplateChart(template)}
                          disabled={loading || !canGenerateChart}
                        >
                          {loading ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            '사용'
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* 생성된 차트 표시 */}
          {generatedChart && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>생성된 차트</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyChartUrl}>
                      <Copy className="w-4 h-4 mr-1" />
                      URL 복사
                    </Button>
                    <Button size="sm" variant="outline" onClick={downloadChart}>
                      <Download className="w-4 h-4 mr-1" />
                      다운로드
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <a href={generatedChart.chartUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        새 창에서 보기
                      </a>
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full overflow-auto">
                  <img 
                    src={generatedChart.chartUrl} 
                    alt="Generated Chart" 
                    className="max-w-full h-auto rounded-lg border"
                    onError={() => toast.error('차트 이미지를 불러올 수 없습니다.')}
                  />
                </div>
                
                {generatedChart.summary && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <h4 className="text-sm font-medium mb-2">차트 정보</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p><strong>검색어:</strong> {generatedChart.summary.keywords.join(', ')}</p>
                      <p><strong>기간:</strong> {generatedChart.summary.period}</p>
                      <p><strong>데이터 포인트:</strong> {generatedChart.summary.dataPoints}개</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
