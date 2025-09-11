/**
 * Google API 연동 서비스
 * 
 * Google OAuth 인증, Docs, Sheets API 연동을 담당
 * - OAuth 인증 플로우
 * - Google Docs 연동
 * - Google Sheets 연동
 * - 연결 상태 관리
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import { projectId, publicAnonKey } from '../../utils/supabase/info';

const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c`;

// Google 연동 관련 타입 정의
export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface GoogleConnectionStatus {
  connected: boolean;
  user?: GoogleUserInfo;
  scope?: string;
  connectedAt?: string;
  message?: string;
}

export interface GoogleDocument {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
}

export interface GoogleDocumentContent {
  id: string;
  title: string;
  textContent: string;
  metadata: {
    revisionId: string;
    suggestionsViewMode: string;
  };
}

export interface GoogleSpreadsheet {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
}

export interface GoogleSpreadsheetData {
  id: string;
  title: string;
  sheets: Array<{
    id: number;
    title: string;
    rowCount: number;
    columnCount: number;
  }>;
  values: string[][];
  range: string;
}

/**
 * Google OAuth 인증 URL 생성
 * @returns Promise<{ authUrl: string; state: string }>
 */
export async function getGoogleAuthUrl(): Promise<{ authUrl: string; state: string }> {
  try {
    console.log('🔐 Google OAuth 인증 URL 요청');
    
    const response = await fetch(`${API_BASE_URL}/google/auth-url`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'OAuth URL 생성에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google OAuth 인증 URL 생성 완료');
    
    return data;
  } catch (error) {
    console.error('Google OAuth URL 생성 중 오류:', error);
    throw error;
  }
}

/**
 * Google OAuth 토큰 교환
 * @param code OAuth 인증 코드
 * @param clientSecret Google Client Secret
 * @returns Promise<{ success: boolean; user: GoogleUserInfo; accessToken: string; scope: string }>
 */
