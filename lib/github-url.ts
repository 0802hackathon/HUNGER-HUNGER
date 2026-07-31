export type GitHubRepositoryReference = {
  owner: string;
  repository: string;
};

const pathSegmentPattern = /^[A-Za-z0-9_.-]+$/;

export function parseGitHubRepositoryUrl(
  value: string,
): GitHubRepositoryReference | null {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }

  if (
    url.protocol !== "https:" ||
    url.hostname !== "github.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return null;
  }

  const segments = url.pathname.split("/").filter(Boolean);
  if (segments.length !== 2) {
    return null;
  }

  const owner = segments[0];
  const repository = segments[1].replace(/\.git$/i, "");
  if (
    !owner ||
    !repository ||
    !pathSegmentPattern.test(owner) ||
    !pathSegmentPattern.test(repository)
  ) {
    return null;
  }

  return { owner, repository };
}
