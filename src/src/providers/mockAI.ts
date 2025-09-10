/**
 * Mock AI Provider - Figma Make 환경용 시뮬레이터
 * 
 * 실제 AI API 호출 없이 다양한 역할의 응답을 시뮬레이션합니다.
 * 스트리밍 효과와 함께 자연스러운 응답을 제공합니다.
 */

import { Role } from '../types';

/**
 * Role별 샘플 응답 템플릿
 */
const ROLE_RESPONSE_TEMPLATES: Record<string, string[]> = {
  buddy: [
    "안녕하세요! 😊 저는 당신의 친근한 AI 어시스턴트입니다.\n\n**질문해주신 내용에 대해 답변드리겠습니다:**\n\n{response}\n\n더 궁금한 점이 있으시면 언제든지 물어보세요! 함께 문제를 해결해보아요. ✨",
    "좋은 질문이네요! 🤔 이런 주제에 대해 이야기하는 것을 좋아해요.\n\n{response}\n\n이런 관점에서 생각해보시는 건 어떨까요? 더 깊이 있는 대화를 나눠보고 싶어요!",
    "와, 정말 흥미로운 주제네요! 🌟\n\n**제가 생각하기로는:**\n\n{response}\n\n당신의 의견도 궁금해요. 어떻게 생각하세요? 함께 더 탐구해보면 좋겠어요! 💭"
  ],
  philosopher: [
    "🤔 **철학적 관점에서 바라본 당신의 질문...**\n\n{response}\n\n*\"진정한 지혜는 자신이 무지하다는 것을 아는 데 있다.\"* - 소크라테스\n\n이러한 철학적 사유가 당신의 사고에 새로운 지평을 열어주기를 바랍니다.",
    "**존재론적 차원에서 접근해보겠습니다.**\n\n{response}\n\n우리가 던지는 질문들은 때로는 답보다도 중요합니다. 질문 자체가 우리의 존재 방식을 드러내기 때문이죠.\n\n*어떤 생각이 드시나요?* 🌌",
    "**형이상학적 관점에서...**\n\n{response}\n\n*\"사유한다, 고로 존재한다\"* - 데카르트\n\n당신의 질문을 통해 우리는 존재의 근본적 의미를 탐구할 수 있습니다. 이것이야말로 철학의 진정한 가치가 아닐까요? 🏛️"
  ],
  teacher: [
    "📚 **교육적 관점에서 설명드리겠습니다**\n\n{response}\n\n**핵심 포인트:**\n• 이해를 위한 단계별 접근\n• 실제 적용 방법\n• 추가 학습 자료\n\n학습은 평생에 걸친 여정입니다. 궁금한 점이 있으면 언제든 질문하세요! 📖✨",
    "**체계적으로 설명해드리겠습니다:**\n\n{response}\n\n**복습 문제:** 오늘 배운 내용을 한 문장으로 요약해보세요.\n\n지식은 나누면 나눌수록 커집니다. 다른 사람에게도 설명해보시면 더욱 깊이 이해할 수 있어요! 👨‍🏫",
    "**학습 목표 달성을 위해...**\n\n{response}\n\n**다음 단계 학습 추천:**\n1. 기초 개념 복습\n2. 실습을 통한 적용\n3. 심화 내용 탐구\n\n배움의 즐거움을 함께 나누어요! 🎓"
  ],
  developer: [
    "💻 **개발자 관점에서 분석해보겠습니다**\n\n{response}\n\n```typescript\n// 참고 코드 예시\nconst solution = {\n  approach: 'best-practice',\n  performance: 'optimized',\n  maintainability: 'high'\n};\n```\n\n**추천 리소스:**\n• 공식 문서 검토\n• 코드 리뷰 요청\n• 단위 테스트 작성\n\n코딩 패스 계속 이어가세요! 🚀",
    "**기술적 솔루션 제안:**\n\n{response}\n\n**아키텍처 고려사항:**\n- 확장성 (Scalability)\n- 유지보수성 (Maintainability)  \n- 성능 최적화 (Performance)\n\n```bash\n# 실행 명령어\nnpm install solution\nnpm run develop\n```\n\n더 나은 코드를 위해 함께 노력해요! 👨‍💻",
    "**개발 베스트 프랙티스 적용:**\n\n{response}\n\n**코드 품질 체크리스트:**\n✅ 클린 코드 원칙\n✅ SOLID 원칙 준수\n✅ 테스트 커버리지\n✅ 문서화\n\n*\"좋은 코드는 시를 읽는 것과 같다\"* - Robert C. Martin\n\nHappy Coding! 🎯"
  ],
  default: [
    "**질문에 대한 답변:**\n\n{response}\n\n더 자세한 정보가 필요하시거나 다른 질문이 있으시면 언제든지 말씀해 주세요. 도움이 되었기를 바랍니다! 😊",
    "좋은 질문이네요! 이에 대해 설명드리겠습니다.\n\n{response}\n\n이런 정보가 도움이 되셨나요? 추가로 궁금한 점이 있으시면 언제든지 물어보세요!",
    "**답변 드리겠습니다:**\n\n{response}\n\n이 주제에 대해 더 깊이 있는 정보를 원하시거나, 다른 관점에서의 설명이 필요하시면 말씀해 주세요. 🌟"
  ]
};

