import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the Gym Lesson Planner shell", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Gym Lesson Planner<\/title>/i);
  assert.match(html, /Public shared lesson planning for gymnastics coaching\./);
  assert.match(html, /LESSON PLANNER/);
  assert.match(html, /\+ LESSON PLAN/);
  assert.match(html, /\+ IMPORT CLASS/);
  assert.match(html, /CONNECTING PUBLIC WORKSPACE/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|SkeletonPreview/i);
});

test("keeps the planner's public-shared metadata and capability surface", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /title:\s*"Gym Lesson Planner"/);
  assert.match(layout, /description:\s*"Public shared lesson planning for gymnastics coaching\."/);
  assert.match(layout, /manifest:\s*"\/site\.webmanifest"/);
  assert.match(layout, /appleWebApp:/);
  assert.match(page, /createLessonPlanMeta/);
  assert.match(page, /LOCAL_REMINDER_STORAGE_KEY/);
  assert.doesNotMatch(page, /SkeletonPreview|_sites-preview/);
});
