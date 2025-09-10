/**
 * Trial Manager - 무료 체험 관리 유틸리티
 * 
 * 무료 체험 기간 카운트다운 및 상태 관리
 * - D-Day 형태의 남은 기간 표시
 * - 체험 기간 만료 감지
 * - 모드별 태그 생성
 */

export interface TrialStatus {
  isTrialMode: boolean;
  daysLeft: number;
  displayText: string;
  isExpired: boolean;
  badgeColor: string;
}

/**
 * 무료 체험 시작일 설정 (localStorage 기반)
 */
export function initializeTrial(): void {
  const trialStartDate = localStorage.getItem('trial_start_date');
  if (!trialStartDate) {
    localStorage.setItem('trial_start_date', new Date().toISOString());
  }
}

/**
 * 무료 체험 상태 조회
 */
export function getTrialStatus(): TrialStatus {
  const trialStartDate = localStorage.getItem('trial_start_date');
  const userMode = sessionStorage.getItem('user_mode') || 'ephemeral';
  
  // BYOK나 라이선스 모드는 체험이 아님
  if (userMode === 'byok' || userMode === 'licensed') {
    return {
      isTrialMode: false,
      daysLeft: 0,
      displayText: userMode === 'byok' ? 'BYOK Mode' : 'Licensed',
      isExpired: false,
      badgeColor: 'from-green-500 to-emerald-600'
    };
  }

  if (!trialStartDate) {
    initializeTrial();
    return getTrialStatus(); // 재귀 호출로 다시 계산
  }

  const startDate = new Date(trialStartDate);
  const currentDate = new Date();
  const daysPassed = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const TRIAL_PERIOD_DAYS = 3; // 3일 무료 체험
  const daysLeft = Math.max(0, TRIAL_PERIOD_DAYS - daysPassed);

  let displayText: string;
  let badgeColor: string;

  if (daysLeft > 1) {
    displayText = `D-${daysLeft}`;
    badgeColor = 'from-blue-500 to-blue-600';
  } else if (daysLeft === 1) {
    displayText = 'D-1';
    badgeColor = 'from-orange-500 to-orange-600';
  } else if (daysLeft === 0) {
    displayText = 'D-Day';
    badgeColor = 'from-red-500 to-red-600';
  } else {
    displayText = 'Expired';
    badgeColor = 'from-gray-500 to-gray-600';
  }

  return {
    isTrialMode: true,
    daysLeft,
    displayText,
    isExpired: daysLeft <= 0,
    badgeColor
  };
}

/**
 * 모드별 태그 정보 생성
 */
export function getModeTagInfo(mode: string): { text: string; color: string; icon?: string } {
  switch (mode) {
    case 'byok':
      return {
        text: 'BYOK',
        color: 'from-green-500 to-emerald-600',
        icon: '🔑'
      };
    case 'licensed':
      return {
        text: 'Pro',
        color: 'from-purple-500 to-purple-600',
        icon: '👑'
      };
    case 'personal':
      return {
        text: 'Personal',
        color: 'from-blue-500 to-blue-600',
        icon: '👤'
      };
    case 'public':
      return {
        text: 'Public',
        color: 'from-orange-500 to-orange-600',
        icon: '🌐'
      };
    case 'ephemeral':
    default:
      const trialStatus = getTrialStatus();
      return {
        text: trialStatus.displayText,
        color: trialStatus.badgeColor,
        icon: trialStatus.isExpired ? '⏰' : '🎯'
      };
  }
}

/**
 * 체험 기간 연장 (개발/테스트용)
 */
export function extendTrial(additionalDays: number): void {
  const currentStart = localStorage.getItem('trial_start_date');
  if (currentStart) {
    const startDate = new Date(currentStart);
    startDate.setDate(startDate.getDate() - additionalDays);
    localStorage.setItem('trial_start_date', startDate.toISOString());
  }
}

/**
 * 체험 초기화 (개발/테스트용)
 */
export function resetTrial(): void {
  localStorage.removeItem('trial_start_date');
  initializeTrial();
}