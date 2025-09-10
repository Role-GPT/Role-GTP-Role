/**
 * OpenWeatherMap Service - 전 세계 날씨 데이터 API
 * 
 * OpenWeatherMap API를 활용한 날씨 및 대기질 정보 제공
 * - 현재 날씨 정보
 * - 5일/3시간 예보
 * - 16일 일일 예보 (유료)
 * - 대기질 정보
 * - 기상 경보 (유료)
 * 
 * BYOK (API 키 필요) - 무료 플랜: 분당 60회, 일일 1,000회
 * 
 * @docs https://openweathermap.org/api
 */

export interface OpenWeatherConfig {
  apiKey: string;
  endpoint?: string;
  units?: 'metric' | 'imperial' | 'kelvin';
  language?: string;
}

export interface OpenWeatherCurrentData {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface OpenWeatherForecastData {
  cod: string;
  message: number;
  cnt: number;
  list: Array<{
    dt: number;
    main: {
      temp: number;
      feels_like: number;
      temp_min: number;
      temp_max: number;
      pressure: number;
      sea_level: number;
      grnd_level: number;
      humidity: number;
      temp_kf: number;
    };
    weather: Array<{
      id: number;
      main: string;
      description: string;
      icon: string;
    }>;
    clouds: {
      all: number;
    };
    wind: {
      speed: number;
      deg: number;
      gust?: number;
    };
    visibility: number;
    pop: number; // 강수 확률
    rain?: {
      '3h': number;
    };
    snow?: {
      '3h': number;
    };
    sys: {
      pod: string;
    };
    dt_txt: string;
  }>;
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

export interface OpenWeatherAirPollutionData {
  coord: {
    lon: number;
    lat: number;
  };
  list: Array<{
    main: {
      aqi: number; // 대기질 지수 (1-5)
    };
    components: {
      co: number;
      no: number;
      no2: number;
      o3: number;
      so2: number;
      pm2_5: number;
      pm10: number;
      nh3: number;
    };
    dt: number;
  }>;
}

/**
 * 현재 날씨 정보 조회
 * @param location 도시명, 좌표, 또는 도시ID
 * @param config OpenWeather API 설정
 */
export async function getCurrentWeather(
  location: string | { lat: number; lon: number } | number,
  config: OpenWeatherConfig
): Promise<OpenWeatherCurrentData> {
  try {
    const baseUrl = config.endpoint || 'https://api.openweathermap.org/data/2.5/weather';
    
    const params = new URLSearchParams({
      appid: config.apiKey,
      units: config.units || 'metric',
      lang: config.language || 'ko'
    });

    // 위치 파라미터 설정
    if (typeof location === 'string') {
      params.append('q', location);
    } else if (typeof location === 'number') {
      params.append('id', location.toString());
    } else {
      params.append('lat', location.lat.toString());
      params.append('lon', location.lon.toString());
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenWeather API 오류 (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.cod !== 200) {
      throw new Error(`OpenWeather 오류: ${data.message}`);
    }

    return data;

  } catch (error) {
    console.error('OpenWeather 현재 날씨 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `현재 날씨 조회 실패: ${error.message}`
        : '현재 날씨 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 5일 3시간 예보 조회
 * @param location 도시명, 좌표, 또는 도시ID
 * @param config OpenWeather API 설정
 */
export async function getWeatherForecast(
  location: string | { lat: number; lon: number } | number,
  config: OpenWeatherConfig
): Promise<OpenWeatherForecastData> {
  try {
    const baseUrl = config.endpoint?.replace('/weather', '/forecast') || 
                    'https://api.openweathermap.org/data/2.5/forecast';
    
    const params = new URLSearchParams({
      appid: config.apiKey,
      units: config.units || 'metric',
      lang: config.language || 'ko'
    });

    // 위치 파라미터 설정
    if (typeof location === 'string') {
      params.append('q', location);
    } else if (typeof location === 'number') {
      params.append('id', location.toString());
    } else {
      params.append('lat', location.lat.toString());
      params.append('lon', location.lon.toString());
    }

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenWeather API 오류 (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    
    if (data.cod !== '200') {
      throw new Error(`OpenWeather 오류: ${data.message}`);
    }

    return data;

  } catch (error) {
    console.error('OpenWeather 예보 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `날씨 예보 조회 실패: ${error.message}`
        : '날씨 예보 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 대기질 정보 조회
 * @param lat 위도
 * @param lon 경도
 * @param config OpenWeather API 설정
 */
export async function getAirPollution(
  lat: number,
  lon: number,
  config: OpenWeatherConfig
): Promise<OpenWeatherAirPollutionData> {
  try {
    const baseUrl = 'https://api.openweathermap.org/data/2.5/air_pollution';
    
    const params = new URLSearchParams({
      lat: lat.toString(),
      lon: lon.toString(),
      appid: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenWeather API 오류 (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('OpenWeather 대기질 조회 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `대기질 조회 실패: ${error.message}`
        : '대기질 조회 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * 도시 검색 (지오코딩)
 * @param cityName 도시명
 * @param config OpenWeather API 설정
 * @param limit 결과 개수 제한
 */
export async function searchCities(
  cityName: string,
  config: OpenWeatherConfig,
  limit: number = 5
): Promise<Array<{
  name: string;
  local_names?: Record<string, string>;
  lat: number;
  lon: number;
  country: string;
  state?: string;
}>> {
  try {
    const baseUrl = 'https://api.openweathermap.org/geo/1.0/direct';
    
    const params = new URLSearchParams({
      q: cityName,
      limit: limit.toString(),
      appid: config.apiKey
    });

    const response = await fetch(`${baseUrl}?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'RoleGPT-Search/1.0'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenWeather API 오류 (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('OpenWeather 도시 검색 오류:', error);
    throw new Error(
      error instanceof Error 
        ? `도시 검색 실패: ${error.message}`
        : '도시 검색 중 알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * OpenWeather API 키 유효성 검사
 * @param config OpenWeather API 설정
 */
export async function validateOpenWeatherApiKey(config: OpenWeatherConfig): Promise<boolean> {
  try {
    // 서울 날씨로 테스트
    await getCurrentWeather('Seoul', config);
    return true;
  } catch (error) {
    console.warn('OpenWeather API 키 검증 실패:', error);
    return false;
  }
}

/**
 * OpenWeather 관련 유틸리티
 */
export const OpenWeatherUtils = {
  /**
   * 날씨 아이콘 URL 생성
   */
  getIconUrl: (iconCode: string, size: '2x' | '4x' = '2x'): string => {
    return `https://openweathermap.org/img/wn/${iconCode}@${size}.png`;
  },

  /**
   * 풍향 각도를 방향으로 변환
   */
  getWindDirection: (degrees: number): string => {
    const directions = ['북', '북북동', '북동', '동북동', '동', '동남동', '남동', '남남동', '남', '남남서', '남서', '서남서', '서', '서북서', '북서', '북북서'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  },

  /**
   * 대기질 지수 해석
   */
  getAirQualityLevel: (aqi: number): {
    level: string;
    description: string;
    color: string;
  } => {
    switch (aqi) {
      case 1:
        return { level: '좋음', description: '대기질이 좋습니다', color: '#50C878' };
      case 2:
        return { level: '보통', description: '대기질이 보통입니다', color: '#FFD700' };
      case 3:
        return { level: '나쁨', description: '민감한 사람은 주의하세요', color: '#FF8C00' };
      case 4:
        return { level: '매우 나쁨', description: '건강에 좋지 않습니다', color: '#FF4500' };
      case 5:
        return { level: '위험', description: '모든 사람에게 위험합니다', color: '#8B0000' };
      default:
        return { level: '알 수 없음', description: '데이터 없음', color: '#808080' };
    }
  },

  /**
   * 온도 단위 변환
   */
  convertTemperature: (temp: number, from: 'celsius' | 'fahrenheit' | 'kelvin', to: 'celsius' | 'fahrenheit' | 'kelvin'): number => {
    if (from === to) return temp;

    // 먼저 섭씨로 변환
    let celsius: number;
    switch (from) {
      case 'fahrenheit':
        celsius = (temp - 32) * 5/9;
        break;
      case 'kelvin':
        celsius = temp - 273.15;
        break;
      default:
        celsius = temp;
    }

    // 목표 단위로 변환
    switch (to) {
      case 'fahrenheit':
        return celsius * 9/5 + 32;
      case 'kelvin':
        return celsius + 273.15;
      default:
        return celsius;
    }
  },

  /**
   * 습도에 따른 체감 설명
   */
  getHumidityDescription: (humidity: number): string => {
    if (humidity < 30) return '매우 건조';
    if (humidity < 50) return '건조';
    if (humidity < 70) return '적당';
    if (humidity < 80) return '습함';
    return '매우 습함';
  },

  /**
   * 가시거리 설명
   */
  getVisibilityDescription: (visibility: number): string => {
    if (visibility >= 10000) return '매우 맑음';
    if (visibility >= 5000) return '맑음';
    if (visibility >= 2000) return '보통';
    if (visibility >= 1000) return '흐림';
    return '매우 흐림';
  },

  /**
   * UV 지수 설명 (별도 API 필요)
   */
  getUVIndexDescription: (uvIndex: number): {
    level: string;
    description: string;
    color: string;
  } => {
    if (uvIndex <= 2) {
      return { level: '낮음', description: '선크림 불필요', color: '#58D68D' };
    } else if (uvIndex <= 5) {
      return { level: '보통', description: '선크림 권장', color: '#F7DC6F' };
    } else if (uvIndex <= 7) {
      return { level: '높음', description: '선크림 필수', color: '#F39C12' };
    } else if (uvIndex <= 10) {
      return { level: '매우 높음', description: '외출 시 주의', color: '#E74C3C' };
    } else {
      return { level: '위험', description: '외출 자제', color: '#8E44AD' };
    }
  }
};