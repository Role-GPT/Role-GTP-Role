import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Check, Lock, ExternalLink } from 'lucide-react';

interface GrokModelSelectorProps {
  onModelSelect?: (model: string) => void;
  onApiSetup?: () => void;
}

interface ModelConfig {
  id: string;
  name: string;
  description: string;
  provider: string;
  requiresApiKey: boolean;
  icon: string;
}

// 동적으로 사용 가능한 모델들을 생성하는 함수
const generateAvailableModels = (): ModelConfig[] => {
  const models: ModelConfig[] = [
    { id: 'role-gpt', name: 'Role GPT', description: '역할 기반 AI', provider: 'builtin', requiresApiKey: false, icon: '🎭' }
  ];

  try {
    const savedConfigs = localStorage.getItem('role-gpt-api-configs');
    if (savedConfigs) {
      const configs = JSON.parse(savedConfigs);
      
      Object.entries(configs).forEach(([providerId, config]: [string, any]) => {
        if (config?.isActive && config?.apiKey?.trim() && config?.selectedModels?.length > 0) {
          // Provider별 아이콘 매핑
          const providerIcons: Record<string, string> = {
            openai: '🤖',
            anthropic: '🧠', 
            google: '🔮',
            openrouter: '🌐',
            groq: '⚡',
            xai: '🚀',
            custom: '🔧'
          };

          config.selectedModels.forEach((modelId: string) => {
            models.push({
              id: `${providerId}:${modelId}`,
              name: getModelDisplayName(providerId, modelId),
              description: getModelDescription(providerId, modelId),
              provider: providerId,
              requiresApiKey: true,
              icon: providerIcons[providerId] || '🤖'
            });
          });
        }
      });
    }
  } catch (error) {
    console.error('Failed to generate available models:', error);
  }

  return models;
};

// 모델 표시 이름 생성
const getModelDisplayName = (providerId: string, modelId: string): string => {
  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic',
    google: 'Google',
    openrouter: 'OpenRouter',
    groq: 'Groq',
    xai: 'xAI',
    custom: 'Custom'
  };

  // 모델 이름 정리
  const cleanModelName = modelId
    .replace(/^(anthropic|openai|meta-llama|mistralai)\//, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());

  return `${cleanModelName}`;
};

// 모델 설명 생성
const getModelDescription = (providerId: string, modelId: string): string => {
  const providerNames: Record<string, string> = {
    openai: 'OpenAI',
    anthropic: 'Anthropic', 
    google: 'Google',
    openrouter: 'OpenRouter',
    groq: 'Groq',
    xai: 'xAI',
    custom: 'Custom'
  };

  return `via ${providerNames[providerId] || providerId}`;
};

