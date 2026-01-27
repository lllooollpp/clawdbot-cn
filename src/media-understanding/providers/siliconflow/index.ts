import type { MediaUnderstandingProvider } from "../../types.js";
import { transcribeOpenAiCompatibleAudio } from "../openai/audio.js";

export const siliconflowProvider: MediaUnderstandingProvider = {
  id: "siliconflow",
  capabilities: ["audio"],
  transcribeAudio: (params) => {
    return transcribeOpenAiCompatibleAudio({
      ...params,
      baseUrl: params.baseUrl || "https://api.siliconflow.cn/v1",
    });
  },
};
