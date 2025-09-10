import { GoogleGenAI, Content, SafetySetting, HarmCategory, HarmBlockThreshold, GenerateContentParameters } from "@google/genai";
import { Message, Role, ApiConfiguration, Part, Project } from '../types';
import { state } from '../state';
import { detectEnvironment } from '../utils/environmentDetector';
import { simulateAIStreaming } from './mockAI';

function buildSystemInstruction(role: Role, project: Project | null): string {
    let combinedPrompt = role.prompt;

     // Add project context if available
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

    const keywordInstructions = role.keywordIds
        .map(id => state.masterKeywords.find(kw => kw.id === id))
        .filter(kw => kw && kw.description)
        .map(kw => {
            let instruction = `- ${kw!.name}: ${kw!.description}`;
            // 세부 프롬프트가 있으면 추가
            if (kw!.detailPrompt) {
                instruction += `\n  세부 지침: ${kw!.detailPrompt}`;
            }
            return instruction;
        })
        .join('\n');

    if (keywordInstructions) {
        combinedPrompt += `\n\n[RESPONSE STYLE INSTRUCTIONS]\nYou must adhere to the following response style rules:\n${keywordInstructions}`;
    }
    return combinedPrompt;
}

export async function* streamGeminiMessage(
    apiConfig: ApiConfiguration,
    role: Role,
    history: Message[],
    newUserParts: Part[]
): AsyncGenerator<string> {
    
    if (!apiConfig.apiKey) {
        throw new Error("Gemini API key is not set for this Role.");
    }

    try {
        const ai = new GoogleGenAI({ apiKey: apiConfig.apiKey });
        const activeChat = state.conversations.find(c => c.id === state.activeChatId);
        const project = activeChat?.projectId ? state.projects.find(p => p.id === activeChat.projectId) : null;

        const systemInstruction = buildSystemInstruction(role, project);

        const geminiHistory: Content[] = history
            .slice(0, -1) // Exclude the very last user message, which is in newUserParts
            .map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }]
            }));
        
        const contents: Content[] = [
            ...geminiHistory,
            { role: 'user', parts: newUserParts }
        ];

        const safetySettings: SafetySetting[] = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: role.safetyLevel as HarmBlockThreshold },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: role.safetyLevel as HarmBlockThreshold },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: role.safetyLevel as HarmBlockThreshold },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: role.safetyLevel as HarmBlockThreshold },
        ];
        
        const request: GenerateContentParameters = {
            model: apiConfig.modelName || 'gemini-2.5-flash',
            contents: contents,
            config: {
                systemInstruction: systemInstruction,
                temperature: role.temperature,
                maxOutputTokens: role.maxOutputTokens,
                safetySettings: safetySettings,
            }
        };
        
        const result = await ai.models.generateContentStream(request);

        for await (const chunk of result) {
            if (chunk.text) {
                yield chunk.text;
            }
        }
    } catch (error) {
        console.error("Error streaming Gemini message:", error);
        const errorMsg = error instanceof Error ? error.message : "An unknown error occurred.";
        throw new Error(`Failed to get response from Gemini: ${errorMsg}`);
    }
}


