/**
 * API 키 입력 컴포넌트
 * 
 * 개별 API 제공자를 위한 재사용 가능한 입력 폼
 */

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { TestTube, Eye, EyeOff, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from "sonner@2.0.3";
import { ApiKeyConfig } from '../src/utils/apiKeyManager';

interface ApiKeyInputProps {
  icon: string;
  name: string;
  provider: string;
  category: string;
  fields: Array<{
    key: string;
    label: string;
    placeholder: string;
    type?: 'text' | 'password';
    required?: boolean;
  }>;
  isFree?: boolean;
  description?: string;
  existingKey?: ApiKeyConfig | null;
  compact?: boolean;
  onSave: (provider: string, config: any) => void;
  onDelete?: (keyId: string) => void;
  onTest?: (apiKey: ApiKeyConfig) => void;
  isTestingId?: string | null;
}

export function ApiKeyInput({
  icon,
  name,
  provider,
  category,
  fields,
  isFree = false,
  description,
  existingKey,
  compact = false,
  onSave,
  onDelete,
  onTest,
  isTestingId
}: ApiKeyInputProps) {
  const [formData, setFormData] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    fields.forEach(field => {
      initial[field.key] = existingKey ? (existingKey as any)[field.key] || '' : '';
    });
    return initial;
  });
  
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSave = async () => {
    // 필수 필드 검증
    const requiredFields = fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formData[field.key]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`다음 필드를 입력해주세요: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(provider, {
        name: `${name} API`,
        category,
        ...formData
      });
    } catch (error) {
      console.error('Failed to save API key:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    if (existingKey && onDelete) {
      if (confirm(`${name} API 키를 삭제하시겠습니까?`)) {
        onDelete(existingKey.id);
      }
    }
  };

  const handleTest = () => {
    if (existingKey && onTest) {
      onTest(existingKey);
    }
  };

  const canSave = fields.filter(f => f.required).every(field => formData[field.key]?.trim());
  const hasExistingKey = !!existingKey;
  const isTesting = isTestingId === existingKey?.id;

  const [isExpanded, setIsExpanded] = useState(false);

  if (compact) {
    return (
      <div className={`border rounded transition-all ${isFree ? 'border-green-200 bg-green-50/30' : 'bg-muted/5'}`}>
        <div 
          className="flex items-center justify-between p-2 hover:bg-muted/10 transition-colors cursor-pointer"
          onClick={() => !isFree && !hasExistingKey && setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="text-sm">{icon}</span>
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-sm font-medium truncate">{name}</span>
              {isFree && <Badge variant="secondary" className="text-xs">무료</Badge>}
              {hasExistingKey && <Badge variant="default" className="text-xs">✓</Badge>}
            </div>
            {description && !hasExistingKey && (
              <span className="text-xs text-muted-foreground truncate">{description}</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 ml-2">
            {hasExistingKey ? (
              <>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTest();
                  }}
                  disabled={isTesting}
                  className="h-6 w-6 p-0"
                >
                  <TestTube className="w-3 h-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            ) : isFree ? (
              <Badge variant="outline" className="text-xs">사용 가능</Badge>
            ) : (
              <div className="flex items-center gap-1">
                <Badge variant="outline" className="text-xs">설정 필요</Badge>
                {fields.length > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {isExpanded ? '▲' : '▼'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {isExpanded && !isFree && !hasExistingKey && (
          <div className="p-3 border-t bg-muted/10 space-y-2">
            {fields.map((field) => (
              <div key={field.key} className="space-y-1">
                <Label className="text-xs">
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                <div className="relative">
                  <Input 
                    type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                    placeholder={field.placeholder}
                    value={formData[field.key] || ''}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    className="h-7 text-xs pr-8"
                  />
                  {field.type === 'password' && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-0 h-7 w-7 p-0"
                      onClick={() => toggleSecretVisibility(field.key)}
                    >
                      {showSecrets[field.key] ? 
                        <EyeOff className="w-3 h-3" /> : 
                        <Eye className="w-3 h-3" />
                      }
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="flex gap-1 pt-1">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleSave}
                disabled={!canSave || isSaving}
                className="h-6 text-xs"
              >
                {isSaving ? '저장 중...' : '저장'}
              </Button>
              <Button 
                size="sm" 
                variant="ghost" 
                onClick={() => setIsExpanded(false)}
                className="h-6 text-xs"
              >
                취소
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-3 p-3 border rounded-lg ${isFree ? 'bg-green-50/50' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h6 className="font-medium text-sm">{name}</h6>
          {isFree && <Badge variant="secondary" className="text-xs">무료</Badge>}
          {hasExistingKey && <Badge variant="default" className="text-xs">연결됨</Badge>}
        </div>
        
        {hasExistingKey && (
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleTest}
              disabled={isTesting}
              className="h-6 text-xs"
            >
              <TestTube className="w-3 h-3 mr-1" />
              {isTesting ? '테스트 중...' : '테스트'}
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleDelete}
              className="h-6 text-xs text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}

      {!isFree && (
        <div className="space-y-2">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1">
              <Label className="text-xs">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <div className="relative">
                <Input 
                  type={field.type === 'password' && !showSecrets[field.key] ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  value={formData[field.key] || ''}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="h-8 text-xs pr-8"
                />
                {field.type === 'password' && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-0 h-8 w-8 p-0"
                    onClick={() => toggleSecretVisibility(field.key)}
                  >
                    {showSecrets[field.key] ? 
                      <EyeOff className="w-3 h-3" /> : 
                      <Eye className="w-3 h-3" />
                    }
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!isFree && (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleSave}
            disabled={!canSave || isSaving}
            className="h-6 text-xs"
          >
            {isSaving ? '저장 중...' : hasExistingKey ? '업데이트' : '저장'}
          </Button>
          {!hasExistingKey && canSave && (
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                // 테스트 없이 저장만 하는 경우
                toast.info('저장 후 테스트 버튼으로 검증해보세요.');
              }}
              className="h-6 text-xs"
            >
              나중에 테스트
            </Button>
          )}
        </div>
      )}

      {isFree && (
        <div className="flex gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-6 text-xs"
            onClick={() => toast.info(`${name}는 무료로 사용 가능합니다!`)}
          >
            사용 가능
          </Button>
        </div>
      )}
    </div>
  );
}