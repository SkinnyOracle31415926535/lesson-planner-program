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
  assert.match(html, /Ryan-only shared lesson planning for gymnastics coaching\./);
  assert.match(html, /LESSON PLANNER/);
  assert.match(html, /\+ LESSON PLAN/);
  assert.match(html, /\+ IMPORT CLASS/);
  assert.match(html, /CONNECTING TO RYAN’S WORKSPACE/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site|SkeletonPreview/i);
});

test("keeps the planner's Ryan-only metadata and capability surface", async () => {
  const [page, layout] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(layout, /title:\s*"Gym Lesson Planner"/);
  assert.match(layout, /description:\s*"Ryan-only shared lesson planning for gymnastics coaching\."/);
  assert.match(layout, /manifest:\s*"\/site\.webmanifest"/);
  assert.match(layout, /appleWebApp:/);
  assert.match(page, /createLessonPlanMeta/);
  assert.match(page, /LOCAL_REMINDER_STORAGE_KEY/);
  assert.doesNotMatch(page, /SkeletonPreview|_sites-preview/);
});

test("keeps direct Draft actions beside the shared Idea save actions", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const newIdeaActionsStart = page.indexOf('<div className="new-idea-actions">');
  const newIdeaActions = page.slice(newIdeaActionsStart, page.indexOf("</div>", newIdeaActionsStart));
  const editorActionsStart = page.lastIndexOf('<div className="idea-editor-actions">', page.lastIndexOf("onClick={closeLibraryEdit}"));
  const editorActions = page.slice(editorActionsStart, page.indexOf("</div>", editorActionsStart));

  assert.ok(newIdeaActionsStart >= 0);
  assert.ok(editorActionsStart >= 0);
  assert.ok(newIdeaActions.indexOf("SAVE IDEA") < newIdeaActions.indexOf("DRAFT IDEA"));
  assert.ok(newIdeaActions.indexOf("DRAFT IDEA") < newIdeaActions.indexOf("CANCEL"));
  assert.match(newIdeaActions, /<button type="button"[\s\S]*?saveNewIdea\(\{ asDraft: true \}\)[\s\S]*?>DRAFT IDEA<\/button>/);
  assert.ok(editorActions.indexOf("CANCEL") < editorActions.indexOf("MOVE TO DRAFT"));
  assert.ok(editorActions.indexOf("MOVE TO DRAFT") < editorActions.indexOf("SAVE SHARED EDIT"));
  assert.match(editorActions, /<button type="button"[\s\S]*?saveLibraryEdit\(\{ moveToDraft: true \}\)[\s\S]*?>MOVE TO DRAFT<\/button>/);
});

test("the Idea Library edit form exposes the Station Maker", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");
  const editorMediaStart = page.indexOf('<section className="idea-editor-media"');
  const editorMedia = page.slice(editorMediaStart, page.indexOf("</section>", editorMediaStart));

  assert.ok(editorMediaStart >= 0);
  assert.match(editorMedia, /openLibraryEditStationMaker/);
  assert.match(editorMedia, /"EDIT STATION" : "MAKE STATION"/);
});
