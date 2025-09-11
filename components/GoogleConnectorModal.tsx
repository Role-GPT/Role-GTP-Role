/**
 * Google 커넥터 모달 컴포넌트
 * 
 * Google OAuth 인증, Docs/Sheets 연동 관리
 * - OAuth 인증 플로우
 * - 연결 상태 표시
 * - Google Docs/Sheets 목록 및 내용 조회
 * - 연결 해제 기능
 * 
 * @author Role GPT Team
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FileText, Table, Loader2, CheckCircle, AlertCircle, Unlink } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import { toast } from "sonner";
import {
  getGoogleConnectionStatus,
  startGoogleAuth,
  disconnectGoogle,
  getGoogleDocs,
  getGoogleDocContent,
  getGoogleSheets,
  getGoogleSheetData,
  getCurrentUserId,
  GoogleConnectionStatus,
  GoogleDocument,
  GoogleSpreadsheet,
  GoogleDocumentContent,
  GoogleSpreadsheetData
} from '../src/services/googleService';

interface GoogleConnectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleConnectorModal({ isOpen, onClose }: GoogleConnectorModalProps) {
  const [connectionStatus, setConnectionStatus] = useState<GoogleConnectionStatus>({ connected: false });
  const [clientSecret, setClientSecret] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('connection');
  
  // Google Docs 관련 상태
  const [docs, setDocs] = useState<GoogleDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<GoogleDocumentContent | null>(null);
  const [isLoadingDocs, setIsLoadingDocs] = useState(false);
  const [isLoadingDocContent, setIsLoadingDocContent] = useState(false);
  
  // Google Sheets 관련 상태
  const [sheets, setSheets] = useState<GoogleSpreadsheet[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSpreadsheetData | null>(null);
  const [isLoadingSheets, setIsLoadingSheets] = useState(false);
  const [isLoadingSheetData, setIsLoadingSheetData] = useState(false);
  
  const userId = getCurrentUserId();

  // 연결 상태 확인
  const checkConnectionStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getGoogleConnectionStatus(userId);
      setConnectionStatus(status);
      
      // 연결된 상태라면 기본 탭을 문서로 변경
      if (status.connected) {
        setActiveTab('docs');
      }
    } catch (error) {
      console.error('연결 상태 확인 실패:', error);
      toast.error('Google 연결 상태를 확인할 수 없습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 연결 상태 확인
  useEffect(() => {
    if (isOpen) {
      checkConnectionStatus();
    }
  }, [isOpen]);

  // OAuth 콜백 메시지 리스너
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // 보안상 origin 확인
      if (event.origin !== window.location.origin) {
        return;
      }

      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        try {
          setIsConnecting(false);
          
          // 연결 상태 다시 확인
          await checkConnectionStatus();
          
          toast.success('Google 계정이 성공적으로 연결되었습니다!');
        } catch (error) {
          console.error('OAuth 콜백 처리 오류:', error);
          toast.error('연결 완료 처리 중 오류가 발생했습니다.');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Google OAuth 연결 시작
  const handleConnect = async () => {
    if (!clientSecret.trim()) {
      toast.error('Google Client Secret을 입력해주세요.');
      return;
    }

    try {
      setIsConnecting(true);
      await startGoogleAuth(clientSecret);
      
      // OAuth 완료 대기 (실제로는 콜백으로 처리)
      const checkInterval = setInterval(async () => {
        try {
          const status = await getGoogleConnectionStatus(userId);
          if (status.connected) {
            clearInterval(checkInterval);
            setConnectionStatus(status);
            setIsConnecting(false);
            setActiveTab('docs');
            toast.success(`Google 계정이 연결되었습니다: ${status.user?.email}`);
          }
        } catch (error) {
          // 연결 확인 중 오류는 무시 (아직 연결되지 않았을 수 있음)
        }
      }, 2000);

      // 30초 후 타임아웃
      setTimeout(() => {
        clearInterval(checkInterval);
        setIsConnecting(false);
      }, 30000);

    } catch (error) {
      console.error('Google 연결 실패:', error);
      toast.error('Google 연결에 실패했습니다.');
      setIsConnecting(false);
    }
  };

  // Google 연결 해제
  const handleDisconnect = async () => {
    try {
      setIsLoading(true);
      await disconnectGoogle(userId);
      setConnectionStatus({ connected: false });
      setDocs([]);
      setSheets([]);
      setSelectedDoc(null);
      setSelectedSheet(null);
      setActiveTab('connection');
      toast.success('Google 연결이 해제되었습니다.');
    } catch (error) {
      console.error('Google 연결 해제 실패:', error);
      toast.error('Google 연결 해제에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Docs 목록 로드
  const loadGoogleDocs = async () => {
    try {
      setIsLoadingDocs(true);
      const result = await getGoogleDocs(userId, 20);
      setDocs(result.documents);
    } catch (error) {
      console.error('Google Docs 로드 실패:', error);
      toast.error('Google Docs 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoadingDocs(false);
    }
  };

  // Google Doc 내용 로드
  const loadDocContent = async (documentId: string) => {
    try {
      setIsLoadingDocContent(true);
      const result = await getGoogleDocContent(userId, documentId);
      setSelectedDoc(result.document);
    } catch (error) {
      console.error('Google Docs 내용 로드 실패:', error);
      toast.error('문서 내용을 불러올 수 없습니다.');
    } finally {
      setIsLoadingDocContent(false);
    }
  };

  // Google Sheets 목록 로드
  const loadGoogleSheets = async () => {
    try {
      setIsLoadingSheets(true);
      const result = await getGoogleSheets(userId, 20);
      setSheets(result.spreadsheets);
    } catch (error) {
      console.error('Google Sheets 로드 실패:', error);
      toast.error('Google Sheets 목록을 불러올 수 없습니다.');
    } finally {
      setIsLoadingSheets(false);
    }
  };

  // Google Sheet 데이터 로드
  const loadSheetData = async (spreadsheetId: string) => {
    try {
      setIsLoadingSheetData(true);
      const result = await getGoogleSheetData(userId, spreadsheetId);
      setSelectedSheet(result.spreadsheet);
    } catch (error) {
      console.error('Google Sheets 데이터 로드 실패:', error);
      toast.error('스프레드시트 데이터를 불러올 수 없습니다.');
    } finally {
      setIsLoadingSheetData(false);
    }
  };

  // Docs 탭이 활성화될 때 문서 목록 로드
  useEffect(() => {
    if (activeTab === 'docs' && connectionStatus.connected && docs.length === 0) {
      loadGoogleDocs();
    }
  }, [activeTab, connectionStatus.connected]);

  // Sheets 탭이 활성화될 때 스프레드시트 목록 로드
  useEffect(() => {
    if (activeTab === 'sheets' && connectionStatus.connected && sheets.length === 0) {
      loadGoogleSheets();
    }
  }, [activeTab, connectionStatus.connected]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold">Google 연동</h2>
              <p className="text-sm text-muted-foreground">Google Docs와 Sheets에 연결하여 문서를 관리하세요</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>연결 상태 확인 중...</span>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-3 mx-6 mt-4">
                <TabsTrigger value="connection">연결 설정</TabsTrigger>
                <TabsTrigger value="docs" disabled={!connectionStatus.connected}>Google Docs</TabsTrigger>
                <TabsTrigger value="sheets" disabled={!connectionStatus.connected}>Google Sheets</TabsTrigger>
              </TabsList>

              {/* 연결 설정 탭 */}
              <TabsContent value="connection" className="flex-1 p-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        연결 상태
                        {connectionStatus.connected ? (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            연결됨
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            연결되지 않음
                          </Badge>
                        )}
                      </CardTitle>
                      {connectionStatus.connected && (
                        <Button variant="outline" size="sm" onClick={handleDisconnect}>
                          <Unlink className="w-4 h-4 mr-2" />
                          연결 해제
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {connectionStatus.connected ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-4 border rounded-lg">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {connectionStatus.user?.picture ? (
                              <img
                                src={connectionStatus.user.picture}
                                alt={connectionStatus.user.name}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{connectionStatus.user?.name}</p>
                            <p className="text-sm text-muted-foreground">{connectionStatus.user?.email}</p>
                            <p className="text-xs text-muted-foreground">
                              {connectionStatus.connectedAt && 
                                `연결됨: ${new Date(connectionStatus.connectedAt).toLocaleString()}`
                              }
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>✅ Google Docs 및 Sheets에 접근할 수 있습니다</p>
                          <p>✅ 문서 내용을 읽고 AI와 함께 작업할 수 있습니다</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="clientSecret">Google Client Secret</Label>
                          <Input
                            id="clientSecret"
                            type="password"
                            placeholder="Google Cloud Console에서 생성한 Client Secret을 입력하세요"
                            value={clientSecret}
                            onChange={(e) => setClientSecret(e.target.value)}
                            className="mt-1"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Client ID: 850513120058-clp78s0glfj4r9esgra0bkdqo6nh0kqv.apps.googleusercontent.com
                          </p>
                        </div>
                        <Button
                          onClick={handleConnect}
                          disabled={isConnecting || !clientSecret.trim()}
                          className="w-full"
                        >
                          {isConnecting ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Google 연결 중...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                              </svg>
                              Google 계정 연결
                            </>
                          )}
                        </Button>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <p>📋 연결 후 사용 가능한 기능:</p>
                          <ul className="list-disc list-inside ml-4 space-y-1">
                            <li>Google Docs 문서 목록 조회 및 내용 읽기</li>
                            <li>Google Sheets 스프레드시트 데이터 조회</li>
                            <li>AI와 함께 문서 내용 분석 및 작업</li>
                          </ul>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Google Docs 탭 */}
              <TabsContent value="docs" className="flex-1 flex gap-6 p-6">
                <div className="w-1/2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Google Docs</h3>
                    <Button variant="outline" size="sm" onClick={loadGoogleDocs} disabled={isLoadingDocs}>
                      {isLoadingDocs ? <Loader2 className="w-4 h-4 animate-spin" /> : '새로고침'}
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[400px] border rounded-lg">
                    {isLoadingDocs ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : docs.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {docs.map((doc) => (
                          <div
                            key={doc.id}
                            className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => loadDocContent(doc.id)}
                          >
                            <div className="flex items-start gap-3">
                              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{doc.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(doc.modifiedTime).toLocaleDateString()}
                                </p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Google Docs가 없습니다</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <div className="w-1/2">
                  <div className="h-full border rounded-lg">
                    {isLoadingDocContent ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                          <p>문서 내용을 불러오는 중...</p>
                        </div>
                      </div>
                    ) : selectedDoc ? (
                      <div className="h-full flex flex-col">
                        <div className="p-4 border-b">
                          <h4 className="font-medium">{selectedDoc.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {selectedDoc.textContent.length}자
                          </p>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                          <div className="whitespace-pre-wrap text-sm">
                            {selectedDoc.textContent || '내용이 없습니다.'}
                          </div>
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>문서를 선택하세요</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Google Sheets 탭 */}
              <TabsContent value="sheets" className="flex-1 flex gap-6 p-6">
                <div className="w-1/2 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Google Sheets</h3>
                    <Button variant="outline" size="sm" onClick={loadGoogleSheets} disabled={isLoadingSheets}>
                      {isLoadingSheets ? <Loader2 className="w-4 h-4 animate-spin" /> : '새로고침'}
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[400px] border rounded-lg">
                    {isLoadingSheets ? (
                      <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : sheets.length > 0 ? (
                      <div className="p-2 space-y-2">
                        {sheets.map((sheet) => (
                          <div
                            key={sheet.id}
                            className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                            onClick={() => loadSheetData(sheet.id)}
                          >
                            <div className="flex items-start gap-3">
                              <Table className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{sheet.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(sheet.modifiedTime).toLocaleDateString()}
                                </p>
                              </div>
                              <ExternalLink className="w-4 h-4 text-muted-foreground" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-32 text-muted-foreground">
                        <div className="text-center">
                          <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Google Sheets가 없습니다</p>
                        </div>
                      </div>
                    )}
                  </ScrollArea>
                </div>

                <div className="w-1/2">
                  <div className="h-full border rounded-lg">
                    {isLoadingSheetData ? (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <Loader2 className="w-8 h-8 mx-auto mb-2 animate-spin" />
                          <p>스프레드시트 데이터를 불러오는 중...</p>
                        </div>
                      </div>
                    ) : selectedSheet ? (
                      <div className="h-full flex flex-col">
                        <div className="p-4 border-b">
                          <h4 className="font-medium">{selectedSheet.title}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{selectedSheet.sheets.length}개 시트</span>
                            <span>{selectedSheet.values.length}행</span>
                          </div>
                        </div>
                        <ScrollArea className="flex-1 p-4">
                          {selectedSheet.values.length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="w-full text-sm border-collapse">
                                <tbody>
                                  {selectedSheet.values.slice(0, 50).map((row, rowIndex) => (
                                    <tr key={rowIndex} className={rowIndex === 0 ? 'font-medium bg-muted' : ''}>
                                      {row.map((cell, cellIndex) => (
                                        <td key={cellIndex} className="border px-2 py-1 text-xs">
                                          {cell || ''}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                              {selectedSheet.values.length > 50 && (
                                <p className="text-xs text-muted-foreground mt-2 text-center">
                                  처음 50행만 표시됨 (전체 {selectedSheet.values.length}행)
                                </p>
                              )}
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-32 text-muted-foreground">
                              <p>데이터가 없습니다</p>
                            </div>
                          )}
                        </ScrollArea>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground">
                        <div className="text-center">
                          <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>스프레드시트를 선택하세요</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}