export async function exchangeGoogleToken(code: string, clientSecret: string): Promise<{
  success: boolean;
  user: GoogleUserInfo;
  accessToken: string;
  scope: string;
}> {
  try {
    console.log('🔐 Google OAuth 토큰 교환 시작');
    
    const response = await fetch(`${API_BASE_URL}/google/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        clientSecret
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '토큰 교환에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google OAuth 토큰 교환 완료:', data.user.email);
    
    return data;
  } catch (error) {
    console.error('Google OAuth 토큰 교환 중 오류:', error);
    throw error;
  }
}

/**
 * Google 연결 상태 확인
 * @param userId 사용자 ID
 * @returns Promise<GoogleConnectionStatus>
 */
export async function getGoogleConnectionStatus(userId: string): Promise<GoogleConnectionStatus> {
  try {
    console.log('📊 Google 연결 상태 확인:', userId);
    
    const response = await fetch(`${API_BASE_URL}/google/status/${userId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '연결 상태 확인에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google 연결 상태 확인 완료:', data.connected ? '연결됨' : '연결되지 않음');
    
    return data;
  } catch (error) {
    console.error('Google 연결 상태 확인 중 오류:', error);
    throw error;
  }
}

/**
 * Google 연결 해제
 * @param userId 사용자 ID
 * @returns Promise<{ success: boolean; message: string }>
 */
export async function disconnectGoogle(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log('🔌 Google 연결 해제:', userId);
    
    const response = await fetch(`${API_BASE_URL}/google/disconnect/${userId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '연결 해제에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google 연결 해제 완료');
    
    return data;
  } catch (error) {
    console.error('Google 연결 해제 중 오류:', error);
    throw error;
  }
}

/**
 * Google Docs 목록 조회
 * @param userId 사용자 ID
 * @param limit 조회할 문서 수 (기본: 10)
 * @returns Promise<{ success: boolean; documents: GoogleDocument[]; total: number }>
 */
export async function getGoogleDocs(userId: string, limit: number = 10): Promise<{
  success: boolean;
  documents: GoogleDocument[];
  total: number;
}> {
  try {
    console.log('📄 Google Docs 목록 조회:', userId);
    
    const response = await fetch(`${API_BASE_URL}/google/docs/${userId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google Docs 조회에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google Docs 목록 조회 완료:', data.total, '개 문서');
    
    return data;
  } catch (error) {
    console.error('Google Docs 조회 중 오류:', error);
    throw error;
  }
}

/**
 * Google Docs 내용 조회
 * @param userId 사용자 ID
 * @param documentId 문서 ID
 * @returns Promise<{ success: boolean; document: GoogleDocumentContent }>
 */
export async function getGoogleDocContent(userId: string, documentId: string): Promise<{
  success: boolean;
  document: GoogleDocumentContent;
}> {
  try {
    console.log('📄 Google Docs 내용 조회:', documentId);
    
    const response = await fetch(`${API_BASE_URL}/google/docs/${userId}/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google Docs 내용 조회에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google Docs 내용 조회 완료:', data.document.textContent.length, '자');
    
    return data;
  } catch (error) {
    console.error('Google Docs 내용 조회 중 오류:', error);
    throw error;
  }
}

/**
 * Google Sheets 목록 조회
 * @param userId 사용자 ID
 * @param limit 조회할 스프레드시트 수 (기본: 10)
 * @returns Promise<{ success: boolean; spreadsheets: GoogleSpreadsheet[]; total: number }>
 */
export async function getGoogleSheets(userId: string, limit: number = 10): Promise<{
  success: boolean;
  spreadsheets: GoogleSpreadsheet[];
  total: number;
}> {
  try {
    console.log('📊 Google Sheets 목록 조회:', userId);
    
    const response = await fetch(`${API_BASE_URL}/google/sheets/${userId}?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google Sheets 조회에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google Sheets 목록 조회 완료:', data.total, '개 스프레드시트');
    
    return data;
  } catch (error) {
    console.error('Google Sheets 조회 중 오류:', error);
    throw error;
  }
}

/**
 * Google Sheets 데이터 조회
 * @param userId 사용자 ID
 * @param spreadsheetId 스프레드시트 ID
 * @param range 조회할 범위 (기본: A1:Z100)
 * @returns Promise<{ success: boolean; spreadsheet: GoogleSpreadsheetData }>
 */
export async function getGoogleSheetData(userId: string, spreadsheetId: string, range: string = 'A1:Z100'): Promise<{
  success: boolean;
  spreadsheet: GoogleSpreadsheetData;
}> {
  try {
    console.log('📊 Google Sheets 데이터 조회:', spreadsheetId, range);
    
    const response = await fetch(`${API_BASE_URL}/google/sheets/${userId}/${spreadsheetId}?range=${encodeURIComponent(range)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Google Sheets 데이터 조회에 실패했습니다');
    }

    const data = await response.json();
    console.log('✅ Google Sheets 데이터 조회 완료:', data.spreadsheet.values.length, '행');
    
    return data;
  } catch (error) {
    console.error('Google Sheets 데이터 조회 중 오류:', error);
    throw error;
  }
}

/**
 * Google OAuth 인증 시작
 * @param clientSecret Google Client Secret
 * @returns Promise<void>
 */
export async function startGoogleAuth(clientSecret: string): Promise<void> {
  try {
    const { authUrl, state } = await getGoogleAuthUrl();
    
    // state를 sessionStorage에 저장 (CSRF 보호)
    sessionStorage.setItem('google_oauth_state', state);
    sessionStorage.setItem('google_client_secret', clientSecret);
    
    // 새 창에서 OAuth 인증 시작
    const authWindow = window.open(
      authUrl,
      'google_auth',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    );

    if (!authWindow) {
      throw new Error('팝업이 차단되었습니다. 팝업을 허용하고 다시 시도해주세요.');
    }

    console.log('🔐 Google OAuth 인증 창 열림');
    
  } catch (error) {
    console.error('Google OAuth 인증 시작 중 오류:', error);
    throw error;
  }
}

/**
 * Google OAuth 콜백 처리
 * @param code OAuth 인증 코드
 * @param state OAuth state 값
 * @returns Promise<GoogleUserInfo>
 */
export async function handleGoogleCallback(code: string, state: string): Promise<GoogleUserInfo> {
  try {
    // state 검증 (CSRF 보호)
    const savedState = sessionStorage.getItem('google_oauth_state');
    if (state !== savedState) {
      throw new Error('유효하지 않은 OAuth state입니다.');
    }

    const clientSecret = sessionStorage.getItem('google_client_secret');
    if (!clientSecret) {
      throw new Error('클라이언트 시크릿이 없습니다.');
    }

    const result = await exchangeGoogleToken(code, clientSecret);
    
    // OAuth 관련 임시 데이터 정리
    sessionStorage.removeItem('google_oauth_state');
    sessionStorage.removeItem('google_client_secret');
    
    return result.user;
    
  } catch (error) {
    console.error('Google OAuth 콜백 처리 중 오류:', error);
    throw error;
  }
}

/**
 * 사용자 ID 생성 또는 가져오기
 * 실제 구현에서는 인증 시스템과 연동
 * @returns string
 */
export function getCurrentUserId(): string {
  // 임시로 브라우저별 고유 ID 생성 (실제로는 인증된 사용자 ID 사용)
  let userId = localStorage.getItem('role_gpt_user_id');
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('role_gpt_user_id', userId);
  }
  return userId;
}
