import axios from "axios";

export interface SpeechRequest {
  input: SpeechInput;
  voice: SpeechVoice;
  audioConfig: SpeechAudioConfig;
}

export interface SpeechInput {
  text: string;
}

export interface SpeechVoice {
  languageCode: string;
  name: string;
  ssmlGender: "MALE" | "FEMALE";
}

export interface SpeechAudioConfig {
  audioEncoding: "MP3";
}

/**
 * リクエストを投げる
 * @param request リクエスト
 */
export const callSpeechRequest = async (request: SpeechRequest) => {
  const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${import.meta.env.VITE_APP_GOOGLE_API_KEY}`;

  const response = await axios.post(endpoint, request);
  return "data:audio/mp3;base64," + response.data.audioContent;
}
