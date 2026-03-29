import type { TemplateFile, TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { Templates } from "@prisma/client";

const GITHUB_API = "https://api.github.com";

const IGNORE_FOLDERS = new Set([
  "node_modules",
  ".git",
  ".vscode",
  ".idea",
  "dist",
  "build",
  "coverage",
]);

const IGNORE_FILES = new Set([
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  ".DS_Store",
  "thumbs.db",
  ".gitignore",
  ".npmrc",
  ".yarnrc",
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
]);

const MAX_FILES = 500;
const MAX_TOTAL_SIZE = 5 * 1024 * 1024; // 5MB
const BLOB_FETCH_CONCURRENCY = 10;

export interface ParsedGithubRepo {
  owner: string;
  repo: string;
  branch?: string;
}

export function parseGithubRepoUrl(input: string): ParsedGithubRepo {
  const trimmed = input.trim().replace(/\.git$/, "");

  // owner/repo shorthand
  const shorthandMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], repo: shorthandMatch[2] };
  }

  try {
    const url = new URL(trimmed);
    if (!/(^|\.)github\.com$/.test(url.hostname)) {
      throw new Error("Not a github.com URL");
    }

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) {
      throw new Error("URL must include an owner and repo name");
    }

    const [owner, repo] = parts;
    let branch: string | undefined;
    if (parts[2] === "tree" && parts[3]) {
      branch = parts.slice(3).join("/");
    }

    return { owner, repo, branch };
  } catch {
    throw new Error(
      "Enter a valid GitHub repo URL (e.g. https://github.com/owner/repo) or owner/repo."
    );
  }
}

function githubHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }
  return headers;
}

interface GithubTreeEntry {
  path: string;
  type: "blob" | "tree" | "commit";
  sha: string;
  size?: number;
}

function shouldIgnorePath(filePath: string): boolean {
  const segments = filePath.split("/");
  const basename = segments[segments.length - 1];

  if (segments.some((segment) => IGNORE_FOLDERS.has(segment))) return true;
  if (IGNORE_FILES.has(basename)) return true;

  return false;
}

function buildTree(entries: { path: string; content: string }[]): TemplateFolder {
  const root: TemplateFolder = { folderName: "root", items: [] };

  for (const entry of entries) {
    const segments = entry.path.split("/");
    const fileSegment = segments[segments.length - 1];
    const folderSegments = segments.slice(0, -1);

    let current = root;
    for (const folderName of folderSegments) {
      let next = current.items.find(
        (item): item is TemplateFolder => "folderName" in item && item.folderName === folderName
      );
      if (!next) {
        next = { folderName, items: [] };
        current.items.push(next);
      }
      current = next;
    }

    const dotIndex = fileSegment.lastIndexOf(".");
    const filename = dotIndex > 0 ? fileSegment.slice(0, dotIndex) : fileSegment;
    const fileExtension = dotIndex > 0 ? fileSegment.slice(dotIndex + 1) : "";

    current.items.push({
      filename,
      fileExtension,
      content: entry.content,
    });
  }

  return root;
}

async function fetchJson(url: string, accessToken?: string) {
  const response = await fetch(url, { headers: githubHeaders(accessToken) });
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Repository not found. Check the URL and make sure the repo is public.");
    }
    if (response.status === 403) {
      throw new Error("GitHub API rate limit exceeded. Please try again later.");
    }
    throw new Error(`GitHub API error (${response.status}): ${response.statusText}`);
  }
  return response.json();
}

export async function fetchGithubRepoAsTemplateFolder(
  owner: string,
  repo: string,
  branch: string | undefined,
  accessToken?: string
): Promise<TemplateFolder> {
  const repoInfo = await fetchJson(`${GITHUB_API}/repos/${owner}/${repo}`, accessToken);

  if (repoInfo.private) {
    throw new Error("Only public repositories can be imported.");
  }

  const resolvedBranch = branch || repoInfo.default_branch;

  const treeResponse = await fetchJson(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${encodeURIComponent(resolvedBranch)}?recursive=1`,
    accessToken
  );

  if (treeResponse.truncated) {
    throw new Error("This repository is too large to import.");
  }

  const entries: GithubTreeEntry[] = (treeResponse.tree ?? []).filter(
    (entry: GithubTreeEntry) => entry.type === "blob" && !shouldIgnorePath(entry.path)
  );

  if (entries.length === 0) {
    throw new Error("No importable files found in this repository.");
  }

  if (entries.length > MAX_FILES) {
    throw new Error(
      `This repository has too many files (${entries.length}, limit ${MAX_FILES}) to import.`
    );
  }

  const totalSize = entries.reduce((sum, entry) => sum + (entry.size ?? 0), 0);
  if (totalSize > MAX_TOTAL_SIZE) {
    throw new Error("This repository is too large to import.");
  }

  const fileContents: { path: string; content: string }[] = [];
  for (let i = 0; i < entries.length; i += BLOB_FETCH_CONCURRENCY) {
    const batch = entries.slice(i, i + BLOB_FETCH_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (entry) => {
        const blob = await fetchJson(
          `${GITHUB_API}/repos/${owner}/${repo}/git/blobs/${entry.sha}`,
          accessToken
        );
        const content =
          blob.encoding === "base64"
            ? Buffer.from(blob.content, "base64").toString("utf8")
            : blob.content;
        return { path: entry.path, content };
      })
    );
    fileContents.push(...results);
  }

  const folder = buildTree(fileContents);
  folder.folderName = repo;
  return folder;
}

const FRAMEWORK_DETECTORS: { deps: string[]; template: Templates }[] = [
  { deps: ["@angular/core"], template: Templates.ANGULAR },
  { deps: ["vue"], template: Templates.VUE },
  { deps: ["hono"], template: Templates.HONO },
  { deps: ["next"], template: Templates.NEXTJS },
  { deps: ["express"], template: Templates.EXPRESS },
  { deps: ["react"], template: Templates.REACT },
];

function findRootPackageJson(folder: TemplateFolder): TemplateFile | undefined {
  return folder.items.find(
    (item): item is TemplateFile =>
      "filename" in item && item.filename === "package" && item.fileExtension === "json"
  );
}

export function detectTemplateAndNormalize(folder: TemplateFolder): {
  template: Templates;
  folder: TemplateFolder;
} {
  const packageJsonFile = findRootPackageJson(folder);

  if (!packageJsonFile) {
    throw new Error(
      "No package.json found at the repo root — this doesn't look like a Node.js project and can't run in this sandbox."
    );
  }

  let pkg: any;
  try {
    pkg = JSON.parse(packageJsonFile.content);
  } catch {
    throw new Error("The repo's package.json isn't valid JSON.");
  }

  const allDeps = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);

  let template: Templates = Templates.CUSTOM;
  for (const detector of FRAMEWORK_DETECTORS) {
    if (detector.deps.every((dep) => allDeps.has(dep))) {
      template = detector.template;
      break;
    }
  }

  const scripts = pkg.scripts ?? {};
  if (!scripts.start) {
    if (scripts.dev) {
      pkg.scripts = { ...scripts, start: scripts.dev };
      packageJsonFile.content = JSON.stringify(pkg, null, 2);
    } else {
      throw new Error(
        "This repo has no 'start' or 'dev' script in package.json, so it can't be launched in the sandbox."
      );
    }
  }

  return { template, folder };
}
