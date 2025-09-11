import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { 
  X, 
  Crown, 
  Settings, 
  Globe, 
  Volume2, 
  Palette, 
  User, 
  Bell, 
  Shield, 
  Key,
  Mic,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Bot,
  Zap,
  Check,
  Play,
  ExternalLink,
  Loader2
} from 'lucide-react';
import { useApp } from '../src/context/AppContext';
import { useTheme } from '../src/context/ThemeContext';
import { GoogleConnectorModal } from './GoogleConnectorModal';
import { ImageGenerationSettings } from './ImageGenerationSettings';
import { toast } from "sonner";

interface SafeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SafeSettingsModal({ isOpen, onClose }: SafeSettingsModalProps) {
  const { state } = useApp();
  const { theme, setTheme } = useTheme();
  
  // 접힘 상태 관리
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    'search-builtin': false,
    'search-byok': false,
    'other-academic': false,
    'other-ai-tools': false
  });

  // 검색 API 키 상태
  const [searchApiKeys, setSearchApiKeys] = useState({
    googleCustomSearch: { apiKey: '', searchEngineId: '', isEnabled: false },
    bingSearch: { apiKey: '', isEnabled: false },
    serper: { apiKey: '', isEnabled: false },
    serpapi: { apiKey: '', isEnabled: false }
  });

  // 섹션 접힘/펼침 토글
  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  // 검색 서비스 토글
  const toggleSearchService = (serviceId: string, enabled: boolean) => {
    setSearchApiKeys(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId as keyof typeof prev],
        isEnabled: enabled
      }
    }));
  };

  // API 키 업데이트
  const updateSearchApiKey = (serviceId: string, field: string, value: string) => {
    setSearchApiKeys(prev => ({
      ...prev,
      [serviceId]: {
        ...prev[serviceId as keyof typeof prev],
        [field]: value
      }
    }));
  };

  // API 키 테스트
  const testSearchApiKey = (serviceId: string) => {
    toast.info(`${serviceId} API 키를 테스트 중...`);
    // TODO: 실제 API 키 테스트 로직 구현
  };

  // 통합 검색 테스트
  const testUnifiedSearch = (query: string) => {
    toast.info(`"${query}"로 통합 검색을 테스트 중...`);
    // TODO: 실제 통합 검색 테스트 로직 구현
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-background border border-border rounded-lg shadow-lg overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            <h2 className="text-lg font-semibold">설정</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 탭 네비게이션 */}
        <Tabs defaultValue="providers" className="flex flex-col h-full">
          <div className="px-6 py-4 border-b border-border">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="providers">Provider</TabsTrigger>
              <TabsTrigger value="search">검색</TabsTrigger>
              <TabsTrigger value="other">기타</TabsTrigger>
              <TabsTrigger value="connectors">커넥터</TabsTrigger>
              <TabsTrigger value="appearance">외관</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {/* Provider 탭 */}
            <TabsContent value="providers" className="space-y-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">AI Provider 설정</h3>
                <p className="text-muted-foreground">AI 서비스 제공업체 설정을 관리합니다.</p>
              </div>
            </TabsContent>

            {/* 검색 설정 탭 */}
            <TabsContent value="search" className="space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto sidebar-section-scroll">
                <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-2">
                  <h4 className="text-sm font-medium">검색 서비스 설정</h4>
                  <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                    <Check className="w-3 h-3 mr-1" />
                    4개 활성화
                  </Badge>
                </div>

                {/* 내장 서비스 */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSectionCollapse('search-builtin')}
                  >
                    <Label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">내장 서비스</Label>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <svg className={`w-4 h-4 transform transition-transform ${collapsedSections['search-builtin'] ? 'rotate-0' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none">
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  {!collapsedSections['search-builtin'] && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded border hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">위키백과</div>
                          <div className="text-xs text-muted-foreground">무료 백과사전 검색</div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          활성화
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded border hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">네이버 백과</div>
                          <div className="text-xs text-muted-foreground">한국어 지식 검색</div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          활성화
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* BYOK 서비스 */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSectionCollapse('search-byok')}
                  >
                    <Label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">API 키 필요 서비스</Label>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <svg className={`w-4 h-4 transform transition-transform ${collapsedSections['search-byok'] ? 'rotate-0' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none">
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  {!collapsedSections['search-byok'] && (
                    <div className="space-y-3">
                      {/* Google Custom Search */}
                      <div className="border rounded p-3 space-y-3 hover:border-primary/50 hover:bg-muted/10 transition-all">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">Google Custom Search</div>
                            <div className="text-xs text-muted-foreground">구글 검색 엔진 API</div>
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
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label className="text-xs text-muted-foreground mb-1 block">
                            Google API 키와 검색 엔진 ID를 입력하여 고품질 검색 사용하기
                          </Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="password"
                              placeholder="API 키"
                              value={searchApiKeys.googleCustomSearch.apiKey}
                              onChange={(e) => updateSearchApiKey('googleCustomSearch', 'apiKey', e.target.value)}
                              className="text-sm h-8"
                            />
                            <Input
                              placeholder="Search Engine ID"
                              value={searchApiKeys.googleCustomSearch.searchEngineId}
                              onChange={(e) => updateSearchApiKey('googleCustomSearch', 'searchEngineId', e.target.value)}
                              className="text-sm h-8"
                            />
                          </div>
                          
                          {searchApiKeys.googleCustomSearch.apiKey && searchApiKeys.googleCustomSearch.searchEngineId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => testSearchApiKey('googleCustomSearch')}
                              className="w-full h-8 mt-2"
                            >
                              <Play className="w-3 h-3 mr-1" />
                              테스트
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 검색 테스트 */}
                <div className="border-t pt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">검색 테스트</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="검색어를 입력하세요..."
                      className="flex-1 h-8 text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const query = (e.target as HTMLInputElement).value.trim();
                          if (query) {
                            testUnifiedSearch(query);
                          }
                        }
                      }}
                    />
                    <Button onClick={() => {
                      const input = document.querySelector('input[placeholder="검색어를 입력하세요..."]') as HTMLInputElement;
                      const query = input?.value?.trim();
                      if (query) {
                        testUnifiedSearch(query);
                      } else {
                        toast.error('검색어를 입력해주세요');
                      }
                    }} size="sm" className="h-8 px-3">
                      <Play className="w-3 h-3 mr-1" />
                      테스트
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 기타 Provider 탭 */}
            <TabsContent value="other" className="space-y-6">
              <div className="space-y-4 max-h-96 overflow-y-auto sidebar-section-scroll">
                <div className="flex items-center justify-between sticky top-0 bg-background z-10 pb-2">
                  <h4 className="text-sm font-medium">기타 AI 서비스</h4>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    <Check className="w-3 h-3 mr-1" />
                    9개 활성화
                  </Badge>
                </div>

                {/* 학문 데이터베이스 섹션 */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSectionCollapse('other-academic')}
                  >
                    <Label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">학문 데이터베이스 및 연구 자료</Label>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <svg className={`w-4 h-4 transform transition-transform ${collapsedSections['other-academic'] ? 'rotate-0' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none">
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  {!collapsedSections['other-academic'] && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded border hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">PubMed</div>
                          <div className="text-xs text-muted-foreground">의학 및 생명과학 논문 데이터베이스</div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          활성화
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded border hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">Semantic Scholar</div>
                          <div className="text-xs text-muted-foreground">학술 논문 및 인용 데이터베이스</div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          활성화
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI 도구 섹션 */}
                <div className="space-y-3">
                  <div 
                    className="flex items-center justify-between cursor-pointer group"
                    onClick={() => toggleSectionCollapse('other-ai-tools')}
                  >
                    <Label className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">AI 도구 및 서비스</Label>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <svg className={`w-4 h-4 transform transition-transform ${collapsedSections['other-ai-tools'] ? 'rotate-0' : 'rotate-180'}`} viewBox="0 0 24 24" fill="none">
                        <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                  
                  {!collapsedSections['other-ai-tools'] && (
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded border hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">음성 생성 (TTS)</div>
                          <div className="text-xs text-muted-foreground">텍스트를 음성으로 변환, 음성 인식 지원</div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          활성화
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-muted/20 rounded border hover:bg-muted/30 transition-colors">
                        <div>
                          <div className="font-medium text-sm">문서 분석</div>
                          <div className="text-xs text-muted-foreground">텍스트 문서 분석, 요약, 구조화</div>
                        </div>
                        <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20">
                          활성화
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>

                {/* 데이터베이스 연결 테스트 */}
                <div className="border-t pt-4">
                  <Label className="text-xs text-muted-foreground mb-2 block">데이터베이스 연결 테스트</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="테스트 검색어를 입력하세요..."
                      className="flex-1 h-8 text-sm"
                    />
                    <Button 
                      size="sm" 
                      className="h-8 px-3"
                      onClick={() => toast.info('학문 데이터베이스 연결 테스트 중...')}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      테스트
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* 커넥터 설정 탭 */}
            <TabsContent value="connectors" className="space-y-6">
              <div className="text-center py-8">
                <h3 className="text-lg font-medium mb-2">커넥터 설정</h3>
                <p className="text-muted-foreground">외부 서비스 연동을 관리합니다.</p>
              </div>
            </TabsContent>

            {/* 외관 설정 탭 */}
            <TabsContent value="appearance" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">외관 설정</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-sm font-medium">테마</Label>
                      <p className="text-xs text-muted-foreground">앱의 색상 테마를 선택하세요</p>
                    </div>
                    <Select value={theme} onValueChange={setTheme}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">라이트</SelectItem>
                        <SelectItem value="dark">다크</SelectItem>
                        <SelectItem value="system">시스템</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
