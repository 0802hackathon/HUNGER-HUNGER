import { parseGitHubRepositoryUrl } from "@/lib/github-url";

export type GitHubRepositoryStatus = {
  fullName: string | null;
  isPublic: boolean;
  licenseIdentifier: string | null;
  reason: "public" | "private" | "not_found";
};

type GitHubRepositoryResponse = {
  full_name?: unknown;
  license?: {
    spdx_id?: unknown;
  } | null;
  private?: unknown;
};

export class GitHubRepositoryLookupError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GitHubRepositoryLookupError";
  }
}

export async function getGitHubRepositoryStatus(
  repositoryUrl: string,
  signal?: AbortSignal,
): Promise<GitHubRepositoryStatus> {
  const repository = parseGitHubRepositoryUrl(repositoryUrl);
  if (!repository) {
    throw new GitHubRepositoryLookupError(
      "GitHub Repository URLの形式が正しくありません。",
    );
  }

  const token = process.env.GITHUB_TOKEN?.trim();
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(repository.owner)}/${encodeURIComponent(repository.repository)}`,
    {
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "User-Agent": "HUNGER-HUNGER",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      signal,
    },
  );

  if (response.status === 404) {
    return {
      fullName: null,
      isPublic: false,
      licenseIdentifier: null,
      reason: "not_found",
    };
  }

  if (!response.ok) {
    throw new GitHubRepositoryLookupError(
      "GitHubからRepository情報を取得できませんでした。",
    );
  }

  const data = (await response.json()) as GitHubRepositoryResponse;
  if (typeof data.private !== "boolean") {
    throw new GitHubRepositoryLookupError(
      "GitHubから取得したRepository情報を確認できませんでした。",
    );
  }

  const isPublic = !data.private;
  const fullName =
    typeof data.full_name === "string" ? data.full_name : null;
  const licenseIdentifier =
    data.license &&
    typeof data.license.spdx_id === "string" &&
    data.license.spdx_id !== "NOASSERTION"
      ? data.license.spdx_id
      : null;

  return {
    fullName,
    isPublic,
    licenseIdentifier,
    reason: isPublic ? "public" : "private",
  };
}
