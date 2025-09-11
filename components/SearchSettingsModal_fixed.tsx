/**
 * 검색 설정 모달 컴포넌트
 * 
 * AI가 사용할 검색 도구들의 API 키를 관리하는 간단한 모달
 * - 검색 서비스 활성화/비활성화
 * - API 키 입력 및 테스트
 * - 실시간 상태 표시
 */

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { X, Search, Check, Play, AlertCircle, ExternalLink, Settings, BookOpen, Newspaper, TrendingUp, Database } from 'lucide-react';
import { toast } from "sonner";
import { useApp } from '../src/context/AppContext';

interface SearchSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchSettingsModal({ isOpen, onClose }: SearchSettingsModalProps) {
  const { state, updateSettings } = useApp();
  
  // 검색 API 키 관리 상태
  const [searchApiKeys, setSearchApiKeys] = useState({
    googleCustomSearch: { apiKey: '', searchEngineId: '', isEnabled: false },
    bingSearch: { apiKey: '', isEnabled: false },
    serper: { apiKey: '', isEnabled: false },
    serpapi: { apiKey: '', isEnabled: false }
  });

  // 내장 서비스 토글 상태
  const [builtInServices, setBuiltInServices] = useState({
    naver: { isEnabled: true, name: '네이버 검색', description: '한국어 웹 검색, 뉴스, 블로그' },
    wikipedia: { isEnabled: true, name: '위키백과', description: '백과사전 정보, 학술 자료' },
    pubmed: { isEnabled: true, name: 'PubMed', description: '의학/생명과학 논문 검색' },
    semanticScholar: { isEnabled: true, name: 'Semantic Scholar', description: '학술 논문 및 인용 정보' },
    newsApi: { isEnabled: true, name: 'NewsAPI', description: '실시간 뉴스 검색' }
  });

  const [isTesting, setIsTesting] = useState<string | null>(null);

  // 저장된 설정 로드
  useEffect(() => {
    if (isOpen) {
      // API 키 설정 로드
      const savedSearchKeys = localStorage.getItem('searchApiKeys');
      if (savedSearchKeys) {
        try {
          const keys = JSON.parse(savedSearchKeys);
          setSearchApiKeys(prev => ({ ...prev, ...keys }));
        } catch (error) {
          console.error('검색 API 키 로드 실패:', error);
        }
      }

      // 내장 서비스 설정 로드
      const savedBuiltInServices = localStorage.getItem('builtInSearchServices');
      if (savedBuiltInServices) {
        try {
          const services = JSON.parse(savedBuiltInServices);
          setBuiltInServices(prev => ({ ...prev, ...services }));
        } catch (error) {
          console.error('내장 서비스 설정 로드 실패:', error);
        }
      }

      // 전역 설정에서 기본값 적용
      if (state.searchConfig) {
        const globalConfig = state.searchConfig;
        setBuiltInServices(prev => ({
          ...prev,
          naver: { ...prev.naver, isEnabled: globalConfig.enabledCategories.includes('web') },
          wikipedia: { ...prev.wikipedia, isEnabled: globalConfig.enabledCategories.includes('scholar') },
          pubmed: { ...prev.pubmed, isEnabled: globalConfig.enabledCategories.includes('scholar') },
          semanticScholar: { ...prev.semanticScholar, isEnabled: globalConfig.enabledCategories.includes('scholar') },
          newsApi: { ...prev.newsApi, isEnabled: globalConfig.enabledCategories.includes('news') }
        }));
      }
    }
  }, [isOpen, state.searchConfig]);

  // 검색 API 키 업데이트
  const updateSearchApiKey = (provider: string, field: string, value: string) => {
    setSearchApiKeys(prev => {
      const updated = {
        ...prev,
        [provider]: {
          ...prev[provider],
          [field]: value
        }
      };
      
      // 로컬 스토리지에 저장
      localStorage.setItem('searchApiKeys', JSON.stringify(updated));
      
      return updated;
    });
  };

