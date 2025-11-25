
export interface VoiceOption {
  value: string;
  label: string;
}

export interface VoiceCategory {
  label: string;
  options: VoiceOption[];
}

export interface ToneOption {
  value: string;
  label: string;
  defaultRate?: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  textPreview: string;
  voiceName: string;
  audioData: string[];
  fileName: string;
  duration?: number; // Optional, usually calculated on playback
}
