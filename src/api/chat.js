import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";

// IMPORTANT: This function is a simplified duplicate of the one in the frontend.
// In a real-world monorepo, you would share this logic.
function buildSystemInstruction(role, project, masterKeywords) {
    let combinedPrompt = role.prompt;

    if (project) {
        let projectContext = '\n\n[PROJECT CONTEXT]\n';
        if (project.guidelines) projectContext += `Guidelines: ${project.guidelines}\n`;
        if (project.memory?.length > 0) {
            const memoryText = project.memory.map(m => `- ${m.content}`).join('\n');
            projectContext += `Memory:\n${memoryText}\n`;
        }
        if (project.files?.length > 0) {
             const fileText = project.files.map(f => `File: ${f.name}\nContent:\n${f.content.substring(0, 2000)}...\n`).join('\n---\n');
             projectContext += `Referenced Files:\n${fileText}\n`;
        }
        combinedPrompt += projectContext;
    }

    const keywordInstructions = role.keywordIds
        .map(id => masterKeywords.find(kw => kw.id === id))
        .filter(kw => kw && kw.description)
        .map(kw => `- ${kw.name}: ${kw.description}`)
        .join('\n');

    if (keywordInstructions) {
        combinedPrompt += `\n\n[ADDITIONAL INSTRUCTIONS]\nYou must adhere to the following rules in your responses:\n${keywordInstructions}`;
    }
    return combinedPrompt;
}


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set on the server.");
      return res.status(500).json({ error: "Trial service is currently unavailable. The server is not configured with an API key." });
    }

    const { role, history, newUserParts, project, masterKeywords } = req.body;
    
    if (!role || !history || !newUserParts || !masterKeywords) {
        return res.status(400).json({ error: "Invalid request body. Missing required fields." });
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemInstruction = buildSystemInstruction(role, project, masterKeywords);

    const geminiHistory = history
        .slice(0, -1)
        .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
        }));
    
    const contents = [
        ...geminiHistory,
        { role: 'user', parts: newUserParts }
    ];

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: role.safetyLevel },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: role.safetyLevel },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: role.safetyLevel },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: role.safetyLevel },
    ];
    
    const resultStream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemInstruction,
            temperature: role.temperature, // Use role's temperature setting
            maxOutputTokens: role.maxOutputTokens, // Use role's token limit
            safetySettings: safetySettings,
        }
    });
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    for await (const chunk of resultStream) {
      if (chunk.text) {
          res.write(`data: ${JSON.stringify(chunk.text)}\n\n`);
      }
    }
    
    res.end();

  } catch (error) {
    console.error('Error in /api/chat:', error);
    const errorMessage = error instanceof Error ? error.message : 'An internal server error occurred.';
    if (!res.headersSent) {
        res.status(500).json({ error: errorMessage });
    } else {
        res.write(`data: ${JSON.stringify(`[ERROR] ${errorMessage}`)}\n\n`);
        res.end();
    }
  }
}