/**
 * Search Routing Manager - 3단 라우팅 시스템 UI
 * 
 * JSON 설정 기반 검색 라우팅을 관리하는 React 컴포넌트
 * - 카테고리별 활성화/비활성화
 * - 프로바이더별 상태 모니터링
 * - Trial 사용량 추적
 * - BYOK 키 연동
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Key,
  Settings,
  TrendingUp,
  Users,
  Zap,
  RefreshCw
} from 'lucide-react';
import { SearchRoutingService, SearchConfig, SearchRequest, SearchResponse } from '../src/services/searchRoutingService';
import { DEFAULT_SEARCH_CONFIG, CATEGORY_ICONS, PROVIDER_ICONS, TRIAL_LIMIT_MESSAGES } from '../src/services/searchConfig';

interface SearchRoutingManagerProps {
  onSearch?: (response: SearchResponse) => void;
  className?: string;
  userKeys?: Record<string, any>;
  onKeyRequest?: (providerId: string) => void;
}

export function SearchRoutingManager({
  onSearch,
  className = '',
  userKeys = {},
  onKeyRequest
}: SearchRoutingManagerProps) {
  const [routingService, setRoutingService] = useState<SearchRoutingService | null>(null);
  const [config, setConfig] = useState<SearchConfig>(DEFAULT_SEARCH_CONFIG);
  const [usageStats, setUsageStats] = useState<any>({});
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [healthStatus, setHealthStatus] = useState<Record<string, boolean>>({});

  // 초기화
  useEffect(() => {
    console.log('🔍 SearchRoutingManager 초기화:', {
      configCategoriesCount: config.categories.length,
      userKeysCount: Object.keys(userKeys).length,
      config: config
    });
    
    const service = new SearchRoutingService(config);
    service.setUserKeys(userKeys);
    setRoutingService(service);
    
    // 주기적으로 사용량 통계 업데이트
    const interval = setInterval(() => {
      if (service) {
        setUsageStats(service.getUsageStats());
      }
    }, 30000); // 30초마다

    return () => clearInterval(interval);
  }, [config, userKeys]);

  // 테스트 검색 실행
  const handleTestSearch = async () => {
    if (!routingService || !testQuery.trim()) return;

    setIsLoading(true);
    try {
      const request: SearchRequest = {
        query: testQuery,
        roleId: 'test_role',
        categories: selectedCategories.length > 0 ? selectedCategories : undefined,
        maxResults: 10,
        includeTrialSources: true
      };

      const response = await routingService.search(request);
      setSearchResults(response);
      onSearch?.(response);
    } catch (error) {
      console.error('테스트 검색 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 카테고리 활성화/비활성화
  const toggleCategory = (categoryId: string, enabled: boolean) => {
    const updatedConfig = {
      ...config,
      categories: config.categories.map(cat =>
        cat.id === categoryId ? { ...cat, enabled } : cat
      )
    };
    setConfig(updatedConfig);
    routingService?.updateConfig(updatedConfig);
  };

  // Trial 사용량 계산
  const getTrialUsagePercentage = (categoryId: string): number => {
    const todayUsage = usageStats.daily_trial_usage?.[new Date().toISOString().split('T')[0]] || {};
    const used = todayUsage[categoryId] || 0;
    const limit = config.trial.per_user_daily[categoryId] || 0;
    return limit > 0 ? Math.min(100, (used / limit) * 100) : 0;
  };

  // 프로바이더 상태 체크
  const getProviderStatus = (providerId: string): 'healthy' | 'unhealthy' | 'unknown' => {
    const health = usageStats.provider_health?.[providerId];
    if (!health) return 'unknown';
    return health.is_healthy ? 'healthy' : 'unhealthy';
  };

  // BYOK 키 상태 체크
  const hasValidKey = (providerId: string): boolean => {
    const provider = config.providers[providerId];
    if (provider.key_type === 'none') return true;
    return !!userKeys[providerId];
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">검색 라우팅 관리</h2>
          <p className="text-muted-foreground">Role → Category → Source 3단 라우팅 시스템</p>
          {/* 디버깅 정보 */}
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/20 rounded">
            🔧 디버그: {config.categories.length}개 카테고리, {Object.keys(userKeys).length}개 사용자 키
          </div>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          v{config.version}
        </Badge>
      </div>

      {/* 테스트 검색 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            테스트 검색
          </CardTitle>
          <CardDescription>
            라우팅 시스템을 테스트해보세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="검색어를 입력하세요..."
              value={testQuery}
              onChange={(e) => setTestQuery(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-md bg-background"
              onKeyPress={(e) => e.key === 'Enter' && handleTestSearch()}
            />
            <Button onClick={handleTestSearch} disabled={isLoading || !testQuery.trim()}>
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : '검색'}
            </Button>
          </div>
          
          {/* 카테고리 선택 */}
          <div className="flex flex-wrap gap-2">
            {config.categories.filter(cat => cat.enabled).map(category => (
              <Badge
                key={category.id}
                variant={selectedCategories.includes(category.id) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category.id)
                      ? prev.filter(id => id !== category.id)
                      : [...prev, category.id]
                  );
                }}
              >
                {CATEGORY_ICONS[category.id]} {category.label}
              </Badge>
            ))}
          </div>

          {/* 검색 결과 */}
          {searchResults && (
            <div className="mt-4 p-4 border border-border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">검색 결과</span>
                <Badge variant="secondary">
                  {searchResults.results.length}개 결과 • {searchResults.search_time_ms}ms
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>사용된 소스: {searchResults.sources_used.join(', ')}</div>
                <div>검색된 카테고리: {searchResults.categories_searched.join(', ')}</div>
                {searchResults.fallback_used && (
                  <div className="text-amber-600">⚠️ Fallback 검색이 사용되었습니다</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="categories">카테고리</TabsTrigger>
          <TabsTrigger value="providers">프로바이더</TabsTrigger>
          <TabsTrigger value="usage">사용량</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        {/* 카테고리 관리 */}
        <TabsContent value="categories" className="space-y-4">
          <div className="grid gap-4">
            {config.categories.map(category => (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{CATEGORY_ICONS[category.id]}</span>
                      <div>
                        <CardTitle className="text-base">{category.label}</CardTitle>
                        <CardDescription>
                          {category.providers.length}개 프로바이더 • {category.selection} 선택
                        </CardDescription>
                      </div>
                    </div>
                    <Switch
                      checked={category.enabled}
                      onCheckedChange={(enabled) => toggleCategory(category.id, enabled)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Trial 사용량 */}
                  {config.trial.enabled && config.trial.per_user_daily[category.id] && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Trial 사용량</span>
                        <span className="text-muted-foreground">
                          {Math.floor(getTrialUsagePercentage(category.id))}%
                        </span>
                      </div>
                      <Progress 
                        value={getTrialUsagePercentage(category.id)} 
                        className="h-2"
                      />
                    </div>
                  )}

                  {/* 프로바이더 목록 */}
                  <div className="flex flex-wrap gap-2">
                    {category.providers.map(providerId => {
                      const provider = config.providers[providerId];
                      const status = getProviderStatus(providerId);
                      const hasKey = hasValidKey(providerId);
                      
                      return (
                        <div
                          key={providerId}
                          className="flex items-center gap-1 px-2 py-1 rounded-md border border-border bg-background"
                        >
                          <span className="text-xs">{PROVIDER_ICONS[providerId]}</span>
                          <span className="text-xs">{provider.label}</span>
                          
                          {/* 상태 인디케이터 */}
                          {status === 'healthy' && hasKey && (
                            <CheckCircle className="w-3 h-3 text-green-500" />
                          )}
                          {status === 'unhealthy' && (
                            <AlertCircle className="w-3 h-3 text-red-500" />
                          )}
                          {provider.key_type === 'byok' && !hasKey && (
                            <Key 
                              className="w-3 h-3 text-amber-500 cursor-pointer" 
                              onClick={() => onKeyRequest?.(providerId)}
                            />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 프로바이더 상세 */}
        <TabsContent value="providers" className="space-y-4">
          {Object.entries(config.providers).map(([providerId, provider]) => {
            const status = getProviderStatus(providerId);
            const hasKey = hasValidKey(providerId);
            
            return (
              <Card key={providerId}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{PROVIDER_ICONS[providerId]}</span>
                      <div>
                        <CardTitle className="text-base">{provider.label}</CardTitle>
                        <CardDescription>
                          {provider.category} • {provider.key_type} • 가중치: {provider.weight || 10}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {/* Trial 적용 여부 */}
                      {provider.trial_applies && (
                        <Badge variant="secondary" className="text-xs">Trial</Badge>
                      )}
                      
                      {/* 상태 */}
                      {status === 'healthy' && hasKey && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          정상
                        </Badge>
                      )}
                      {status === 'unhealthy' && (
                        <Badge className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          오류
                        </Badge>
                      )}
                      {provider.key_type === 'byok' && !hasKey && (
                        <Badge 
                          className="bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300 cursor-pointer"
                          onClick={() => onKeyRequest?.(providerId)}
                        >
                          <Key className="w-3 h-3 mr-1" />
                          키 필요
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </TabsContent>

        {/* 사용량 통계 */}
        <TabsContent value="usage" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Trial 사용량 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Trial 사용량 (오늘)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(config.trial.per_user_daily).map(([categoryId, limit]) => {
                  const used = usageStats.daily_trial_usage?.[new Date().toISOString().split('T')[0]]?.[categoryId] || 0;
                  const percentage = Math.min(100, (used / limit) * 100);
                  
                  return (
                    <div key={categoryId}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span className="flex items-center gap-1">
                          {CATEGORY_ICONS[categoryId]} {categoryId}
                        </span>
                        <span className="text-muted-foreground">
                          {used}/{limit}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      {percentage >= 100 && (
                        <Alert className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription className="text-xs">
                            {TRIAL_LIMIT_MESSAGES[categoryId as keyof typeof TRIAL_LIMIT_MESSAGES]}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* BYOK 호출 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  BYOK 호출 (오늘)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {usageStats.daily_byok_calls?.[new Date().toISOString().split('T')[0]] || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  개인 API 키로 수행한 검색 횟수
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 프로바이더 헬스 상태 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                프로바이더 상태
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-3">
                {Object.entries(usageStats.provider_health || {}).map(([providerId, health]) => (
                  <div
                    key={providerId}
                    className={`p-2 rounded-lg border ${
                      health.is_healthy 
                        ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                        : 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{PROVIDER_ICONS[providerId]}</span>
                      <span className="text-xs font-medium">{config.providers[providerId]?.label}</span>
                      {health.is_healthy ? (
                        <CheckCircle className="w-3 h-3 text-green-500" />
                      ) : (
                        <AlertCircle className="w-3 h-3 text-red-500" />
                      )}
                    </div>
                    {!health.is_healthy && health.last_error && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {health.last_error}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 설정 */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                라우팅 설정
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium">카테고리 정책</label>
                  <select 
                    value={config.routing.category_policy}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      routing: { ...prev.routing, category_policy: e.target.value as any }
                    }))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="one_per_category">카테고리당 1개</option>
                    <option value="parallel">병렬 실행</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Fallback 정책</label>
                  <select 
                    value={config.routing.fallback}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      routing: { ...prev.routing, fallback: e.target.value as any }
                    }))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="next_available">다음 사용 가능</option>
                    <option value="trial_only">Trial만</option>
                    <option value="none">없음</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">타임아웃 (ms)</label>
                  <input
                    type="number"
                    value={config.routing.timeout_ms}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      routing: { ...prev.routing, timeout_ms: parseInt(e.target.value) || 8000 }
                    }))}
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md bg-background"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-border">
                <Button 
                  onClick={() => routingService?.resetDailyUsage()}
                  variant="outline"
                  className="mr-2"
                >
                  사용량 초기화
                </Button>
                <Button onClick={() => window.location.reload()} variant="outline">
                  설정 새로고침
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
