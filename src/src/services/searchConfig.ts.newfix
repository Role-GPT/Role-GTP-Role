/**
 * Search Configuration - JSON 기반 검색 설정
 * 
 * 사용자가 제시한 JSON 스키마를 기반으로 한 기본 설정
 * Role → Category → Source 3단 라우팅 구성
 */

import { SearchConfig } from './searchRoutingService';

export const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  "version": "1.0",
  "trial": {
    "enabled": true,
    "per_user_daily": { 
      "image": 10, 
      "weather": 20, 
      "web": 20, 
      "scholar": 20,
      "news": 15,
      "blog": 10,
      "business": 15,
      "culture": 10,
      "lifestyle": 15
    },
    "copy": {
      "limit_hit": "체험 사용이 끝났습니다. 내 API 키를 연결하면 계속 이용할 수 있어요."
    }
  },
  "byok": { 
    "store": "browser", 
    "encryption": "local" 
  },

  "routing": {
    "category_policy": "one_per_category",          // or "parallel"
    "fallback": "next_available",                    // health/quota/timeout 실패 시
    "timeout_ms": 8000,
    "cache_ttl_sec": { 
      "wiki": 600, 
      "scholar": 600, 
      "news": 300,
      "web": 180,
      "business": 300
    }
  },

  "categories": [
    {
      "id": "web",
      "label": "웹",
      "enabled": true,
      "selection": "weighted",                       // or "priority", "round_robin"
      "max_parallel": 1,
      "providers": ["wikimedia", "bing", "google_cse", "serper", "serpapi"]
    },
    {
      "id": "news",
      "label": "뉴스",
      "enabled": true,
      "selection": "priority",
      "max_parallel": 1,
      "providers": ["naver_news", "newsapi", "bing_news"]
    },
    {
      "id": "blog",
      "label": "블로그",
      "enabled": true,
      "selection": "priority",
      "max_parallel": 1,
      "providers": ["naver_blog"]
    },
    {
      "id": "scholar",
      "label": "학문",
      "enabled": true,
      "selection": "weighted",
      "max_parallel": 1,
      "providers": ["arxiv", "pubmed", "openalex", "semanticscholar", "europepmc"]
    },
    {
      "id": "business",
      "label": "비즈니스",
      "enabled": true,
      "selection": "priority",
      "max_parallel": 1,
      "providers": ["alpha_vantage", "fred", "sec_edgar", "finnhub", "yahoo_fin"]
    },
    {
      "id": "culture",
      "label": "문화",
      "enabled": true,
      "selection": "priority",
      "max_parallel": 1,
      "providers": ["tmdb", "openlibrary", "spotify"]
    },
    {
      "id": "lifestyle",
      "label": "라이프스타일",
      "enabled": true,
      "selection": "priority",
      "max_parallel": 1,
      "providers": ["openweather", "kma", "unsplash", "publicdata"]
    },
    {
      "id": "developer",
      "label": "개발자",
      "enabled": true,
      "selection": "weighted",
      "max_parallel": 1,
      "providers": ["github", "stackoverflow", "npmjs"]
    },
    {
      "id": "social",
      "label": "소셜",
      "enabled": true,
      "selection": "priority",
      "max_parallel": 1,
      "providers": ["reddit", "twitter"]
    }
  ],

  "providers": {
    // === 웹 검색 ===
    "wikimedia": {
      "label": "Wikimedia REST",
      "category": "web",
      "base_url": "https://ko.wikipedia.org/w/rest.php/v1",
      "key_type": "none",
      "trial_applies": true,
      "weight": 70,
      "endpoints": {
        "search": "/search/title?q={q}&limit={n}",
        "summary": "/page/{title}/summary"
      },
      "health": { 
        "probe": "GET /search/title?q=hello&limit=1", 
        "interval_sec": 300 
      }
    },
    "bing": {
      "label": "Bing Web Search",
      "category": "web",
      "base_url": "https://api.bing.microsoft.com/v7.0/search",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 30,
      "headers": { 
        "Ocp-Apim-Subscription-Key": "{{user_keys.bing}}" 
      },
      "health": { 
        "probe": "HEAD /", 
        "interval_sec": 600 
      }
    },
    "google_cse": {
      "label": "Google Custom Search",
      "category": "web",
      "base_url": "https://www.googleapis.com/customsearch/v1",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 40,
      "health": { 
        "probe": "HEAD /", 
        "interval_sec": 600 
      }
    },
    "serper": {
      "label": "Serper.dev",
      "category": "web",
      "base_url": "https://google.serper.dev/search",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 35,
      "headers": { 
        "X-API-KEY": "{{user_keys.serper}}" 
      },
      "health": { 
        "probe": "HEAD /", 
        "interval_sec": 600 
      }
    },
    "serpapi": {
      "label": "SerpAPI",
      "category": "web",
      "base_url": "https://serpapi.com/search.json",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 35,
      "health": { 
        "probe": "GET /account.json", 
        "interval_sec": 600 
      }
    },

    // === 뉴스 검색 ===
    "naver_news": {
      "label": "Naver News",
      "category": "news",
      "base_url": "https://openapi.naver.com/v1/search/news.json",
      "key_type": "byok",
      "headers": {
        "X-Naver-Client-Id": "{{user_keys.naver.id}}",
        "X-Naver-Client-Secret": "{{user_keys.naver.secret}}"
      },
      "trial_applies": true,
      "weight": 50,
      "quota": { 
        "provider_daily": 25000 
      }
    },
    "newsapi": {
      "label": "NewsAPI",
      "category": "news",
      "base_url": "https://newsapi.org/v2/everything",
      "key_type": "byok",
      "headers": { 
        "X-Api-Key": "{{user_keys.newsapi}}" 
      },
      "trial_applies": false,
      "weight": 30
    },
    "bing_news": {
      "label": "Bing News",
      "category": "news",
      "base_url": "https://api.bing.microsoft.com/v7.0/news/search",
      "key_type": "byok",
      "headers": { 
        "Ocp-Apim-Subscription-Key": "{{user_keys.bing}}" 
      },
      "trial_applies": false,
      "weight": 25
    },

    // === 블로그 검색 ===
    "naver_blog": {
      "label": "Naver Blog",
      "category": "blog",
      "base_url": "https://openapi.naver.com/v1/search/blog.json",
      "key_type": "byok",
      "headers": {
        "X-Naver-Client-Id": "{{user_keys.naver.id}}",
        "X-Naver-Client-Secret": "{{user_keys.naver.secret}}"
      },
      "trial_applies": true,
      "weight": 70,
      "quota": { 
        "provider_daily": 25000 
      }
    },

    // === 학술 검색 ===
    "arxiv": {
      "label": "arXiv",
      "category": "scholar",
      "base_url": "http://export.arxiv.org/api/query",
      "key_type": "none",
      "trial_applies": true,
      "weight": 40,
      "health": { 
        "probe": "GET /?search_query=electron&max_results=1", 
        "interval_sec": 600 
      }
    },
    "pubmed": {
      "label": "PubMed E-utilities",
      "category": "scholar",
      "base_url": "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
      "key_type": "none",
      "trial_applies": true,
      "weight": 35,
      "headers": {
        "User-Agent": "RoleGPT-Search/1.0 (contact@rolegpt.com)"
      },
      "health": { 
        "probe": "GET /?db=pubmed&retmode=json&term=medicine&retmax=1", 
        "interval_sec": 600 
      }
    },
    "openalex": {
      "label": "OpenAlex",
      "category": "scholar",
      "base_url": "https://api.openalex.org/works",
      "key_type": "none",
      "headers": { 
        "User-Agent": "RoleGPT (contact@rolegpt.com)" 
      },
      "trial_applies": true,
      "weight": 20,
      "health": { 
        "probe": "GET /?search=science&per_page=1", 
        "interval_sec": 600 
      }
    },
    "semanticscholar": {
      "label": "Semantic Scholar",
      "category": "scholar",
      "base_url": "https://api.semanticscholar.org/graph/v1/paper/search",
      "key_type": "byok",
      "headers": { 
        "x-api-key": "{{user_keys.semanticscholar}}"
      },
      "trial_applies": true,
      "weight": 25,
      "health": { 
        "probe": "GET /?query=artificial%20intelligence&limit=1", 
        "interval_sec": 600 
      }
    },
    "europepmc": {
      "label": "Europe PMC",
      "category": "scholar",
      "base_url": "https://www.ebi.ac.uk/europepmc/webservices/rest/search",
      "key_type": "none",
      "trial_applies": true,
      "weight": 15,
      "health": { 
        "probe": "GET /?query=medicine&format=json&pageSize=1", 
        "interval_sec": 600 
      }
    },

    // === 비즈니스 & 금융 ===
    "alpha_vantage": {
      "label": "Alpha Vantage",
      "category": "business",
      "base_url": "https://www.alphavantage.co/query",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 45,
      "health": { 
        "probe": "GET /?function=GLOBAL_QUOTE&symbol=AAPL&apikey=demo", 
        "interval_sec": 600 
      }
    },
    "fred": {
      "label": "FRED (St. Louis Fed)",
      "category": "business",
      "base_url": "https://api.stlouisfed.org/fred/series/observations",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 40,
      "health": { 
        "probe": "GET /?series_id=CPIAUCSL&api_key=demo&file_type=json&limit=1", 
        "interval_sec": 600 
      }
    },
    "sec_edgar": {
      "label": "SEC EDGAR",
      "category": "business",
      "base_url": "https://data.sec.gov/api/xbrl/companyfacts",
      "key_type": "none",
      "headers": { 
        "User-Agent": "RoleGPT-Search/1.0 (contact@rolegpt.com)" 
      },
      "trial_applies": true,
      "weight": 35,
      "health": { 
        "probe": "GET /CIK0000320193.json", 
        "interval_sec": 600 
      }
    },
    "finnhub": {
      "label": "Finnhub",
      "category": "business",
      "base_url": "https://finnhub.io/api/v1",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 30,
      "health": { 
        "probe": "GET /quote?symbol=AAPL&token=demo", 
        "interval_sec": 600 
      }
    },
    "yahoo_fin": { 
      "label": "Yahoo Finance", 
      "category": "business", 
      "base_url": "https://query1.finance.yahoo.com/v8/finance/chart",
      "key_type": "none", 
      "trial_applies": true,
      "weight": 25,
      "health": { 
        "probe": "GET /AAPL", 
        "interval_sec": 600 
      }
    },

    // === 문화 & 엔터테인먼트 ===
    "tmdb": { 
      "label": "TMDB (영화/TV)", 
      "category": "culture", 
      "base_url": "https://api.themoviedb.org/3/search/movie",
      "key_type": "byok",
      "headers": {
        "Authorization": "Bearer {{user_keys.tmdb}}"
      },
      "trial_applies": false,
      "weight": 50,
      "health": { 
        "probe": "GET /?query=avengers&page=1", 
        "interval_sec": 600 
      }
    },
    "openlibrary": {
      "label": "Open Library",
      "category": "culture",
      "base_url": "https://openlibrary.org/search.json",
      "key_type": "none",
      "trial_applies": true,
      "weight": 40,
      "health": { 
        "probe": "GET /?q=python&limit=1", 
        "interval_sec": 600 
      }
    },
    "spotify": { 
      "label": "Spotify Web API", 
      "category": "culture", 
      "base_url": "https://api.spotify.com/v1/search",
      "key_type": "oauth", 
      "headers": {
        "Authorization": "Bearer {{user_keys.spotify_token}}"
      },
      "trial_applies": false,
      "weight": 30,
      "health": { 
        "probe": "GET /?q=music&type=track&limit=1", 
        "interval_sec": 600 
      }
    },

    // === 라이프스타일 ===
    "openweather": { 
      "label": "OpenWeatherMap", 
      "category": "lifestyle", 
      "base_url": "https://api.openweathermap.org/data/2.5/weather",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 50,
      "health": { 
        "probe": "GET /?q=Seoul&appid=demo&units=metric", 
        "interval_sec": 600 
      }
    },
    "kma": { 
      "label": "KMA (기상청)", 
      "category": "lifestyle", 
      "base_url": "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0/getVilageFcst",
      "key_type": "byok", 
      "trial_applies": false,
      "weight": 45,
      "health": { 
        "probe": "GET /?serviceKey=demo&numOfRows=1&dataType=JSON&base_date=20250101&base_time=0200&nx=60&ny=127", 
        "interval_sec": 600 
      }
    },
    "unsplash": { 
      "label": "Unsplash", 
      "category": "lifestyle", 
      "base_url": "https://api.unsplash.com/search/photos",
      "key_type": "byok",
      "headers": {
        "Authorization": "Client-ID {{user_keys.unsplash}}"
      },
      "trial_applies": false,
      "weight": 35,
      "health": { 
        "probe": "GET /?query=nature&per_page=1", 
        "interval_sec": 600 
      }
    },
    "publicdata": { 
      "label": "Korean Public Data", 
      "category": "lifestyle", 
      "base_url": "https://apis.data.go.kr",
      "key_type": "byok", 
      "trial_applies": true,
      "weight": 30,
      "health": { 
        "probe": "GET /?serviceKey=demo", 
        "interval_sec": 600 
      }
    },

    // === 개발자 도구 ===
    "github": {
      "label": "GitHub",
      "category": "developer",
      "base_url": "https://api.github.com",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 50,
      "health": { 
        "probe": "GET /search/repositories?q=javascript&per_page=1", 
        "interval_sec": 600 
      }
    },
    "stackoverflow": {
      "label": "Stack Overflow",
      "category": "developer",
      "base_url": "https://api.stackexchange.com/2.3",
      "key_type": "none",
      "trial_applies": true,
      "weight": 40,
      "health": { 
        "probe": "GET /search?order=desc&sort=activity&intitle=javascript&site=stackoverflow&pagesize=1", 
        "interval_sec": 600 
      }
    },
    "npmjs": {
      "label": "NPM Registry",
      "category": "developer",
      "base_url": "https://registry.npmjs.org/-/v1/search",
      "key_type": "none",
      "trial_applies": true,
      "weight": 30,
      "health": { 
        "probe": "GET /?text=react&size=1", 
        "interval_sec": 600 
      }
    },

    // === 소셜 미디어 ===
    "reddit": {
      "label": "Reddit",
      "category": "social",
      "base_url": "https://www.reddit.com/api/v1",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 50
    },
    "twitter": {
      "label": "Twitter/X",
      "category": "social",
      "base_url": "https://api.twitter.com/2",
      "key_type": "byok",
      "trial_applies": false,
      "weight": 40
    }
  },

  // === Role 기반 오버라이드 ===
  "role_overrides": {
    "friendly_analyst": { 
      "enabled_categories": ["news", "business"], 
      "pin": ["fred", "sec_edgar"],
      "weights": { "fred": 60, "sec_edgar": 50, "yahoo_fin": 40 }
    },
    "kid_science_duo": { 
      "enabled_categories": ["scholar", "web"], 
      "weights": { "arxiv": 60, "openalex": 30, "wikimedia": 80 }
    },
    "marketing_guru": {
      "enabled_categories": ["news", "social", "business"],
      "pin": ["reddit", "naver_news"],
      "weights": { "reddit": 70, "naver_news": 60 }
    },
    "coding_mentor": {
      "enabled_categories": ["developer", "scholar"],
      "pin": ["github", "stackoverflow"],
      "weights": { "github": 80, "stackoverflow": 70, "arxiv": 40 }
    },
    "travel_buddy": {
      "enabled_categories": ["lifestyle", "culture", "web"],
      "pin": ["openweather", "unsplash"],
      "weights": { "openweather": 60, "unsplash": 50, "wikimedia": 70 }
    },
    "health_coach": {
      "enabled_categories": ["scholar", "lifestyle", "news"],
      "pin": ["pubmed", "europepmc"],
      "weights": { "pubmed": 80, "europepmc": 60, "naver_news": 40 }
    },
    "creative_writer": {
      "enabled_categories": ["culture", "web", "social"],
      "pin": ["openlibrary", "wikimedia"],
      "weights": { "openlibrary": 70, "wikimedia": 80, "reddit": 50 }
    },
    "financial_advisor": {
      "enabled_categories": ["business", "news"],
      "pin": ["yahoo_fin", "fred", "alpha_vantage"],
      "weights": { "yahoo_fin": 60, "fred": 70, "alpha_vantage": 65, "finnhub": 55 }
    },
    "researcher": {
      "enabled_categories": ["scholar", "web", "news"],
      "pin": ["arxiv", "pubmed", "openalex"],
      "weights": { "arxiv": 70, "pubmed": 65, "openalex": 60, "semanticscholar": 55 }
    },
    "social_media_expert": {
      "enabled_categories": ["social", "news", "culture"],
      "pin": ["reddit", "twitter"],
      "weights": { "reddit": 80, "twitter": 70, "naver_news": 50 }
    }
  }
};

