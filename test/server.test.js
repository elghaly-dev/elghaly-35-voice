import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createApp, renderDeskCards } from "../server.js";

const servers = [];
after(() => Promise.all(servers.map((s) => new Promise((r) => s.close(r)))));

function listen(opts) {
  const { app } = createApp(opts);
  const server = app.listen(0, "127.0.0.1");
  servers.push(server);
  return new Promise((resolve) => server.on("listening", () => resolve(`http://127.0.0.1:${server.address().port}`)));
}

test("without a voice key the server still runs and says so", async () => {
  const base = await listen({ apiKey: "" });
  const health = await (await fetch(`${base}/api/health`)).json();
  assert.deepEqual(health, { ok: true, links: 4, voice: "not_configured" });
  const token = await fetch(`${base}/api/voice-token`);
  assert.equal(token.status, 503);
  assert.equal((await token.json()).error, "voice_unavailable");
});

test("the page arrives with the desk cards already in it", async () => {
  const base = await listen({ apiKey: "" });
  const html = await (await fetch(`${base}/`)).text();
  assert.ok(!html.includes("<!--DESK_CARDS-->"));
  for (const id of ["phone_check", "chain_read", "iris_page", "support"]) {
    assert.ok(html.includes(`id="link-${id}"`), id);
  }
  const flat = html.replace(/\s+/g, " ");
  assert.match(flat, /Your speech is sent to AssemblyAI for transcription\. Never speak a seed phrase or private key\./);
  assert.equal(await (await fetch(`${base}/index.html`)).text(), html);
});

test("health never calls the voice service", async () => {
  let calls = 0;
  const base = await listen({ apiKey: "test-key-not-real", fetchImpl: async () => { calls += 1; throw new Error("no"); } });
  const health = await (await fetch(`${base}/api/health`)).json();
  assert.equal(health.voice, "configured");
  assert.equal(calls, 0);
});

test("token route: success, upstream error, network error", async () => {
  const ok = await listen({
    apiKey: "test-key-not-real",
    fetchImpl: async (url, init) => {
      assert.match(String(url), /^https:\/\/agents\.assemblyai\.com\/v1\/token\?expires_in_seconds=300$/);
      assert.equal(init.headers.Authorization, "Bearer test-key-not-real");
      return new Response(JSON.stringify({ token: "tmp-token" }), { status: 200 });
    },
  });
  assert.deepEqual(await (await fetch(`${ok}/api/voice-token`)).json(), { token: "tmp-token", expires_in_seconds: 300 });

  const bad = await listen({ apiKey: "k", fetchImpl: async () => new Response("quota details", { status: 402 }) });
  const r1 = await fetch(`${bad}/api/voice-token`);
  assert.equal(r1.status, 502);
  assert.ok(!(await r1.text()).includes("quota details"));

  const down = await listen({ apiKey: "k", fetchImpl: async () => { throw new TypeError("fetch failed"); } });
  assert.equal((await fetch(`${down}/api/voice-token`)).status, 502);
});

test("card markup escapes text", () => {
  const html = renderDeskCards({ links: [{ id: "x", name: "<b>", summary: "a & b", url: "https://e.test/?a=1&b=2", label: "Go" }] });
  assert.ok(html.includes("&lt;b&gt;") && html.includes("a &amp; b") && html.includes("a=1&amp;b=2"));
});
