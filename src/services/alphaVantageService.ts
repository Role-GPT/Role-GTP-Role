/**
 * Alpha Vantage Service - 금융 데이터 API
 * 
 * Alpha Vantage API를 활용한 주식, 외환, 암호화폐 데이터 제공
 * - 실시간 및 과거 주식 데이터
 * - 외환 환율 정보
 * - 암호화폐 시세
 * - 기업 재무 정보
 * - 기술 지표 및 분석
 * 
 * BYOK (API 키 필요) - 일일 500회 무료, 프리미엄 플랜 제공
 * 
 * @docs https://www.alphavantage.co/documentation/
 */

export interface AlphaVantageConfig {
  apiKey: string;
  endpoint?: string;
}

export interface AlphaVantageStockData {
  symbol: string;
  open: string;
  high: string;
  low: string;
  price: string;
  volume: string;
  latestTradingDay: string;
  previousClose: string;
  change: string;
  changePercent: string;
}

export interface AlphaVantageTimeSeriesData {
  'Meta Data': {
    '1. Information': string;
    '2. Symbol': string;
    '3. Last Refreshed': string;
    '4. Output Size': string;
    '5. Time Zone': string;
  };
  'Time Series (Daily)': {
    [date: string]: {
      '1. open': string;
      '2. high': string;
      '3. low': string;
      '4. close': string;
      '5. volume': string;
    };
  };
}

export interface AlphaVantageCompanyOverview {
  Symbol: string;
  AssetType: string;
  Name: string;
  Description: string;
  CIK: string;
  Exchange: string;
  Currency: string;
  Country: string;
  Sector: string;
  Industry: string;
  Address: string;
  FiscalYearEnd: string;
  LatestQuarter: string;
  MarketCapitalization: string;
  EBITDA: string;
  PERatio: string;
  PEGRatio: string;
  BookValue: string;
  DividendPerShare: string;
  DividendYield: string;
  EPS: string;
  RevenuePerShareTTM: string;
  ProfitMargin: string;
  OperatingMarginTTM: string;
  ReturnOnAssetsTTM: string;
  ReturnOnEquityTTM: string;
  RevenueTTM: string;
  GrossProfitTTM: string;
  DilutedEPSTTM: string;
  QuarterlyEarningsGrowthYOY: string;
  QuarterlyRevenueGrowthYOY: string;
  AnalystTargetPrice: string;
  TrailingPE: string;
  ForwardPE: string;
  PriceToSalesRatioTTM: string;
  PriceToBookRatio: string;
  EVToRevenue: string;
  EVToEBITDA: string;
  Beta: string;
  '52WeekHigh': string;
  '52WeekLow': string;
  '50DayMovingAverage': string;
  '200DayMovingAverage': string;
  SharesOutstanding: string;
  DividendDate: string;
  ExDividendDate: string;
}

export interface AlphaVantageForexData {
  'Realtime Currency Exchange Rate': {
    '1. From_Currency Code': string;
    '2. From_Currency Name': string;
    '3. To_Currency Code': string;
    '4. To_Currency Name': string;
    '5. Exchange Rate': string;
    '6. Last Refreshed': string;
    '7. Time Zone': string;
    '8. Bid Price': string;
    '9. Ask Price': string;
  };
}

/**
 * 실시간 주식 시세 조회
 * @param symbol 주식 심볼 (예: AAPL, MSFT)
 * @param config Alpha Vantage API 설정
 */
