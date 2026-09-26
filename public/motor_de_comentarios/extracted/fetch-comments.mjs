import { writeFile } from "node:fs/promises";

const [videoUrl, csvPath = "comments-admin.csv", rawPath] = process.argv.slice(2);
if (!videoUrl) throw new Error("Uso: node fetch-comments.mjs <tiktok-url> [csv-path] [raw-json-path]");

const videoId = videoUrl.match(/\/video\/(\d+)/)?.[1];
if (!videoId) throw new Error("No se encontró aweme_id en la URL de TikTok");

const headers = {
  accept: "application/json, text/plain, */*",
  "user-agent": "Mozilla/5.0",
  referer: videoUrl,
};

async function getJson(url) {
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`TikTok HTTP ${response.status}: ${url}`);
  const data = await response.json();
  if (data.status_code !== 0) throw new Error(`TikTok status_code ${data.status_code}: ${data.status_msg ?? ""}`);
  return data;
}

async function getTopLevelComments() {
  const comments = [];
  let cursor = 0;
  for (let page = 0; page < 100; page += 1) {
    const url = new URL("https://www.tiktok.com/api/comment/list/");
    url.search = new URLSearchParams({ aweme_id: videoId, count: "50", cursor: String(cursor), aid: "1988", app_language: "es-MX", region: "MX", sort_type: "1" }).toString();
    const data = await getJson(url);
    comments.push(...(data.comments ?? []));
    if (!data.has_more || data.cursor === undefined || String(data.cursor) === String(cursor)) break;
    cursor = data.cursor;
  }
  return comments;
}

async function getReplies(parent) {
  if (!Number(parent.reply_comment_total)) return [];
  const replies = [];
  let cursor = 0;
  for (let page = 0; page < 100; page += 1) {
    const url = new URL("https://www.tiktok.com/api/comment/list/reply/");
    url.search = new URLSearchParams({ comment_id: String(parent.cid), count: "50", cursor: String(cursor), item_id: videoId, aid: "1988", app_language: "es-MX", region: "MX" }).toString();
    const data = await getJson(url);
    replies.push(...(data.comments ?? []));
    if (!data.has_more || data.cursor === undefined || String(data.cursor) === String(cursor)) break;
    cursor = data.cursor;
  }
  return replies;
}

function adminRow(comment) {
  const user = comment.user ?? {};
  const timestamp = Number(comment.create_time);
  return {
    author: String(user.nickname ?? user.unique_id ?? ""),
    username: String(user.unique_id ?? ""),
    text: String(comment.text ?? ""),
    likes: String(comment.digg_count ?? 0),
    replies: String(comment.reply_comment_total ?? 0),
    created_at: Number.isFinite(timestamp) ? new Date(timestamp * 1000).toISOString() : "",
    language: String(comment.comment_language ?? ""),
  };
}

function csvCell(value) {
  return `"${String(value ?? "").replaceAll('"', '""')}"`;
}

const topLevel = await getTopLevelComments();
const replies = [];
for (const parent of topLevel) replies.push(...await getReplies(parent));
const all = [...topLevel, ...replies];
const seen = new Set();
const unique = all.filter((comment) => {
  const id = String(comment.cid ?? "");
  if (!id || seen.has(id)) return false;
  seen.add(id); return true;
});
const columns = ["author", "username", "text", "likes", "replies", "created_at", "language"];
const rows = unique.map(adminRow);
const csv = [columns, ...rows.map((row) => columns.map((column) => csvCell(row[column])).join(","))].map((row) => Array.isArray(row) ? row.map(csvCell).join(",") : row).join("\r\n");

await writeFile(csvPath, `\ufeff${csv}\r\n`, "utf8");
if (rawPath) await writeFile(rawPath, JSON.stringify(unique, null, 2), "utf8");
console.log(JSON.stringify({ videoId, topLevel: topLevel.length, replies: replies.length, unique: unique.length, csvPath, rawPath: rawPath ?? null }, null, 2));