/**
 * 주제별 지능형 응답 생성
 */
const INTELLIGENT_RESPONSES: Record<string, string> = {
  // 철학/인생 관련
  '철학|인생|존재|의미|가치|목적': 
    `인생은 끊임없는 질문과 탐구의 연속입니다. 우리가 살아가는 이유는 단순히 생존을 위해서가 아니라, 의미를 창조하고 가치를 실현하기 위해서입니다.

    **철학적 관점에서의 인생:**
    • **실존주의적 관점**: 우리는 존재가 본질에 앞선다는 사르트르의 말처럼, 스스로의 삶을 정의해 나갑니다.
    • **스토아적 관점**: 우리가 통제할 수 있는 것에 집중하고, 그렇지 않은 것은 받아들이며 살아가야 합니다.
    • **불교적 관점**: 모든 고통은 집착에서 비롯되며, 깨달음을 통해 진정한 평화를 찾을 수 있습니다.

    삶의 의미는 외부에서 주어지는 것이 아니라, 우리 각자가 만들어가는 것입니다.`,

  // 기술/개발 관련  
  '프로그래밍|개발|코딩|기술|AI|인공지능|컴퓨터':
    `기술의 발전은 인류의 문제 해결 능력을 확장시키는 강력한 도구입니다. 특히 AI와 프로그래밍은 현대 사회의 핵심 기술로 자리잡고 있습니다.

    **현대 기술의 특징:**
    • **AI의 민주화**: ChatGPT, Gemini 같은 도구로 누구나 AI를 활용할 수 있게 되었습니다.
    • **노코드/로우코드**: 프로그래밍 지식 없이도 애플리케이션을 만들 수 있는 시대가 왔습니다.
    • **오픈소스**: 집단 지성을 통해 더 나은 솔루션을 만들어가고 있습니다.

    **미래 전망:**
    AI는 인간을 대체하는 것이 아니라, 인간의 창의성과 협업하여 더 나은 미래를 만들어갈 것입니다.`,

  // 교육/학습 관련
  '교육|학습|공부|지식|성장|발전':
    `학습은 인간만이 가진 가장 강력한 능력 중 하나입니다. 지식을 습득하고 성장해나가는 과정은 단순히 정보를 축적하는 것을 넘어서, 우리의 사고 체계를 발전시키는 것입니다.

    **효과적인 학습 전략:**
    • **능동적 학습**: 단순 암기보다는 이해와 적용에 중점을 둡니다.
    • **메타인지**: 자신의 학습 과정을 의식적으로 모니터링하고 조절합니다.
    • **실천과 반복**: 배운 것을 실제로 적용해보고 반복 연습합니다.

    **평생 학습의 중요성:**
    급변하는 세상에서 지속적인 학습은 선택이 아닌 필수입니다. 새로운 지식과 기술을 습득하며 끊임없이 성장해나가는 것이 중요합니다.`,

  // 기본 응답
  'default': 
    `질문해주신 내용에 대해 생각해보겠습니다.

    이는 흥미로운 주제네요. 다양한 관점에서 접근해볼 수 있을 것 같습니다.

    **고려해볼 점들:**
    • 다각도 분석을 통한 이해
    • 실제적인 적용 방안 모색  
    • 장기적인 관점에서의 의미

    더 구체적인 정보나 특정 관점에서의 설명이 필요하시면 언제든 말씀해 주세요.`
};

