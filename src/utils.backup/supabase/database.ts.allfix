/**
 * Supabase 데이터베이스 스키마 설정
 * 사용자 인증, 게스트 체험, 공용 좌석 관리를 위한 테이블 정의
 */

import { createClient } from '@supabase/supabase-js';

// 환경변수는 info.tsx에서 가져옴
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// 데이터베이스 스키마 타입 정의
export interface PublicCode {
  id: string;
  code: string;
  seats_total: number;
  expires_at: string;
  created_at: string;
}

export interface PublicSeat {
  id: string;
  code_id: string;
  seat_no: number;
  device_fp?: string;
  seat_token?: string;
  assigned_at?: string;
  last_seen_at?: string;
  session_expires_at?: string;
}

export interface GuestTrial {
  id: string;
  device_fp: string;
  issued_at: string;
  expires_at: string;
}

export interface UserAccount {
  id: string;
  email: string;
  created_at: string;
}

export interface DeviceFingerprint {
  id: string;
  device_fp_hash: string;
  trial_id?: string;
  user_id?: string;
  first_seen_at: string;
  last_seen_at?: string;
}

export interface DeviceLink {
  id: string;
  device_id: string;
  pin: string;
  expires_at: string;
  claimed: boolean;
}

// 데이터베이스 초기화 함수
export const initializeDatabase = async () => {
  try {
    // 테이블 존재 여부 확인 (실제로는 Supabase 대시보드에서 수동 생성)
    console.log('Database schema should be created manually in Supabase dashboard');
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
};

/*
Supabase 대시보드에서 수동으로 생성해야 할 SQL:

-- 1. 공용 좌석 코드 테이블
CREATE TABLE public_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  seats_total INT NOT NULL DEFAULT 10,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. 좌석 상태 테이블
CREATE TABLE public_seats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code_id UUID REFERENCES public_codes(id) ON DELETE CASCADE,
  seat_no INT NOT NULL,
  device_fp TEXT,
  seat_token TEXT,
  assigned_at TIMESTAMPTZ,
  last_seen_at TIMESTAMPTZ,
  session_expires_at TIMESTAMPTZ,
  UNIQUE(code_id, seat_no)
);

-- 3. 게스트 체험 발급 기록
CREATE TABLE guest_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fp TEXT UNIQUE,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. 사용자 계정 (이메일 확인용)
CREATE TABLE user_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 디바이스 지문 매핑
CREATE TABLE device_fingerprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_fp_hash TEXT NOT NULL,
  trial_id UUID REFERENCES guest_trials(id),
  user_id UUID REFERENCES user_accounts(id),
  first_seen_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ
);

-- 6. 디바이스 연결 PIN
CREATE TABLE device_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  pin TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  claimed BOOLEAN NOT NULL DEFAULT FALSE
);

-- RLS 활성화 (엣지 함수에서만 접근)
ALTER TABLE public_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_seats ENABLE ROW LEVEL SECURITY;
ALTER TABLE guest_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_fingerprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_links ENABLE ROW LEVEL SECURITY;

-- 서비스 역할 키만 접근 가능하도록 정책 설정
CREATE POLICY "Service role only" ON public_codes FOR ALL TO service_role;
CREATE POLICY "Service role only" ON public_seats FOR ALL TO service_role;
CREATE POLICY "Service role only" ON guest_trials FOR ALL TO service_role;
CREATE POLICY "Service role only" ON user_accounts FOR ALL TO service_role;
CREATE POLICY "Service role only" ON device_fingerprints FOR ALL TO service_role;
CREATE POLICY "Service role only" ON device_links FOR ALL TO service_role;
*/