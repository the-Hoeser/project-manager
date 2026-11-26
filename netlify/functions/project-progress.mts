import { parseMarkdownPlan, progressFromPhases, parseLogbook } from "../../src/progress.ts";

const ALLOWED_ORIGINS = new Set([
  "https://hacktony.netlify.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

const json = (body: unknown, status = 200, origin = "") => {
  const headers = new Headers({
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
    "vary": "Origin",
  });
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers.set("access-control-allow-origin", origin);
    headers.set("access-control-allow-methods", "GET, OPTIONS");
    headers.set("access-control-allow-headers", "Accept");
  }
  return new Response(JSON.stringify(body), { status, headers });
};

async function githubJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "RepoPulse-ReadOnly-Progress/1.0",
    },
  });
  if (!response.ok) {
    const text = await response.text();
    const message = response.status === 404
      ? "The public GitHub repository or selected branch was not found."
      : response.status === 403
        ? "GitHub's unauthenticated API rate limit was reached. Try again later."
        : "GitHub returned HTTP " + response.status + (text ? ": " + text.slice(0, 160) : "");
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

async function readTextFile(owner: string, repo: string, branch: string, path: string): Promise<string> {
  const contentPath = path.split("/").map(encodeURIComponent).join("/");
  const url = "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo)
    + "/contents/" + contentPath + "?ref=" + encodeURIComponent(branch);
  const item = await githubJson<{ type: string; content?: string; encoding?: string }>(url);
  if (item.type !== "file" || !item.content || item.encoding !== "base64") return "";
  const bytes = Uint8Array.from(atob(item.content.replace(/\n/g, "")), (character) => character.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function choosePlanPath(paths: string[]): string | null {
  const candidates = ["PLAN.md", "plan.md", "ROADMAP.md", "roadmap.md", "TODO.md", "TASKS.md", "tasks.md"];
  const rootCandidates = candidates.map((name) => paths.find((path) => path.toLowerCase() === name.toLowerCase())).find(Boolean);
  return rootCandidates
    ?? paths.find((path) => /plan|roadmap|task/i.test(path.split("/").pop() || ""))
    ?? paths.find((path) => path.toLowerCase() === "readme.md")
    ?? null;
}

function chooseLogPath(paths: string[]): string | null {
  return paths.find((path) => /logbook|devlog|development-log/i.test(path.split("/").pop() || "")) ?? null;
}

export default async (request: Request) => {
  const origin = request.headers.get("origin") || "";
  if (origin && !ALLOWED_ORIGINS.has(origin)) {
    return json({ error: "This read-only progress endpoint is not available to this origin." }, 403);
  }
  if (request.method === "OPTIONS") {
    const headers = new Headers();
    if (origin && ALLOWED_ORIGINS.has(origin)) {
      headers.set("access-control-allow-origin", origin);
      headers.set("access-control-allow-methods", "GET, OPTIONS");
      headers.set("access-control-allow-headers", "Accept");
      headers.set("access-control-max-age", "600");
      headers.set("vary", "Origin");
    }
    return new Response(null, { status: 204, headers });
  }
  if (request.method !== "GET") return json({ error: "GET required. This endpoint is read-only." }, 405, origin);

  try {
    const params = new URL(request.url).searchParams;
    const requestedRepo = params.get("repo") || "";
    const branchParam = params.get("branch") || "";
    const parts = requestedRepo.split("/");
    if (parts.length !== 2 || !parts.every((part) => /^[A-Za-z0-9_.-]+$/.test(part))) {
      return json({ error: "Provide a public GitHub repository as repo=owner/name." }, 400, origin);
    }
    if (branchParam.length > 200 || branchParam.startsWith("-")) {
      return json({ error: "The branch parameter is invalid." }, 400, origin);
    }

    const [owner, repo] = parts;
    const metadata = await githubJson<{ full_name: string; name: string; default_branch: string; html_url: string; pushed_at: string | null }>(
      "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo),
    );
    const branch = branchParam || metadata.default_branch;
    if (!branch || branch.includes("..") || branch.includes("\\") || branch.startsWith("/")) {
      return json({ error: "The selected branch is invalid." }, 400, origin);
    }

    const tree = await githubJson<{ truncated?: boolean; tree: { path: string; type: string }[] }>(
      "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo)
        + "/git/trees/" + encodeURIComponent(branch) + "?recursive=1",
    );
    const paths = (tree.tree || []).filter((entry) => entry.type === "blob").map((entry) => entry.path);
    const planPath = choosePlanPath(paths);
    const logPath = chooseLogPath(paths);

    const plan = planPath ? await readTextFile(owner, repo, branch, planPath) : "";
    const log = logPath ? await readTextFile(owner, repo, branch, logPath) : "";
    const phases = parseMarkdownPlan(plan);
    const progress = progressFromPhases(phases);

    let latestCommitSha: string | null = null;
    try {
      const commits = await githubJson<{ sha: string }[]>(
        "https://api.github.com/repos/" + encodeURIComponent(owner) + "/" + encodeURIComponent(repo)
          + "/commits?per_page=1&sha=" + encodeURIComponent(branch),
      );
      latestCommitSha = commits[0]?.sha ?? null;
    } catch {
      // Progress remains valid if only the optional commit lookup fails.
    }

    return json({
      repository: metadata.full_name,
      repositoryUrl: metadata.html_url,
      branch,
      defaultBranch: metadata.default_branch,
      planPath,
      logPath,
      planAvailable: Boolean(planPath && plan),
      progress,
      phases,
      logbook: parseLogbook(log),
      latestCommitSha,
      repositoryPushedAt: metadata.pushed_at,
      generatedAt: new Date().toISOString(),
      source: "RepoPulse Markdown checklist engine",
      readOnly: true,
      treeTruncated: Boolean(tree.truncated),
    }, 200, origin);
  } catch (error) {
    return json({
      error: error instanceof Error ? error.message : "Unable to read the public repository progress.",
      readOnly: true,
    }, 502, origin);
  }
};
