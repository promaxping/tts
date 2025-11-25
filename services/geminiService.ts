
import { GoogleGenAI, Modality } from "@google/genai";
import { splitTextIntoChunks } from '../utils/textUtils';
import { CHUNK_MAX_LENGTH } from '../constants';

// This function will handle a single API call for one chunk of text.
const generateSingleChunk = async (
  ai: GoogleGenAI,
  textChunk: string,
  voiceName: string,
  speakingRate: number,
  pitch: number,
  tone: string
): Promise<string> => {
  // Construct style instructions for the prompt since the API config doesn't support pitch/rate directly in the generateContent config yet.
  const styleParts: string[] = [];
  
  if (tone && tone.trim()) {
    styleParts.push(tone.trim());
  }

  // Map numerical speaking rate to descriptive text
  if (speakingRate <= 0.5) styleParts.push("rất chậm");
  else if (speakingRate < 0.9) styleParts.push("chậm rãi");
  else if (speakingRate >= 1.75) styleParts.push("rất nhanh");
  else if (speakingRate > 1.2) styleParts.push("nhanh");

  // Map numerical pitch to descriptive text
  if (pitch <= -5) styleParts.push("tông rất trầm");
  else if (pitch < -1) styleParts.push("tông trầm");
  else if (pitch >= 5) styleParts.push("tông rất cao");
  else if (pitch > 1) styleParts.push("tông cao");

  // Construct the final text with style instructions
  const finalText = styleParts.length > 0 
    ? `Hãy đọc văn bản sau với giọng ${styleParts.join(', ')}: ${textChunk}`
    : textChunk;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: finalText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName,
          },
        },
      },
      // Removed invalid parameters speakingRate and pitch
    },
  });

  const candidate = response.candidates?.[0];
  const base64Audio = candidate?.content?.parts?.[0]?.inlineData?.data;

  // Success case: we received audio data.
  if (base64Audio) {
    return base64Audio;
  }
  
  // Error case: no audio data received. Let's provide a better error message.
  console.error("Invalid API response received:", JSON.stringify(response, null, 2));

  if (response.promptFeedback?.blockReason) {
    throw new Error(
      `Văn bản bị chặn vì lý do an toàn: ${response.promptFeedback.blockReason}. Vui lòng sửa đổi nội dung.`
    );
  }

  if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
     let reasonMessage = `Lý do: ${candidate.finishReason}.`;
     if (candidate.finishReason === 'SAFETY') {
        reasonMessage = "Nội dung có thể đã vi phạm chính sách an toàn.";
     } else if (candidate.finishReason === 'OTHER') {
        reasonMessage = "Lỗi không xác định từ máy chủ API. Điều này có thể do văn bản quá dài hoặc chứa nội dung không được hỗ trợ.";
     }
    throw new Error(
      `Không thể tạo giọng nói cho một đoạn văn bản. ${reasonMessage} Vui lòng kiểm tra lại văn bản hoặc thử lại.`
    );
  }

  // Fallback for any other case where audio is missing.
  throw new Error("Không nhận được dữ liệu âm thanh từ API cho một đoạn văn bản.");
};


// The new main export function that handles chunking with concurrency and abort support.
export const generateSpeech = async (
  apiKey: string,
  text: string,
  voiceName: string,
  speakingRate: number,
  pitch: number,
  tone: string,
  onProgress: (current: number, total: number) => void,
  signal?: AbortSignal
): Promise<string[]> => {
  if (!apiKey) {
      throw new Error("API key là bắt buộc. Vui lòng cung cấp API key của bạn.");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  const textChunks = splitTextIntoChunks(text, CHUNK_MAX_LENGTH);
  const totalChunks = textChunks.length;
  onProgress(0, totalChunks);
  
  // Concurrency limit to prevent rate limits and allow smoother cancellation
  const CONCURRENCY_LIMIT = 3;
  const results: string[] = new Array(totalChunks);
  let completedChunks = 0;
  let nextChunkIndex = 0;

  // Worker function to process chunks from the queue
  const worker = async () => {
    while (nextChunkIndex < totalChunks) {
      if (signal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }

      const currentIndex = nextChunkIndex++;
      const chunk = textChunks[currentIndex];

      try {
        const result = await generateSingleChunk(ai, chunk, voiceName, speakingRate, pitch, tone);
        
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }

        results[currentIndex] = result;
        completedChunks++;
        onProgress(completedChunks, totalChunks);
      } catch (error) {
        // If aborted during the call, throw AbortError
        if (signal?.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        throw error;
      }
    }
  };

  try {
    // Start initial workers
    const workers = Array(Math.min(totalChunks, CONCURRENCY_LIMIT))
      .fill(null)
      .map(() => worker());

    await Promise.all(workers);
    return results;
  } catch (error) {
    if (signal?.aborted || (error instanceof Error && error.name === 'AbortError')) {
       throw new DOMException('Aborted', 'AbortError');
    }

    console.error("Gemini API call failed:", error);
     if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            throw new Error("API key không hợp lệ hoặc chưa được kích hoạt. Vui lòng kiểm tra lại.");
        }
        throw error;
    }
    throw new Error("Đã xảy ra lỗi không xác định. Vui lòng thử lại.");
  }
};
