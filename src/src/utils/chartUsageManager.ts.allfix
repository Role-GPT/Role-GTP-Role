/**
 * 차트 생성 사용량 관리자
 * 
 * 일일 차트 생성 제한 시스템을 제공
 * - 하루 최대 10회 제한
 * - 로컬 스토리지 기반 사용량 추적
 * - 자정 초기화 자동 처리
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

export interface ChartUsageInfo {
  dailyUsage: number;
  maxDailyUsage: number;
  remainingUsage: number;
  resetTime: string;
  canGenerate: boolean;
  lastUsedDate: string;
}

export interface ChartUsageRecord {
  date: string;
  count: number;
  lastUsed: number; // timestamp
}

/**
 * 차트 생성 사용량 관리자 클래스
 */
export class ChartUsageManager {
  private static readonly STORAGE_KEY = 'chart_usage_data';
  private static readonly MAX_DAILY_USAGE = 10;
  private static readonly RESET_HOUR = 0; // 자정 (0시)

  /**
   * 오늘 날짜 문자열 반환
   */
  private static getTodayString(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * 다음 자정까지의 시간 계산
   */
  private static getNextResetTime(): Date {
    const now = new Date();
    const nextReset = new Date(now);
    nextReset.setHours(this.RESET_HOUR, 0, 0, 0);
    
    // 이미 자정이 지났다면 다음날 자정으로 설정
    if (nextReset <= now) {
      nextReset.setDate(nextReset.getDate() + 1);
    }
    
    return nextReset;
  }

  /**
   * 저장된 사용량 데이터 로드
   */
  private static loadUsageData(): ChartUsageRecord | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return null;
      
      const data = JSON.parse(stored) as ChartUsageRecord;
      
      // 날짜가 오늘이 아니면 null 반환 (자동 초기화)
      if (data.date !== this.getTodayString()) {
        return null;
      }
      
      return data;
    } catch (error) {
      console.warn('차트 사용량 데이터 로드 실패:', error);
      return null;
    }
  }

  /**
   * 사용량 데이터 저장
   */
  private static saveUsageData(data: ChartUsageRecord): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('차트 사용량 데이터 저장 실패:', error);
    }
  }

  /**
   * 현재 사용량 정보 조회
   */
  static getUsageInfo(): ChartUsageInfo {
    const today = this.getTodayString();
    const storedData = this.loadUsageData();
    const dailyUsage = storedData?.count || 0;
    const remainingUsage = Math.max(0, this.MAX_DAILY_USAGE - dailyUsage);
    const nextReset = this.getNextResetTime();
    
    return {
      dailyUsage,
      maxDailyUsage: this.MAX_DAILY_USAGE,
      remainingUsage,
      resetTime: nextReset.toLocaleTimeString('ko-KR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      canGenerate: remainingUsage > 0,
      lastUsedDate: today
    };
  }

  /**
   * 차트 생성 가능 여부 확인
   */
  static canGenerateChart(): boolean {
    const usageInfo = this.getUsageInfo();
    return usageInfo.canGenerate;
  }

  /**
   * 사용량 증가 (차트 생성 시 호출)
   */
  static incrementUsage(): boolean {
    const today = this.getTodayString();
    const storedData = this.loadUsageData();
    const currentUsage = storedData?.count || 0;
    
    // 이미 한도에 도달했는지 확인
    if (currentUsage >= this.MAX_DAILY_USAGE) {
      console.warn('일일 차트 생성 한도 초과:', { currentUsage, maxUsage: this.MAX_DAILY_USAGE });
      return false;
    }
    
    // 사용량 증가
    const newUsage = currentUsage + 1;
    const newData: ChartUsageRecord = {
      date: today,
      count: newUsage,
      lastUsed: Date.now()
    };
    
    this.saveUsageData(newData);
    
    console.log('차트 생성 사용량 증가:', {
      date: today,
      usage: newUsage,
      remaining: this.MAX_DAILY_USAGE - newUsage
    });
    
    return true;
  }

  /**
   * 사용량 초기화 (테스트 또는 관리자용)
   */
  static resetUsage(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('차트 사용량이 초기화되었습니다.');
    } catch (error) {
      console.warn('차트 사용량 초기화 실패:', error);
    }
  }

  /**
   * 사용량 상태 메시지 생성
   */
  static getUsageStatusMessage(): string {
    const info = this.getUsageInfo();
    
    if (info.canGenerate) {
      return `오늘 ${info.remainingUsage}번 더 차트를 생성할 수 있습니다. (${info.dailyUsage}/${info.maxDailyUsage} 사용)`;
    } else {
      return `오늘의 차트 생성 한도를 모두 사용했습니다. ${info.resetTime}에 초기화됩니다.`;
    }
  }

  /**
   * 에러 메시지 생성
   */
  static getLimitExceededMessage(): string {
    const info = this.getUsageInfo();
    return `일일 차트 생성 한도 초과 (${info.maxDailyUsage}회). ${info.resetTime}에 초기화됩니다.`;
  }

  /**
   * 사용량 진행률 (0-100)
   */
  static getUsageProgress(): number {
    const info = this.getUsageInfo();
    return Math.round((info.dailyUsage / info.maxDailyUsage) * 100);
  }

  /**
   * 디버그 정보 출력
   */
  static debugInfo(): void {
    const info = this.getUsageInfo();
    const storedData = this.loadUsageData();
    
    console.group('📊 차트 사용량 디버그 정보');
    console.log('현재 사용량 정보:', info);
    console.log('저장된 데이터:', storedData);
    console.log('로컬 스토리지 원본:', localStorage.getItem(this.STORAGE_KEY));
    console.log('다음 초기화 시간:', this.getNextResetTime());
    console.groupEnd();
  }
}

/**
 * 편의 함수들
 */
export const chartUsage = {
  /**
   * 사용량 정보 조회
   */
  getInfo: () => ChartUsageManager.getUsageInfo(),
  
  /**
   * 생성 가능 여부 확인
   */
  canGenerate: () => ChartUsageManager.canGenerateChart(),
  
  /**
   * 사용량 증가
   */
  increment: () => ChartUsageManager.incrementUsage(),
  
  /**
   * 상태 메시지
   */
  getStatusMessage: () => ChartUsageManager.getUsageStatusMessage(),
  
  /**
   * 에러 메시지
   */
  getErrorMessage: () => ChartUsageManager.getLimitExceededMessage(),
  
  /**
   * 진행률
   */
  getProgress: () => ChartUsageManager.getUsageProgress(),
  
  /**
   * 초기화 (개발용)
   */
  reset: () => ChartUsageManager.resetUsage(),
  
  /**
   * 디버그
   */
  debug: () => ChartUsageManager.debugInfo()
};

export default ChartUsageManager;