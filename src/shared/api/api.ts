export interface AnalyzeResponse {
  siteId: string;
  normalizedUrl: string;
  score: number;
  issues: string[];
  recommendations: string[];
  checkedAt: string;
  monitoring: {
    hasPreviousSnapshot: boolean;
    scoreDelta: number | null;
  };
}

export interface StartBusinessResponse {
  niche: string;
  checklist: string[];
  commercialOffer: string[];
}

// Легкая обертка над fetch для клиентских запросов.
async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function analyzeSite(url: string): Promise<AnalyzeResponse> {
  return request<AnalyzeResponse>("/api/analyze", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
}

export function startBusiness(niche: string): Promise<StartBusinessResponse> {
  return request<StartBusinessResponse>("/api/start", {
    method: "POST",
    body: JSON.stringify({ niche }),
  });
}
