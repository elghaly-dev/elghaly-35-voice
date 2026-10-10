// Iris Desk Voice — lightweight Node server.
//
// 1. Serves the page in /public. The desk link cards are rendered into index.html on the
//    server, so they show before any script or API call runs.
// 2. Issues single-use AssemblyAI tokens at GET /api/voice-token (key stays server-side).
//    Without ASSEMBLYAI_API_KEY the server still runs: the token route answers 503 and
//    the page switches to text mode.
// 3. Serves locked session config + desk link catalog at GET /api/session-config.
// 4. Health check at GET /api/health. It reports whether a voice key is configured but
//    never calls AssemblyAI, so a healthy answer is not proof the voice account works.

import express from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import "dotenv/config";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TOKEN_TTL_SECONDS = 300;

const GREETING =
  "Hello. I'm Iris Desk Voice, the front desk for the Iris page. I can explain the phone check, help you read what a transaction signed, or point you to support. How may I help?";

const SYSTEM_PROMPT = readFileSync(join(__dirname, "system-prompt.txt"), "utf8").trim();
const DESK_CONFIG = JSON.parse(readFileSync(join(__dirname, "desk.json"), "utf8"));
const INDEX_TEMPLATE = readFileSync(join(__dirname, "public", "index.html"), "utf8");

const SHOW_LINK_TOOL = {
  type: "function",
  name: "show_link",
  description:
    "Highlight a desk link card on the visitor's screen and return its URL. Call this when the visitor's question matches a topic so they can open it themselves.",
  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        enum: DESK_CONFIG.links.map((l) => l.id),
        description:
          "phone_check (iPhone/Android checklist), chain_read (what a transaction signed), iris_page (the Iris page), or support (email a human).",
      },
    },
    required: ["topic"],
  },
  execution_mode: "interactive",
  timeout_seconds: 30,
};

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Same markup as renderLinkCards() in public/app.js.
export function renderDeskCards(desk = DESK_CONFIG) {
  return desk.links
    .map((link) => {
      const external = link.url.startsWith("mailto:") ? "" : ' target="_blank" rel="noopener noreferrer"';
      return (
        `<article class="link-card" id="link-${escapeHtml(link.id)}" data-topic="${escapeHtml(link.id)}">` +
        `<h3 class="link-name">${escapeHtml(link.name)}</h3>` +
        `<p class="summary">${escapeHtml(link.summary)}</p>` +
        `<a class="open-btn" href="${escapeHtml(link.url)}"${external}>${escapeHtml(link.label || "Open")}</a>` +
        `</article>`
      );
    })
    .join("\n");
}

export function createApp({ apiKey = process.env.ASSEMBLYAI_API_KEY, fetchImpl = globalThis.fetch } = {}) {
  const voiceConfigured = Boolean(apiKey && apiKey.trim());
  const indexHtml = INDEX_TEMPLATE.replace("<!--DESK_CARDS-->", renderDeskCards());

  const app = express();

  const sendIndex = (_req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache");
    res.send(indexHtml);
  };
  app.get("/", sendIndex);
  app.get("/index.html", sendIndex);

  // express.static (send) sets Content-Type from the extension (.mp4 -> video/mp4) and
  // answers Range requests with 206, which iPhone Safari needs for <video>.
  app.use(
    express.static(join(__dirname, "public"), {
      index: false,
      setHeaders(res, path) {
        if (path.endsWith(".mp4")) {
          res.setHeader("Content-Type", "video/mp4");
          res.setHeader("Accept-Ranges", "bytes");
          res.setHeader("Cache-Control", "public, max-age=86400");
        }
      },
    }),
  );

  // Browsers still probe /favicon.ico; point them at the SVG icon instead of a 404.
  app.get("/favicon.ico", (_req, res) => res.redirect(301, "/favicon.svg"));

  const health = (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    res.json({
      ok: true,
      links: DESK_CONFIG.links.length,
      voice: voiceConfigured ? "configured" : "not_configured",
    });
  };
  app.get("/api/health", health);
  app.get("/health", health);

  app.get("/api/session-config", (_req, res) => {
    res.json({
      system_prompt: SYSTEM_PROMPT,
      greeting: GREETING,
      desk: DESK_CONFIG,
      tools: [SHOW_LINK_TOOL],
    });
  });

  app.get("/api/voice-token", async (_req, res) => {
    res.setHeader("Cache-Control", "no-store");
    if (!voiceConfigured) {
      return res.status(503).json({
        error: "voice_unavailable",
        message: "Voice is not configured on this server. Text mode still works.",
      });
    }
    try {
      const url = new URL("https://agents.assemblyai.com/v1/token");
      url.searchParams.set("expires_in_seconds", String(TOKEN_TTL_SECONDS));

      const response = await fetchImpl(url, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });

      if (!response.ok) {
        console.error(`Token request failed: HTTP ${response.status}`);
        return res.status(502).json({ error: "token_failed", message: "The voice service did not issue a token." });
      }

      const { token } = await response.json();
      res.json({ token, expires_in_seconds: TOKEN_TTL_SECONDS });
    } catch (err) {
      console.error("Token request error:", err?.name ?? "error");
      res.status(502).json({ error: "token_failed", message: "The voice service could not be reached." });
    }
  });

  return { app, voiceConfigured };
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const PORT = process.env.PORT || 3000;
  const { app, voiceConfigured } = createApp();
  if (!voiceConfigured) {
    console.warn("ASSEMBLYAI_API_KEY is not set: serving the page in text mode only (voice token returns 503).");
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Iris Desk Voice running at http://localhost:${PORT}`);
  });
}
