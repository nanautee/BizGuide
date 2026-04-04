import axios from "axios";
import { REQUEST_CONSTANTS } from "@/shared/config/constants";

export async function fetchHtml(url: string): Promise<string> {
  // Базовый HTTP-клиент с таймаутом и user-agent для устойчивого парсинга.
  const response = await axios.get<string>(url, {
    timeout: REQUEST_CONSTANTS.timeoutMs,
    headers: {
      "User-Agent": REQUEST_CONSTANTS.userAgent,
      Accept: "text/html,application/xhtml+xml",
    },
    responseType: "text",
    maxRedirects: 5,
  });

  return response.data;
}