export function GrokModelSelector({ onModelSelect, onApiSetup }: GrokModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState('role-gpt');
  const [allModels, setAllModels] = useState<ModelConfig[]>([]);

  // API 설정 변경 감지 및 모델 목록 업데이트
  useEffect(() => {
    const updateModels = () => {
      const models = generateAvailableModels();
      setAllModels(models);
    };

    // 초기 로드
    updateModels();

    // 로컬 스토리지 변경 감지
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'role-gpt-api-configs') {
        updateModels();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // 주기적으로 업데이트 (같은 탭에서의 변경 감지)
    const interval = setInterval(updateModels, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleModelSelect = (modelId: string, model: ModelConfig) => {
    if (model.requiresApiKey && !allModels.find(m => m.id === modelId)) {
      // 모델이 사용 불가능하면 설정 모달 열기
      onApiSetup?.();
      return;
    }
    
    setSelectedModel(modelId);
    onModelSelect?.(modelId);
  };

  // 사용 가능한 모델과 잠긴 모델 분리
  const availableModels = allModels.filter(model => !model.requiresApiKey || model.id !== 'role-gpt');
  const builtinModels = allModels.filter(model => !model.requiresApiKey);
  
  // 잠긴 모델들 (설정되지 않은 Provider들)
  const getLockedProviders = () => {
    const configuredProviders = new Set();
    try {
      const savedConfigs = localStorage.getItem('role-gpt-api-configs');
      if (savedConfigs) {
        const configs = JSON.parse(savedConfigs);
        Object.entries(configs).forEach(([providerId, config]: [string, any]) => {
          if (config?.isActive && config?.apiKey?.trim() && config?.selectedModels?.length > 0) {
            configuredProviders.add(providerId);
          }
        });
      }
    } catch (error) {
      console.error('Failed to parse configs:', error);
    }

    const allProviders = ['openai', 'anthropic', 'google', 'openrouter', 'groq', 'xai'];
    return allProviders.filter(provider => !configuredProviders.has(provider));
  };

  const lockedProviders = getLockedProviders();

  return (
    <div className="space-y-6">
      {/* 기본 모델 */}
      {builtinModels.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">기본 모델</span>
            <span className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-1 rounded-full">
              무료
            </span>
          </div>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {builtinModels.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                className={`relative h-11 px-4 rounded-full transition-all duration-200 ${
                  selectedModel === model.id 
                    ? 'bg-foreground text-background hover:bg-foreground/90' 
                    : 'bg-muted/50 hover:bg-muted border-border/50'
                }`}
                onClick={() => handleModelSelect(model.id, model)}
              >
                <span className="mr-2">{model.icon}</span>
                {selectedModel === model.id && (
                  <Check className="w-4 h-4 mr-2" />
                )}
                <span className="font-medium">{model.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 설정된 외부 모델들 */}
      {availableModels.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">설정된 AI 모델</span>
            <span className="text-xs bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full">
              {availableModels.length}개 사용 가능
            </span>
          </div>
          <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
            {availableModels.map((model) => (
              <Button
                key={model.id}
                variant={selectedModel === model.id ? "default" : "outline"}
                className={`h-12 px-4 justify-start transition-all duration-200 ${
                  selectedModel === model.id 
                    ? 'bg-foreground text-background hover:bg-foreground/90' 
                    : 'bg-muted/50 hover:bg-muted border-border/50'
                }`}
                onClick={() => handleModelSelect(model.id, model)}
              >
                <span className="mr-3">{model.icon}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs opacity-70">{model.description}</div>
                </div>
                {selectedModel === model.id && (
                  <Check className="w-4 h-4 ml-2" />
                )}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* 설정 가능한 Provider들 */}
      {lockedProviders.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm font-medium text-muted-foreground">설정 가능한 Provider</span>
            <span className="text-xs bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 px-2 py-1 rounded-full">
              API 키 필요
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {lockedProviders.map((providerId) => {
              const providerInfo: Record<string, { name: string; icon: string }> = {
                openai: { name: 'OpenAI', icon: '🤖' },
                anthropic: { name: 'Anthropic', icon: '🧠' },
                google: { name: 'Google AI', icon: '🔮' },
                openrouter: { name: 'OpenRouter', icon: '🌐' },
                groq: { name: 'Groq', icon: '⚡' },
                xai: { name: 'xAI', icon: '🚀' }
              };
              
              const info = providerInfo[providerId];
              if (!info) return null;
              
              return (
                <Button
                  key={providerId}
                  variant="outline"
                  className="h-12 px-3 justify-start bg-muted/30 border-border/30 text-muted-foreground hover:bg-muted/50 transition-all duration-200"
                  onClick={onApiSetup}
                >
                  <span className="mr-2 opacity-50">{info.icon}</span>
                  <Lock className="w-3 h-3 mr-2 opacity-60" />
                  <span className="font-medium text-sm">{info.name}</span>
                </Button>
              );
            })}
          </div>
          
          <div className="text-center mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onApiSetup}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="w-3 h-3 mr-2" />
              API 키 설정하고 더 많은 모델 사용하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}