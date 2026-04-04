export type SocialPlatform = "instagram" | "vk" | "telegram" | "youtube" | "whatsapp";

export interface SocialLinkInput {
  platform: SocialPlatform;
  url: string;
  active: boolean;
  followers?: number;
  contacts?: string;
}

export interface SocialLinkAnalysis {
  platform: SocialPlatform;
  url: string;
  status: "ok" | "warning" | "error";
  score: number;
  issues: string[];
  recommendation: string;
}