/**
 * 질문 내용을 분석하여 적절한 응답을 생성합니다
 */
function generateIntelligentResponse(userMessage: string, roleId: string): string {
  // 키워드 기반 매칭
  for (const [keywords, response] of Object.entries(INTELLIGENT_RESPONSES)) {
    if (keywords === 'default') continue;
    
    const keywordList = keywords.split('|');
    if (keywordList.some(keyword => 
      userMessage.toLowerCase().includes(keyword) || 
      userMessage.includes(keyword)
    )) {
      return response;
    }
  }

  // 기본 응답
  return INTELLIGENT_RESPONSES.default;
}

/**
 * 스트리밍 효과를 시뮬레이션하는 async generator
 */
export async function* simulateAIStreaming(
  role: Role,
  userMessage: string,
  delay: number = 50
): AsyncGenerator<string, void, unknown> {
  console.log('🎭 Mock AI 응답 시뮬레이션 시작:', {
    roleId: role.id,
    roleName: role.name,
    messageLength: userMessage.length,
    delay
  });

  // 🔧 Mock 환경에서도 도구 자동 사용 시뮬레이션
  let toolsOutput = '';
  try {
    // 도구 감지 및 Mock 결과 생성
    const toolResults = await generateMockToolResults(userMessage);
    if (toolResults.length > 0) {
      console.log('🔧 Mock 도구 결과 생성:', toolResults.map(r => ({ type: r.type, success: r.success })));
      
      // 도구 결과를 텍스트로 포맷팅
      toolsOutput = toolResults.map(result => formatMockToolResult(result)).join('\n');
    }
  } catch (error) {
    console.warn('🔧 Mock 도구 시뮬레이션 오류:', error);
  }

  // Role에 맞는 템플릿 선택
  const templates = ROLE_RESPONSE_TEMPLATES[role.id] || ROLE_RESPONSE_TEMPLATES.default;
  const template = templates[Math.floor(Math.random() * templates.length)];

  // 지능형 응답 생성
  const intelligentResponse = generateIntelligentResponse(userMessage, role.id);
  
  // 템플릿에 응답 내용 삽입
  let fullResponse = template.replace('{response}', intelligentResponse);
  
  // 도구 결과가 있으면 앞에 추가
  if (toolsOutput) {
    fullResponse = toolsOutput + '\n\n---\n\n' + fullResponse;
  }

  // 문자별로 스트리밍 시뮬레이션
  const words = fullResponse.split(' ');
  let accumulatedResponse = '';

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const isLastWord = i === words.length - 1;
    
    // 단어 추가 (마지막이 아니면 공백도 추가)
    accumulatedResponse += word + (isLastWord ? '' : ' ');
    
    // 현재까지의 텍스트를 yield
    yield accumulatedResponse;

    // 지연 시간 (문장 부호나 줄바꿈에서 더 긴 지연)
    let currentDelay = delay;
    if (word.includes('\n')) {
      currentDelay = delay * 4; // 줄바꿈에서 더 긴 지연
    } else if (word.includes('.') || word.includes('!') || word.includes('?')) {
      currentDelay = delay * 3; // 문장 끝에서 더 긴 지연
    } else if (word.includes(',') || word.includes(':') || word.includes(';')) {
      currentDelay = delay * 2; // 쉼표나 콜론에서 약간 더 긴 지연
    }

    // 지연
    await new Promise(resolve => setTimeout(resolve, currentDelay));
  }

  console.log('✅ Mock AI 응답 시뮬레이션 완료:', {
    finalLength: accumulatedResponse.length,
    wordsCount: words.length
  });
}

/**
 * 빠른 Mock 응답 생성 (스트리밍 없이)
 */
