/**
 * 세션 관리 유틸리티
 */

import { UserSession, UserMode } from '../types/auth';
import { getDeviceId } from './deviceFingerprint';

export const isEphemeral = (): boolean => {
  return sessionStorage.getItem("mode") !== "persist";
};

export const enterEphemeral = (): void => {
  sessionStorage.setItem("mode", "ephemeral");
};

export const enablePersist = (): void => {
  sessionStorage.setItem("mode", "persist");
};

export const getCurrentSession = (): UserSession => {
  const mode = (sessionStorage.getItem("user_mode") as UserMode) || 'ephemeral';
  const hasPin = localStorage.getItem("has_pin") === "true";
  const hasVault = localStorage.getItem("vault_configured") === "true";
  const deviceId = getDeviceId();
  
  // 체험 정보 확인
  const trialData = localStorage.getItem("guest_trial");
  const trial = trialData ? JSON.parse(trialData) : undefined;
  
  // 공용 좌석 정보 확인
  const seatData = sessionStorage.getItem("seat");
  const publicSeat = seatData ? JSON.parse(seatData) : undefined;
  
  // 만료 시간 계산
  let expiresAt: string | undefined;
  let daysRemaining: number | undefined;
  
  if (trial?.expires_at) {
    expiresAt = trial.expires_at;
    const expiry = new Date(trial.expires_at);
    const now = new Date();
    daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }
  
  return {
    mode,
    isEphemeral: isEphemeral(),
    hasPin,
    hasVault,
    trial,
    publicSeat,
    deviceId,
    expiresAt,
    daysRemaining
  };
};

export const setUserMode = (mode: UserMode): void => {
  sessionStorage.setItem("user_mode", mode);
  if (mode !== 'ephemeral') {
    enablePersist();
  } else {
    enterEphemeral();
  }
};

export const wireEphemeralAutoPurge = (getUnsaved: () => boolean) => {
  const handler = (e: BeforeUnloadEvent) => {
    if (isEphemeral()) {
      if (getUnsaved()) {
        e.preventDefault();
        e.returnValue = "";
      }
      // 실제 삭제
      sessionStorage.clear();
      // 임시 데이터 정리
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tmp_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  };
  
  window.addEventListener("beforeunload", handler);
  return () => window.removeEventListener("beforeunload", handler);
};
