import { NextResponse } from "next/server";
import {
  getGitHubRepositoryStatus,
  GitHubRepositoryLookupError,
} from "@/lib/github-repository";
import { parseGitHubRepositoryUrl } from "@/lib/github-url";

export async function GET(request: Request) {
  const repositoryUrl = new URL(request.url).searchParams.get("url")?.trim();
  if (!repositoryUrl || !parseGitHubRepositoryUrl(repositoryUrl)) {
    return NextResponse.json(
      {
        message:
          "https://github.com/owner/repository 形式のURLを入力してください。",
      },
      { status: 400 },
    );
  }

  try {
    const status = await getGitHubRepositoryStatus(repositoryUrl);
    return NextResponse.json({
      ...status,
      message: status.isPublic
        ? "公開Repositoryを確認しました。"
        : "公開Repositoryとして確認できませんでした。URLと公開設定を確認してください。",
    });
  } catch (error) {
    if (error instanceof GitHubRepositoryLookupError) {
      return NextResponse.json({ message: error.message }, { status: 503 });
    }

    console.error("GitHub repository lookup failed", error);
    return NextResponse.json(
      { message: "Repositoryの公開状態を確認できませんでした。" },
      { status: 503 },
    );
  }
}
