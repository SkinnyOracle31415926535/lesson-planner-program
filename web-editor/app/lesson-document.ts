/** Normalizes short area labels for a compact generated lesson document. */
function compactAreaName(value: string): string {
  return value.toLocaleLowerCase().replace(/\s+/g, "");
}

/**
 * A phase already supplies its event once. Keep a useful prefix only when a
 * mixed-area phase needs to distinguish a station from its neighbours.
 */
export function documentDrillTitle(
  phaseEventName: string,
  phaseTitle: string,
  area: string,
  title: string,
): string {
  if (area === "TEXT") return title;
  const compactArea = compactAreaName(area);
  return compactArea && (compactArea === compactAreaName(phaseEventName) || compactArea === compactAreaName(phaseTitle))
    ? title
    : `${area} · ${title}`;
}

/** Empty or whitespace-only equipment entries do not create a mats callout. */
export function listedMats(mats: readonly string[] | undefined): string[] {
  return (mats ?? []).map((mat) => mat.trim()).filter(Boolean);
}

function escapeHtmlText(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function safeFilenamePart(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48)
    .replace(/-+$/g, "");
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

/** Produces a stable local filename without exposing punctuation from class names. */
export function lessonPlanDownloadFilename(className: string, isoDate: string): string {
  const safeDate = isIsoDate(isoDate) ? isoDate : "saved";
  const safeClassName = safeFilenamePart(className);
  return `lesson-plan-${safeDate}${safeClassName ? `-${safeClassName}` : ""}.html`;
}

/**
 * Wraps the already React-escaped View document in an offline-only retro page.
 * `renderedPaperHtml` must come from the rendered `.legacy-document-paper` DOM.
 */
export function standaloneLessonPlanHtml({
  pageTitle,
  renderedPaperHtml,
}: {
  pageTitle: string;
  renderedPaperHtml: string;
}): string {
  const title = escapeHtmlText(pageTitle.trim() || "Lesson Plan");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="referrer" content="no-referrer">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:; base-uri 'none'; form-action 'none'">
  <title>${title}</title>
  <style>
    :root { color-scheme:light; --teal:#008080; --window:#c0c0c0; --white:#fff; --black:#000; --navy:#000080; --cyan:#00ffff; --pink:#ff00ff; --ink:#12212a; }
    * { box-sizing:border-box; }
    html { min-width:320px; background:var(--teal); }
    body { margin:0; padding:24px; background:radial-gradient(circle at 10% 8%,#009d9d,var(--teal) 44%); color:var(--black); font-family:"Arial Narrow","Helvetica Neue",Arial,sans-serif; }
    .download-window { width:min(900px,100%); margin:0 auto; background:var(--window); border-top:3px solid var(--white); border-left:3px solid var(--white); border-right:3px solid var(--black); border-bottom:3px solid var(--black); box-shadow:7px 7px 0 rgba(0,0,0,.5); }
    .download-title { padding:8px 10px; display:flex; justify-content:space-between; gap:10px; background:var(--navy); color:var(--white); font:900 11px/1.2 ui-monospace,Menlo,monospace; letter-spacing:.04em; }
    .download-title span { color:var(--cyan); }
    .legacy-document-paper { margin:10px; padding:20px 28px; background:repeating-linear-gradient(0deg,#fffef2 0,#fffef2 25px,#d5e7ff 26px); border:2px solid var(--ink); box-shadow:inset 0 0 0 2px #fff; color:#10234b; }
    .legacy-document-paper h3 { margin:0; color:var(--navy); text-align:center; font:900 22px/1.1 Georgia,serif; letter-spacing:.04em; }
    .legacy-date { margin:5px 0 15px; text-align:center; color:#a00079; font:900 10px ui-monospace,monospace; }
    .legacy-document-paper section { margin:10px 0; }
    .legacy-document-paper h4 { margin:0 0 3px; color:var(--navy); border-bottom:1px dotted var(--navy); font:900 10px ui-monospace,monospace; letter-spacing:.06em; }
    .legacy-document-paper p,.legacy-document-paper li { margin:4px 0; font:700 12px/1.35 "Arial Narrow",Arial,sans-serif; }
    .legacy-document-paper ul { margin:5px 0; padding-left:20px; }
    .legacy-attendance-list { columns:2; }
    .legacy-attendance-list small { color:#49637b; font:800 8px ui-monospace,monospace; text-transform:uppercase; }
    .legacy-attendance-check,.legacy-todo-check { display:inline-flex; align-items:center; gap:6px; min-height:28px; cursor:pointer; }
    .legacy-todo-list { display:grid; gap:3px; }
    .legacy-todo-check.completed span { color:#4f4f4f; text-decoration:line-through; }
    .legacy-attendance-check input,.legacy-todo-check input { width:20px; height:20px; margin:0; -webkit-appearance:none; appearance:none; display:inline-grid; place-content:center; flex:0 0 auto; overflow:visible; border:2px solid var(--black); border-radius:0; background:#d8d8d8; box-shadow:inset 2px 2px 0 var(--white),inset -2px -2px 0 #808080; }
    .legacy-attendance-check input::after,.legacy-todo-check input::after { content:""; width:20px; height:20px; background:var(--black); clip-path:polygon(0 45%,12% 33%,40% 60%,88% 0,100% 11%,41% 83%); transform:translate(2px,-3px) scale(0); transform-origin:center; }
    .legacy-attendance-check input:checked::after,.legacy-todo-check input:checked::after { transform:translate(2px,-3px) scale(1); }
    .legacy-attendance-check input:active,.legacy-todo-check input:active { background:#c0c0c0; box-shadow:inset 2px 2px 0 #808080,inset -1px -1px 0 var(--white); }
    .legacy-attendance-check input:focus-visible,.legacy-todo-check input:focus-visible { outline:1px dotted var(--black); outline-offset:2px; }
    .legacy-plan-list { display:grid; gap:7px; }
    .legacy-phase-plan { padding:6px 7px; background:rgba(255,255,255,.55); border:1px dotted var(--navy); break-inside:avoid; }
    .legacy-phase-plan h5 { margin:0 0 5px; color:var(--navy); font:900 11px/1.2 ui-monospace,monospace; letter-spacing:.02em; }
    .legacy-drill { margin:5px 0; padding:5px 7px; background:#fffef8; border-left:4px solid var(--cyan); break-inside:avoid; }
    .legacy-drill > b { color:#10234b; font:900 12px/1.25 "Arial Narrow",Arial,sans-serif; }
    .legacy-drill p,.legacy-text-cue,.legacy-plan-empty { margin:3px 0; }
    .legacy-mats { padding:3px 5px; background:#d8f9dd; border:1px dotted #087c12; color:#075c0e; font-size:10px !important; }
    .legacy-text-cue { padding-left:7px; border-left:3px solid var(--pink); }
    .legacy-plan-empty { color:#4b4b4b; font-style:italic; }
    @media (max-width:600px) { body { padding:8px; } .legacy-document-paper { margin:6px; padding:14px; } .legacy-attendance-list { columns:1; } }
    @media print { html,body { background:#fff; } body { padding:0; } .download-window { width:100%; border:0; box-shadow:none; } .download-title { display:none; } .legacy-document-paper { margin:0; border:0; box-shadow:none; } }
  </style>
</head>
<body>
  <main class="download-window">
    <div class="download-title">LESSON PLANNER <span>STYLED OFFLINE COPY</span></div>
    ${renderedPaperHtml}
  </main>
</body>
</html>`;
}