// 카테고리별 아이콘 매핑
export const CATEGORY_ICONS: Record<string, string> = {
  web: "🌐",
  news: "📰", 
  blog: "📝",
  scholar: "📚",
  business: "💼",
  culture: "🎭",
  lifestyle: "🌟",
  developer: "👨‍💻",
  social: "👥"
};

// 프로바이더별 아이콘 매핑
export const PROVIDER_ICONS: Record<string, string> = {
  wikimedia: "📖",
  bing: "🔎",
  google_cse: "🔍",
  serper: "⚡",
  serpapi: "🐍",
  naver_news: "📰",
  naver_blog: "📝",
  newsapi: "🗞️",
  arxiv: "🔬",
  pubmed: "🏥",
  openalex: "📊",
  semanticscholar: "🎓",
  europepmc: "🇪🇺",
  yahoo_fin: "💹",
  fred: "🏦",
  sec_edgar: "📈",
  alpha_vantage: "📊",
  finnhub: "💰",
  tmdb: "🎬",
  openlibrary: "📚",
  spotify: "🎵",
  openweather: "🌤️",
  kma: "🌦️",
  unsplash: "📸",
  publicdata: "🏛️",
  github: "👨‍💻",
  stackoverflow: "❓",
  npmjs: "📦",
  reddit: "👽",
  twitter: "🐦"
};