export async function getAlphaVantageQuote(
  symbol: string,
  config: AlphaVantageConfig
): Promise<AlphaVantageStockData> {
  try {
    const baseUrl = config.endpoint || 'https://www.alphavantage.co/query';
    
    const params = new URLSearchParams({
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase(),
      apikey: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage 오류: ${data['Error Message']}`);
    }

    if (data['Note']) {
      throw new Error(`Alpha Vantage 제한: ${data['Note']}`);
    }

    const quote = data['Global Quote'];
    if (!quote) {
      throw new Error('주식 데이터를 찾을 수 없습니다');
    }

    return {
      symbol: quote['01. symbol'],
      open: quote['02. open'],
      high: quote['03. high'],
      low: quote['04. low'],
      price: quote['05. price'],
      volume: quote['06. volume'],
      latestTradingDay: quote['07. latest trading day'],
      previousClose: quote['08. previous close'],
      change: quote['09. change'],
      changePercent: quote['10. change percent']
    };

  } catch (error) {
    console.error('Alpha Vantage 주식 시세 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `주식 시세 조회 실패: ${error.message}`
        : '주식 시세 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 일봉 주식 데이터 조회
 * @param symbol 주식 심볼
 * @param config Alpha Vantage API 설정
 * @param outputSize 'compact' (최근 100일) 또는 'full' (20년+)
 */
export async function getAlphaVantageDaily(
  symbol: string,
  config: AlphaVantageConfig,
  outputSize: 'compact' | 'full' = 'compact'
): Promise<AlphaVantageTimeSeriesData> {
  try {
    const baseUrl = config.endpoint || 'https://www.alphavantage.co/query';
    
    const params = new URLSearchParams({
      function: 'TIME_SERIES_DAILY',
      symbol: symbol.toUpperCase(),
      outputsize: outputSize,
      apikey: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage 오류: ${data['Error Message']}`);
    }

    if (data['Note']) {
      throw new Error(`Alpha Vantage 제한: ${data['Note']}`);
    }

    if (!data['Time Series (Daily)']) {
      throw new Error('일봉 데이터를 찾을 수 없습니다');
    }

    return data;

  } catch (error) {
    console.error('Alpha Vantage 일봉 데이터 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `일봉 데이터 조회 실패: ${error.message}`
        : '일봉 데이터 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 기업 개요 정보 조회
 * @param symbol 주식 심볼
 * @param config Alpha Vantage API 설정
 */
export async function getAlphaVantageOverview(
  symbol: string,
  config: AlphaVantageConfig
): Promise<AlphaVantageCompanyOverview> {
  try {
    const baseUrl = config.endpoint || 'https://www.alphavantage.co/query';
    
    const params = new URLSearchParams({
      function: 'OVERVIEW',
      symbol: symbol.toUpperCase(),
      apikey: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage 오류: ${data['Error Message']}`);
    }

    if (data['Note']) {
      throw new Error(`Alpha Vantage 제한: ${data['Note']}`);
    }

    if (!data.Symbol) {
      throw new Error('기업 정보를 찾을 수 없습니다');
    }

    return data;

  } catch (error) {
    console.error('Alpha Vantage 기업 개요 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `기업 개요 조회 실패: ${error.message}`
        : '기업 개요 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 외환 환율 조회
 * @param fromCurrency 기준 통화 (예: USD)
 * @param toCurrency 대상 통화 (예: KRW)
 * @param config Alpha Vantage API 설정
 */
export async function getAlphaVantageForex(
  fromCurrency: string,
  toCurrency: string,
  config: AlphaVantageConfig
): Promise<AlphaVantageForexData> {
  try {
    const baseUrl = config.endpoint || 'https://www.alphavantage.co/query';
    
    const params = new URLSearchParams({
      function: 'CURRENCY_EXCHANGE_RATE',
      from_currency: fromCurrency.toUpperCase(),
      to_currency: toCurrency.toUpperCase(),
      apikey: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage 오류: ${data['Error Message']}`);
    }

    if (data['Note']) {
      throw new Error(`Alpha Vantage 제한: ${data['Note']}`);
    }

    if (!data['Realtime Currency Exchange Rate']) {
      throw new Error('환율 데이터를 찾을 수 없습니다');
    }

    return data;

  } catch (error) {
    console.error('Alpha Vantage 환율 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `환율 조회 실패: ${error.message}`
        : '환율 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 암호화폐 시세 조회
 * @param symbol 암호화폐 심볼 (예: BTC)
 * @param market 시장 (예: USD, KRW)
 * @param config Alpha Vantage API 설정
 */
export async function getAlphaVantageCrypto(
  symbol: string,
  market: string,
  config: AlphaVantageConfig
): Promise<any> {
  try {
    const baseUrl = config.endpoint || 'https://www.alphavantage.co/query';
    
    const params = new URLSearchParams({
      function: 'DIGITAL_CURRENCY_DAILY',
      symbol: symbol.toUpperCase(),
      market: market.toUpperCase(),
      apikey: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage 오류: ${data['Error Message']}`);
    }

    if (data['Note']) {
      throw new Error(`Alpha Vantage 제한: ${data['Note']}`);
    }

    return data;

  } catch (error) {
    console.error('Alpha Vantage 암호화폐 시세 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `암호화폐 시세 조회 실패: ${error.message}`
        : '암호화폐 시세 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 주식 심볼 검색
 * @param keywords 검색 키워드
 * @param config Alpha Vantage API 설정
 */
export async function searchAlphaVantageSymbols(
  keywords: string,
  config: AlphaVantageConfig
): Promise<any> {
  try {
    const baseUrl = config.endpoint || 'https://www.alphavantage.co/query';
    
    const params = new URLSearchParams({
      function: 'SYMBOL_SEARCH',
      keywords: keywords,
      apikey: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`Alpha Vantage API 오류 (${response.status}): ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data['Error Message']) {
      throw new Error(`Alpha Vantage 오류: ${data['Error Message']}`);
    }

    if (data['Note']) {
      throw new Error(`Alpha Vantage 제한: ${data['Note']}`);
    }

    return data;

  } catch (error) {
    console.error('Alpha Vantage 심볼 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `심볼 검색 실패: ${error.message}`
        : '심볼 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * Alpha Vantage API 키 유효성 검사
 * @param config Alpha Vantage API 설정
 */
export async function validateAlphaVantageApiKey(config: AlphaVantageConfig): Promise<boolean> {
  try {
    // 간단한 테스트 쿼리로 API 키 유효성 검사
    await getAlphaVantageQuote('AAPL', config);
    return true;
  } catch (error) {
    console.warn('Alpha Vantage API 키 검증 실패:', error);
    return false;
  }
}

/**
 * Alpha Vantage 관련 유틸리티
 */
export const AlphaVantageUtils = {
  /**
   * 숫자 포맷팅 (통화)
   */
  formatCurrency: (value: string | number, currency: string = 'USD'): string => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  },

  /**
   * 퍼센트 포맷팅
   */
  formatPercent: (value: string | number): string => {
    const num = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
    if (isNaN(num)) return 'N/A';
    
    const color = num >= 0 ? 'green' : 'red';
    const sign = num >= 0 ? '+' : '';
    return `${sign}${num.toFixed(2)}%`;
  },

  /**
   * 거래량 포맷팅
   */
  formatVolume: (value: string | number): string => {
    const num = typeof value === 'string' ? parseInt(value) : value;
    if (isNaN(num)) return 'N/A';
    
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)}B`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(2)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(2)}K`;
    }
    return num.toLocaleString();
  },

  /**
   * 시가총액 포맷팅
   */
  formatMarketCap: (value: string | number): string => {
    return AlphaVantageUtils.formatVolume(value);
  },

  /**
   * 주식 변동 상태 계산
   */
  getChangeStatus: (changePercent: string): {
    status: 'up' | 'down' | 'neutral';
    color: string;
    icon: string;
  } => {
    const change = parseFloat(changePercent.replace('%', ''));
    
    if (change > 0) {
      return { status: 'up', color: '#22C55E', icon: '↗' };
    } else if (change < 0) {
      return { status: 'down', color: '#EF4444', icon: '↘' };
    } else {
      return { status: 'neutral', color: '#6B7280', icon: '→' };
    }
  },

  /**
   * P/E 비율 분석
   */
  analyzePERatio: (pe: string | number): {
    level: 'undervalued' | 'fair' | 'overvalued' | 'unknown';
    description: string;
  } => {
    const ratio = typeof pe === 'string' ? parseFloat(pe) : pe;
    
    if (isNaN(ratio) || ratio <= 0) {
      return { level: 'unknown', description: 'P/E 비율 정보 없음' };
    }

    if (ratio < 15) {
      return { level: 'undervalued', description: '저평가 가능성' };
    } else if (ratio <= 25) {
      return { level: 'fair', description: '적정 평가' };
    } else {
      return { level: 'overvalued', description: '고평가 가능성' };
    }
  },

  /**
   * 배당 수익률 분석
   */
  analyzeDividendYield: (yield: string | number): {
    level: 'low' | 'moderate' | 'high' | 'unknown';
    description: string;
  } => {
    const yieldNum = typeof yield === 'string' ? parseFloat(yield) : yield;
    
    if (isNaN(yieldNum) || yieldNum <= 0) {
      return { level: 'unknown', description: '배당 정보 없음' };
    }

    if (yieldNum < 2) {
      return { level: 'low', description: '낮은 배당 수익률' };
    } else if (yieldNum <= 5) {
      return { level: 'moderate', description: '적정 배당 수익률' };
    } else {
      return { level: 'high', description: '높은 배당 수익률' };
    }
  }
};
