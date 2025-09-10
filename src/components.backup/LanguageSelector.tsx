import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Search, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES, type Language } from '../src/locales';
import { useTranslation } from '../src/hooks/useTranslation';

interface LanguageSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onLanguageSelect: (languageCode: Language) => void;
  currentLanguage: Language;
}

interface LanguageOption {
  code: Language | 'auto';
  name: string;
  nativeName: string;
}

export function LanguageSelector({ isOpen, onClose, onLanguageSelect, currentLanguage }: LanguageSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const translation = useTranslation();
  const { t, isInitialized } = translation;

  // 언어 목록 생성 (자동 감지를 맨 위에)
  const languages: LanguageOption[] = [
    { code: 'auto', name: 'Auto-detect', nativeName: isInitialized ? t('autoDetect') : '자동 감지' },
    ...SUPPORTED_LANGUAGES.map(lang => ({
      code: lang,
      name: getLanguageEnglishName(lang),
      nativeName: LANGUAGE_NAMES[lang]
    }))
  ];

  function getLanguageEnglishName(lang: Language): string {
    const englishNames = {
      ko: 'Korean',
      en: 'English', 
      ja: 'Japanese',
      es: 'Spanish',
      pt: 'Portuguese',
      hi: 'Hindi'
    };
    return englishNames[lang] || lang;
  }

  const filteredLanguages = languages.filter(
    language =>
      language.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      language.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLanguageSelect = (languageCode: Language | 'auto') => {
    if (languageCode === 'auto') {
      // 자동 감지 모드로 설정
      localStorage.removeItem('roleGtp_language_manual');
      localStorage.removeItem('roleGtp_language');
      
      // 브라우저 언어 자동 감지
      const browserLang = navigator.language.split('-')[0] as Language;
      const detectedLang = SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'ko';
      onLanguageSelect(detectedLang);
    } else {
      // 수동 선택 모드로 설정
      localStorage.setItem('roleGtp_language_manual', 'true');
      localStorage.setItem('roleGtp_language', languageCode);
      onLanguageSelect(languageCode);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('language')}</DialogTitle>
        </DialogHeader>

        {/* 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="언어 검색하기"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* 언어 목록 */}
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-1 p-1">
            {filteredLanguages.map((language) => (
              <Button
                key={language.code}
                variant="ghost"
                className="w-full justify-between h-12 px-3"
                onClick={() => handleLanguageSelect(language.code)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{language.nativeName}</span>
                  <span className="text-sm text-muted-foreground">{language.name}</span>
                </div>
                {(currentLanguage === language.code || 
                  (language.code === 'auto' && !localStorage.getItem('roleGtp_language_manual'))) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </Button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}