import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { stripeCheckoutApp } from "./stripe-checkout.ts";
import { stripeWebhookApp } from "./stripe-webhook.ts";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e3d1d00c/health", (c) => {
  return c.json({ status: "ok" });
});

// Naver Search API interfaces
interface NaverSearchItem {
  title: string;
  link: string;
  description?: string;
  bloggername?: string;
  bloggerlink?: string;
  postdate?: string;
  pubDate?: string;
}

interface NaverSearchResponse {
  lastBuildDate: string;
  total: number;
  start: number;
  display: number;
  items: NaverSearchItem[];
}

interface NaverDataLabItem {
  period: string;
  ratio: number;
}

interface NaverDataLabResponse {
  startDate: string;
  endDate: string;
  timeUnit: string;
  results: Array<{
    title: string;
    keywords: string[];
    data: NaverDataLabItem[];
  }>;
}

// Naver Search API
app.get("/make-server-e3d1d00c/naver/search/:type", async (c) => {
  try {
    const clientId = Deno.env.get("NAVER_CLIENT_ID");
    const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error("네이버 API 키가 설정되지 않음");
      return c.json({ error: "네이버 API 키가 설정되지 않았습니다" }, 500);
    }

    const type = c.req.param("type"); // news, blog, webkr, etc.
    const query = c.req.query("query");
    const display = c.req.query("display") || "10";
    const start = c.req.query("start") || "1";
    const sort = c.req.query("sort") || "sim"; // sim (유사도순), date (날짜순)

    if (!query) {
      return c.json({ error: "검색어가 필요합니다" }, 400);
    }

    const validTypes = ["news", "blog", "webkr", "image", "shop", "doc"];
    if (!validTypes.includes(type)) {
      return c.json({ error: "지원하지 않는 검색 타입입니다" }, 400);
    }

    console.log(`🔍 네이버 ${type} 검색:`, { query, display, start, sort });

    const url = `https://openapi.naver.com/v1/search/${type}.json?query=${encodeURIComponent(query)}&display=${display}&start=${start}&sort=${sort}`;

    const response = await fetch(url, {
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
        "User-Agent": "RoleGPT/1.0"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("네이버 검색 API 에러:", response.status, errorText);
      return c.json({ 
        error: `네이버 검색 API 오류: ${response.status} ${response.statusText}`,
        details: errorText
      }, response.status);
    }

    const data: NaverSearchResponse = await response.json();
    
    // HTML 태그 제거 및 데이터 정리
    const cleanedItems = data.items.map(item => ({
      ...item,
      title: item.title.replace(/<[^>]*>/g, ""),
      description: item.description?.replace(/<[^>]*>/g, "") || "",
    }));

    console.log(`✅ 네이버 ${type} 검색 완료:`, cleanedItems.length, "개 결과");

    return c.json({
      ...data,
      items: cleanedItems
    });

  } catch (error) {
    console.error("네이버 검색 중 오류:", error);
    return c.json({ 
      error: "네이버 검색 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Naver DataLab API (검색어 트렌드)
app.post("/make-server-e3d1d00c/naver/datalab", async (c) => {
  try {
    const clientId = Deno.env.get("NAVER_CLIENT_ID");
    const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      console.error("네이버 API 키가 설정되지 않음");
      return c.json({ error: "네이버 API 키가 설정되지 않았습니다" }, 500);
    }

    const body = await c.req.json();
    
    // 기본 파라미터 설정
    const requestBody = {
      startDate: body.startDate || "2023-01-01",
      endDate: body.endDate || new Date().toISOString().split('T')[0],
      timeUnit: body.timeUnit || "month", // date, week, month
      keywordGroups: body.keywordGroups || [
        {
          groupName: "검색워드",
          keywords: body.keywords || ["AI"]
        }
      ],
      device: body.device || "", // pc, mo (빈 문자열이면 전체)
      ages: body.ages || [], // 연령대 배열
      gender: body.gender || "" // m, f (빈 문자열이면 전체)
    };

    console.log("🔍 네이버 데이터랩 검색:", requestBody.keywordGroups[0].keywords);

    const response = await fetch("https://openapi.naver.com/v1/datalab/search", {
      method: "POST",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
        "Content-Type": "application/json",
        "User-Agent": "RoleGPT/1.0"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("네이버 데이터랩 API 에러:", response.status, errorText);
      return c.json({ 
        error: `네이버 데이터랩 API 오류: ${response.status} ${response.statusText}`,
        details: errorText
      }, response.status);
    }

    const data: NaverDataLabResponse = await response.json();
    
    console.log("✅ 네이버 데이터랩 검색 완료:", data.results.length, "개 결과");

    return c.json(data);

  } catch (error) {
    console.error("네이버 데이터랩 검색 중 오류:", error);
    return c.json({ 
      error: "네이버 데이터랩 검색 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// NewsAPI 검색 엔드포인트
app.get("/make-server-e3d1d00c/news/search", async (c) => {
  try {
    const apiKey = Deno.env.get("NEWS_API_KEY");
    if (!apiKey) {
      console.error("NEWS_API_KEY 환경 변수가 설정되지 않음");
      return c.json({ error: "NewsAPI 키가 설정되지 않았습니다" }, 500);
    }

    const query = c.req.query("query");
    const language = c.req.query("language") || "en";
    const sortBy = c.req.query("sortBy") || "relevancy"; // relevancy, popularity, publishedAt
    const pageSize = parseInt(c.req.query("pageSize") || "10");
    const from = c.req.query("from"); // 날짜 형식: YYYY-MM-DD

    if (!query) {
      return c.json({ error: "검색어가 필요합니다" }, 400);
    }

    console.log(`🔍 NewsAPI 검색:`, { query, language, sortBy, pageSize, from });

    let url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=${language}&sortBy=${sortBy}&pageSize=${pageSize}&apiKey=${apiKey}`;
    
    if (from) {
      url += `&from=${from}`;
    }

    const response = await fetch(url, {
      headers: {
        "User-Agent": "RoleGPT/1.0"
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("NewsAPI 검색 에러:", response.status, errorText);
      return c.json({ 
        error: `NewsAPI 검색 오류: ${response.status} ${response.statusText}`,
        details: errorText
      }, response.status);
    }

    const data = await response.json();
    
    // 한국어 결과가 필요한 경우 네이버 뉴스도 함께 검색
    let combinedResults = {
      ...data,
      sources: ['NewsAPI']
    };

    if (language === 'ko') {
      try {
        const clientId = Deno.env.get("NAVER_CLIENT_ID");
        const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");
        
        if (clientId && clientSecret) {
          const naverResponse = await fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${Math.min(pageSize, 10)}&sort=date`, {
            headers: {
              "X-Naver-Client-Id": clientId,
              "X-Naver-Client-Secret": clientSecret,
              "User-Agent": "RoleGPT/1.0"
            }
          });

          if (naverResponse.ok) {
            const naverData = await naverResponse.json();
            const naverArticles = naverData.items.map((item: any) => ({
              title: item.title.replace(/<[^>]*>/g, ""),
              description: item.description?.replace(/<[^>]*>/g, "") || "",
              url: item.link,
              publishedAt: item.pubDate,
              source: { name: "Naver News" },
              urlToImage: null
            }));

            combinedResults = {
              status: "ok",
              totalResults: data.totalResults + naverData.total,
              articles: [...(data.articles || []), ...naverArticles],
              sources: ['NewsAPI', 'Naver News']
            };
          }
        }
      } catch (naverError) {
        console.warn("네이버 뉴스 추가 검색 실패:", naverError);
      }
    }

    console.log(`✅ NewsAPI 검색 완료:`, combinedResults.articles?.length || 0, "개 기사");

    return c.json(combinedResults);

  } catch (error) {
    console.error("NewsAPI 검색 중 오류:", error);
    return c.json({ 
      error: "뉴스 검색 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 통합 검색 엔드포인트 (위키백과 + 네이버 + NewsAPI)
app.get("/make-server-e3d1d00c/search/unified", async (c) => {
  try {
    const query = c.req.query("query");
    const sources = c.req.query("sources") || "wikipedia,naver"; // 검색할 소스들
    const limit = parseInt(c.req.query("limit") || "5");

    if (!query) {
      return c.json({ error: "검색어가 필요합니다" }, 400);
    }

    const sourceList = sources.split(",");
    const results: any = {
      query,
      sources: {},
      timestamp: new Date().toISOString()
    };

    console.log("🔍 통합 검색:", { query, sources: sourceList, limit });

    // 병렬 검색 실행
    const searchPromises = [];

    // 위키백과 검색
    if (sourceList.includes("wikipedia")) {
      searchPromises.push(
        fetch(`https://ko.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(query)}&limit=${limit}`)
          .then(res => res.json())
          .then(data => ({
            source: "wikipedia",
            data: data.pages || []
          }))
          .catch(error => ({
            source: "wikipedia",
            error: error.message
          }))
      );
    }

    // 네이버 뉴스 검색
    if (sourceList.includes("naver")) {
      const clientId = Deno.env.get("NAVER_CLIENT_ID");
      const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");
      
      if (clientId && clientSecret) {
        searchPromises.push(
          fetch(`https://openapi.naver.com/v1/search/news.json?query=${encodeURIComponent(query)}&display=${limit}`, {
            headers: {
              "X-Naver-Client-Id": clientId,
              "X-Naver-Client-Secret": clientSecret
            }
          })
            .then(res => res.json())
            .then(data => ({
              source: "naver_news",
              data: data.items || []
            }))
            .catch(error => ({
              source: "naver_news",
              error: error.message
            }))
        );
      }
    }

    const searchResults = await Promise.all(searchPromises);

    // 결과 정리
    searchResults.forEach(result => {
      if (result.error) {
        results.sources[result.source] = { error: result.error };
      } else {
        results.sources[result.source] = {
          count: result.data.length,
          items: result.data
        };
      }
    });

    console.log("✅ 통합 검색 완료:", Object.keys(results.sources));

    return c.json(results);

  } catch (error) {
    console.error("통합 검색 중 오류:", error);
    return c.json({ 
      error: "통합 검색 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Chart generation interfaces
interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
  fill?: boolean;
}

interface ChartConfig {
  type: "line" | "bar" | "pie" | "doughnut" | "radar" | "area";
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
  options?: {
    responsive?: boolean;
    plugins?: {
      title?: {
        display: boolean;
        text: string;
      };
      legend?: {
        display: boolean;
        position?: "top" | "bottom" | "left" | "right";
      };
    };
    scales?: {
      y?: {
        beginAtZero?: boolean;
        title?: {
          display: boolean;
          text: string;
        };
      };
      x?: {
        title?: {
          display: boolean;
          text: string;
        };
      };
    };
  };
}

// QuickChart API를 사용한 차트 생성
app.post("/make-server-e3d1d00c/chart/generate", async (c) => {
  try {
    const body = await c.req.json();
    const {
      chart,
      width = 600,
      height = 400,
      backgroundColor = "white",
      format = "png"
    } = body;

    if (!chart) {
      return c.json({ error: "차트 설정이 필요합니다" }, 400);
    }

    console.log("📊 차트 생성 요청:", { 
      type: chart.type, 
      width, 
      height, 
      datasets: chart.data?.datasets?.length || 0 
    });

    // QuickChart URL 생성
    const chartConfig = encodeURIComponent(JSON.stringify(chart));
    const quickChartUrl = `https://quickchart.io/chart?width=${width}&height=${height}&backgroundColor=${backgroundColor}&format=${format}&chart=${chartConfig}`;

    console.log("🔗 QuickChart URL 생성 완료");

    return c.json({
      success: true,
      chartUrl: quickChartUrl,
      config: chart
    });

  } catch (error) {
    console.error("차트 생성 중 오류:", error);
    return c.json({
      error: "차트 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 네이버 데이터랩 데이터를 차트로 변환
app.post("/make-server-e3d1d00c/chart/datalab", async (c) => {
  try {
    const body = await c.req.json();
    const {
      keywords = ["검색어"],
      startDate = "2023-01-01",
      endDate = new Date().toISOString().split('T')[0],
      timeUnit = "month",
      chartType = "line",
      width = 800,
      height = 400
    } = body;

    console.log("📊 데이터랩 차트 생성:", { keywords, chartType, timeUnit });

    // 1. 네이버 데이터랩 API 호출
    const clientId = Deno.env.get("NAVER_CLIENT_ID");
    const clientSecret = Deno.env.get("NAVER_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      return c.json({ error: "네이버 API 키가 설정되지 않았습니다" }, 500);
    }

    const datalabBody = {
      startDate,
      endDate,
      timeUnit,
      keywordGroups: keywords.map((keyword: string, index: number) => ({
        groupName: keyword,
        keywords: [keyword]
      }))
    };

    const datalabResponse = await fetch("https://openapi.naver.com/v1/datalab/search", {
      method: "POST",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
        "Content-Type": "application/json",
        "User-Agent": "RoleGPT/1.0"
      },
      body: JSON.stringify(datalabBody)
    });

    if (!datalabResponse.ok) {
      const errorText = await datalabResponse.text();
      console.error("네이버 데이터랩 API 에러:", datalabResponse.status, errorText);
      return c.json({ 
        error: `네이버 데이터랩 API 오류: ${datalabResponse.status}`,
        details: errorText
      }, datalabResponse.status);
    }

    const datalabData: NaverDataLabResponse = await datalabResponse.json();

    // 2. 차트 데이터로 변환
    const labels = datalabData.results[0]?.data.map(item => {
      const date = new Date(item.period);
      return timeUnit === "date" 
        ? date.toLocaleDateString("ko-KR", { month: "short", day: "numeric" })
        : timeUnit === "week"
        ? `${date.getMonth() + 1}월 ${Math.ceil(date.getDate() / 7)}주`
        : date.toLocaleDateString("ko-KR", { year: "numeric", month: "short" });
    }) || [];

    const colors = [
      "rgba(59, 130, 246, 0.8)",   // 파랑
      "rgba(239, 68, 68, 0.8)",    // 빨강
      "rgba(34, 197, 94, 0.8)",    // 초록
      "rgba(251, 146, 60, 0.8)",   // 주황
      "rgba(168, 85, 247, 0.8)",   // 보라
    ];

    const datasets = datalabData.results.map((result, index) => ({
      label: result.title,
      data: result.data.map(item => item.ratio),
      backgroundColor: chartType === "line" ? "transparent" : colors[index % colors.length],
      borderColor: colors[index % colors.length],
      borderWidth: 2,
      fill: chartType === "area"
    }));

    // 3. Chart.js 설정 생성
    const chartConfig: ChartConfig = {
      type: chartType as any,
      data: {
        labels,
        datasets
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: `검색 트렌드: ${keywords.join(", ")} (${startDate} ~ ${endDate})`
          },
          legend: {
            display: true,
            position: "top"
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "검색량 지수"
            }
          },
          x: {
            title: {
              display: true,
              text: "기간"
            }
          }
        }
      }
    };

    // 4. QuickChart URL 생성
    const chartConfigStr = encodeURIComponent(JSON.stringify(chartConfig));
    const quickChartUrl = `https://quickchart.io/chart?width=${width}&height=${height}&backgroundColor=white&chart=${chartConfigStr}`;

    console.log("✅ 데이터랩 차트 생성 완료:", keywords.length, "개 키워드");

    return c.json({
      success: true,
      chartUrl: quickChartUrl,
      config: chartConfig,
      rawData: datalabData,
      summary: {
        keywords: keywords,
        period: `${startDate} ~ ${endDate}`,
        timeUnit: timeUnit,
        dataPoints: labels.length
      }
    });

  } catch (error) {
    console.error("데이터랩 차트 생성 중 오류:", error);
    return c.json({
      error: "데이터랩 차트 생성 중 오류가 발생���습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 사전 정의된 차트 템플릿
app.get("/make-server-e3d1d00c/chart/templates", (c) => {
  const templates = [
    {
      id: "line_trend",
      name: "라인 차트 (트렌드)",
      description: "시간별 데이터 변화를 보여주는 라인 차트",
      type: "line",
      example: {
        type: "line",
        data: {
          labels: ["1월", "2월", "3월", "4월", "5월"],
          datasets: [{
            label: "검색량",
            data: [120, 190, 150, 220, 180],
            borderColor: "rgba(59, 130, 246, 1)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            borderWidth: 2
          }]
        }
      }
    },
    {
      id: "bar_comparison",
      name: "막대 차트 (비교)",
      description: "여러 항목을 비교하는 막대 차트",
      type: "bar",
      example: {
        type: "bar",
        data: {
          labels: ["AI", "머신러닝", "딥러닝", "데이터사이언스"],
          datasets: [{
            label: "검색량",
            data: [85, 72, 68, 45],
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(239, 68, 68, 0.8)",
              "rgba(34, 197, 94, 0.8)",
              "rgba(251, 146, 60, 0.8)"
            ]
          }]
        }
      }
    },
    {
      id: "pie_distribution",
      name: "파이 차트 (분포)",
      description: "전체에서 각 부분의 비율을 보여주는 파이 차트",
      type: "pie",
      example: {
        type: "pie",
        data: {
          labels: ["모바일", "데스크톱", "태블릿"],
          datasets: [{
            data: [65, 30, 5],
            backgroundColor: [
              "rgba(59, 130, 246, 0.8)",
              "rgba(239, 68, 68, 0.8)",
              "rgba(34, 197, 94, 0.8)"
            ]
          }]
        }
      }
    }
  ];

  return c.json({ templates });
});

// ======================================
// 🔥 Role GPT 차별화 기능들 - 서버리스 보안 구현
// ======================================

// 역할 고정 (Role Persistence) 인터페이스
interface RolePersistenceSettings {
  userId: string;
  conversationId: string;
  roleId: string;
  persistenceType: 'session' | 'conversation' | 'permanent';
  settings: {
    keywordIds: string[];
    temperature: number;
    maxOutputTokens: number;
    safetyLevel: string;
    customInstructions?: string;
  };
  createdAt: string;
  lastUsedAt: string;
}

// 대화 타임라인 인터페이스
interface ConversationTimeline {
  id: string;
  conversationId: string;
  userId: string;
  summaries: Array<{
    id: string;
    startIndex: number;
    endIndex: number;
    summary: string;
    createdAt: string;
    isConsolidated: boolean;
  }>;
  reminders: Array<{
    id: string;
    content: string;
    triggerIndex: number;
    isActive: boolean;
    createdAt: string;
  }>;
  settings: {
    summaryInterval: number;
    reminderInterval: number;
    autoConsolidate: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// 키워드 응답 설정 인터페이스
interface KeywordResponseSettings {
  userId: string;
  conversationId?: string;
  roleId?: string;
  keywords: Array<{
    id: string;
    name: string;
    description: string;
    category: string;
    priority: number;
    isActive: boolean;
  }>;
  responseMode: 'strict' | 'flexible' | 'adaptive';
  createdAt: string;
  updatedAt: string;
}

// 역할 고정 설정 저장
app.post("/make-server-e3d1d00c/role/persistence/save", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, roleId, persistenceType, settings } = body;

    if (!userId || !roleId) {
      return c.json({ error: "사용자 ID와 역할 ID가 필요합니다" }, 400);
    }

    console.log("💾 역할 고정 설정 저장:", { userId, roleId, persistenceType });

    const persistenceKey = `role_persistence_${userId}_${conversationId || 'global'}`;
    const persistenceData: RolePersistenceSettings = {
      userId,
      conversationId: conversationId || '',
      roleId,
      persistenceType: persistenceType || 'conversation',
      settings: {
        keywordIds: settings.keywordIds || [],
        temperature: settings.temperature || 0.7,
        maxOutputTokens: settings.maxOutputTokens || 2048,
        safetyLevel: settings.safetyLevel || 'BLOCK_MEDIUM_AND_ABOVE',
        customInstructions: settings.customInstructions || ''
      },
      createdAt: new Date().toISOString(),
      lastUsedAt: new Date().toISOString()
    };

    await kv.set(persistenceKey, persistenceData);

    console.log("✅ 역할 고정 설정 저장 완료");

    return c.json({
      success: true,
      message: "역할 고정 설정이 저장되었습니다",
      settings: persistenceData
    });

  } catch (error) {
    console.error("역할 고정 설정 저장 중 오류:", error);
    return c.json({
      error: "역할 고정 설정 저장 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 역할 고정 설정 조회
app.get("/make-server-e3d1d00c/role/persistence/:userId/:conversationId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationId = c.req.param("conversationId");

    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    console.log("🔍 역할 고정 설정 조회:", { userId, conversationId });

    const persistenceKey = `role_persistence_${userId}_${conversationId}`;
    const persistenceData = await kv.get(persistenceKey);

    if (!persistenceData) {
      // 글로벌 설정 확인
      const globalKey = `role_persistence_${userId}_global`;
      const globalData = await kv.get(globalKey);
      
      return c.json({
        success: true,
        settings: globalData || null,
        isGlobal: !!globalData
      });
    }

    // 마지막 사용 시간 업데이트
    persistenceData.lastUsedAt = new Date().toISOString();
    await kv.set(persistenceKey, persistenceData);

    console.log("✅ 역할 고정 설정 조회 완료:", persistenceData.roleId);

    return c.json({
      success: true,
      settings: persistenceData,
      isGlobal: false
    });

  } catch (error) {
    console.error("역할 고정 설정 조회 중 오류:", error);
    return c.json({
      error: "역할 고정 설정 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 대화 타임라인 요약 생성
app.post("/make-server-e3d1d00c/timeline/summary/generate", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, messages, startIndex, endIndex, summaryType = 'auto' } = body;

    if (!userId || !conversationId || !messages) {
      return c.json({ error: "필수 파라미터가 누락되었습니다" }, 400);
    }

    console.log("📝 대화 타임라인 요약 생성:", { 
      userId, 
      conversationId, 
      startIndex, 
      endIndex,
      messagesCount: messages.length,
      summaryType
    });

    // 요약할 메시지 범위 결정
    const startIdx = startIndex || Math.max(0, messages.length - 15);
    const endIdx = endIndex || messages.length - 1;
    const messagesToSummarize = messages.slice(startIdx, endIdx + 1);

    // 간단한 요약 생성 (실제로는 AI API 사용)
    const userMessages = messagesToSummarize.filter((m: any) => m.sender === 'user');
    const aiMessages = messagesToSummarize.filter((m: any) => m.sender === 'ai');
    
    // 주요 토픽 추출
    const topics = extractTopicsFromMessages(messagesToSummarize);
    
    let summary = '';
    switch (summaryType) {
      case 'bullet':
        summary = generateBulletSummary(topics, userMessages.length, aiMessages.length);
        break;
      case 'paragraph':
        summary = generateParagraphSummary(topics, userMessages.length, aiMessages.length);
        break;
      default:
        summary = generateAutoSummary(topics, userMessages.length, aiMessages.length);
    }

    // 타임라인에 요약 저장
    const timelineKey = `timeline_${userId}_${conversationId}`;
    let timeline = await kv.get(timelineKey) as ConversationTimeline || {
      id: `timeline_${Date.now()}`,
      conversationId,
      userId,
      summaries: [],
      reminders: [],
      settings: {
        summaryInterval: 12,
        reminderInterval: 10,
        autoConsolidate: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newSummary = {
      id: `summary_${Date.now()}`,
      startIndex: startIdx,
      endIndex: endIdx,
      summary,
      createdAt: new Date().toISOString(),
      isConsolidated: false
    };

    timeline.summaries.push(newSummary);
    timeline.updatedAt = new Date().toISOString();

    await kv.set(timelineKey, timeline);

    console.log("✅ 대화 타임라인 요약 생성 완료");

    return c.json({
      success: true,
      summary: newSummary,
      timeline: {
        totalSummaries: timeline.summaries.length,
        lastSummaryIndex: endIdx
      }
    });

  } catch (error) {
    console.error("대화 타임라인 요약 생성 중 오류:", error);
    return c.json({
      error: "대화 타임라인 요약 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 대화 리마인더 설정
app.post("/make-server-e3d1d00c/timeline/reminder/set", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, reminderType, content, triggerCondition, settings } = body;

    if (!userId || !conversationId || !reminderType) {
      return c.json({ error: "필수 파라미터가 누락되었습니다" }, 400);
    }

    console.log("⏰ 대화 리마인더 설정:", { userId, conversationId, reminderType });

    const timelineKey = `timeline_${userId}_${conversationId}`;
    let timeline = await kv.get(timelineKey) as ConversationTimeline || {
      id: `timeline_${Date.now()}`,
      conversationId,
      userId,
      summaries: [],
      reminders: [],
      settings: {
        summaryInterval: 12,
        reminderInterval: 10,
        autoConsolidate: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newReminder = {
      id: `reminder_${Date.now()}`,
      content: content || generateDefaultReminderContent(reminderType),
      triggerIndex: triggerCondition?.messageCount || 10,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    timeline.reminders.push(newReminder);
    timeline.settings = { ...timeline.settings, ...settings };
    timeline.updatedAt = new Date().toISOString();

    await kv.set(timelineKey, timeline);

    console.log("✅ 대화 리마인더 설정 완료");

    return c.json({
      success: true,
      reminder: newReminder,
      message: "대화 리마인더가 설정되었습니다"
    });

  } catch (error) {
    console.error("대화 리마인더 설정 중 오류:", error);
    return c.json({
      error: "대화 리마인더 설정 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 키워드 응답 설정 저장
app.post("/make-server-e3d1d00c/keywords/response/save", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, roleId, keywords, responseMode = 'flexible' } = body;

    if (!userId || !keywords || !Array.isArray(keywords)) {
      return c.json({ error: "사용자 ID와 키워드 배열이 필요합니다" }, 400);
    }

    console.log("🏷️ 키워드 응답 설정 저장:", { 
      userId, 
      conversationId, 
      roleId, 
      keywordsCount: keywords.length,
      responseMode
    });

    const keywordsKey = `keywords_${userId}_${conversationId || 'global'}`;
    const keywordSettings: KeywordResponseSettings = {
      userId,
      conversationId: conversationId || '',
      roleId: roleId || '',
      keywords: keywords.map((kw: any, index: number) => ({
        id: kw.id || `kw_${Date.now()}_${index}`,
        name: kw.name,
        description: kw.description,
        category: kw.category || 'custom',
        priority: kw.priority || index + 1,
        isActive: kw.isActive !== false
      })),
      responseMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(keywordsKey, keywordSettings);

    console.log("✅ 키워드 응답 설정 저장 완료");

    return c.json({
      success: true,
      settings: keywordSettings,
      message: "키워드 응답 설정이 저장되었습니다"
    });

  } catch (error) {
    console.error("키워드 응답 설정 저장 중 오류:", error);
    return c.json({
      error: "키워드 응답 설정 저장 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 키워드 응답 설정 조회
app.get("/make-server-e3d1d00c/keywords/response/:userId/:conversationId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationId = c.req.param("conversationId");

    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    console.log("🔍 키워드 응답 설정 조회:", { userId, conversationId });

    const keywordsKey = `keywords_${userId}_${conversationId}`;
    let keywordSettings = await kv.get(keywordsKey);

    if (!keywordSettings) {
      // 글로벌 설정 확인
      const globalKey = `keywords_${userId}_global`;
      keywordSettings = await kv.get(globalKey);
    }

    console.log("✅ 키워드 응답 설정 조회 완료:", keywordSettings ? '설정 있음' : '설정 없음');

    return c.json({
      success: true,
      settings: keywordSettings || null,
      hasSettings: !!keywordSettings
    });

  } catch (error) {
    console.error("키워드 응답 설정 조회 중 오류:", error);
    return c.json({
      error: "키워드 응답 설정 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 대화 타임라인 전체 조회
app.get("/make-server-e3d1d00c/timeline/:userId/:conversationId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationId = c.req.param("conversationId");

    if (!userId || !conversationId) {
      return c.json({ error: "사용자 ID와 대화 ID가 필요합니다" }, 400);
    }

    console.log("📊 대화 타임라인 조회:", { userId, conversationId });

    const timelineKey = `timeline_${userId}_${conversationId}`;
    const timeline = await kv.get(timelineKey);

    console.log("✅ 대화 타임라인 조회 완료:", timeline ? '타임라인 있음' : '타임라인 없음');

    return c.json({
      success: true,
      timeline: timeline || null,
      hasTimeline: !!timeline
    });

  } catch (error) {
    console.error("대화 타임라인 조회 중 오류:", error);
    return c.json({
      error: "대화 타임라인 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 리마인더 트리거 확인
app.post("/make-server-e3d1d00c/timeline/reminder/check", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, currentMessageIndex } = body;

    if (!userId || !conversationId || typeof currentMessageIndex !== 'number') {
      return c.json({ error: "필수 파라미터가 누락되었습니다" }, 400);
    }

    console.log("🔔 리마인더 트리거 확인:", { userId, conversationId, currentMessageIndex });

    const timelineKey = `timeline_${userId}_${conversationId}`;
    const timeline = await kv.get(timelineKey) as ConversationTimeline;

    if (!timeline) {
      return c.json({
        success: true,
        shouldTrigger: false,
        reminders: []
      });
    }

    // 활성 리마인더 중 트리거 조건을 만족하는 것들 찾기
    const triggeredReminders = timeline.reminders.filter(reminder => 
      reminder.isActive && 
      currentMessageIndex >= reminder.triggerIndex &&
      (currentMessageIndex - reminder.triggerIndex) % timeline.settings.reminderInterval === 0
    );

    const shouldTrigger = triggeredReminders.length > 0;

    console.log("✅ 리마인더 트리거 확인 완료:", { 
      shouldTrigger, 
      triggeredCount: triggeredReminders.length 
    });

    return c.json({
      success: true,
      shouldTrigger,
      reminders: triggeredReminders,
      timeline: {
        summariesCount: timeline.summaries.length,
        remindersCount: timeline.reminders.length,
        settings: timeline.settings
      }
    });

  } catch (error) {
    console.error("리마인더 트리거 확인 중 오류:", error);
    return c.json({
      error: "리마인더 트리거 확인 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 유틸리티 함수들
function extractTopicsFromMessages(messages: any[]): string[] {
  const topics: string[] = [];
  
  messages.forEach(message => {
    const text = message.text.toLowerCase();
    
    if (text.includes('프로젝트') || text.includes('작업')) {
      topics.push('프로젝트 관련');
    }
    if (text.includes('코딩') || text.includes('개발') || text.includes('프로그래밍')) {
      topics.push('개발 관련');
    }
    if (text.includes('디자인') || text.includes('UI') || text.includes('UX')) {
      topics.push('디자인 관련');
    }
    if (text.includes('학습') || text.includes('공부') || text.includes('교육')) {
      topics.push('학습 관련');
    }
    if (text.includes('문제') || text.includes('해결') || text.includes('도움')) {
      topics.push('문제 해결');
    }
  });
  
  return [...new Set(topics)];
}

function generateBulletSummary(topics: string[], userCount: number, aiCount: number): string {
  let summary = `• 대화 ${userCount + aiCount}턴 진행 (사용자 ${userCount}턴, AI ${aiCount}턴)\n`;
  
  if (topics.length > 0) {
    summary += `• 주요 주제: ${topics.join(', ')}\n`;
  }
  
  summary += `• 요약 생성 시간: ${new Date().toLocaleString('ko-KR')}`;
  
  return summary;
}

function generateParagraphSummary(topics: string[], userCount: number, aiCount: number): string {
  let summary = `이 구간에서는 총 ${userCount + aiCount}턴의 대화가 진행되었습니다. `;
  
  if (topics.length > 0) {
    summary += `주요 주제는 ${topics.join(', ')}이었으며, `;
  }
  
  summary += `사용자가 ${userCount}번의 메시지를 보내고 AI가 ${aiCount}번 응답했습니다.`;
  
  return summary;
}

function generateAutoSummary(topics: string[], userCount: number, aiCount: number): string {
  if (topics.length > 2) {
    return generateParagraphSummary(topics, userCount, aiCount);
  } else {
    return generateBulletSummary(topics, userCount, aiCount);
  }
}

function generateDefaultReminderContent(reminderType: string): string {
  switch (reminderType) {
    case 'progress':
      return '현재까지의 대화 진행 상황을 확인해보세요.';
    case 'summary':
      return '대화 내용을 요약해서 정리해드릴까요?';
    case 'check_in':
      return '지금까지의 대화가 도움이 되고 있나요?';
    default:
      return '대화가 계속 진행되고 있습니다.';
  }
}

// Google OAuth interfaces
interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface GoogleDocumentInfo {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
}

interface GoogleSheetInfo {
  spreadsheetId: string;
  properties: {
    title: string;
    locale: string;
    timeZone: string;
  };
  sheets: Array<{
    properties: {
      sheetId: number;
      title: string;
      gridProperties: {
        rowCount: number;
        columnCount: number;
      };
    };
  }>;
}

// Google OAuth 설정
const GOOGLE_CLIENT_ID = "850513120058-clp78s0glfj4r9esgra0bkdqo6nh0kqv.apps.googleusercontent.com";
const GOOGLE_REDIRECT_URI = "https://rolegtp.vercel.app/oauth2/callback";
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile"
].join(" ");

// Google OAuth 인증 URL 생성
app.get("/make-server-e3d1d00c/google/auth-url", (c) => {
  try {
    const state = Math.random().toString(36).substring(7);
    
    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
    authUrl.searchParams.set("redirect_uri", GOOGLE_REDIRECT_URI);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", GOOGLE_SCOPES);
    authUrl.searchParams.set("access_type", "offline");
    authUrl.searchParams.set("prompt", "consent");
    authUrl.searchParams.set("state", state);

    console.log("🔐 Google OAuth 인증 URL 생성:", authUrl.toString());

    return c.json({
      authUrl: authUrl.toString(),
      state
    });

  } catch (error) {
    console.error("Google OAuth URL 생성 중 오류:", error);
    return c.json({
      error: "OAuth URL 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google OAuth 토큰 교환
app.post("/make-server-e3d1d00c/google/token", async (c) => {
  try {
    const body = await c.req.json();
    const { code, clientSecret } = body;

    if (!code) {
      return c.json({ error: "인증 코드가 필요합니다" }, 400);
    }

    if (!clientSecret) {
      return c.json({ error: "클라이언트 시크릿이 필요합니다" }, 400);
    }

    console.log("🔐 Google OAuth 토큰 교환 시작");

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: clientSecret,
        redirect_uri: GOOGLE_REDIRECT_URI,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error("Google 토큰 교환 실패:", tokenResponse.status, errorText);
      return c.json({
        error: `Google 토큰 교환 실패: ${tokenResponse.status}`,
        details: errorText
      }, tokenResponse.status);
    }

    const tokenData: GoogleTokenResponse = await tokenResponse.json();

    // 사용자 정보 가져오기
    const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      console.error("Google 사용자 정보 조회 실패:", userInfoResponse.status);
      return c.json({
        error: "사용자 정보를 가져올 수 없습니다",
      }, userInfoResponse.status);
    }

    const userInfo: GoogleUserInfo = await userInfoResponse.json();

    // 토큰과 사용자 정보를 KV 스토어에 저장 (실제 구현에서는 사용자별로 암호화하여 저장)
    const userTokenKey = `google_token_${userInfo.id}`;
    await kv.set(userTokenKey, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresIn: tokenData.expires_in,
      scope: tokenData.scope,
      tokenType: tokenData.token_type,
      userInfo,
      createdAt: new Date().toISOString()
    });

    console.log("✅ Google OAuth 인증 완료:", userInfo.email);

    return c.json({
      success: true,
      user: userInfo,
      accessToken: tokenData.access_token,
      scope: tokenData.scope
    });

  } catch (error) {
    console.error("Google OAuth 토큰 교환 중 오류:", error);
    return c.json({
      error: "토큰 교환 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google 연결 상태 확인
app.get("/make-server-e3d1d00c/google/status/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    const userTokenKey = `google_token_${userId}`;
    const tokenData = await kv.get(userTokenKey);

    if (!tokenData) {
      return c.json({
        connected: false,
        message: "Google 계정이 연결되지 않았습니다"
      });
    }

    console.log("📊 Google 연결 상태 확인:", tokenData.userInfo?.email);

    return c.json({
      connected: true,
      user: tokenData.userInfo,
      scope: tokenData.scope,
      connectedAt: tokenData.createdAt
    });

  } catch (error) {
    console.error("Google 연결 상태 확인 중 오류:", error);
    return c.json({
      error: "연결 상태 확인 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google 연결 해제
app.delete("/make-server-e3d1d00c/google/disconnect/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    const userTokenKey = `google_token_${userId}`;
    await kv.del(userTokenKey);

    console.log("🔌 Google 연결 해제 완료:", userId);

    return c.json({
      success: true,
      message: "Google 연결이 해제되었습니다"
    });

  } catch (error) {
    console.error("Google 연결 해제 중 오류:", error);
    return c.json({
      error: "연결 해제 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google Docs 목록 조회
app.get("/make-server-e3d1d00c/google/docs/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const limit = c.req.query("limit") || "10";

    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    const userTokenKey = `google_token_${userId}`;
    const tokenData = await kv.get(userTokenKey);

    if (!tokenData || !tokenData.accessToken) {
      return c.json({ error: "Google 계정이 연결되지 않았습니다" }, 401);
    }

    console.log("📄 Google Docs 목록 조회:", userId);

    // Google Drive API를 사용하여 문서 목록 조회
    const docsResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.document'&pageSize=${limit}&fields=files(id,name,mimeType,webViewLink,modifiedTime)`, {
      headers: {
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
    });

    if (!docsResponse.ok) {
      const errorText = await docsResponse.text();
      console.error("Google Docs 조회 실패:", docsResponse.status, errorText);
      return c.json({
        error: `Google Docs 조회 실패: ${docsResponse.status}`,
        details: errorText
      }, docsResponse.status);
    }

    const docsData = await docsResponse.json();

    console.log("✅ Google Docs 목록 조회 완료:", docsData.files?.length || 0, "개 문서");

    return c.json({
      success: true,
      documents: docsData.files || [],
      total: docsData.files?.length || 0
    });

  } catch (error) {
    console.error("Google Docs 조회 중 오류:", error);
    return c.json({
      error: "문서 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google Docs 내용 조회
app.get("/make-server-e3d1d00c/google/docs/:userId/:documentId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const documentId = c.req.param("documentId");

    if (!userId || !documentId) {
      return c.json({ error: "사용자 ID와 문서 ID가 필요합니다" }, 400);
    }

    const userTokenKey = `google_token_${userId}`;
    const tokenData = await kv.get(userTokenKey);

    if (!tokenData || !tokenData.accessToken) {
      return c.json({ error: "Google 계정이 연결되지 않았습니다" }, 401);
    }

    console.log("📄 Google Docs 내용 조회:", documentId);

    // Google Docs API를 사용하여 문서 내용 조회
    const docResponse = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
      headers: {
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
    });

    if (!docResponse.ok) {
      const errorText = await docResponse.text();
      console.error("Google Docs 내용 조회 실패:", docResponse.status, errorText);
      return c.json({
        error: `Google Docs 내용 조회 실패: ${docResponse.status}`,
        details: errorText
      }, docResponse.status);
    }

    const docData = await docResponse.json();

    // 문서 텍스트 추출 (간단한 버전)
    let textContent = "";
    if (docData.body && docData.body.content) {
      docData.body.content.forEach((element: any) => {
        if (element.paragraph && element.paragraph.elements) {
          element.paragraph.elements.forEach((textElement: any) => {
            if (textElement.textRun && textElement.textRun.content) {
              textContent += textElement.textRun.content;
            }
          });
        }
      });
    }

    console.log("✅ Google Docs 내용 조회 완료:", textContent.length, "자");

    return c.json({
      success: true,
      document: {
        id: docData.documentId,
        title: docData.title,
        textContent: textContent.trim(),
        metadata: {
          revisionId: docData.revisionId,
          suggestionsViewMode: docData.suggestionsViewMode
        }
      }
    });

  } catch (error) {
    console.error("Google Docs 내용 조회 중 오류:", error);
    return c.json({
      error: "문서 내용 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google Sheets 목록 조회
app.get("/make-server-e3d1d00c/google/sheets/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const limit = c.req.query("limit") || "10";

    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    const userTokenKey = `google_token_${userId}`;
    const tokenData = await kv.get(userTokenKey);

    if (!tokenData || !tokenData.accessToken) {
      return c.json({ error: "Google 계정이 연결되지 않았습니다" }, 401);
    }

    console.log("📊 Google Sheets 목록 조회:", userId);

    // Google Drive API를 사용하여 스프레드시트 목록 조회
    const sheetsResponse = await fetch(`https://www.googleapis.com/drive/v3/files?q=mimeType='application/vnd.google-apps.spreadsheet'&pageSize=${limit}&fields=files(id,name,mimeType,webViewLink,modifiedTime)`, {
      headers: {
        Authorization: `Bearer ${tokenData.accessToken}`,
      },
    });

    if (!sheetsResponse.ok) {
      const errorText = await sheetsResponse.text();
      console.error("Google Sheets 조회 실패:", sheetsResponse.status, errorText);
      return c.json({
        error: `Google Sheets 조회 실패: ${sheetsResponse.status}`,
        details: errorText
      }, sheetsResponse.status);
    }

    const sheetsData = await sheetsResponse.json();

    console.log("✅ Google Sheets 목록 조회 완료:", sheetsData.files?.length || 0, "개 스프레드시트");

    return c.json({
      success: true,
      spreadsheets: sheetsData.files || [],
      total: sheetsData.files?.length || 0
    });

  } catch (error) {
    console.error("Google Sheets 조회 중 오류:", error);
    return c.json({
      error: "스프레드시트 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google Sheets 데이터 조회
app.get("/make-server-e3d1d00c/google/sheets/:userId/:spreadsheetId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const spreadsheetId = c.req.param("spreadsheetId");
    const range = c.req.query("range") || "A1:Z100"; // 기본 범위

    if (!userId || !spreadsheetId) {
      return c.json({ error: "사용자 ID와 스프레드시트 ID가 필요합니다" }, 400);
    }

    const userTokenKey = `google_token_${userId}`;
    const tokenData = await kv.get(userTokenKey);

    if (!tokenData || !tokenData.accessToken) {
      return c.json({ error: "Google 계정이 연결되지 않았습니다" }, 401);
    }

    console.log("📊 Google Sheets 데이터 조회:", spreadsheetId, range);

    // Google Sheets API를 사용하여 스프레드시트 정보와 데이터 조회
    const [metadataResponse, valuesResponse] = await Promise.all([
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}`, {
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
        },
      }),
      fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`, {
        headers: {
          Authorization: `Bearer ${tokenData.accessToken}`,
        },
      })
    ]);

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error("Google Sheets 메타데이터 조회 실패:", metadataResponse.status, errorText);
      return c.json({
        error: `Google Sheets 메타데이터 조회 실패: ${metadataResponse.status}`,
        details: errorText
      }, metadataResponse.status);
    }

    if (!valuesResponse.ok) {
      const errorText = await valuesResponse.text();
      console.error("Google Sheets 데이터 조회 실패:", valuesResponse.status, errorText);
      return c.json({
        error: `Google Sheets 데이터 조회 실패: ${valuesResponse.status}`,
        details: errorText
      }, valuesResponse.status);
    }

    const metadataData = await metadataResponse.json();
    const valuesData = await valuesResponse.json();

    console.log("✅ Google Sheets 데이터 조회 완료:", valuesData.values?.length || 0, "행");

    return c.json({
      success: true,
      spreadsheet: {
        id: metadataData.spreadsheetId,
        title: metadataData.properties?.title,
        sheets: metadataData.sheets?.map((sheet: any) => ({
          id: sheet.properties.sheetId,
          title: sheet.properties.title,
          rowCount: sheet.properties.gridProperties?.rowCount,
          columnCount: sheet.properties.gridProperties?.columnCount
        })) || [],
        values: valuesData.values || [],
        range: valuesData.range
      }
    });

  } catch (error) {
    console.error("Google Sheets 데이터 조회 중 오류:", error);
    return c.json({
      error: "스프레드시트 데이터 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// AI 채팅 인터페이스들
interface ChatMessage {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatRole {
  id: string;
  name: string;
  prompt: string;
  temperature: number;
  maxOutputTokens: number;
  safetyLevel: string;
  keywordIds: string[];
}

interface ChatProject {
  id: string;
  title: string;
  guidelines?: string;
  memory?: Array<{ content: string }>;
  files?: Array<{ name: string; content: string }>;
}

interface ChatRequest {
  role: ChatRole;
  history: ChatMessage[];
  newUserParts: Array<{ text: string }>;
  project?: ChatProject | null;
  masterKeywords?: Array<{ id: string; name: string; description: string }>;
}

// AI 채팅 시스템 인스트럭션 빌더
function buildSystemInstruction(role: ChatRole, project: ChatProject | null, masterKeywords: any[] = []): string {
  let combinedPrompt = role.prompt;

  // 프로젝트 컨텍스트 추가
  if (project) {
    let projectContext = '\n\n[PROJECT CONTEXT]\n';
    if (project.guidelines) {
      projectContext += `Guidelines: ${project.guidelines}\n`;
    }
    if (project.memory && project.memory.length > 0) {
      const memoryText = project.memory.map(m => `- ${m.content}`).join('\n');
      projectContext += `Memory:\n${memoryText}\n`;
    }
    if (project.files && project.files.length > 0) {
      const fileText = project.files.map(f => `File: ${f.name}\nContent:\n${f.content.substring(0, 2000)}...\n`).join('\n---\n');
      projectContext += `Referenced Files:\n${fileText}\n`;
    }
    combinedPrompt += projectContext;
  }

  // 키워드 인스트럭션 추가
  const keywordInstructions = role.keywordIds
    .map(id => masterKeywords.find(kw => kw.id === id))
    .filter(kw => kw && kw.description)
    .map(kw => `- ${kw!.name}: ${kw!.description}`)
    .join('\n');

  if (keywordInstructions) {
    combinedPrompt += `\n\n[ADDITIONAL INSTRUCTIONS]\nYou must adhere to the following rules in your responses:\n${keywordInstructions}`;
  }

  return combinedPrompt;
}

// AI 채팅 엔드포인트 (Google Gemini 사용)
app.post("/make-server-e3d1d00c/ai/chat", async (c) => {
  try {
    const apiKey = Deno.env.get("GOOGLE_GEMINI_API_KEY");
    if (!apiKey) {
      console.error("GOOGLE_GEMINI_API_KEY 환경 변수가 설정되지 않음");
      return c.json({ 
        error: "AI 서비스를 사용할 수 없습니다. API 키가 설정되지 않았습니다." 
      }, 500);
    }

    const body = await c.req.json() as ChatRequest;
    const { role, history, newUserParts, project, masterKeywords = [] } = body;
    
    if (!role || !history || !newUserParts) {
      return c.json({ 
        error: "잘못된 요청입니다. 필수 필드가 누락되었습니다." 
      }, 400);
    }

    console.log("🤖 AI 채팅 요청:", {
      roleId: role.id,
      roleName: role.name,
      historyLength: history.length,
      userMessage: newUserParts[0]?.text?.substring(0, 100) + '...',
      projectId: project?.id || null
    });

    // Google Gemini API 호출
    const systemInstruction = buildSystemInstruction(role, project, masterKeywords);

    // 대화 히스토리를 Gemini 형식으로 변환
    const geminiHistory = history
      .slice(0, -1) // 마지막 사용자 메시지는 newUserParts에 있음
      .map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));
    
    const contents = [
      ...geminiHistory,
      { role: 'user', parts: newUserParts }
    ];

    // Safety 설정
    const safetySettings = [
      { 
        category: "HARM_CATEGORY_HARASSMENT", 
        threshold: role.safetyLevel || "BLOCK_MEDIUM_AND_ABOVE" 
      },
      { 
        category: "HARM_CATEGORY_HATE_SPEECH", 
        threshold: role.safetyLevel || "BLOCK_MEDIUM_AND_ABOVE" 
      },
      { 
        category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", 
        threshold: role.safetyLevel || "BLOCK_MEDIUM_AND_ABOVE" 
      },
      { 
        category: "HARM_CATEGORY_DANGEROUS_CONTENT", 
        threshold: role.safetyLevel || "BLOCK_MEDIUM_AND_ABOVE" 
      },
    ];
    
    // Gemini API 요청
    const geminiRequest = {
      contents: contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: role.temperature || 0.7,
        maxOutputTokens: role.maxOutputTokens || 2048,
        responseMimeType: "text/plain"
      },
      safetySettings: safetySettings
    };

    console.log("🔄 Gemini API 호출 중...", {
      model: "gemini-2.0-flash-exp",
      temperature: geminiRequest.generationConfig.temperature,
      maxTokens: geminiRequest.generationConfig.maxOutputTokens
    });

    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:streamGenerateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(geminiRequest),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API 오류:", geminiResponse.status, errorText);
      return c.json({ 
        error: `AI 응답 생성 실패: ${geminiResponse.status}`,
        details: errorText
      }, geminiResponse.status);
    }

    // 스트리밍 응답 설정
    const headers = new Headers({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });

    // ReadableStream으로 응답 스트리밍
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const reader = geminiResponse.body?.getReader();
          if (!reader) {
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.substring(6);
                if (data && data !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(data);
                    const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
                    
                    if (text) {
                      const chunk = `data: ${JSON.stringify(text)}\n\n`;
                      controller.enqueue(new TextEncoder().encode(chunk));
                    }
                  } catch (parseError) {
                    console.warn("JSON 파싱 오류:", parseError, "Data:", data);
                  }
                }
              }
            }
          }

          controller.close();
          console.log("✅ AI 채팅 응답 완료");
          
        } catch (streamError) {
          console.error("스트리밍 중 오류:", streamError);
          controller.error(streamError);
        }
      }
    });

    return new Response(stream, { headers });

  } catch (error) {
    console.error("AI 채팅 중 오류:", error);
    return c.json({
      error: "AI 채팅 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Image generation interfaces
interface ImageGenerationRequest {
  prompt: string;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  style?: 'natural' | 'vivid' | 'sketch' | 'artistic';
  provider?: string;
  model?: string;
}

interface ImageGenerationResult {
  imageUrl: string;
  provider: string;
  prompt: string;
  size: string;
  timestamp: string;
  isBase64?: boolean;
}

// Craiyon 무료 이미지 생성
app.post("/make-server-e3d1d00c/image/craiyon", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt } = body;

    if (!prompt) {
      return c.json({ error: "프롬프트가 필요합니다" }, 400);
    }

    console.log('🎨 Craiyon 이미지 생성 시작:', prompt.substring(0, 50));
    
    const response = await fetch('https://backend.craiyon.com/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
      throw new Error(`Craiyon API 오류: ${response.status}`);
    }

    const data = await response.json();
    
    // Craiyon 응답 처리
    let imageUrl = '';
    if (data.images && data.images.length > 0) {
      // Base64 이미지를 Data URL로 변환
      imageUrl = `data:image/png;base64,${data.images[0]}`;
    } else if (data.image) {
      imageUrl = data.image;
    } else {
      throw new Error('이미지 생성 결과를 받지 못했습니다.');
    }

    console.log('✅ Craiyon 이미지 생성 완료');

    return c.json({
      success: true,
      imageUrl,
      provider: 'craiyon',
      prompt,
      size: '512x512',
      timestamp: new Date().toISOString(),
      isBase64: true
    });

  } catch (error) {
    console.error('Craiyon 이미지 생성 실패:', error);
    return c.json({
      error: "이미지 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// OpenAI DALL-E 이미지 생성
app.post("/make-server-e3d1d00c/image/dalle", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, apiKey, size = '1024x1024', style = 'natural' } = body;

    if (!prompt || !apiKey) {
      return c.json({ error: "프롬프트와 API 키가 필요합니다" }, 400);
    }

    console.log('🎨 DALL-E 이미지 생성 시작:', prompt.substring(0, 50));
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        n: 1,
        size: size,
        quality: 'standard',
        style: style === 'vivid' ? 'vivid' : 'natural'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`DALL-E API 오류: ${response.status} ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    
    if (!data.data || data.data.length === 0) {
      throw new Error('DALL-E에서 이미지를 생성하지 못했습니다.');
    }

    console.log('✅ DALL-E 이미지 생성 완료');

    return c.json({
      success: true,
      imageUrl: data.data[0].url,
      provider: 'dalle',
      prompt,
      size: size,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('DALL-E 이미지 생성 실패:', error);
    return c.json({
      error: "이미지 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Google 이미지 생성 (Imagen)
app.post("/make-server-e3d1d00c/image/google", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, apiKey, model = 'imagen-3.0-fast-generate-001', size = '1024x1024' } = body;

    if (!prompt || !apiKey) {
      return c.json({ error: "프롬프트와 API 키가 필요합니다" }, 400);
    }

    console.log('🎨 Google 이미지 생성 시작:', prompt.substring(0, 50));
    
    // 모델별 API 엔드포인트 및 요청 구조 설정
    let endpoint = '';
    let requestBody: any = {};
    
    if (model.startsWith('imagen-')) {
      // Imagen 모델들
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      requestBody = {
        contents: [{
          role: 'user',
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: 'image/png'
        }
      };
    } else if (model.includes('gemini') && model.includes('image')) {
      // Gemini Vision 이미지 생성
      endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      requestBody = {
        contents: [{
          role: 'user',
          parts: [{ text: `Generate an image: ${prompt}` }]
        }],
        generationConfig: {
          responseMimeType: 'image/png',
          temperature: 0.7
        }
      };
    } else {
      throw new Error(`지원하지 않는 모델: ${model}`);
    }
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Google API 오류: ${response.status} ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    
    if (!data.candidates || data.candidates.length === 0) {
      throw new Error('Google에서 이미지를 생성하지 못했습니다.');
    }

    // Base64 이미지 데이터 추출
    const candidate = data.candidates[0];
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      throw new Error('생성된 이미지 데이터를 찾을 수 없습니다.');
    }

    const imagePart = candidate.content.parts.find((part: any) => part.inlineData);
    if (!imagePart || !imagePart.inlineData) {
      throw new Error('이미지 데이터가 없습니다.');
    }

    const imageUrl = `data:${imagePart.inlineData.mimeType};base64,${imagePart.inlineData.data}`;

    console.log('✅ Google 이미지 생성 완료');

    return c.json({
      success: true,
      imageUrl,
      provider: `google-${model}`,
      prompt,
      size: size,
      timestamp: new Date().toISOString(),
      isBase64: true
    });

  } catch (error) {
    console.error('Google 이미지 생성 실패:', error);
    return c.json({
      error: "이미지 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// Hugging Face Stable Diffusion 이미지 생성
app.post("/make-server-e3d1d00c/image/huggingface", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, apiKey } = body;

    if (!prompt || !apiKey) {
      return c.json({ error: "프롬프트와 API 키가 필요합니다" }, 400);
    }

    console.log('🎨 Hugging Face 이미지 생성 시작:', prompt.substring(0, 50));
    
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          width: 1024,
          height: 1024,
          num_inference_steps: 30,
          guidance_scale: 7.5
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API 오류: ${response.status}`);
    }

    const blob = await response.blob();
    
    // Blob을 Base64로 변환
    const arrayBuffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const base64String = btoa(String.fromCharCode(...uint8Array));
    const imageUrl = `data:image/png;base64,${base64String}`;

    console.log('✅ Hugging Face 이미지 생성 완료');

    return c.json({
      success: true,
      imageUrl,
      provider: 'huggingface',
      prompt,
      size: '1024x1024',
      timestamp: new Date().toISOString(),
      isBase64: true
    });

  } catch (error) {
    console.error('Hugging Face 이미지 생성 실패:', error);
    return c.json({
      error: "이미지 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// ======================================
// 🎯 모드별 타임라인 고급 설정 시스템
// ======================================

// ======================================
// 🔐 통합 모드별 제한사항 시스템 (완전 서버리스)
// ======================================

// 내부 함수: 모드별 제한사항 가져오기
function getModeLimitationsInternal(userMode: 'standard' | 'advanced' | 'expert') {
  // 🔥 완전한 모드별 제한사항 (브라우저에서 접근 불가)
  const SECURE_MODE_LIMITATIONS = {
    standard: {
      // 기본 제한
      maxProjects: 2,
      maxConversations: 10,
      maxCustomRoles: 6,
      maxTemplateRoles: 6,
      
      // 기능 제한
      canExportChats: true,
      canImportChats: false,
      canDuplicateChats: false,
      canCreateCustomRoles: true,
      canEditTemplateRoles: false,
      canAccessAdvancedFeatures: false,
      
      // 타임라인 & 요약 제한
      timelineReminderMaxInterval: 10,
      timelineReminderConfigurable: false,
      showTimelineReminderSettings: false,
      summaryInterval: 12,
      summaryConfigurable: false,
      summaryToggleable: false,
      availableSummaryFormats: ['bullet'],
      minSummaryInterval: 12,
      maxSummaryInterval: 12,
      
      // 역할 & 키워드 제한
      roleReminderMaxInterval: 15,
      roleReminderPaidOnlyAfter: 15,
      maxKeywordsPerRole: 3,
      canUseCustomKeywords: false,
      
      // API 사용량 제한
      maxApiCallsPerDay: 100,
      maxTokensPerRequest: 2048,
      canUseAdvancedModels: false,
      
      // UI 제한
      showAdvancedSettings: false,
      showExpertFeatures: false,
      showTimelineControls: false
    },
    
    advanced: {
      // 고급 제한
      maxProjects: 10,
      maxConversations: 50,
      maxCustomRoles: 20,
      maxTemplateRoles: 20,
      
      // 기능 허용
      canExportChats: true,
      canImportChats: true,
      canDuplicateChats: true,
      canCreateCustomRoles: true,
      canEditTemplateRoles: true,
      canAccessAdvancedFeatures: true,
      
      // 타임라인 & 요약 고급 기능
      timelineReminderMaxInterval: 30,
      timelineReminderPaidOnlyAfter: 15,
      timelineReminderConfigurable: true,
      showTimelineReminderSettings: true,
      summaryInterval: 12,
      summaryConfigurable: true,
      summaryToggleable: true,
      availableSummaryFormats: ['bullet', 'paragraph'],
      minSummaryInterval: 8,
      maxSummaryInterval: 25,
      
      // 역할 & 키워드 고급
      roleReminderMaxInterval: 30,
      roleReminderPaidOnlyAfter: 20,
      maxKeywordsPerRole: 8,
      canUseCustomKeywords: true,
      
      // API 사용량 증가
      maxApiCallsPerDay: 500,
      maxTokensPerRequest: 4096,
      canUseAdvancedModels: true,
      
      // UI 고급 기능
      showAdvancedSettings: true,
      showExpertFeatures: false,
      showTimelineControls: true
    },
    
    expert: {
      // 전문가 무제한
      maxProjects: 100,
      maxConversations: 200,
      maxCustomRoles: 100,
      maxTemplateRoles: 100,
      
      // 모든 기능 허용
      canExportChats: true,
      canImportChats: true,
      canDuplicateChats: true,
      canCreateCustomRoles: true,
      canEditTemplateRoles: true,
      canAccessAdvancedFeatures: true,
      
      // 타임라인 & 요약 무제한
      timelineReminderMaxInterval: 50,
      timelineReminderPaidOnlyAfter: 50,
      timelineReminderConfigurable: true,
      showTimelineReminderSettings: true,
      summaryInterval: 12,
      summaryConfigurable: true,
      summaryToggleable: true,
      availableSummaryFormats: ['bullet', 'paragraph', 'sentences', 'custom'],
      minSummaryInterval: 5,
      maxSummaryInterval: 50,
      
      // 역할 & 키워드 무제한
      roleReminderMaxInterval: 50,
      roleReminderPaidOnlyAfter: 50,
      maxKeywordsPerRole: 20,
      canUseCustomKeywords: true,
      
      // API 사용량 무제한
      maxApiCallsPerDay: 2000,
      maxTokensPerRequest: 8192,
      canUseAdvancedModels: true,
      
      // 모든 UI 기능
      showAdvancedSettings: true,
      showExpertFeatures: true,
      showTimelineControls: true,
      requiresPlus: true
    }
  };

  const limitations = SECURE_MODE_LIMITATIONS[userMode] || SECURE_MODE_LIMITATIONS.standard;

  return {
    limitations,
    features: {
      timelineReminder: limitations.timelineReminderConfigurable,
      summaryControl: limitations.summaryConfigurable,
      summaryToggle: limitations.summaryToggleable,
      formatSelection: limitations.availableSummaryFormats.length > 1,
      advancedSettings: limitations.showAdvancedSettings,
      expertFeatures: limitations.showExpertFeatures,
      customKeywords: limitations.canUseCustomKeywords,
      advancedModels: limitations.canUseAdvancedModels
    }
  };
}

// 모드별 제한사항 확인 (보안 강화 버전)
app.get("/make-server-e3d1d00c/mode/limitations/:userMode", (c) => {
  const userMode = c.req.param("userMode") as 'standard' | 'advanced' | 'expert';
  
  console.log("🔐 모드별 제한사항 서버 확인:", { userMode });
  
  const result = getModeLimitationsInternal(userMode);
  
  console.log("✅ 모드별 제한사항 서버 응답:", { userMode, hasLimitations: true });

  return c.json({
    success: true,
    userMode,
    limitations: result.limitations,
    timestamp: new Date().toISOString(),
    features: result.features
  });
});

// 실시간 제한사항 검증 (API 호출시 검증)
app.post("/make-server-e3d1d00c/mode/validate-action", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, userMode, action, currentUsage } = body;

    if (!userId || !userMode || !action) {
      return c.json({ error: "필수 파라미터가 누락되었습니다" }, 400);
    }

    console.log("🔍 실시간 제한사항 검증:", { userId, userMode, action, currentUsage });

    // 모드별 제한사항을 직접 가져오기 (내부 함수 호출)
    const limitationsResult = getModeLimitationsInternal(userMode);
    const limits = limitationsResult.limitations;

    // currentUsage 안전성 확인
    const safeCurrentUsage = currentUsage || {
      projects: 0,
      conversations: 0,
      customRoles: 0,
      apiCallsToday: 0,
      exportedChats: 0
    };

    console.log("📊 사용량 데이터 확인:", { 
      originalUsage: currentUsage, 
      safeUsage: safeCurrentUsage,
      limits: {
        maxProjects: limits.maxProjects,
        maxConversations: limits.maxConversations,
        maxCustomRoles: limits.maxCustomRoles,
        maxApiCallsPerDay: limits.maxApiCallsPerDay
      }
    });

    let isAllowed = true;
    let reason = '';
    let upgradeRequired = false;

    // 액션별 제한 검증
    switch (action) {
      case 'create_project':
        if (safeCurrentUsage.projects >= limits.maxProjects) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 최대 ${limits.maxProjects}개의 프로젝트만 생성할 수 있습니다.`;
          upgradeRequired = userMode !== 'expert';
        }
        break;
        
      case 'create_conversation':
        if (safeCurrentUsage.conversations >= limits.maxConversations) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 최대 ${limits.maxConversations}개의 대화만 생성할 수 있습니다.`;
          upgradeRequired = userMode !== 'expert';
        }
        break;
        
      case 'create_custom_role':
        if (!limits.canCreateCustomRoles) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 커스텀 역할 생성이 제한됩니다.`;
          upgradeRequired = true;
        } else if (safeCurrentUsage.customRoles >= limits.maxCustomRoles) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 최대 ${limits.maxCustomRoles}개의 커스텀 역할만 생성할 수 있습니다.`;
          upgradeRequired = userMode !== 'expert';
        }
        break;
        
      case 'import_chats':
        if (!limits.canImportChats) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 채팅 가져오기가 제한됩니다.`;
          upgradeRequired = true;
        }
        break;
        
      case 'duplicate_chats':
        if (!limits.canDuplicateChats) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 채팅 복제가 제한됩니다.`;
          upgradeRequired = true;
        }
        break;
        
      case 'advanced_timeline_settings':
        if (!limits.canAccessAdvancedFeatures) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 고급 타임라인 설정이 제한됩니다.`;
          upgradeRequired = true;
        }
        break;
        
      case 'api_call':
        if (safeCurrentUsage.apiCallsToday >= limits.maxApiCallsPerDay) {
          isAllowed = false;
          reason = `${userMode} 모드에서는 하루 최대 ${limits.maxApiCallsPerDay}회의 API 호출만 가능합니다.`;
          upgradeRequired = userMode !== 'expert';
        }
        break;
        
      default:
        console.warn("알 수 없는 액션:", action);
    }

    console.log("✅ 제한사항 검증 완료:", { 
      action, 
      isAllowed, 
      reason: reason || '허용됨',
      upgradeRequired 
    });

    return c.json({
      success: true,
      allowed: isAllowed,
      reason: reason || '액션이 허용됩니다.',
      upgradeRequired,
      currentLimits: {
        maxProjects: limits.maxProjects,
        maxConversations: limits.maxConversations,
        maxCustomRoles: limits.maxCustomRoles,
        maxApiCallsPerDay: limits.maxApiCallsPerDay
      },
      currentUsage: safeCurrentUsage
    });

  } catch (error) {
    console.error("❌ 제한사항 검증 중 구체적 오류:", error);
    console.error("📊 에러 발생 시점 데이터:", { 
      userId, 
      userMode, 
      action, 
      currentUsage,
      errorType: error?.constructor?.name,
      errorStack: error instanceof Error ? error.stack : undefined
    });
    
    return c.json({
      success: false,
      error: "제한사항 검증 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류",
      errorType: error?.constructor?.name,
      context: {
        userId: userId || 'unknown',
        userMode: userMode || 'unknown', 
        action: action || 'unknown',
        hasCurrentUsage: !!currentUsage
      }
    }, 500);
  }
});

// 사용량 추적 (서버에서 관리)
app.post("/make-server-e3d1d00c/mode/track-usage", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, userMode, action, metadata } = body;

    if (!userId || !action) {
      return c.json({ error: "필수 파라미터가 누락되었습니다" }, 400);
    }

    console.log("📊 사용량 추적:", { userId, userMode, action });

    // 사용량 데이터 저장
    const usageKey = `usage_${userId}_${new Date().toISOString().split('T')[0]}`;
    let usageData = await kv.get(usageKey) || {
      userId,
      date: new Date().toISOString().split('T')[0],
      projects: 0,
      conversations: 0,
      customRoles: 0,
      apiCalls: 0,
      exportedChats: 0,
      actions: []
    };

    // 액션별 카운트 증가
    switch (action) {
      case 'create_project':
        usageData.projects++;
        break;
      case 'create_conversation':
        usageData.conversations++;
        break;
      case 'create_custom_role':
        usageData.customRoles++;
        break;
      case 'api_call':
        usageData.apiCalls++;
        break;
      case 'export_chat':
        usageData.exportedChats++;
        break;
    }

    usageData.actions.push({
      action,
      timestamp: new Date().toISOString(),
      metadata: metadata || {}
    });

    await kv.set(usageKey, usageData);

    console.log("✅ 사용량 추적 완료:", { action, newCount: usageData[action] || 'N/A' });

    return c.json({
      success: true,
      message: "사용량이 추적되었습니다",
      currentUsage: {
        projects: usageData.projects,
        conversations: usageData.conversations,
        customRoles: usageData.customRoles,
        apiCallsToday: usageData.apiCalls,
        exportedChats: usageData.exportedChats
      }
    });

  } catch (error) {
    console.error("사용량 추적 중 오류:", error);
    return c.json({
      error: "사용량 추적 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 현재 사용량 조회
app.get("/make-server-e3d1d00c/mode/usage/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    console.log("📊 사용량 조회:", { userId });

    const usageKey = `usage_${userId}_${new Date().toISOString().split('T')[0]}`;
    const usageData = await kv.get(usageKey) || {
      projects: 0,
      conversations: 0,
      customRoles: 0,
      apiCalls: 0,
      exportedChats: 0
    };

    console.log("✅ 사용량 조회 완료");

    return c.json({
      success: true,
      currentUsage: {
        projects: usageData.projects || 0,
        conversations: usageData.conversations || 0,
        customRoles: usageData.customRoles || 0,
        apiCallsToday: usageData.apiCalls || 0,
        exportedChats: usageData.exportedChats || 0
      },
      date: new Date().toISOString().split('T')[0]
    });

  } catch (error) {
    console.error("사용량 조회 중 오류:", error);
    return c.json({
      error: "사용량 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 타임라인 고급 설정 저장 (모드별 제한 적용)
app.post("/make-server-e3d1d00c/timeline/advanced-settings/save", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, userMode, settings } = body;

    if (!userId || !userMode || !settings) {
      return c.json({ error: "필수 파라미터가 누락되었습니다" }, 400);
    }

    console.log("⚙️ 타임라인 고급 설정 저장:", { userId, conversationId, userMode });

    // 모드별 제한사항 적용
    const modeLimitations = {
      standard: {
        summaryConfigurable: false,
        summaryToggleable: false,
        summaryInterval: 12,
        availableSummaryFormats: ['bullet'],
        minSummaryInterval: 12,
        maxSummaryInterval: 12,
        timelineReminderConfigurable: false,
        timelineReminderMaxInterval: 10
      },
      advanced: {
        summaryConfigurable: true,
        summaryToggleable: true,
        summaryInterval: 12,
        availableSummaryFormats: ['bullet', 'paragraph'],
        minSummaryInterval: 8,
        maxSummaryInterval: 25,
        timelineReminderConfigurable: true,
        timelineReminderMaxInterval: 30
      },
      expert: {
        summaryConfigurable: true,
        summaryToggleable: true,
        summaryInterval: 12,
        availableSummaryFormats: ['bullet', 'paragraph', 'sentences', 'custom'],
        minSummaryInterval: 5,
        maxSummaryInterval: 50,
        timelineReminderConfigurable: true,
        timelineReminderMaxInterval: 50
      }
    };

    const limits = modeLimitations[userMode as keyof typeof modeLimitations] || modeLimitations.standard;

    // 설정 값 검증 및 제한 적용
    const validatedSettings = {
      summaryEnabled: limits.summaryToggleable ? (settings.summaryEnabled !== false) : true,
      summaryInterval: limits.summaryConfigurable 
        ? Math.max(limits.minSummaryInterval, Math.min(limits.maxSummaryInterval, settings.summaryInterval || 12))
        : limits.summaryInterval,
      summaryFormat: limits.availableSummaryFormats.includes(settings.summaryFormat) 
        ? settings.summaryFormat 
        : limits.availableSummaryFormats[0],
      reminderEnabled: limits.timelineReminderConfigurable ? (settings.reminderEnabled !== false) : true,
      reminderInterval: limits.timelineReminderConfigurable
        ? Math.max(5, Math.min(limits.timelineReminderMaxInterval, settings.reminderInterval || 10))
        : limits.timelineReminderMaxInterval,
      autoConsolidate: settings.autoConsolidate !== false,
      consolidationInterval: Math.max(30, Math.min(100, settings.consolidationInterval || 40))
    };

    const settingsKey = `timeline_advanced_${userId}_${conversationId || 'global'}`;
    const advancedSettings = {
      userId,
      conversationId: conversationId || '',
      userMode,
      settings: validatedSettings,
      limitations: limits,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await kv.set(settingsKey, advancedSettings);

    console.log("✅ 타임라인 고급 설정 저장 완료:", validatedSettings);

    return c.json({
      success: true,
      settings: validatedSettings,
      limitations: limits,
      message: "타임라인 고급 설정이 저장되었습니다"
    });

  } catch (error) {
    console.error("타임라인 고급 설정 저장 중 오류:", error);
    return c.json({
      error: "타임라인 고급 설정 저장 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 타임라인 고급 설정 조회
app.get("/make-server-e3d1d00c/timeline/advanced-settings/:userId/:conversationId/:userMode", async (c) => {
  try {
    const userId = c.req.param("userId");
    const conversationId = c.req.param("conversationId");
    const userMode = c.req.param("userMode") as 'standard' | 'advanced' | 'expert';

    if (!userId || !userMode) {
      return c.json({ error: "사용자 ID와 모드가 필요합니다" }, 400);
    }

    console.log("🔍 타임라인 고급 설정 조회:", { userId, conversationId, userMode });

    const settingsKey = `timeline_advanced_${userId}_${conversationId}`;
    let advancedSettings = await kv.get(settingsKey);

    if (!advancedSettings) {
      // 글로벌 설정 확인
      const globalKey = `timeline_advanced_${userId}_global`;
      advancedSettings = await kv.get(globalKey);
    }

    // 모드별 제한사항 조회
    const limitationsResponse = await fetch(`${c.req.url.split('/timeline/advanced-settings')[0]}/timeline/mode-limitations/${userMode}`);
    const limitationsData = await limitationsResponse.json();

    console.log("✅ 타임라인 고급 설정 조회 완료");

    return c.json({
      success: true,
      settings: advancedSettings ? advancedSettings.settings : null,
      limitations: limitationsData.limitations,
      features: limitationsData.features,
      hasSettings: !!advancedSettings
    });

  } catch (error) {
    console.error("타임라인 고급 설정 조회 중 오류:", error);
    return c.json({
      error: "타임라인 고급 설정 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 모드별 지능형 요약 생성 (고급 설정 적용)
app.post("/make-server-e3d1d00c/timeline/intelligent-summary", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, conversationId, messages, userMode, forceSettings } = body;

    if (!userId || !conversationId || !messages || !userMode) {
      return c.json({ error: "필수 파라미터가 누락되었습니다" }, 400);
    }

    console.log("🧠 지능형 요약 생성:", { 
      userId, 
      conversationId, 
      messagesCount: messages.length,
      userMode
    });

    // 사용자 고급 설정 조회
    const settingsKey = `timeline_advanced_${userId}_${conversationId}`;
    let userSettings = await kv.get(settingsKey);
    
    if (!userSettings) {
      const globalKey = `timeline_advanced_${userId}_global`;
      userSettings = await kv.get(globalKey);
    }

    // 모드별 기본 설정 적용 
    const modeLimitations = {
      standard: { summaryInterval: 12, availableSummaryFormats: ['bullet'] },
      advanced: { summaryInterval: 12, availableSummaryFormats: ['bullet', 'paragraph'] },
      expert: { summaryInterval: 12, availableSummaryFormats: ['bullet', 'paragraph', 'sentences', 'custom'] }
    };
    
    const limits = modeLimitations[userMode as keyof typeof modeLimitations] || modeLimitations.standard;

    const effectiveSettings = forceSettings || (userSettings ? userSettings.settings : {
      summaryEnabled: true,
      summaryInterval: limits.summaryInterval,
      summaryFormat: limits.availableSummaryFormats[0],
      reminderEnabled: userMode !== 'standard',
      reminderInterval: userMode === 'standard' ? 10 : userMode === 'advanced' ? 15 : 20
    });

    // 요약이 비활성화된 경우
    if (!effectiveSettings.summaryEnabled && !forceSettings) {
      return c.json({
        success: true,
        summary: null,
        message: "요약 기능이 비활성화되어 있습니다",
        settings: effectiveSettings
      });
    }

    // 지능형 요약 생성
    const topics = extractTopicsFromMessages(messages);
    const userMessages = messages.filter((m: any) => m.sender === 'user');
    const aiMessages = messages.filter((m: any) => m.sender === 'ai');

    let summary = '';
    switch (effectiveSettings.summaryFormat) {
      case 'bullet':
        summary = generateBulletSummary(topics, userMessages.length, aiMessages.length);
        break;
      case 'paragraph':
        summary = generateParagraphSummary(topics, userMessages.length, aiMessages.length);
        break;
      case 'sentences':
        summary = generateSentenceSummary(topics);
        break;
      case 'custom':
        summary = generateCustomSummary(topics, userMessages.length, aiMessages.length, effectiveSettings);
        break;
      default:
        summary = generateAutoSummary(topics, userMessages.length, aiMessages.length);
    }

    // 타임라인에 저장
    const timelineKey = `timeline_${userId}_${conversationId}`;
    let timeline = await kv.get(timelineKey) as any || {
      id: `timeline_${Date.now()}`,
      conversationId,
      userId,
      summaries: [],
      reminders: [],
      settings: effectiveSettings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newSummary = {
      id: `summary_${Date.now()}`,
      startIndex: Math.max(0, messages.length - effectiveSettings.summaryInterval),
      endIndex: messages.length - 1,
      summary,
      format: effectiveSettings.summaryFormat,
      createdAt: new Date().toISOString(),
      isConsolidated: false,
      userMode,
      isIntelligent: true
    };

    timeline.summaries.push(newSummary);
    timeline.settings = effectiveSettings;
    timeline.updatedAt = new Date().toISOString();

    await kv.set(timelineKey, timeline);

    console.log("✅ 지능형 요약 생성 완료");

    return c.json({
      success: true,
      summary: newSummary,
      settings: effectiveSettings,
      limitations: limits,
      timeline: {
        totalSummaries: timeline.summaries.length,
        lastSummaryIndex: newSummary.endIndex
      }
    });

  } catch (error) {
    console.error("지능형 요약 생성 중 오류:", error);
    return c.json({
      error: "지능형 요약 생성 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

// 커스텀 요약 생성 함수
function generateCustomSummary(topics: string[], userCount: number, aiCount: number, settings: any): string {
  let summary = '';
  
  // Expert 모드용 커스텀 요약
  summary += `🔍 심층 분석 요약\n\n`;
  summary += `📊 대화 통계:\n`;
  summary += `  - 총 ${userCount + aiCount}턴 대화\n`;
  summary += `  - 사용자 발화: ${userCount}회\n`;
  summary += `  - AI 응답: ${aiCount}회\n`;
  summary += `  - 참여율: ${((userCount / (userCount + aiCount)) * 100).toFixed(1)}%\n\n`;
  
  if (topics.length > 0) {
    summary += `🏷️ 주요 토픽:\n`;
    topics.forEach((topic, index) => {
      summary += `  ${index + 1}. ${topic}\n`;
    });
    summary += '\n';
  }
  
  summary += `⏰ 생성 시간: ${new Date().toLocaleString('ko-KR')}\n`;
  summary += `🎯 요약 형태: ${settings.summaryFormat} (커스텀)`;
  
  return summary;
}

function generateSentenceSummary(topics: string[]): string {
  if (topics.length === 0) {
    return '사용자와 AI 간의 일반적인 대화가 진행되었습니다.';
  }
  
  return `${topics.join(', ')}에 대한 대화가 이루어졌습니다.`;
}

// ======================================
// 💳 Stripe 결제 시스템 라우팅
// ======================================

// Stripe 체크아웃 라우팅
app.route("/make-server-e3d1d00c/stripe", stripeCheckoutApp);

// Stripe 웹훅 라우팅
app.route("/make-server-e3d1d00c/stripe", stripeWebhookApp);

// 구독 상태 조회
app.get("/make-server-e3d1d00c/subscription/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    
    if (!userId) {
      return c.json({ error: "사용자 ID가 필요합니다" }, 400);
    }

    console.log("💳 구독 상태 조회:", userId);

    const subscriptionData = await kv.get(`subscription:${userId}`);
    
    if (!subscriptionData) {
      return c.json({
        success: true,
        hasSubscription: false,
        status: 'none',
        message: '구독 정보가 없습니다'
      });
    }

    // 구독 만료 확인
    const now = new Date();
    const endDate = new Date(subscriptionData.current_period_end);
    const isExpired = now > endDate;
    
    const response = {
      success: true,
      hasSubscription: true,
      subscription: {
        status: isExpired ? 'expired' : subscriptionData.status,
        customerId: subscriptionData.customer_id,
        priceId: subscriptionData.price_id,
        currentPeriodStart: subscriptionData.current_period_start,
        currentPeriodEnd: subscriptionData.current_period_end,
        isExpired,
        daysRemaining: isExpired ? 0 : Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      }
    };

    console.log("✅ 구독 상태 조회 완료:", response.subscription.status);

    return c.json(response);

  } catch (error) {
    console.error("구독 상태 조회 중 오류:", error);
    return c.json({
      error: "구독 상태 조회 중 오류가 발생했습니다",
      details: error instanceof Error ? error.message : "알 수 없는 오류"
    }, 500);
  }
});

Deno.serve(app.fetch);