// Trial 한계치 도달 메시지 템플릿
export const TRIAL_LIMIT_MESSAGES = {
  web: "웹 검색 체험이 끝났습니다. Google CSE나 Bing API 키를 연결하면 계속 이용할 수 있어요.",
  news: "뉴스 검색 체험이 끝났습니다. 네이버 API나 NewsAPI 키를 연결하면 계속 이용할 수 있어요.",
  scholar: "학술 검색 체험이 끝났습니다. Semantic Scholar API 키를 연결하면 더 많은 논문을 검색할 수 있어요.",
  business: "비즈니스 검색 체험이 끝났습니다. Alpha Vantage나 FRED API 키를 연결하면 계속 이용할 수 있어요.",
  culture: "문화 검색 체험이 끝났습니다. TMDB API 키를 연결하면 계속 이용할 수 있어요.",
  lifestyle: "라이프스타일 검색 체험이 끝났습니다. OpenWeather API 키를 연결하면 계속 이용할 수 있어요.",
  developer: "개발자 도구 체험이 끝났습니다. GitHub Personal Access Token을 연결하면 계속 이용할 수 있어요.",
  social: "소셜 미디어 검색 체험이 끝났습니다. Reddit API 키를 연결하면 계속 이용할 수 있어요.",
  blog: "블로그 검색 체험이 끝났습니다. 네이버 API 키를 연결하면 계속 이용할 수 있어요."
};

// 헬스체크 기본 설정
export const DEFAULT_HEALTH_CONFIG = {
  timeout_ms: 5000,
  retry_count: 3,
  interval_sec: 600
};

// 쿼터 기본 설정  
export const DEFAULT_QUOTA_CONFIG = {
  user_daily: 1000,
  user_monthly: 25000
};