// This function now calls our secure serverless function instead of the Gemini SDK directly.
export async function* streamTrialMessage(
    role: Role,
    history: Message[],
    newUserParts: Part[],
    signal?: AbortSignal
): AsyncGenerator<string> {
    
    // 🌍 환경 감지 - Figma Make 환경에서는 Mock AI 사용
    const env = detectEnvironment();
    console.log('🔍 AI Provider 환경 체크:', {
        isFigmaMake: env.isFigmaMake,
        shouldUseDemoMode: env.shouldUseDemoMode,
        supportsNetworking: env.supportsNetworking
    });

    if (env.shouldUseDemoMode) {
        console.log('🎭 Demo 모드 활성화 - Mock AI 응답 사용');
        const userMessage = newUserParts
            .filter(part => part.text)
            .map(part => part.text)
            .join(' ');
            
        // Mock AI 스트리밍으로 위임
        yield* simulateAIStreaming(role, userMessage, 80);
        return;
    }
    
    const activeChat = state.conversations.find(c => c.id === state.activeChatId);
    const project = activeChat?.projectId ? state.projects.find(p => p.id === activeChat.projectId) : null;
    
    // 🔧 사용자 메시지에서 필요한 도구들 감지 및 실행
    const userMessage = newUserParts
        .filter(part => part.text)
        .map(part => part.text)
        .join(' ');
    
    let toolResults: any[] = [];
    let toolsOutput = '';
    
    try {
        const { AIToolsService } = await import('../services/aiToolsService');
        console.log('🤖 AI 도구 감지 시작:', userMessage.substring(0, 100));
        
        // 도구 자동 감지 및 실행
        toolResults = await AIToolsService.executeDetectedTools(userMessage);
        
        if (toolResults.length > 0) {
            console.log('🔧 AI 도구 실행 결과:', toolResults.map(r => ({ type: r.type, success: r.success })));
            
            // 도구 결과를 텍스트로 포맷팅
            toolsOutput = toolResults
                .map(result => AIToolsService.formatToolResult(result))
                .join('\n');
        }
    } catch (toolError) {
        console.warn('🔧 AI 도구 실행 중 오류:', toolError);
    }
    
    try {
        const { projectId, publicAnonKey } = await import('../../utils/supabase/info');
        
        // 서버 연결 상태 먼저 확인
        console.log('🔍 서버 연결 테스트 시작:', `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c/health`);
        
        try {
            const healthResponse = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c/health`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${publicAnonKey}`,
                },
                signal: AbortSignal.timeout(10000) // 10초 타임아웃
            });
            
            console.log('🏥 헬스체크 응답 상태:', healthResponse.status);
            
            if (healthResponse.ok) {
                const healthData = await healthResponse.json();
                console.log('✅ 서버 연결 성공:', healthData);
            } else {
                console.error('❌ 서버 헬스체크 실패:', healthResponse.status, healthResponse.statusText);
                const errorText = await healthResponse.text();
                console.error('❌ 헬스체크 에러 내용:', errorText);
            }
        } catch (healthError) {
            console.error('❌ 서버 헬스체크 요청 실패:', healthError);
            throw new Error(`서버에 연결할 수 없습니다: ${healthError instanceof Error ? healthError.message : '알 수 없는 오류'}`);
        }
        
        console.log('🤖 AI 채팅 요청 시작...');
        
        const requestData = { 
            role, 
            history, 
            newUserParts,
            project,
            masterKeywords: state.masterKeywords
        };
        
        console.log('📤 요청 데이터:', {
            roleId: role.id,
            roleName: role.name,
            historyLength: history.length,
            newUserPartsLength: newUserParts.length,
            projectId: project?.id || null,
            masterKeywordsLength: state.masterKeywords.length,
            url: `https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c/ai/chat`
        });
        
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-e3d1d00c/ai/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify(requestData),
            signal: AbortSignal.timeout(60000) // 60초 타임아웃
        });

        console.log('📨 응답 상태:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
            url: response.url
        });

        if (!response.ok) {
            let errorMessage = `Server responded with status ${response.status}`;
            console.error('❌ HTTP 에러 발생:', {
                status: response.status,
                statusText: response.statusText,
                url: response.url
            });
            
            try {
                const errorData = await response.json();
                errorMessage = errorData.error || errorMessage;
                console.error('❌ 서버 에러 응답 JSON:', errorData);
            } catch (parseError) {
                console.warn('❌ JSON 파싱 실패:', parseError);
                try {
                    const errorText = await response.text();
                    console.error('❌ 서버 에러 텍스트:', errorText);
                    errorMessage += `: ${errorText}`;
                } catch (textError) {
                    console.error('❌ 에러 응답 읽기 실패:', textError);
                }
            }
            throw new Error(errorMessage);
        }

        const reader = response.body?.getReader();
        if (!reader) {
            throw new Error("Could not read response stream from server.");
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let firstChunkSent = false;
        let toolsInserted = false;

        // 도구 결과가 있으면 스트리밍 시작 전에 먼저 출력
        if (toolsOutput && !toolsInserted) {
            console.log('🔧 도구 결과 먼저 스트리밍:', toolsOutput.substring(0, 100));
            
            // 도구 결과를 조금씩 스트리밍
            const chunks = toolsOutput.split('');
            for (const chunk of chunks) {
                yield chunk;
                // 약간의 딜레이로 자연스러운 타이핑 효과
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            
            yield '\n\n---\n\n'; // 도구 결과와 AI 응답 구분선
            toolsInserted = true;
        }

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
                            const text = JSON.parse(data);
                            if (text) {
                                if (!firstChunkSent) {
                                    console.log("📝 AI 응답 스트림 시작:", text.substring(0, 50) + "...");
                                    firstChunkSent = true;
                                }
                                yield text;
                            }
                        } catch (e) {
                            console.error("Error parsing trial stream data:", e, "Data:", data);
                        }
                    }
                }
            }
        }
        
        console.log("🔚 AI 응답 스트림 완료", { toolsUsed: toolResults.length > 0 });

    } catch (error) {
        console.error("Error calling trial service:", error);
        const errorMsg = error instanceof Error ? error.message : "An unknown error occurred with the trial service.";
        throw new Error(errorMsg);
    }
}