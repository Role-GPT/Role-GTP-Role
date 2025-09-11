// Web Speech API 타입 정의
interface SpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onstart: ((event: any) => void) | null;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: ((event: any) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

// 음성 관리자 클래스
class SpeechManager {
  private synth: SpeechSynthesis | null = null;
  private recognition: SpeechRecognition | null = null;
  private currentLanguage: string = 'ko';
  private enabled: boolean = false;
  private isListening: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // 음성 합성 초기화
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
      }
      
      // 음성 인식 초기화
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'ko-KR';
      }
    }
  }

  setLanguageCode(languageCode: string) {
    this.currentLanguage = languageCode;
    
    // 음성 인식 언어도 업데이트
    if (this.recognition) {
      const languageMap: { [key: string]: string } = {
        ko: 'ko-KR',
        en: 'en-US',
        ja: 'ja-JP',
        es: 'es-ES',
        pt: 'pt-BR',
        hi: 'hi-IN'
      };
      this.recognition.lang = languageMap[languageCode] || 'ko-KR';
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  async speak(text: string) {
    if (!this.synth || !this.enabled || !text.trim()) {
      return;
    }

    // 이전 음성 중지
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 언어 설정
    const languageMap: { [key: string]: string } = {
      ko: 'ko-KR',
      en: 'en-US',
      ja: 'ja-JP',
      es: 'es-ES',
      pt: 'pt-BR',
      hi: 'hi-IN'
    };
    
    utterance.lang = languageMap[this.currentLanguage] || 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  getVoices() {
    if (!this.synth) return [];
    return this.synth.getVoices();
  }

  isSupported() {
    return !!this.synth;
  }

  // 별칭 함수 (호환성을 위해)
  isSynthesisSupported() {
    return this.isSupported();
  }

  // 현재 언어에 최적화된 음성 목록 반환
  getVoicesForCurrentLanguage(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    
    const allVoices = this.synth.getVoices();
    const languageMap: { [key: string]: string } = {
      ko: 'ko',
      en: 'en',
      ja: 'ja',
      es: 'es',
      pt: 'pt',
      hi: 'hi'
    };
    
    const targetLang = languageMap[this.currentLanguage] || 'ko';
    
    // 현재 언어에 맞는 음성만 필터링
    const currentLangVoices = allVoices.filter(voice => 
      voice.lang.startsWith(targetLang)
    );
    
    return currentLangVoices.length > 0 ? currentLangVoices : allVoices;
  }

  // 특정 언어 코드로 음성 재생 (오버로드 버전)
  async speak(text: string, languageCode?: string) {
    if (!this.synth || !this.enabled || !text.trim()) {
      return;
    }

    // 이전 음성 중지
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // 언어 설정
    const languageMap: { [key: string]: string } = {
      ko: 'ko-KR',
      'ko-KR': 'ko-KR',
      en: 'en-US',
      'en-US': 'en-US',
      ja: 'ja-JP',
      'ja-JP': 'ja-JP',
      es: 'es-ES',
      'es-ES': 'es-ES',
      pt: 'pt-BR',
      'pt-BR': 'pt-BR',
      hi: 'hi-IN',
      'hi-IN': 'hi-IN'
    };
    
    // 매개변수로 받은 언어 코드가 있으면 사용, 없으면 현재 언어 사용
    const targetLang = languageCode || this.currentLanguage;
    utterance.lang = languageMap[targetLang] || 'ko-KR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;

    this.synth.speak(utterance);
  }

  // 음성 인식 관련 메서드들
  isRecognitionSupported(): boolean {
    return !!this.recognition;
  }

  getIsListening(): boolean {
    return this.isListening;
  }

  startListening(
    onResult: (text: string) => void,
    onError: (error: string) => void
  ): boolean {
    if (!this.recognition || this.isListening) {
      return false;
    }

    try {
      this.recognition.onstart = () => {
        this.isListening = true;
        console.log('음성 인식 시작');
      };

      this.recognition.onresult = (event: any) => {
        if (event.results && event.results.length > 0) {
          const transcript = event.results[0][0].transcript;
          console.log('음성 인식 결과:', transcript);
          onResult(transcript);
        }
      };

      this.recognition.onerror = (event: any) => {
        this.isListening = false;
        console.error('음성 인식 오류:', event.error);
        onError(event.error || '음성 인식 오류가 발생했습니다.');
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('음성 인식 종료');
      };

      this.recognition.start();
      return true;
    } catch (error) {
      console.error('음성 인식 시작 실패:', error);
      this.isListening = false;
      onError('음성 인식을 시작할 수 없습니다.');
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch (error) {
        console.error('음성 인식 중지 실패:', error);
        this.isListening = false;
      }
    }
  }
}

// 전역 인스턴스
export const speechManager = new SpeechManager();
