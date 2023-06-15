import axios from "axios";

export interface VisionRequest {
  requests: VisionRequestBody[];
}

export interface VisionRequestBody {
  image: VisionRequestImage;
  features: VisionRequestFeature[];
}

export interface VisionRequestImage {
  content: string;
}

export interface VisionRequestFeature {
  type: string;
  maxResults: number;
}

/**
 * リクエストを投げる
 * @param request リクエスト
 */
export const callVisionRequest = async (request: VisionRequest) => {
  const endpoint = `https://vision.googleapis.com/v1/images:annotate?key=${import.meta.env.VITE_APP_GOOGLE_API_KEY}`;

  const response = await axios.post(endpoint, request);
  return response.data;
}
