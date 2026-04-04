const axios = require("axios");

const CHROME_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

async function main() {
  const channelName = "arts_tobe";
  let totalPosts = 0;
  let totalViews = 0;
  let page = 0;
  let moreLink = null;
  let subscribers = 0;
  let channelTitle = "";

  // First request
  const firstUrl = "https://dzen.ru/api/v3/launcher/more";
  const r = await axios.get(firstUrl, {
    params: { channel_name: channelName },
    timeout: 15000,
    headers: {
      "User-Agent": CHROME_UA,
      "Accept-Language": "ru-RU,ru;q=0.9",
      Accept: "application/json",
      Referer: `https://dzen.ru/${channelName}`,
    },
    responseType: "json",
  });

  const data = r.data;
  const items = data.items || [];
  const source = items[0]?.source;
  subscribers = source?.subscribers || 0;
  channelTitle = source?.title || channelName;

  for (const item of items) totalViews += item.views || 0;
  totalPosts += items.length;
  page++;

  // Check 'more' field for pagination
  console.log("Top-level 'more':", JSON.stringify(data.more)?.substring(0, 500));
  console.log("First item 'more':", JSON.stringify(items[0]?.more)?.substring(0, 500));

  // The 'more' field at top level is the pagination link
  moreLink = data.more?.link || data.more;

  console.log(`\nPage ${page}: ${items.length} items, views so far: ${totalViews}`);

  // Paginate up to 10 pages (200 posts max for speed)
  while (moreLink && page < 10) {
    try {
      const nextUrl = typeof moreLink === "string" ? moreLink : null;
      if (!nextUrl) break;

      const r2 = await axios.get(nextUrl, {
        timeout: 15000,
        headers: {
          "User-Agent": CHROME_UA,
          "Accept-Language": "ru-RU,ru;q=0.9",
          Accept: "application/json",
          Referer: `https://dzen.ru/${channelName}`,
        },
        responseType: "json",
      });

      const d2 = r2.data;
      const items2 = d2.items || [];
      if (items2.length === 0) break;

      for (const item of items2) totalViews += item.views || 0;
      totalPosts += items2.length;
      page++;

      moreLink = d2.more?.link || d2.more;
      console.log(`Page ${page}: ${items2.length} items, views so far: ${totalViews}`);
    } catch (e) {
      console.log("Pagination error:", e.message);
      break;
    }
  }

  console.log("\n--- TOTALS ---");
  console.log("Channel:", channelTitle);
  console.log("Subscribers:", subscribers);
  console.log("Total posts fetched:", totalPosts);
  console.log("Total views:", totalViews);
  console.log("Pages fetched:", page);
  console.log("Has more:", !!moreLink);
}

main().catch(e => console.error("ERROR:", e.message));
