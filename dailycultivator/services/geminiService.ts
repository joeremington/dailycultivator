
import { GoogleGenAI, Type } from "@google/genai";
import { Habit, JournalEntry, Task } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateHabitCoach = async (habits: Habit[]) => {
  const ai = getAI();
  const prompt = `
    User's current habit data: ${JSON.stringify(habits)}. 
    
    Acting as a high-performance productivity coach, provide a beautifully formatted insight.
    Structure your response using these sections:
    1. **The Win**: A specific observation about a streak or completion pattern.
    2. **The Science**: A brief (1 sentence) psychological or physiological reason why this habit is working (or how to fix it).
    3. **The Micro-Adjustment**: One tiny, actionable tip to improve consistency tomorrow.
    
    Keep the total length under 4 sentences. Use bullet points or bold text for emphasis. Be encouraging but direct.
  `;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text;
};

export const generateJournalPrompt = async (recentEntries: JournalEntry[]) => {
  const ai = getAI();
  const prompt = `Generate a thoughtful, open-ended journaling prompt for personal growth. Context: User's recent themes: ${recentEntries.map(e => e.content).join(' ')}. Create one unique question that challenges their current perspective or celebrates their growth.`;
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });
  return response.text;
};

export const prioritizeTasks = async (tasks: Task[], energy: string) => {
  const ai = getAI();
  const prompt = `Current tasks: ${JSON.stringify(tasks)}. Current energy: ${energy}. Prioritize these tasks. Return a JSON object with: recommended_order (array of IDs), reasoning (string), quick_win (string).`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          recommended_order: { type: Type.ARRAY, items: { type: Type.STRING } },
          reasoning: { type: Type.STRING },
          quick_win: { type: Type.STRING }
        },
        required: ["recommended_order", "reasoning", "quick_win"]
      }
    }
  });
  return JSON.parse(response.text || '{}');
};

export const speakAffirmation = async (text: string): Promise<void> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Read this productivity insight clearly: ${text}` }] }],
      config: {
        responseModalities: ['AUDIO' as any],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error("No audio data returned. This model may require a paid API key with billing enabled.");
    }

    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    
    const binaryString = atob(base64Audio);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const dataInt16 = new Int16Array(bytes.buffer);
    const buffer = audioContext.createBuffer(1, dataInt16.length, 24000);
    const channelData = buffer.getChannelData(0);
    for (let i = 0; i < dataInt16.length; i++) {
      channelData[i] = dataInt16[i] / 32768.0;
    }

    const source = audioContext.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContext.destination);
    
    return new Promise((resolve) => {
      source.onended = () => resolve();
      source.start();
    });
  } catch (error: any) {
    console.error("TTS Error:", error);
    if (error.message?.includes("403") || error.message?.includes("permission")) {
      alert("TTS failed: This model (gemini-2.5-flash-preview-tts) usually requires a paid Google AI Studio account with billing enabled.");
    } else {
      alert("Audio Playback Error: " + (error.message || "Unknown error"));
    }
    throw error;
  }
};
