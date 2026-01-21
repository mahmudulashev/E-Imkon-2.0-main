
import { GoogleGenAI, Modality } from "@google/genai";
import { getGeminiApiKey } from "./env";

const isQuotaError = (err: unknown) => {
  const message = String((err as any)?.message || err || "");
  return message.includes("RESOURCE_EXHAUSTED") || message.toLowerCase().includes("quota");
};

export const isTtsBlocked = () => Boolean((globalThis as any).__eImkonTtsBlocked);

export const createSpeechUtterance = (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  const utter = new SpeechSynthesisUtterance(text);
  const voices = window.speechSynthesis.getVoices();
  const pick =
    voices.find(v => v.lang?.toLowerCase().startsWith('uz')) ||
    voices.find(v => v.lang?.toLowerCase().startsWith('tr')) ||
    voices.find(v => v.lang?.toLowerCase().startsWith('ru')) ||
    voices.find(v => v.lang?.toLowerCase().startsWith('en')) ||
    null;
  if (pick) {
    utter.voice = pick;
    utter.lang = pick.lang;
  }
  utter.rate = 0.98;
  utter.pitch = 1;
  return utter;
};

// Guideline-compliant decode function
export function decode(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const playSoundCue = (type: 'success' | 'click' | 'error' | 'nav', ctx: AudioContext) => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  if (type === 'success') {
    osc.frequency.setValueAtTime(587.33, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  } else if (type === 'nav') {
    osc.frequency.setValueAtTime(440, now);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
  } else if (type === 'error') {
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.linearRampToValueAtTime(110, now + 0.2);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
  }

  osc.start();
  osc.stop(now + 0.3);
};

const normalizeUzbekTtsText = (input: string) => {
  let text = input;
  const replacements: Array<[RegExp, string]> = [
    [/\bAI\b/gi, 'ay ay'],
    [/\bTTS\b/gi, 'ti ti es'],
    [/\bE-?Imkon\b/gi, 'e imkon'],
    [/\bTutor\b/gi, 'tyutor'],
    [/\bFrontend\b/gi, 'fron tend'],
    [/\bHTML\b/gi, 'eych ti em el'],
    [/\bCSS\b/gi, 'si es es'],
    [/\bReact\b/gi, 'riakt'],
  ];

  replacements.forEach(([pattern, value]) => {
    text = text.replace(pattern, value);
  });

  return text;
};

const TTS_MODELS = [
  "gemini-2.5-pro-tts",
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-flash-tts"
];

export const generateSpeech = async (text: string) => {
  if (!text || !text.trim()) return null;
  try {
    if (isTtsBlocked()) return null;
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      console.warn('Gemini API key topilmadi. .env faylini tekshiring.');
      return null;
    }
    const cacheKey = text.trim();
    if (!(globalThis as any).__eImkonTtsCache) {
      (globalThis as any).__eImkonTtsCache = new Map<string, string>();
    }
    const ttsCache: Map<string, string> = (globalThis as any).__eImkonTtsCache;
    if (ttsCache.has(cacheKey)) {
      return ttsCache.get(cacheKey) || null;
    }
    const ai = new GoogleGenAI({ apiKey });
    const cleanText = normalizeUzbekTtsText(text.replace(/([0-9]+)/g, " $1 "));
    const prompt = `O'zbek tili ona tilida gapiradigan suxandon sifatida o'qing. 
Matnni o'zbekcha talaffuz bilan, tabiiy ohang va to'g'ri urg'u bilan ayting. 
Inglizcha yoki texnik atamalarni ham o'zbekcha talaffuzga moslab o'qing: ${cleanText}`;
    
    let quotaBlocked = true;
    for (const model of TTS_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: [{ parts: [{ text: prompt.substring(0, 3000) }] }],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Zephyr' }
              }
            }
          }
        });

        const audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
        if (audio) {
          ttsCache.set(cacheKey, audio);
          return audio;
        }
        quotaBlocked = false;
      } catch (err) {
        if (!isQuotaError(err)) quotaBlocked = false;
      }
    }
    if (quotaBlocked) {
      (globalThis as any).__eImkonTtsBlocked = true;
    }
    return null;
  } catch (err) {
    if (isQuotaError(err)) {
      (globalThis as any).__eImkonTtsBlocked = true;
    }
    console.error("TTS API Error:", err);
    return null;
  }
};
