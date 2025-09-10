/**
 * APIKeyManagement - 개선된 API 키 관리 시스템
 * 
 * 카테고리별 분리와 검색 선택형 UI를 제공하는 API 관리 컴포넌트
 * - LLM 모델과 추가 서비스 구분
 * - 검색/필터 기능
 * - 커스텀 API 추가 지원
 */

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { 
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  Trash2,
  Check,
  AlertCircle,
  Plus,
  X,
  Search
} from 'lucide-react';

// LLM API Providers - 최신 모델 반영
const LLM_PROVIDERS = [
  { 
    id: 'openai', 
    name: 'OpenAI', 
    description: 'GPT 모델 시리즈', 
    defaultEndpoint: 'https://api.openai.com/v1',
    category: 'llm',
    models: [
      { id: 'gpt-5', name: 'GPT-5', description: '차세대 GPT 모델 (예정)', isUpcoming: true },
      { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: '최신 GPT-4 모델' },
      { id: 'gpt-4', name: 'GPT-4', description: '고성능 범용 모델' },
      { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: '빠르고 효율적' }
    ]
  },
  { 
    id: 'anthropic', 
    name: 'Anthropic', 
    description: 'Claude 모델 시리즈', 
    defaultEndpoint: 'https://api.anthropic.com/v1',
    category: 'llm',
    models: [
      { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: '최신 Claude 모델' },
      { id: 'claude-3-opus', name: 'Claude 3 Opus', description: '최고 성능 모델' },
      { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: '균형잡힌 성능' },
      { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: '빠른 응답' }
    ]
  },
  { 
    id: 'google', 
    name: 'Google AI', 
    description: 'Gemini & Gemma 모델 시리즈', 
    defaultEndpoint: 'https://generativelanguage.googleapis.com/v1',
    category: 'llm',
    models: [
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', description: '최신 실험 모델' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', description: '고성능 분석 모델' },
      { id: 'gemini-pro-vision', name: 'Gemini Pro Vision', description: '멀티모달 모델' },
      { id: 'gemma2-27b-it', name: 'Gemma 2 27B', description: 'Google 오픈소스' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: '경량 오픈소스' }
    ]
  },
  { 
    id: 'openrouter', 
    name: 'OpenRouter', 
    description: '다양한 모델 라우터 (Gemma3 지원)', 
    defaultEndpoint: 'https://openrouter.ai/api/v1',
    category: 'llm',
    models: [
      { id: 'google/gemma-3-27b-it', name: 'Gemma 3 27B', description: 'via OpenRouter' },
      { id: 'google/gemma-3-9b-it', name: 'Gemma 3 9B', description: 'via OpenRouter' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', description: 'via OpenRouter' },
      { id: 'openai/gpt-4-turbo', name: 'GPT-4 Turbo', description: 'via OpenRouter' },
      { id: 'meta-llama/llama-3.1-405b-instruct', name: 'Llama 3.1 405B', description: 'Meta 최신 모델' },
      { id: 'mistralai/mistral-large-2407', name: 'Mistral Large', description: 'Mistral 최신 모델' }
    ]
  },
  { 
    id: 'groq', 
    name: 'Groq', 
    description: '초고속 추론 엔진', 
    defaultEndpoint: 'https://api.groq.com/openai/v1',
    category: 'llm',
    models: [
      { id: 'llama-3.1-405b-reasoning', name: 'Llama 3.1 405B', description: '최신 추론 모델' },
      { id: 'llama-3.1-70b-versatile', name: 'Llama 3.1 70B', description: '범용 모델' },
      { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', description: 'Mistral 혼합 모델' },
      { id: 'gemma2-9b-it', name: 'Gemma 2 9B', description: 'Google 오픈소스' }
    ]
  },
  { 
    id: 'xai', 
    name: 'xAI', 
    description: 'Grok 모델 시리즈', 
    defaultEndpoint: 'https://api.x.ai/v1',
    category: 'llm',
    models: [
      { id: 'grok-2', name: 'Grok 2', description: 'xAI 최신 모델' },
      { id: 'grok-beta', name: 'Grok Beta', description: 'xAI 베타 모델' }
    ]
  }
];

// 추가 API 카테고리들
const ADDITIONAL_API_PROVIDERS = [
  // 이미지 생성
  {
    id: 'dalle',
    name: 'DALL-E 3',
    description: 'OpenAI 이미지 생성',
    defaultEndpoint: 'https://api.openai.com/v1',
    category: 'image',
    models: [
      { id: 'dall-e-3', name: 'DALL-E 3', description: '최신 이미지 생성' },
      { id: 'dall-e-2', name: 'DALL-E 2', description: '이전 버전' }
    ]
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: '고품질 AI 아트 생성',
    defaultEndpoint: 'https://api.midjourney.com/v1',
    category: 'image',
    models: [
      { id: 'mj-v6', name: 'Midjourney V6', description: '최신 버전' },
      { id: 'mj-v5.2', name: 'Midjourney V5.2', description: '안정 버전' }
    ]
  },
  {
    id: 'stable-diffusion',
    name: 'Stable Diffusion',
    description: '오픈소스 이미지 생성',
    defaultEndpoint: 'https://api.stability.ai/v1',
    category: 'image',
    models: [
      { id: 'sd-xl-1.0', name: 'SDXL 1.0', description: '고해상도 생성' },
      { id: 'sd-3-medium', name: 'SD 3 Medium', description: '최신 모델' }
    ]
  },
  
  // 검색 엔진 - BYOK 템플릿
  {
    id: 'bing-search',
    name: 'Bing Search (Azure)',
    description: 'Microsoft Bing 웹 & 뉴스 검색',
    defaultEndpoint: 'https://api.bing.microsoft.com/v7.0/search',
    category: 'search',
    models: [
      { id: 'web-search', name: 'Web Search', description: '웹 검색 API' },
      { id: 'news-search', name: 'News Search', description: '뉴스 검색 API' },
      { id: 'image-search', name: 'Image Search', description: '이미지 검색 API' },
      { id: 'video-search', name: 'Video Search', description: '비디오 검색 API' }
    ],
    setup: {
      apiKeyPlaceholder: 'Azure Subscription Key',
      instructions: '1. Azure Portal에서 Cognitive Services 생성\n2. Bing Search v7 리소스 생성\n3. 키 및 엔드포인트 복사'
    }
  },
  {
    id: 'google-custom-search',
    name: 'Google Custom Search',
    description: 'Google 커스텀 검색 엔진 (CSE)',
    defaultEndpoint: 'https://www.googleapis.com/customsearch/v1',
    category: 'search',
    models: [
      { id: 'web-search', name: 'Web Search', description: '웹 검색' },
      { id: 'image-search', name: 'Image Search', description: '이미지 검색' },
      { id: 'site-search', name: 'Site Search', description: '특정 사이트 검색' }
    ],
    setup: {
      apiKeyPlaceholder: 'Google API Key (AIza...)',
      secondaryKeyPlaceholder: 'Search Engine ID (CX)',
      instructions: '1. Google Cloud Console에서 API 키 생성\n2. Custom Search JSON API 활성화\n3. 프로그래밍 가능한 검색 엔진 생성\n4. API 키와 검색 엔진 ID(CX) 복사'
    }
  },
  {
    id: 'serper-dev',
    name: 'Serper.dev',
    description: 'Google SERP JSON API (실시간)',
    defaultEndpoint: 'https://google.serper.dev/search',
    category: 'search',
    models: [
      { id: 'google-search', name: 'Google Search', description: '실시간 Google 검색' },
      { id: 'google-news', name: 'Google News', description: 'Google 뉴스 검색' },
      { id: 'google-images', name: 'Google Images', description: 'Google 이미지 검색' },
      { id: 'google-places', name: 'Google Places', description: 'Google 장소 검색' }
    ],
    setup: {
      apiKeyPlaceholder: 'Serper.dev API Key',
      instructions: '1. serper.dev 회원가입\n2. 대시보드에서 API 키 생성\n3. 월 2,500회 무료 제공'
    }
  },
  {
    id: 'serpapi',
    name: 'SerpAPI',
    description: 'Google SERP API (안정적)',
    defaultEndpoint: 'https://serpapi.com/search.json',
    category: 'search',
    models: [
      { id: 'google', name: 'Google Search', description: 'Google 웹 검색' },
      { id: 'google-news', name: 'Google News', description: 'Google 뉴스' },
      { id: 'google-images', name: 'Google Images', description: 'Google 이미지' },
      { id: 'google-scholar', name: 'Google Scholar', description: 'Google 학술 검색' },
      { id: 'google-shopping', name: 'Google Shopping', description: 'Google 쇼핑' }
    ],
    setup: {
      apiKeyPlaceholder: 'SerpAPI Key',
      instructions: '1. serpapi.com 회원가입\n2. 대시보드에서 API 키 생성\n3. 월 100회 무료 제공'
    }
  },
  
  // 문서 처리
  {
    id: 'document-ai',
    name: 'Google Document AI',
    description: 'Google Cloud 문서 분석',
    defaultEndpoint: 'https://documentai.googleapis.com/v1',
    category: 'document',
    models: [
      { id: 'ocr-processor', name: 'OCR Processor', description: '텍스트 추출' },
      { id: 'form-parser', name: 'Form Parser', description: '양식 분석' },
      { id: 'invoice-parser', name: 'Invoice Parser', description: '송장 분석' },
      { id: 'contract-parser', name: 'Contract Parser', description: '계약서 분석' }
    ],
    setup: {
      apiKeyPlaceholder: 'Google Cloud Service Account JSON',
      instructions: '1. Google Cloud Console에서 프로젝트 생성\n2. Document AI API 활성화\n3. 서비스 계정 생성 및 JSON 키 다운로드'
    }
  },
  {
    id: 'textract',
    name: 'AWS Textract',
    description: 'Amazon 텍스트 추출 서비스',
    defaultEndpoint: 'https://textract.amazonaws.com',
    category: 'document',
    models: [
      { id: 'detect-text', name: 'Text Detection', description: '텍스트 감지' },
      { id: 'analyze-document', name: 'Document Analysis', description: '문서 분석' },
      { id: 'analyze-expense', name: 'Expense Analysis', description: '영수증 분석' }
    ],
    setup: {
      apiKeyPlaceholder: 'AWS Access Key ID',
      secondaryKeyPlaceholder: 'AWS Secret Access Key',
      instructions: '1. AWS Console에서 IAM 사용자 생성\n2. Textract 권한 부여\n3. Access Key 생성'
    }
  },
  
  // 학술 정보
  {
    id: 'semantic-scholar',
    name: 'Semantic Scholar',
    description: '학술 논문 검색 (무료)',
    defaultEndpoint: 'https://api.semanticscholar.org/graph/v1',
    category: 'academic',
    models: [
      { id: 'paper-search', name: 'Paper Search', description: '논문 검색' },
      { id: 'author-search', name: 'Author Search', description: '저자 검색' },
      { id: 'citation-search', name: 'Citation Search', description: '인용 검색' }
    ],
    setup: {
      apiKeyPlaceholder: 'API Key (선택사항)',
      instructions: '1. semanticscholar.org 회원가입\n2. API 키 없이도 사용 가능 (제한적)\n3. API 키 신청 시 더 높은 할당량 제공'
    }
  },
  {
    id: 'arxiv',
    name: 'arXiv API',
    description: '물리학/수학/컴퓨터과학 논문',
    defaultEndpoint: 'http://export.arxiv.org/api/query',
    category: 'academic',
    models: [
      { id: 'paper-search', name: 'Paper Search', description: '논문 검색' },
      { id: 'category-browse', name: 'Category Browse', description: '카테고리별 탐색' }
    ],
    setup: {
      apiKeyPlaceholder: 'API 키 불필요',
      instructions: '1. arXiv는 무료 API 제공\n2. API 키 없이 바로 사용 가능\n3. 속도 제한: 초당 3회 요청'
    }
  },
  
  // 뉴스 & 콘텐츠
  {
    id: 'newsapi',
    name: 'NewsAPI',
    description: '글로벌 뉴스 검색',
    defaultEndpoint: 'https://newsapi.org/v2',
    category: 'news',
    models: [
      { id: 'everything', name: 'Everything', description: '모든 뉴스 검색' },
      { id: 'top-headlines', name: 'Top Headlines', description: '주요 헤드라인' },
      { id: 'sources', name: 'Sources', description: '뉴스 소스 목록' }
    ],
    setup: {
      apiKeyPlaceholder: 'NewsAPI Key',
      instructions: '1. newsapi.org 회원가입\n2. 무료 플랜: 월 1,000회\n3. API 키 복사'
    }
  },
  {
    id: 'reddit',
    name: 'Reddit API',
    description: 'Reddit 게시물 및 댓글 검색',
    defaultEndpoint: 'https://www.reddit.com/api/v1',
    category: 'social',
    models: [
      { id: 'search', name: 'Search Posts', description: '게시물 검색' },
      { id: 'subreddit', name: 'Subreddit', description: '서브레딧 탐색' },
      { id: 'comments', name: 'Comments', description: '댓글 검색' }
    ],
    setup: {
      apiKeyPlaceholder: 'Reddit Client ID',
      secondaryKeyPlaceholder: 'Reddit Client Secret',
      instructions: '1. reddit.com/prefs/apps에서 앱 생성\n2. script 타입으로 생성\n3. Client ID와 Secret 복사'
    }
  },
  
  // 개발자 도구
  {
    id: 'github',
    name: 'GitHub API',
    description: 'GitHub 저장소 및 코드 검색',
    defaultEndpoint: 'https://api.github.com',
    category: 'developer',
    models: [
      { id: 'repositories', name: 'Repository Search', description: '저장소 검색' },
      { id: 'code', name: 'Code Search', description: '코드 검색' },
      { id: 'issues', name: 'Issues Search', description: '이슈 검색' },
      { id: 'users', name: 'Users Search', description: '사용자 검색' }
    ],
    setup: {
      apiKeyPlaceholder: 'GitHub Personal Access Token',
      instructions: '1. GitHub Settings > Developer settings\n2. Personal access tokens 생성\n3. repo, read:user 권한 부여'
    }
  },
  {
    id: 'stackoverflow',
    name: 'Stack Overflow API',
    description: 'Stack Overflow 질문/답변 검색',
    defaultEndpoint: 'https://api.stackexchange.com/2.3',
    category: 'developer',
    models: [
      { id: 'questions', name: 'Questions', description: '질문 검색' },
      { id: 'answers', name: 'Answers', description: '답변 검색' },
      { id: 'users', name: 'Users', description: '사용자 검색' }
    ],
    setup: {
      apiKeyPlaceholder: 'Stack Apps Key (선택사항)',
      instructions: '1. stackapps.com에서 앱 등록\n2. API 키 없이도 사용 가능\n3. 키 사용 시 더 높은 할당량'
    }
  },
  
  // 학술 검색 - 추가된 서비스들
  {
    id: 'pubmed',
    name: 'PubMed E-utilities',
    description: '의학/생명과학 논문 검색 (무료)',
    defaultEndpoint: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils',
    category: 'academic',
    models: [
      { id: 'search', name: 'Paper Search', description: '논문 검색' },
      { id: 'summary', name: 'Paper Summary', description: '논문 요약' },
      { id: 'fetch', name: 'Full Text', description: '원문 메타데이터' }
    ],
    setup: {
      apiKeyPlaceholder: 'API 키 불필요 (이메일 권장)',
      instructions: '1. 키 없이 바로 사용 가능\n2. 이메일 제공 시 더 높은 속도 제한\n3. 의학, 생명과학 분야 논문 검색'
    }
  },
  
  // 금융 데이터
  {
    id: 'alpha-vantage',
    name: 'Alpha Vantage',
    description: '실시간 주식 및 금융 데이터',
    defaultEndpoint: 'https://www.alphavantage.co/query',
    category: 'finance',
    models: [
      { id: 'quote', name: 'Real-time Quote', description: '실시간 주가' },
      { id: 'daily', name: 'Daily Time Series', description: '일봉 데이터' },
      { id: 'overview', name: 'Company Overview', description: '기업 개요' },
      { id: 'forex', name: 'Foreign Exchange', description: '외환 환율' },
      { id: 'crypto', name: 'Cryptocurrency', description: '암호화폐 시세' },
      { id: 'search', name: 'Symbol Search', description: '종목 검색' }
    ],
    setup: {
      apiKeyPlaceholder: 'Alpha Vantage API Key',
      instructions: '1. alphavantage.co 회원가입\n2. 무료 플랜: 일일 500회\n3. API 키 복사\n4. 주식, 외환, 암호화폐 데이터 제공'
    }
  },
  {
    id: 'fred',
    name: 'FRED (Federal Reserve)',
    description: '미국 연방준비제도 경제 데이터',
    defaultEndpoint: 'https://api.stlouisfed.org/fred',
    category: 'finance',
    models: [
      { id: 'series', name: 'Economic Series', description: '경제 시계열 데이터' },
      { id: 'observations', name: 'Data Points', description: '관측값 조회' },
      { id: 'categories', name: 'Data Categories', description: '데이터 카테고리' }
    ],
    setup: {
      apiKeyPlaceholder: 'FRED API Key',
      instructions: '1. research.stlouisfed.org에서 계정 생성\n2. 무료 API 키 신청\n3. 경제 지표, 금리, 인플레이션 등 데이터'
    }
  },
  {
    id: 'sec-edgar',
    name: 'SEC EDGAR',
    description: '미국 증권거래위원회 기업 공시',
    defaultEndpoint: 'https://data.sec.gov/api',
    category: 'finance',
    models: [
      { id: 'company-facts', name: 'Company Facts', description: '기업 재무 정보' },
      { id: 'submissions', name: 'Form Submissions', description: '공시 서류' },
      { id: 'frames', name: 'XBRL Frames', description: 'XBRL 데이터' }
    ],
    setup: {
      apiKeyPlaceholder: 'API 키 불필요',
      instructions: '1. API 키 없이 사용 가능\n2. User-Agent 헤더에 이메일 필수\n3. 미국 상장 기업 재무제표 및 공시'
    }
  },
  {
    id: 'finnhub',
    name: 'Finnhub',
    description: '주식 시장 데이터 API',
    defaultEndpoint: 'https://finnhub.io/api/v1',
    category: 'finance',
    models: [
      { id: 'quote', name: 'Stock Quote', description: '실시간 주가' },
      { id: 'news', name: 'Market News', description: '시장 뉴스' },
      { id: 'earnings', name: 'Earnings', description: '실적 데이터' },
      { id: 'recommendation', name: 'Analyst Recommendations', description: '애널리스트 추천' }
    ],
    setup: {
      apiKeyPlaceholder: 'Finnhub API Key',
      instructions: '1. finnhub.io 회원가입\n2. 무료 플랜: 분당 60회\n3. API 키 복사\n4. 글로벌 주식 데이터'
    }
  },

  // 문화 & 엔터테인먼트
  {
    id: 'tmdb',
    name: 'TMDB (영화/TV)',
    description: 'The Movie Database API',
    defaultEndpoint: 'https://api.themoviedb.org/3',
    category: 'culture',
    models: [
      { id: 'movie-search', name: 'Movie Search', description: '영화 검색' },
      { id: 'tv-search', name: 'TV Search', description: 'TV 프로그램 검색' },
      { id: 'person-search', name: 'Person Search', description: '인물 검색' },
      { id: 'trending', name: 'Trending', description: '인기 콘텐츠' }
    ],
    setup: {
      apiKeyPlaceholder: 'TMDB API Key (v3 auth)',
      instructions: '1. themoviedb.org 계정 생성\n2. API 섹션에서 키 요청\n3. 영화, TV 프로그램, 배우 정보'
    }
  },
  {
    id: 'openlibrary',
    name: 'Open Library',
    description: '오픈 도서 데이터베이스 (무료)',
    defaultEndpoint: 'https://openlibrary.org',
    category: 'culture',
    models: [
      { id: 'search', name: 'Book Search', description: '도서 검색' },
      { id: 'works', name: 'Work Details', description: '작품 상세정보' },
      { id: 'authors', name: 'Author Info', description: '저자 정보' }
    ],
    setup: {
      apiKeyPlaceholder: 'API 키 불필요',
      instructions: '1. 무료로 바로 사용 가능\n2. 전 세계 도서 메타데이터\n3. 저자, 출판사, ISBN 검색 지원'
    }
  },
  {
    id: 'spotify',
    name: 'Spotify Web API',
    description: '음악 스트리밍 데이터',
    defaultEndpoint: 'https://api.spotify.com/v1',
    category: 'culture',
    models: [
      { id: 'search', name: 'Music Search', description: '음악 검색' },
      { id: 'albums', name: 'Album Info', description: '앨범 정보' },
      { id: 'artists', name: 'Artist Info', description: '아티스트 정보' },
      { id: 'playlists', name: 'Playlists', description: '플레이리스트' }
    ],
    setup: {
      apiKeyPlaceholder: 'Spotify Client ID',
      secondaryKeyPlaceholder: 'Spotify Client Secret',
      instructions: '1. developer.spotify.com에서 앱 생성\n2. Client ID와 Secret 복사\n3. OAuth 토큰 발급 필요'
    }
  },

  // 라이프스타일 & 날씨
  {
    id: 'openweather',
    name: 'OpenWeatherMap',
    description: '전 세계 날씨 데이터',
    defaultEndpoint: 'https://api.openweathermap.org/data/2.5',
    category: 'lifestyle',
    models: [
      { id: 'current', name: 'Current Weather', description: '현재 날씨' },
      { id: 'forecast', name: '5-day Forecast', description: '5일 예보' },
      { id: 'onecall', name: 'One Call API', description: '종합 날씨 데이터' },
      { id: 'air-pollution', name: 'Air Pollution', description: '대기질 정보' }
    ],
    setup: {
      apiKeyPlaceholder: 'OpenWeather API Key',
      instructions: '1. openweathermap.org 회원가입\n2. 무료 플랜: 분당 60회, 일일 1,000회\n3. API 키 발급\n4. 전 세계 날씨 및 대기질 데이터'
    }
  },
  {
    id: 'kma',
    name: '기상청 공공데이터',
    description: '한국 기상청 날씨 예보',
    defaultEndpoint: 'https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0',
    category: 'lifestyle',
    models: [
      { id: 'forecast', name: 'Village Forecast', description: '동네예보' },
      { id: 'ultra-srt', name: 'Ultra Short-term', description: '초단기예보' },
      { id: 'living-weather', name: 'Living Weather', description: '생활기상지수' }
    ],
    setup: {
      apiKeyPlaceholder: '공공데이터포털 서비스키',
      instructions: '1. data.go.kr 회원가입\n2. 기상청_단기예보 API 신청\n3. 승인 후 서비스키 발급\n4. 한국 상세 날씨 데이터'
    }
  },
  {
    id: 'unsplash',
    name: 'Unsplash',
    description: '고품질 무료 이미지',
    defaultEndpoint: 'https://api.unsplash.com',
    category: 'lifestyle',
    models: [
      { id: 'search', name: 'Photo Search', description: '사진 검색' },
      { id: 'random', name: 'Random Photos', description: '랜덤 사진' },
      { id: 'collections', name: 'Collections', description: '컬렉션' }
    ],
    setup: {
      apiKeyPlaceholder: 'Unsplash Access Key',
      instructions: '1. unsplash.com/developers 계정 생성\n2. 앱 등록 후 Access Key 발급\n3. 무료 플랜: 시간당 50회\n4. 고품질 무료 스톡 이미지'
    }
  },
  {
    id: 'public-data-korea',
    name: '공공데이터포털',
    description: '한국 정부 공공데이터',
    defaultEndpoint: 'https://apis.data.go.kr',
    category: 'lifestyle',
    models: [
      { id: 'air-quality', name: 'Air Quality', description: '대기질 정보' },
      { id: 'traffic', name: 'Traffic Info', description: '교통 정보' },
      { id: 'public-wifi', name: 'Public WiFi', description: '공공 WiFi' },
      { id: 'pharmacy', name: 'Pharmacy Info', description: '약국 정보' }
    ],
    setup: {
      apiKeyPlaceholder: '공공데이터포털 일반인증키',
      instructions: '1. data.go.kr 회원가입\n2. 원하는 API 서비스 신청\n3. 승인 후 인증키 발급\n4. 정부 제공 다양한 공공데이터'
    }
  }
];

interface APIKeyManagementProps {
  apiConfigs: Record<string, {
    apiKey: string;
    alias: string;
    endpoint: string;
    selectedModels: string[];
    isActive: boolean;
    isCustom?: boolean;
    category?: string;
  }>;
  onUpdateApiConfig: (providerId: string, updates: any) => void;
  showApiKeys: Record<string, boolean>;
  onToggleApiKeyVisibility: (providerId: string) => void;
  expandedProviders: Record<string, boolean>;
  onToggleProviderExpanded: (providerId: string) => void;
}

export function APIKeyManagement({
  apiConfigs,
  onUpdateApiConfig,
  showApiKeys,
  onToggleApiKeyVisibility,
  expandedProviders,
  onToggleProviderExpanded
}: APIKeyManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingCustomAPI, setIsAddingCustomAPI] = useState(false);
  const [customAPIForm, setCustomAPIForm] = useState({
    name: '',
    description: '',
    endpoint: '',
    category: 'llm',
    models: [{ id: '', name: '', description: '' }]
  });

  // 디버깅: props 확인
  React.useEffect(() => {
    console.log('🔑 APIKeyManagement 렌더링:', {
      apiConfigsCount: Object.keys(apiConfigs || {}).length,
      apiConfigs: apiConfigs,
      LLM_PROVIDERS_COUNT: LLM_PROVIDERS.length,
      ADDITIONAL_API_PROVIDERS_COUNT: ADDITIONAL_API_PROVIDERS.length
    });
  }, [apiConfigs]);

  // 별칭 자동 생성
  const generateAlias = (providerName: string, apiKey: string) => {
    if (!apiKey) return '';
    const keyPreview = apiKey.substring(0, 8) + '***';
    return `${providerName}-${keyPreview}`;
  };

  // Provider 활성화 토글
  const toggleProviderActive = (providerId: string) => {
    const config = apiConfigs[providerId];
    if (config?.apiKey.trim()) {
      onUpdateApiConfig(providerId, { isActive: !config.isActive });
    }
  };

  // 모델 토글
  const toggleModel = (providerId: string, modelId: string) => {
    const config = apiConfigs[providerId];
    if (!config) return;
    
    const selectedModels = config.selectedModels.includes(modelId)
      ? config.selectedModels.filter(id => id !== modelId)
      : [...config.selectedModels, modelId];
    
    onUpdateApiConfig(providerId, { selectedModels });
  };

  // 검색 필터링
  const filteredLLMProviders = LLM_PROVIDERS.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAdditionalProviders = ADDITIONAL_API_PROVIDERS.filter(provider => 
    provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    provider.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Provider 렌더링 컴포넌트
  const renderProvider = (provider: any) => {
    const config = apiConfigs[provider.id] || {
      apiKey: '',
      alias: '',
      endpoint: provider.defaultEndpoint,
      selectedModels: [],
      isActive: false
    };
    
    const isExpanded = expandedProviders[provider.id];
    
    return (
      <Collapsible key={provider.id} open={isExpanded} onOpenChange={() => onToggleProviderExpanded(provider.id)}>
        <div className="border border-border/50 rounded-xl overflow-hidden bg-card/30">
          {/* Provider Header */}
          <CollapsibleTrigger asChild>
            <div className="p-4 hover:bg-muted/20 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{provider.name}</h4>
                      {config.isActive && (
                        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          활성
                        </Badge>
                      )}
                      {provider.models?.some((m: any) => m.isUpcoming) && (
                        <Badge variant="secondary" className="text-xs">
                          곧 출시
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{provider.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={config.isActive}
                    onCheckedChange={(e) => {
                      e.stopPropagation();
                      toggleProviderActive(provider.id);
                    }}
                    disabled={!config.apiKey.trim()}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          </CollapsibleTrigger>

          {/* 설정 영역 */}
          <CollapsibleContent>
            <div className="p-4 border-t border-border/30 space-y-4 bg-muted/10">
              {/* API 키 입력 */}
              <div className="space-y-3">
                <label className="text-sm font-medium">API 키 설정</label>
                
                {/* 설정 가이드 */}
                {provider.setup && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800/50">
                    <div className="text-xs text-blue-700 dark:text-blue-300 whitespace-pre-line">
                      {provider.setup.instructions}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <div className="flex-1 space-y-2">
                    {/* 기본 API 키 */}
                    <Input
                      type={showApiKeys[provider.id] ? "text" : "password"}
                      placeholder={provider.setup?.apiKeyPlaceholder || `${provider.name} API 키`}
                      value={config.apiKey}
                      onChange={(e) => {
                        const newKey = e.target.value;
                        const newAlias = config.alias || generateAlias(provider.name, newKey);
                        onUpdateApiConfig(provider.id, { 
                          apiKey: newKey,
                          alias: newAlias
                        });
                      }}
                      className="font-mono text-sm bg-input-background"
                    />
                    
                    {/* 보조 키 (Google CSE의 CX, AWS Secret Key 등) */}
                    {provider.setup?.secondaryKeyPlaceholder && (
                      <Input
                        type={showApiKeys[provider.id] ? "text" : "password"}
                        placeholder={provider.setup.secondaryKeyPlaceholder}
                        value={config.secondaryKey || ''}
                        onChange={(e) => onUpdateApiConfig(provider.id, { secondaryKey: e.target.value })}
                        className="font-mono text-sm bg-input-background"
                      />
                    )}
                    
                    {/* 별칭 */}
                    <Input
                      placeholder="별칭 (선택사항)"
                      value={config.alias}
                      onChange={(e) => onUpdateApiConfig(provider.id, { alias: e.target.value })}
                      className="text-sm bg-input-background"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    {/* 키 표시/숨김 토글 */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onToggleApiKeyVisibility(provider.id)}
                      className="h-10 w-10"
                      title={showApiKeys[provider.id] ? "키 숨기기" : "키 보기"}
                    >
                      {showApiKeys[provider.id] ? 
                        <EyeOff className="w-4 h-4" /> : 
                        <Eye className="w-4 h-4" />
                      }
                    </Button>
                    
                    {/* API 키 테스트 */}
                    {config.apiKey && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={async () => {
                          try {
                            // TODO: API 키 테스트 로직 구현
                            console.log(`Testing ${provider.name} API key...`);
                            // 임시로 성공 메시지
                            alert(`${provider.name} API 키가 유효합니다!`);
                          } catch (error) {
                            alert(`${provider.name} API 키 테스트 실패: ${error}`);
                          }
                        }}
                        className="h-10 w-10 text-green-600 hover:text-green-700"
                        title="API 키 테스트"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* 키 삭제 */}
                    {config.apiKey && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onUpdateApiConfig(provider.id, { 
                          apiKey: '', 
                          alias: '',
                          secondaryKey: '',
                          isActive: false, 
                          selectedModels: [] 
                        })}
                        className="h-10 w-10 text-destructive hover:text-destructive"
                        title="API 키 삭제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {config.apiKey && (
                  <p className="text-xs text-muted-foreground">
                    저장될 별칭: {config.alias || generateAlias(provider.name, config.apiKey)}
                  </p>
                )}
              </div>

              {/* 모델 선택 */}
              {provider.models && provider.models.length > 0 && config.apiKey && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">
                    사용할 모델 선택 ({config.selectedModels.length}개 선택됨)
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin border border-border/30 rounded-lg p-2">
                    {provider.models.map((model: any) => (
                      <div 
                        key={model.id}
                        className="flex items-center justify-between p-2 rounded-lg bg-background/80 border border-border/50 hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{model.name}</span>
                            {model.isUpcoming && (
                              <Badge variant="secondary" className="text-xs">
                                예정
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{model.description}</div>
                        </div>
                        <Switch
                          checked={config.selectedModels.includes(model.id)}
                          onCheckedChange={() => toggleModel(provider.id, model.id)}
                          disabled={model.isUpcoming}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6">
      {/* 헤더 섹션 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">API 키 관리</h3>
          <p className="text-sm text-muted-foreground mt-1">
            AI 모델과 추가 서비스의 API 키를 카테고리별로 관리하세요
          </p>
          {/* 디버깅 정보 */}
          <div className="text-xs text-muted-foreground mt-2 p-2 bg-muted/20 rounded">
            🔧 디버그: {Object.keys(apiConfigs || {}).length}개 설정, LLM: {LLM_PROVIDERS.length}개, 추가: {ADDITIONAL_API_PROVIDERS.length}개
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
            <Check className="w-3 h-3 mr-1" />
            {Object.values(apiConfigs || {}).filter(config => config?.isActive).length}개 활성
          </Badge>
        </div>
      </div>

      {/* 검색바 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="API Provider 검색..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 카테고리별 서브 탭 */}
      <Tabs defaultValue="llm" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted/20 p-1 rounded-xl">
          <TabsTrigger value="llm" className="rounded-lg">
            🧠 LLM 모델
          </TabsTrigger>
          <TabsTrigger value="additional" className="rounded-lg">
            🛠️ 추가 서비스
          </TabsTrigger>
          <TabsTrigger value="custom" className="rounded-lg">
            ⚙️ 커스텀 API
          </TabsTrigger>
        </TabsList>

        {/* LLM Provider 탭 */}
        <TabsContent value="llm" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">LLM Provider</h4>
            <span className="text-sm text-muted-foreground">
              {filteredLLMProviders.filter(p => apiConfigs[p.id]?.isActive).length} / {filteredLLMProviders.length} 활성
            </span>
          </div>
          
          <div className="space-y-3">
            {filteredLLMProviders.map(renderProvider)}
          </div>
        </TabsContent>

        {/* 추가 서비스 탭 */}
        <TabsContent value="additional" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">추가 API 서비스</h4>
            <span className="text-sm text-muted-foreground">
              {filteredAdditionalProviders.filter(p => apiConfigs[p.id]?.isActive).length} / {filteredAdditionalProviders.length} 활성
            </span>
          </div>

          {/* 카테고리별 그룹핑 */}
          {['image', 'search', 'document', 'academic', 'news', 'social', 'developer', 'finance'].map(category => {
            const categoryProviders = filteredAdditionalProviders.filter(p => p.category === category);
            const categoryNames = {
              image: '🎨 이미지 생성',
              search: '🔍 검색 엔진',
              document: '📄 문서 처리', 
              academic: '📚 학술 정보',
              news: '📰 뉴스 & 미디어',
              social: '👥 소셜 미디어',
              developer: '👨‍💻 개발자 도구',
              finance: '💰 금융 데이터'
            };
            
            if (categoryProviders.length === 0) return null;
            
            return (
              <div key={category} className="space-y-3">
                <h5 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  {categoryNames[category as keyof typeof categoryNames]}
                </h5>
                {categoryProviders.map(renderProvider)}
              </div>
            );
          })}
        </TabsContent>

        {/* 커스텀 API 탭 */}
        <TabsContent value="custom" className="space-y-4 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">커스텀 API</h4>
            <Button 
              onClick={() => setIsAddingCustomAPI(true)}
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              API 추가
            </Button>
          </div>

          {/* 커스텀 API 추가 폼 */}
          {isAddingCustomAPI && (
            <div className="border border-border/50 rounded-xl p-4 bg-card/30 space-y-4">
              <div className="flex items-center justify-between">
                <h5 className="font-medium">새 커스텀 API 추가</h5>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => {
                    setIsAddingCustomAPI(false);
                    setCustomAPIForm({
                      name: '',
                      description: '',
                      endpoint: '',
                      category: 'llm',
                      models: [{ id: '', name: '', description: '' }]
                    });
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">API 이름</label>
                  <Input
                    placeholder="예: My Custom API"
                    value={customAPIForm.name}
                    onChange={(e) => setCustomAPIForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">카테고리</label>
                  <Select
                    value={customAPIForm.category}
                    onValueChange={(value) => setCustomAPIForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llm">🧠 LLM 모델</SelectItem>
                      <SelectItem value="image">🎨 이미지 생성</SelectItem>
                      <SelectItem value="search">🔍 검색 엔진</SelectItem>
                      <SelectItem value="document">📄 문서 처리</SelectItem>
                      <SelectItem value="academic">📚 학술 정보</SelectItem>
                      <SelectItem value="news">📰 뉴스 & 미디어</SelectItem>
                      <SelectItem value="social">👥 소셜 미디어</SelectItem>
                      <SelectItem value="developer">👨‍💻 개발자 도구</SelectItem>
                      <SelectItem value="finance">💰 금융 데이터</SelectItem>
                      <SelectItem value="custom">⚙️ 기타</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">설명</label>
                <Input
                  placeholder="API 설명을 입력하세요"
                  value={customAPIForm.description}
                  onChange={(e) => setCustomAPIForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">엔드포인트 URL</label>
                <Input
                  placeholder="https://api.example.com/v1"
                  value={customAPIForm.endpoint}
                  onChange={(e) => setCustomAPIForm(prev => ({ ...prev, endpoint: e.target.value }))}
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddingCustomAPI(false)}
                >
                  취소
                </Button>
                <Button 
                  onClick={() => {
                    // TODO: 커스텀 API 추가 로직
                    console.log('Adding custom API:', customAPIForm);
                    setIsAddingCustomAPI(false);
                  }}
                  disabled={!customAPIForm.name || !customAPIForm.endpoint}
                >
                  추가
                </Button>
              </div>
            </div>
          )}

          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">아직 추가된 커스텀 API가 없습니다.</p>
            <p className="text-xs mt-1">위의 "API 추가" 버튼을 클릭해서 커스텀 API를 추가해보세요.</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* 도움말 섹션 */}
      <div className="space-y-4">
        {/* API 키 관리 팁 */}
        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800 dark:text-blue-200">API 키 관리 가이드</h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 mt-2 space-y-1">
                <li>• <strong>설정 방법:</strong> 회사 이름을 클릭하면 API 키 입력 영역이 나타납니다</li>
                <li>• <strong>키 테스트:</strong> 체크 버튼을 클릭해서 API 키가 정상 작동하는지 확인하세요</li>
                <li>• <strong>보조 키:</strong> Google CSE는 API 키와 검색 엔진 ID(CX) 모두 필요합니다</li>
                <li>• <strong>별칭:</strong> 설정하지 않으면 자동으로 "회사이름-키미리보기"로 저장됩니다</li>
                <li>• <strong>보안:</strong> API 키는 안전하게 보관하고 타인과 공유하지 마세요</li>
                <li>• <strong>사용량:</strong> 각 Provider의 사용량과 요금을 정기적으로 확인하세요</li>
              </ul>
            </div>
          </div>
        </div>

        {/* BYOK 검색 엔진 안내 */}
        <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/50">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <h4 className="font-medium text-green-800 dark:text-green-200">BYOK 검색 엔진 추천</h4>
              <div className="text-sm text-green-700 dark:text-green-300 mt-2 space-y-2">
                <div>
                  <strong>🏆 추천 순서 (품질 기준):</strong>
                  <ol className="ml-4 mt-1 space-y-1">
                    <li>1. <strong>Google Custom Search</strong> - 최고 품질, 월 100회 무료</li>
                    <li>2. <strong>Serper.dev</strong> - 실시간 Google SERP, 월 2,500회 무료</li>
                    <li>3. <strong>SerpAPI</strong> - 가장 안정적, 월 100회 무료</li>
                    <li>4. <strong>Bing Search</strong> - Microsoft 검색, Azure 계정 필요</li>
                  </ol>
                </div>
                <div>
                  <strong>💡 사용 팁:</strong> 여러 검색 엔진을 설정하면 자동으로 Fallback 검색이 동작합니다
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 무료 API 안내 */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="font-medium text-amber-800 dark:text-amber-200">무료로 사용 가능한 API들</h4>
              <ul className="text-sm text-amber-700 dark:text-amber-300 mt-2 space-y-1">
                <li>• <strong>Semantic Scholar:</strong> 학술 논문 검색 (API 키 선택사항)</li>
                <li>• <strong>arXiv:</strong> 물리학/수학/CS 논문 (완전 무료)</li>
                <li>• <strong>Stack Overflow:</strong> 개발 Q&A (API 키 선택사항)</li>
                <li>• <strong>Reddit:</strong> 소셜 미디어 검색 (앱 등록 필요)</li>
                <li>• <strong>GitHub:</strong> 저장소/코드 검색 (Personal Token 필요)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}