  // 검색 서비스 활성화/비활성화
  const toggleSearchService = (provider: string, enabled: boolean) => {
    setSearchApiKeys(prev => {
      const updated = {
        ...prev,
        [provider]: {
          ...prev[provider],
          isEnabled: enabled
        }
      };
      
      // 로컬 스토리지에 저장
      localStorage.setItem('searchApiKeys', JSON.stringify(updated));
      
      // unifiedSearchService에도 설정 적용
      if (typeof window !== 'undefined') {
        import('../src/services/unifiedSearchService').then(({ unifiedSearchService }) => {
          unifiedSearchService.toggleProvider(provider, enabled);
          if (enabled && prev[provider]) {
            unifiedSearchService.setProviderConfig(provider, prev[provider]);
          }
        });
      }
      
      return updated;
    });
    
    toast.success(`${getSearchProviderName(provider)} ${enabled ? '활성화' : '비활성화'}되었습니다`);
  };

  // 내장 서비스 토글
  const toggleBuiltInService = (service: string, enabled: boolean) => {
    setBuiltInServices(prev => {
      const updated = {
        ...prev,
        [service]: {
          ...prev[service],
          isEnabled: enabled
        }
      };
      
      // 로컬 스토리지에 저장
      localStorage.setItem('builtInSearchServices', JSON.stringify(updated));
      
      // 전역 설정에도 반영
      const currentCategories = state.searchConfig?.enabledCategories || [];
      let newCategories = [...currentCategories];
      
      if (service === 'naver') {
        if (enabled && !newCategories.includes('web')) {
          newCategories.push('web');
        } else if (!enabled) {
          newCategories = newCategories.filter(cat => cat !== 'web');
        }
      } else if (['wikipedia', 'pubmed', 'semanticScholar'].includes(service)) {
        if (enabled && !newCategories.includes('scholar')) {
          newCategories.push('scholar');
        } else if (!enabled) {
          // 다른 학술 서비스들이 활성화되어 있는지 확인
          const otherScholarServices = ['wikipedia', 'pubmed', 'semanticScholar'].filter(s => s !== service);
          const hasOtherActiveScholar = otherScholarServices.some(s => updated[s]?.isEnabled);
          if (!hasOtherActiveScholar) {
            newCategories = newCategories.filter(cat => cat !== 'scholar');
          }
        }
      } else if (service === 'newsApi') {
        if (enabled && !newCategories.includes('news')) {
          newCategories.push('news');
        } else if (!enabled) {
          newCategories = newCategories.filter(cat => cat !== 'news');
        }
      }

      // 전역 설정 업데이트
      updateSettings({
        searchConfig: {
          ...state.searchConfig,
          enabledCategories: newCategories
        }
      });
      
      return updated;
    });
    
    toast.success(`${builtInServices[service]?.name} ${enabled ? '활성화' : '비활성화'}되었습니다`);
  };

  // 검색 Provider 이름 가져오기
  const getSearchProviderName = (provider: string) => {
    const names = {
      googleCustomSearch: 'Google Custom Search',
      bingSearch: 'Bing Search',
      serper: 'Serper.dev',
      serpapi: 'SerpAPI'
    };
    return names[provider] || provider;
  };

  // 검색 API 키 테스트
  const testSearchApiKey = async (provider: string) => {
    const config = searchApiKeys[provider];
    if (!config.apiKey) {
      toast.error('API 키를 먼저 입력해주세요');
      return;
    }

    setIsTesting(provider);
    
    try {
      toast.info('API 키를 테스트 중입니다...');
      
      // unifiedSearchService를 통해 검증
      const { unifiedSearchService } = await import('../src/services/unifiedSearchService');
      unifiedSearchService.setProviderConfig(provider, config);
      const results = await unifiedSearchService.validateProviders();
      
      if (results[provider]?.isValid) {
        toast.success('API 키가 정상적으로 작동합니다! ✅');
        toggleSearchService(provider, true);
      } else {
        toast.error(`API 키 검증 실패: ${results[provider]?.error || '알 수 없는 오류'}`);
      }
    } catch (error) {
      console.error('API 키 테스트 실패:', error);
      toast.error('API 키 테스트 중 오류가 발생했습니다');
    } finally {
      setIsTesting(null);
    }
  };

