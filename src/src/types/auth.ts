/**
 * 인증 및 사용자 모드 관련 타입 정의
 */

export type UserMode = 'ephemeral' | 'personal' | 'public' | 'byok' | 'licensed';

export interface GuestTrial {
  device_fp: string;
  issued_at: string;
  expires_at: string;
  status: 'active' | 'expired';
}

export interface PublicSeat {
  code: string;
  seat_no: number;
  seat_token: string;
  session_expires_at: string;
  last_seen_at: string;
}

export interface DeviceFingerprint {
  device_id: string;
  fingerprint: string;
  created_at: string;
}

export interface UserSession {
  mode: UserMode;
  isEphemeral: boolean;
  hasPin: boolean;
  hasVault: boolean;
  trial?: GuestTrial;
  publicSeat?: PublicSeat;
  deviceId: string;
  expiresAt?: string;
  daysRemaining?: number;
}

export interface AuthModal {
  isOpen: boolean;
  step: 'mode-selection' | 'pin-setup' | 'vault-setup' | 'code-entry' | 'email-verify';
  selectedMode?: UserMode;
}

export interface VaultConfig {
  isConnected: boolean;
  filePath?: string;
  lastBackup?: string;
  autoBackup: boolean;
  backupInterval: number; // minutes
}

export interface SessionFlags {
  showEphemeralBanner: boolean;
  showPinSetupNudge: boolean;
  showVaultNudge: boolean;
  showExpiryWarning: boolean;
  showQuotaWarning: boolean;
  lastBannerShown?: string;
  bannerCooldowns: Record<string, number>;
}