export function generateQuickMockResponse(role: Role, userMessage: string): string {
  const templates = ROLE_RESPONSE_TEMPLATES[role.id] || ROLE_RESPONSE_TEMPLATES.default;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const intelligentResponse = generateIntelligentResponse(userMessage, role.id);
  
  return template.replace('{response}', intelligentResponse);
}

/**
 * 환경에 따른 적절한 AI Provider 선택
 */
export function getAIProvider(forceMock: boolean = false) {
  const { shouldUseDemoMode } = ENV;
  
  if (forceMock || shouldUseDemoMode) {
    console.log('🎭 Mock AI Provider 사용');
    return {
      streamMessage: simulateAIStreaming,
      generateResponse: generateQuickMockResponse,
      isDemo: true
    };
  }

  console.log('🤖 Real AI Provider 사용');
  // 실제 AI Provider import (동적)
  return {
    streamMessage: null, // 실제 provider에서 가져올 것
    generateResponse: null,
    isDemo: false
  };
}

// 환경 감지
import { ENV } from '../utils/environmentDetector';

/**
 * Mock 도구 결과 생성
 */
async function generateMockToolResults(userMessage: string): Promise<any[]> {
  const results: any[] = [];
  const lowerMessage = userMessage.toLowerCase();
  
  // 차트 생성 시뮬레이션
  if (lowerMessage.includes('차트') || lowerMessage.includes('그래프') || lowerMessage.includes('트렌드') || 
      lowerMessage.includes('chart') || lowerMessage.includes('graph') || lowerMessage.includes('visualization')) {
    results.push({
      type: 'chart',
      success: true,
      data: {
        chartUrl: 'https://quickchart.io/chart?c={type:"line",data:{labels:["1월","2월","3월","4월","5월"],datasets:[{label:"검색량",data:[65,59,80,81,56],borderColor:"rgb(75, 192, 192)",tension:0.1}]}}',
        keywords: ['검색어1', '검색어2'],
        summary: { period: '최근 5개월', dataPoints: 5 }
      }
    });
  }
  
  // 검색 시뮬레이션
  if (lowerMessage.includes('검색') || lowerMessage.includes('찾아') || lowerMessage.includes('정보') ||
      lowerMessage.includes('search') || lowerMessage.includes('find') || lowerMessage.includes('information')) {
    results.push({
      type: 'search',
      success: true,
      data: {
        source: 'Wikipedia',
        query: '검색어',
        results: [
          {
            title: 'Mock 검색 결과 1',
            summary: '이것은 데모 모드에서 제공하는 시뮬레이션된 검색 결과입니다. 실제 환경에서는 Wikipedia, 네이버 등의 실시간 검색 결과를 제공합니다.',
            url: 'https://example.com/mock-result-1'
          },
          {
            title: 'Mock 검색 결과 2', 
            summary: 'AI가 자동으로 감지한 검색 요청에 대한 두 번째 시뮬레이션 결과입니다. 실제로는 최신 정보를 실시간으로 가져옵니다.',
            url: 'https://example.com/mock-result-2'
          }
        ]
      }
    });
  }
  
  // 학술 논문 검색 시뮬레이션
  if (lowerMessage.includes('논문') || lowerMessage.includes('연구') || lowerMessage.includes('학술') ||
      lowerMessage.includes('paper') || lowerMessage.includes('research') || lowerMessage.includes('study')) {
    results.push({
      type: 'academic',
      success: true,
      data: {
        source: 'PubMed',
        query: '연구 주제',
        totalCount: 127,
        results: [
          {
            title: 'Mock Research Paper: AI in Healthcare Applications',
            authors: 'Smith, J., Johnson, M., Brown, K.',
            journal: 'Journal of Medical AI',
            year: '2024',
            url: 'https://pubmed.ncbi.nlm.nih.gov/mock-paper-1'
          },
          {
            title: 'Mock Study: Machine Learning Trends in 2024',
            authors: 'Davis, A., Wilson, R.',
            journal: 'AI Research Quarterly',
            year: '2024', 
            url: 'https://pubmed.ncbi.nlm.nih.gov/mock-paper-2'
          }
        ]
      }
    });
  }
  
  // 뉴스 검색 시뮬레이션
  if (lowerMessage.includes('뉴스') || lowerMessage.includes('최신') || lowerMessage.includes('사건') ||
      lowerMessage.includes('news') || lowerMessage.includes('latest') || lowerMessage.includes('breaking')) {
    results.push({
      type: 'news',
      success: true,
      data: {
        source: 'Naver News',
        query: '뉴스 키워드',
        totalCount: 52,
        results: [
          {
            title: 'Mock 뉴스: AI 기술의 최신 동향',
            description: '인공지능 기술이 다양한 산업 분야에서 혁신을 이끌고 있다는 시뮬레이션 뉴스입니다.',
            link: 'https://news.example.com/mock-news-1',
            pubDate: new Date().toISOString()
          },
          {
            title: 'Mock 뉴스: 2024년 기술 트렌드 전망',
            description: '올해 주목받을 기술 트렌드에 대한 전문가들의 분석을 담은 모의 기사입니다.',
            link: 'https://news.example.com/mock-news-2', 
            pubDate: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      }
    });
  }
  
  return results;
}

/**
 * Mock 도구 결과 포맷팅
 */
function formatMockToolResult(result: any): string {
  if (!result.success) {
    return `\n\n❌ **${result.type} 도구 오류**: ${result.error}\n`;
  }

  switch (result.type) {
    case 'chart':
      return `\n\n📊 **검색 트렌드 차트** (Demo Mode)\n![트렌드 차트](${result.data.chartUrl})\n\n**분석 키워드**: ${result.data.keywords.join(', ')}\n**기간**: ${result.data.summary?.period || '최근 데이터'}\n\n*🎭 이것은 데모 모드 시뮬레이션입니다. 실제 환경에서는 네이버 데이터랩의 실시간 트렌드 데이터를 제공합니다.*\n\n`;
      
    case 'search':
      const searchResults = result.data.results.slice(0, 3);
      let searchText = `\n\n🔍 **${result.data.source} 검색 결과** (Demo Mode)\n검색어: ${result.data.query}\n\n`;
      
      searchResults.forEach((item: any, index: number) => {
        searchText += `${index + 1}. **${item.title}**\n   ${item.summary}\n   [더 보기](${item.url})\n\n`;
      });
      
      searchText += '*🎭 이것은 데모 모드 시뮬레이션입니다. 실제 환경에서는 Wikipedia, 네이버 등의 실시간 검색 결과를 제공합니다.*\n\n';
      return searchText;
      
    case 'academic':
      const papers = result.data.results.slice(0, 3);
      let academicText = `\n\n📚 **학술 논문 검색** (Demo Mode)\n검색어: ${result.data.query} | 총 ${result.data.totalCount}개 논문 발견\n\n`;
      
      papers.forEach((paper: any, index: number) => {
        academicText += `${index + 1}. **${paper.title}**\n   저자: ${paper.authors}\n   발행: ${paper.journal} (${paper.year})\n   [PubMed](${paper.url})\n\n`;
      });
      
      academicText += '*🎭 이것은 데모 모드 시뮬레이션입니다. 실제 환경에서는 PubMed의 실시간 학술 논문 검색 결과를 제공합니다.*\n\n';
      return academicText;
      
    case 'news':
      const news = result.data.results.slice(0, 3);
      let newsText = `\n\n📰 **뉴스 검색** (Demo Mode)\n검색어: ${result.data.query} | 총 ${result.data.totalCount}개 기사 발견\n\n`;
      
      news.forEach((item: any, index: number) => {
        const pubDate = new Date(item.pubDate).toLocaleDateString('ko-KR');
        newsText += `${index + 1}. **${item.title}**\n   ${item.description}\n   발행: ${pubDate}\n   [뉴스 보기](${item.link})\n\n`;
      });
      
      newsText += '*🎭 이것은 데모 모드 시뮬레이션입니다. 실제 환경에서는 네이버 뉴스 등의 실시간 뉴스 검색 결과를 제공합니다.*\n\n';
      return newsText;
      
    default:
      return `\n\n✅ **${result.type} 도구 실행 완료** (Demo Mode)\n`;
  }
}