  // 활성화된 서비스 개수
  const enabledCount = Object.values(searchApiKeys).filter(config => config.isEnabled).length;
  const totalBYOKServices = Object.keys(searchApiKeys).length;

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <DialogTitle>🔍 AI 검색 & 데이터 소스 설정</DialogTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  AI가 대화 중에 사용할 검색 서비스와 데이터 소스들을 설정하세요
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                <Check className="w-3 h-3 mr-1" />
                5개 내장
              </Badge>
              <Badge variant="outline">
                {enabledCount}/{totalBYOKServices} BYOK 활성화
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="builtin" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="builtin" className="flex items-center gap-2">
              <Database className="w-4 h-4" />
              내장 서비스
            </TabsTrigger>
            <TabsTrigger value="byok" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              BYOK 서비스
            </TabsTrigger>
          </TabsList>

          {/* 내장 서비스 탭 */}
          <TabsContent value="builtin" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">기본 제공 서비스</h4>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                  무료 서비스
                </Badge>
              </div>
              
              <div className="grid gap-3">
                {/* 웹 검색 카테고리 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <Newspaper className="w-5 h-5 text-blue-500" />
                      <CardTitle className="text-base">웹 검색 & 뉴스</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* 네이버 검색 */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-sm">🟢</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">네이버 검색</div>
                          <div className="text-xs text-muted-foreground">{builtInServices.naver.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {builtInServices.naver.isEnabled ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                            활성화
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">비활성화</Badge>
                        )}
                        <Switch
                          checked={builtInServices.naver.isEnabled}
                          onCheckedChange={(checked) => toggleBuiltInService('naver', checked)}
                        />
                      </div>
                    </div>

                    {/* NewsAPI */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-sm">📰</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">NewsAPI</div>
                          <div className="text-xs text-muted-foreground">{builtInServices.newsApi.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {builtInServices.newsApi.isEnabled ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                            활성화
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">비활성화</Badge>
                        )}
                        <Switch
                          checked={builtInServices.newsApi.isEnabled}
                          onCheckedChange={(checked) => toggleBuiltInService('newsApi', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 학술 정보 카테고리 */}
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-purple-500" />
                      <CardTitle className="text-base">학술 정보 & 연구</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* 위키백과 */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-sm">📚</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">위키백과</div>
                          <div className="text-xs text-muted-foreground">{builtInServices.wikipedia.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {builtInServices.wikipedia.isEnabled ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                            활성화
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">비활성화</Badge>
                        )}
                        <Switch
                          checked={builtInServices.wikipedia.isEnabled}
                          onCheckedChange={(checked) => toggleBuiltInService('wikipedia', checked)}
                        />
                      </div>
                    </div>

                    {/* PubMed */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-sm">🏥</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">PubMed</div>
                          <div className="text-xs text-muted-foreground">{builtInServices.pubmed.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {builtInServices.pubmed.isEnabled ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                            활성화
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">비활성화</Badge>
                        )}
                        <Switch
                          checked={builtInServices.pubmed.isEnabled}
                          onCheckedChange={(checked) => toggleBuiltInService('pubmed', checked)}
                        />
                      </div>
                    </div>

                    {/* Semantic Scholar */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/20 border border-border/20">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                          <span className="text-sm">🎓</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">Semantic Scholar</div>
                          <div className="text-xs text-muted-foreground">{builtInServices.semanticScholar.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {builtInServices.semanticScholar.isEnabled ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                            활성화
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">비활성화</Badge>
                        )}
                        <Switch
                          checked={builtInServices.semanticScholar.isEnabled}
                          onCheckedChange={(checked) => toggleBuiltInService('semanticScholar', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 설정 안내 */}
            <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">내장 서비스 안내</span>
              </div>
              
              <div className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <p>• 내장 서비스들은 무료로 제공되며 API 키가 필요하지 않습니다</p>
                <p>• AI가 대화 중 필요하다고 판단하면 활성화된 서비스들을 자동으로 사용합니다</p>
                <p>• 각 서비스는 개별적으로 활성화/비활성화할 수 있습니다</p>
                <p>• 전역 설정에 따라 기본값이 자동으로 적용됩니다</p>
              </div>
            </div>
          </TabsContent>

          {/* BYOK 서비스 탭 */}
          <TabsContent value="byok" className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">API 키 필요 서비스 (BYOK)</h4>
                <Badge variant="outline" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                  사용자 API 키 필요
                </Badge>
              </div>
              
              <div className="grid gap-4">
                {/* Google Custom Search */}
                <div className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <span className="text-sm">🔍</span>
                      </div>
                      <div>
                        <div className="font-medium text-sm">Google Custom Search</div>
                        <div className="text-xs text-muted-foreground">구글 검색 엔진 API (고품질)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {searchApiKeys.googleCustomSearch.isEnabled ? (
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                          활성화
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">설정 필요</Badge>
                      )}
                      <Switch
                        checked={searchApiKeys.googleCustomSearch.isEnabled}
                        onCheckedChange={(checked) => toggleSearchService('googleCustomSearch', checked)}
                        disabled={!searchApiKeys.googleCustomSearch.apiKey || !searchApiKeys.googleCustomSearch.searchEngineId}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">API 키</Label>
                      <Input
                        type="password"
                        placeholder="Google API 키"
                        value={searchApiKeys.googleCustomSearch.apiKey}
                        onChange={(e) => updateSearchApiKey('googleCustomSearch', 'apiKey', e.target.value)}
                        className="text-xs mt-1 h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Search Engine ID</Label>
                      <Input
                        placeholder="검색 엔진 ID"
                        value={searchApiKeys.googleCustomSearch.searchEngineId}
                        onChange={(e) => updateSearchApiKey('googleCustomSearch', 'searchEngineId', e.target.value)}
                        className="text-xs mt-1 h-8"
                      />
                    </div>
                  </div>
                  
                  {searchApiKeys.googleCustomSearch.apiKey && searchApiKeys.googleCustomSearch.searchEngineId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testSearchApiKey('googleCustomSearch')}
                      disabled={isTesting === 'googleCustomSearch'}
                      className="w-full h-8 text-xs"
                    >
                      {isTesting === 'googleCustomSearch' ? (
                        <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1" />
                      ) : (
                        <Play className="w-3 h-3 mr-1" />
                      )}
                      API 키 테스트
                    </Button>
                  )}
                </div>

                {/* 다른 검색 서비스들 */}
                {Object.entries({
                  bingSearch: { name: 'Bing Search API', desc: 'Microsoft Bing 검색 API', icon: '🌐', color: 'orange' },
                  serper: { name: 'Serper.dev', desc: '빠른 Google 검색 API', icon: '⚡', color: 'purple' },
                  serpapi: { name: 'SerpAPI', desc: '포괄적인 검색 API', icon: '🐍', color: 'green' }
                }).map(([key, info]) => (
                  <div key={key} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 bg-${info.color}-100 dark:bg-${info.color}-900/30 rounded-lg flex items-center justify-center`}>
                          <span className="text-sm">{info.icon}</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{info.name}</div>
                          <div className="text-xs text-muted-foreground">{info.desc}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {searchApiKeys[key].isEnabled ? (
                          <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20 text-xs">
                            활성화
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">설정 필요</Badge>
                        )}
                        <Switch
                          checked={searchApiKeys[key].isEnabled}
                          onCheckedChange={(checked) => toggleSearchService(key, checked)}
                          disabled={!searchApiKeys[key].apiKey}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label className="text-xs">API 키</Label>
                      <Input
                        type="password"
                        placeholder={`${info.name} API 키`}
                        value={searchApiKeys[key].apiKey}
                        onChange={(e) => updateSearchApiKey(key, 'apiKey', e.target.value)}
                        className="text-xs mt-1 h-8"
                      />
                    </div>
                    
                    {searchApiKeys[key].apiKey && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => testSearchApiKey(key)}
                        disabled={isTesting === key}
                        className="w-full h-8 text-xs"
                      >
                        {isTesting === key ? (
                          <div className="w-3 h-3 border border-gray-300 border-t-gray-600 rounded-full animate-spin mr-1" />
                        ) : (
                          <Play className="w-3 h-3 mr-1" />
                        )}
                        API 키 테스트
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              {/* 도움말 */}
              <div className="space-y-3 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">BYOK 서비스 안내</span>
                </div>
                
                <div className="text-xs text-orange-600 dark:text-orange-400 space-y-1">
                  <p>• BYOK 서비스는 각자의 API 키가 필요합니다</p>
                  <p>• API 키를 설정한 후 테스트 버튼으로 연결을 확인하세요</p>
                  <p>• 설정한 검색 도구들은 AI가 필요할 때 자동으로 사용합니다</p>
                  <p>• 더 높은 품질과 다양한 검색 결과를 제공합니다</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
